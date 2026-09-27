# Pitfalls

All met while making SimplyBar's video (27 September 2026), with the fix that worked.

## Screen recording permission asked for a helper nobody can find

**Symptom**: macOS asks "Screen & System Audio Recording" permission for an app called after a helper binary
("renderer") that does not appear in System Settings; `screencapture` answers `could not create image from window`.
**Cause**: `screencapture` ran from a helper binary launched with `open`: the request is filed under that binary,
not under the terminal.
**Fix**:
1. Draw the views offscreen (`NSHostingView` plus `cacheDisplay(in:to:)`): no permission at all. Start there
   (45 minutes lost on six attempts before).
2. If a real window capture is unavoidable: allow the terminal app in System Settings > Privacy & Security >
   Screen & System Audio Recording, then `screencapture -l <window id> -o file.png` from the shell.
3. On the prompt that follows, choose **Later**, never **Quit and Reopen**: the terminal quits and takes the
   agent session running in it along.

## Table

| Symptom | Cause | Fix |
| --- | --- | --- |
| Tailwind present after `npx create-video --blank --no-tailwind` | the scaffold adds it anyway | start from this template instead, or remove it from `package.json`, `remotion.config.ts` and `src/index.css` |
| Grey switches and a black selected row in a window drawn offscreen | the window is inactive | launch the renderer with `open -W -n` as a regular app (`LSUIElement` NO), wait for `NSApp.isActive` (overriding `isActive` in an `NSApplication` subclass has no effect) |
| `open --stdout/--stderr` fails with -10810 | option refused for that launch | `freopen` stdout and stderr to a log file inside the app |
| `open` of the renderer fails with -600 | not elucidated | `open -W -n` on the full `.app` bundle |
| "Access files on a removable volume" dialog, then a hang | an app launched by `open` writes to an external disk | write to `$TMPDIR`, copy afterwards; close the dialog with `killall UserNotificationCenter` |
| An `open -W` that never returns | `timeout` does not exist on macOS | a watchdog loop in the background, 5 minutes |
| Vertex AI TTS answers 429 | per-minute quota of the TTS models | retry after 15 s times the attempt number (done in `voice.py`) |
| The first takes are far too long | a calm default delivery | add "at a lively, brisk pace" to the style |
| A newer TTS model reads the style sentence aloud | Gemini 3.8 TTS treats the text as a verbatim transcript | keep a 2.5 TTS model with `voice.py`, or send the style as `speech_metadata` |
| `pgrep -fl Renderer` also matches the browser and other apps | pattern too wide | match the full path of the binary |
| Whisper writes "max" for "Mac's" | approximate transcription | Whisper only gives times; the text comes from `narration.json` |
| `loudnorm` receives `-0.04inear=true` | in zsh, `:l` in `"$LOUDNORM:$MEASURED"` is a modifier | write `${LOUDNORM}:${MEASURED}` (done in `render.sh`, which runs in bash anyway) |
| `silencedetect` prints decimal commas | the Mac is set to a language with decimal commas | prefix `LC_ALL=C` |
| Reading full-size stills fills the context | a 1920 x 1080 PNG is large | shrink to a 960 px JPEG first (`ffmpeg -vf scale=960:-1` or `sips -Z 960`) |
| Remotion's ESLint refuses `volume={0.5}` and `from={0}` | rules of the Remotion ESLint plugin | `volume={() => 0.5}`, drop `from={0}` |
| Menu bar items leave the frame during a zoom | camera centred, then clamped | camera by anchors (`ax = 1, ay = 0`: pinned to the corner) |
| A context menu still visible when the next panel opens | fade too long | 0.09 s fade, next panel 0.12 s later |
| The click ring follows the cursor | drawn at the current cursor position | draw it where the click landed |
| Dark edges under the end card | CSS blur eats the edges | the same background behind the blurred stage (done in the template) |
| Subtitles over an important panel | panel too low | keep what matters above 900 px, subtitles 104 px above the bottom |
| Items of a bar move from one reading to the next | an item's width changes (real behaviour) | recompute positions for each reading; place a popup at its opening time |
| `__pycache__` left in a tools folder | a Python import | `sys.dont_write_bytecode = True` |
| MP4 colours off by about 5 levels | ProRes master without colour tags, read as BT.601 | `Config.setColorSpace("bt709")` in `remotion.config.ts` |
| The next subtitle arrives abruptly, 0.12 s late | the previous page stayed until its voice ended plus 0.25 s | end it at the next page's start minus 0.05 s too (done in `lib/subtitles.ts`) |
| Last subtitle page on the very last frame | no end bound | end it 0.12 s before the end of the video |
| The pill's blur flickers during fades | `opacity` on a parent switches off `backdropFilter` in Chrome | put the opacity on the pill itself |
| A longer new take overlaps the next line, silently | nothing compared the times | the timeline throws when a line ends after the next one starts |
| The pad is cut dead on the last frame | a 29.5 s file for a 29 s video | the pad is exactly as long as the video (`prepare.py` reads `video.json`) |
| Wrong or stale images of the app | focus lost while rendering, old images left, an accent colour other than the default | check focus before each image, empty the folder on each full render, warn about the accent colour |
