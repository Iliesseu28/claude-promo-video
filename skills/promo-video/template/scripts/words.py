#!/usr/bin/env python3
"""Prints when each word of the voice-over is said, in seconds from the start of the video, to time the gestures
(T in src/scene/timeline.ts) and the subtitle pages on the words.

  python3 scripts/words.py              # every recorded line
  python3 scripts/words.py features     # one line

Needs the Whisper command line (pip install openai-whisper). Whisper only gives the times: it may misspell a word
("max" for "Mac's"), the text itself comes from src/narration.json.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "words"


def main() -> None:
    narration = json.loads((ROOT / "src" / "narration.json").read_text(encoding="utf-8"))
    wanted = set(sys.argv[1:])
    OUT.mkdir(parents=True, exist_ok=True)
    for line in narration["lines"]:
        wav = ROOT / "public" / "voice" / f"{line['id']}.wav"
        if (wanted and line["id"] not in wanted) or not wav.exists():
            continue
        try:
            subprocess.run(["whisper", str(wav), "--model", "base", "--language", "en", "--word_timestamps", "True",
                            "--output_format", "json", "--output_dir", str(OUT)],
                           check=True, capture_output=True, text=True)
        except FileNotFoundError:
            sys.exit("words.py: whisper is not installed (pip install openai-whisper)")
        result = json.loads((OUT / f"{line['id']}.json").read_text(encoding="utf-8"))
        print(f"{line['id']} (starts at {line['start']} s): {line['text']}")
        for segment in result["segments"]:
            for word in segment.get("words", []):
                at = line["start"] + word["start"]
                print(f"  {at:6.2f} s  (+{word['start']:.2f})  {word['word'].strip()}")


if __name__ == "__main__":
    main()
