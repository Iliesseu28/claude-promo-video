# Promo video template (Remotion)

A 16-second, 1920 x 1080 promo video that renders out of the box: a stand-in app window on a drawn stage, a camera
that zooms in and out, a cursor that clicks each toggle on the word that names it, subtitles, an end card, click
sounds and a quiet pad. Copy it into your app's repository, then replace the stand-in with your app's real views.

## Render

```sh
npm ci
npm run dev                      # Remotion Studio, to scrub the timeline
npm run still                    # one frame to out/still.png
bash scripts/render.sh           # out/promo.mp4 and out/promo-poster.jpg (about 40 s on a recent Mac)
```

Needs Node 20 or later, ffmpeg and Python 3 (standard library only).

## Voice-over

```sh
export GOOGLE_CLOUD_PROJECT=<your project id>    # Vertex AI (recommended), after gcloud auth login
# or: export GEMINI_API_KEY=<your key>           # Gemini API
python3 scripts/voice.py                         # one WAV per line of src/narration.json, in public/voice
python3 scripts/words.py                         # when each word is said (pip install openai-whisper)
```

Put the word times in `src/scene/timeline.ts` (`T` and the subtitle pages), then render again. Keep the WAVs in
git: a new take never sounds the same. A line whose text changed is recorded again on the next run.

## Files

| Path | Role | Change it? |
| --- | --- | --- |
| `src/video.json` | size, frame rate, duration, poster time, output name | yes |
| `src/narration.json` | voice, models, style, and each line with its start time | yes |
| `src/brand.ts` | app name, promise, store line, icon, colours | yes |
| `src/scene/layout.ts` | where things are on the stage, in points | yes |
| `src/scene/timeline.ts` | subtitle pages and the time of every gesture | yes |
| `src/scene/moves.ts` | camera keyframes and cursor strokes | yes |
| `src/scene/AppWindow.tsx` | the stand-in app: replace with images of your app | yes |
| `src/lib/` | camera, cursor, subtitle timing | no |
| `src/components/` | cursor, subtitles, end card | rarely |
| `scripts/` | voice, word times, sounds, render and encode | no |

A complete, real example built the same way: the promo video of
[SimplyBar](https://github.com/Iliesseu28/SimplyBar/tree/main/tools/promo-video).
