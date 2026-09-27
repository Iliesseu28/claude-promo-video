#!/usr/bin/env python3
"""Records the voice-over, one WAV per line of src/narration.json, with Gemini text-to-speech, then writes
src/voice.json (the length of each recorded line, in seconds) for the timeline.

Two ways to reach Gemini, picked from the environment:

  Vertex AI (recommended)   GOOGLE_CLOUD_PROJECT=<project id>, gcloud logged in (gcloud auth login),
                            optional GOOGLE_CLOUD_LOCATION (default: global)
  Gemini API                GEMINI_API_KEY=<key from Google AI Studio>

When both are set, Vertex AI wins, unless GOOGLE_GENAI_USE_VERTEXAI=false. `--backend` forces one.

  python3 scripts/voice.py                       # records the lines with no WAV yet, or with a new text
  python3 scripts/voice.py --force intro outro   # records these lines again
  python3 scripts/voice.py --force               # records every line again
  python3 scripts/voice.py --durations           # only measures the WAVs

Needs ffmpeg. Keep the recordings in git (public/voice): a new take never sounds the same.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NARRATION = ROOT / "src" / "narration.json"
VOICE_DIR = ROOT / "public" / "voice"
DURATIONS = ROOT / "src" / "voice.json"
# The text of each take: a line whose text changed since its take is recorded again, even without --force.
TAKES = VOICE_DIR / "takes.json"


def pick_backend(forced: str | None) -> str:
    if forced:
        return forced
    vertex_off = os.environ.get("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in ("0", "false", "no")
    if os.environ.get("GOOGLE_CLOUD_PROJECT") and not vertex_off:
        return "vertex"
    if os.environ.get("GEMINI_API_KEY"):
        return "gemini-api"
    sys.exit("voice.py: set GOOGLE_CLOUD_PROJECT (Vertex AI, recommended) or GEMINI_API_KEY (Gemini API)")


def gcloud_token() -> str:
    for command in (["gcloud", "auth", "print-access-token"],
                    ["gcloud", "auth", "application-default", "print-access-token"]):
        try:
            result = subprocess.run(command, capture_output=True, text=True)
        except FileNotFoundError:
            sys.exit("voice.py: gcloud is not installed (https://cloud.google.com/sdk/docs/install)")
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    sys.exit("voice.py: gcloud gave no access token (run gcloud auth login)")


def request_for(backend: str, model: str, body: dict) -> urllib.request.Request:
    data = json.dumps(body).encode()
    if backend == "vertex":
        project = os.environ.get("GOOGLE_CLOUD_PROJECT")
        if not project:
            sys.exit("voice.py: set GOOGLE_CLOUD_PROJECT (the Google Cloud project that runs Vertex AI)")
        location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
        host = "aiplatform.googleapis.com" if location == "global" else f"{location}-aiplatform.googleapis.com"
        url = (f"https://{host}/v1/projects/{project}/locations/{location}/publishers/google/models/"
               f"{model}:generateContent")
        headers = {"Authorization": f"Bearer {gcloud_token()}"}
    else:
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            sys.exit("voice.py: set GEMINI_API_KEY")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {"x-goog-api-key": key}
    return urllib.request.Request(url, data=data, method="POST",
                                  headers={**headers, "Content-Type": "application/json"})


def synthesize(backend: str, model: str, voice: str, prompt: str) -> tuple[bytes, str]:
    """Audio bytes and their MIME type (raw 16-bit PCM, `audio/L16;rate=24000`, or a WAV)."""
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    for attempt in range(1, 7):
        try:
            with urllib.request.urlopen(request_for(backend, model, body), timeout=120) as response:
                data = json.load(response)
            break
        except urllib.error.HTTPError as error:
            # The text-to-speech models allow a few requests per minute: wait longer at each try.
            if error.code == 429 and attempt < 6:
                print(f"  quota reached, waiting {15 * attempt} s", flush=True)
                time.sleep(15 * attempt)
                continue
            detail = error.read()[:400].decode(errors="replace")
            sys.exit(f"voice.py: {backend} answered {error.code}: {detail}")
    try:
        part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
    except (KeyError, IndexError):
        sys.exit(f"voice.py: no audio in the answer: {json.dumps(data)[:400]}")
    return base64.b64decode(part["data"]), part.get("mimeType", "")


def to_wav(audio: bytes, mime: str, path: Path) -> None:
    """To a 48 kHz mono WAV, silence trimmed at both ends (a take often starts or ends with a breath of it)."""
    if "wav" in mime.lower():
        source = ["-f", "wav"]
    else:
        rate = re.search(r"rate=(\d+)", mime)
        source = ["-f", "s16le", "-ar", rate.group(1) if rate else "24000", "-ac", "1"]
    trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05"
    command = ["ffmpeg", "-loglevel", "error", "-y", *source, "-i", "pipe:0",
               "-af", f"{trim},areverse,{trim},areverse", "-ar", "48000", "-ac", "1", str(path)]
    subprocess.run(command, input=audio, check=True)


def duration(path: Path) -> float:
    result = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                            capture_output=True, text=True, check=True)
    return round(float(result.stdout.strip()), 3)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", nargs="*", default=None, help="record these line ids again (all when empty)")
    parser.add_argument("--durations", action="store_true", help="only measure the recordings")
    parser.add_argument("--backend", choices=["vertex", "gemini-api"], help="skip the choice from the environment")
    parser.add_argument("--model", help="override the model of src/narration.json")
    args = parser.parse_args()
    narration = json.loads(NARRATION.read_text(encoding="utf-8"))
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    forced = set(args.force or [])
    unknown = forced - {line["id"] for line in narration["lines"]}
    if unknown:
        sys.exit(f"voice.py: no line {', '.join(sorted(unknown))} in src/narration.json")
    takes = json.loads(TAKES.read_text(encoding="utf-8")) if TAKES.exists() else {}
    backend = None
    for line in [] if args.durations else narration["lines"]:
        path = VOICE_DIR / f"{line['id']}.wav"
        again = args.force is not None and (not forced or line["id"] in forced)
        edited = line["id"] in takes and takes[line["id"]] != line["text"]
        if path.exists() and not again and not edited:
            takes.setdefault(line["id"], line["text"])
            continue
        backend = backend or pick_backend(args.backend)
        model = args.model or narration["models"][backend]
        print(f"recording {line['id']} ({backend}, {model}, {narration['voice']})...", flush=True)
        audio, mime = synthesize(backend, model, narration["voice"], f"{narration['style']} {line['text']}")
        to_wav(audio, mime, path)
        takes[line["id"]] = line["text"]
        TAKES.write_text(json.dumps(takes, indent=2) + "\n", encoding="utf-8")
    if takes:
        TAKES.write_text(json.dumps(takes, indent=2) + "\n", encoding="utf-8")
    durations = {line["id"]: duration(VOICE_DIR / f"{line['id']}.wav")
                 for line in narration["lines"] if (VOICE_DIR / f"{line['id']}.wav").exists()}
    DURATIONS.write_text(json.dumps(durations, indent=2) + "\n", encoding="utf-8")
    for line in narration["lines"]:
        length = durations.get(line["id"])
        print(f"  {line['id']}: {f'{length:.2f} s' if length else 'not recorded'}")
    print(f"  total: {sum(durations.values()):.2f} s")


if __name__ == "__main__":
    main()
