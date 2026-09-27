# Tools, versions, commands

Tested on 27 September 2026 (Mac mini M4, macOS 27). Paths are relative to the copy of the template,
`<app repo>/tools/promo-video`.

| Tool | Version tested | Role |
| --- | --- | --- |
| Remotion (`remotion`, `@remotion/cli`, `@remotion/media`) | 4.0.529 | React composition rendered frame by frame in a headless Chrome |
| Node and npm | Node 24.19 (20 or later is fine) | Remotion |
| ffmpeg and ffprobe | 8.1.2 | final encode, loudness, stills, checks |
| Gemini TTS | `gemini-2.5-pro-tts` on Vertex AI (location `global`), voice `Charon` | voice-over, one take per line |
| Google Cloud SDK (`gcloud`) | 579.0.0 | access token for Vertex AI (`gcloud auth print-access-token`) |
| Whisper (`openai-whisper`, command line) | model `base` | the time of each word of the voice |
| Python 3 | 3.9 or later, standard library | voice, word times, sounds |

Install on a Mac: `brew install node ffmpeg python`, `brew install --cask google-cloud-sdk`,
`pipx install openai-whisper` (or `pip install openai-whisper`).

## Voice: Vertex AI or Gemini API

| | Vertex AI (recommended) | Gemini API |
| --- | --- | --- |
| Set | `GOOGLE_CLOUD_PROJECT=<project id>`, optional `GOOGLE_CLOUD_LOCATION` (default `global`) | `GEMINI_API_KEY=<key>` |
| Auth | `gcloud auth login` (the script asks gcloud for a token) | the key, sent as `x-goog-api-key` |
| Model in `narration.json` | `models.vertex`: `gemini-2.5-pro-tts` | `models["gemini-api"]`: `gemini-2.5-pro-preview-tts` |
| Why | billed on a Cloud project (free trial credits apply), higher quotas | quickest to start |

When both are set, Vertex AI wins unless `GOOGLE_GENAI_USE_VERTEXAI=false`; `--backend` forces one. Both use the
`generateContent` method and return 16-bit PCM at 24 kHz; the script trims the silence at both ends and writes a
48 kHz WAV. Newer TTS models exist (`gemini-3.8-flash-tts` on the Gemini API): they read the style text aloud if it
is prepended to the line, so keep a 2.5 model with this script or move the style into `speech_metadata`.

## Commands, verbatim

```sh
# Copy the template into the app's repository (once); <skill dir> is the folder of this skill's SKILL.md
cp -R "<skill dir>/template" tools/promo-video && cd tools/promo-video && npm ci

# Voice: every line with no WAV yet or with a new text; one line again; measure only
GOOGLE_CLOUD_PROJECT=<project id> python3 scripts/voice.py
GOOGLE_CLOUD_PROJECT=<project id> python3 scripts/voice.py --force features
python3 scripts/voice.py --durations

# The time of every word, from the start of the video (to time gestures and subtitle pages)
python3 scripts/words.py

# Everything else in one command: sounds, render, loudness, encode, poster (about 40 s for 16 s of video)
bash scripts/render.sh
OUT_DIR=../../docs/video bash scripts/render.sh

# Interactive preview
npm run dev

# One frame to check, shrunk to a small JPEG before reading it (saves context)
npx remotion still Promo out/still.png --frame=180
ffmpeg -loglevel error -y -i out/still.png -vf scale=960:-1 -q:v 5 out/still.jpg    # or: sips -Z 960 on a Mac

# Checks of the final file
ffprobe -v error -show_entries format=duration,size:stream=codec_name,profile,level,width,height,r_frame_rate,sample_rate,channels,bit_rate -of compact out/promo.mp4
LC_ALL=C ffmpeg -hide_banner -nostats -i out/promo.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary
LC_ALL=C ffmpeg -hide_banner -nostats -i out/promo.mp4 -af "highpass=f=300,silencedetect=noise=-32dB:d=0.4" -f null - 2>&1 | grep -oE "silence_(start|end): [0-9.]+"
```

## What `scripts/render.sh` does

1. `python3 scripts/prepare.py`: click sounds and a quiet pad exactly as long as the video (`public/gen`).
2. `npx remotion render Promo out/raw.mov --codec=prores --prores-profile=standard`: a lossless master.
3. Loudness in two passes when a voice is recorded: measure, then one linear gain to `I=-16:TP=-1.5:LRA=11`
   (the voice keeps its dynamics).
4. Encode: `libx264 -profile:v high -level:v 4.0 -pix_fmt yuv420p -preset slow -crf 15 -maxrate 8M -bufsize 16M
   -r 30 -g 60`, BT.709 colour tags, `aac -b:a 256k -ar 48000 -ac 2`, `-movflags +faststart`.
5. Poster: the frame at `poster` seconds (`src/video.json`) as a JPEG.

`remotion.config.ts` sets `Config.setColorSpace("bt709")`: without it, the colours of the MP4 shift by about 5 levels.

Result for SimplyBar: 29.0 s, 1920 x 1080, 30 fps, H.264 High 4.0, AAC 256 kb/s 48 kHz stereo, -16 LUFS, 11.5 MB.
