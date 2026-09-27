#!/usr/bin/env bash
# Renders the promo video and its poster, in one command:
#
#   bash scripts/render.sh                 # writes out/<output>.mp4 and out/<output>-poster.jpg
#   OUT_DIR=../../docs/video bash scripts/render.sh
#
# Output: 1920 x 1080 (src/video.json), 30 fps, H.264 High 4.0, AAC 256 kb/s 48 kHz stereo, loudness -16 LUFS,
# and the frame at `poster` seconds as a JPEG. Needs Node (npm), ffmpeg and Python 3.
# The voice is recorded once (scripts/voice.py) and kept in public/voice.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"
read -r COMPOSITION NAME POSTER < <(python3 -c '
import json; v = json.load(open("src/video.json")); print(v["composition"], v["output"], v["poster"])')
OUT="${OUT_DIR:-out}"
mkdir -p out "$OUT"

[[ -d node_modules ]] || npm ci
python3 scripts/prepare.py

echo "Rendering (a minute or two)..."
npx remotion render "$COMPOSITION" out/raw.mov --codec=prores --prores-profile=standard --log=error

# Loudness in two passes: measured first, then corrected in one linear gain (the voice keeps its dynamics).
# Without a recorded voice there is only the quiet pad and the clicks: leave them as they are.
if python3 -c 'import json, sys; sys.exit(0 if json.load(open("src/voice.json")) else 1)'; then
  LOUDNORM="I=-16:TP=-1.5:LRA=11"
  MEASURED="$(ffmpeg -hide_banner -nostats -i out/raw.mov -vn -af "loudnorm=${LOUDNORM}:print_format=json" -f null - 2>&1 \
    | python3 -c 'import json, sys; t = sys.stdin.read(); d = json.loads(t[t.rindex("{"):t.rindex("}") + 1])
print(":".join("measured_%s=%s" % (k, d["input_" + k]) for k in ("i", "tp", "lra", "thresh")) + ":offset=" + d["target_offset"])')"
  # Braces matter: in zsh, "$LOUDNORM:$MEASURED" would read ":l" as a modifier.
  AUDIO_FILTER="loudnorm=${LOUDNORM}:${MEASURED}:linear=true"
else
  echo "No voice recorded yet (src/voice.json is empty): loudness left as it is."
  AUDIO_FILTER="anull"
fi

echo "Encoding..."
ffmpeg -hide_banner -loglevel error -y -i out/raw.mov \
  -c:v libx264 -profile:v high -level:v 4.0 -pix_fmt yuv420p -preset slow -crf 15 -maxrate 8M -bufsize 16M \
  -r 30 -g 60 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -af "$AUDIO_FILTER" -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -hide_banner -loglevel error -y -ss "$POSTER" -i out/raw.mov -frames:v 1 -q:v 3 "$OUT/$NAME-poster.jpg"

ls -lh "$OUT/$NAME.mp4" "$OUT/$NAME-poster.jpg"
