---
name: promo-video
description: Make a 15 to 30 second promo video of a Mac, iOS or web app with Remotion, built from the app's real views, with a Gemini text-to-speech voice-over (Vertex AI or Gemini API), subtitles synced to the words, and an animated cursor that zooms, moves and clicks on the word that names each feature. Ships a Remotion template that renders out of the box. Use when the user asks for a promo video, launch video, demo video, product video, trailer, App Store app preview, a video for a README, landing page or social post, a voice-over, subtitles or captions for a video, or mentions Remotion.
---

# Promo video of an app

The recipe behind the 29-second launch video of SimplyBar: one continuous stage filmed by a camera, a cursor that
clicks on the word, a voice-over, subtitles, an end card. About 1 hour of agent time with this skill; a full
render takes about 1 minute.

## Rules

- **Start from the template**: copy `${CLAUDE_SKILL_DIR}/template` to `<app repo>/tools/promo-video`, run `npm ci`,
  keep what is generic, redo what belongs to the app (table in `references/recipe.md`).
- **Storyboard first**: 4 to 6 gestures, one idea each, 60 to 70 words, the benefit said in the first 4 seconds.
- **The app's real views**, drawn offscreen or captured once: no mock-up, no screen recording permission needed.
- **Voice**: one take per line, kept in git. Vertex AI is recommended (`GOOGLE_CLOUD_PROJECT`), the Gemini API
  works too (`GEMINI_API_KEY`). Ask the user which one they have; never write a key into a file.
- **Every gesture lands on its word**: word times come from Whisper (`scripts/words.py`), never from the ear.
- **Everything depends on time** (`frame / fps`), nothing on chance: every render is identical.
- **Check stills, not the whole video**: `npx remotion still` every 2 to 3 seconds, read as small JPEGs.
- **App Store preview**: show the app in use (guideline 2.3.4), check size, frame rate and audio before upload.
- **Never click "Quit and Reopen"** on a macOS permission prompt: it kills the terminal that runs you.

## Steps

1. Read the app (screens, main features, store listing) and write the storyboard: `references/storyboard.md`.
2. Copy the template, set `src/video.json`, `src/brand.ts`, `src/narration.json`.
3. Get the app's views as images: `references/recipe.md`, step 3.
4. Record the voice (`scripts/voice.py`), print the word times (`scripts/words.py`), set `src/scene/timeline.ts`.
5. Lay out the stage, the camera and the cursor (`src/scene/`), check stills, fix, repeat (5 or 6 rounds).
6. Render with `bash scripts/render.sh`, run the checks of `references/tools.md`, show the poster to the user.

## Files

- `references/tools.md`: tools, versions, commands verbatim, what the render script does.
- `references/recipe.md`: the whole recipe, step by step.
- `references/storyboard.md`: the storyboard that worked (times, voice text, why), and a blank one.
- `references/app-store-previews.md`: Apple's app preview specifications for Mac, iPhone and iPad, and upload.
- `references/pitfalls.md`: problems met on a real video, with their cause and fix.
- `template/`: the Remotion project (its `README.md` lists each file and whether to change it).
