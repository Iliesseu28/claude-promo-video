# Storyboard

## The one that worked: SimplyBar, 27 September 2026

29.0 s, 7 lines, 65 words. The shots and words belong to SimplyBar (a menu bar system monitor for the Mac); the
shape is the recipe. Video: `assets/simplybar-promo.mp4` in this repository.

| Time | Picture | Voice-over (start: text) |
| --- | --- | --- |
| 0 to 1.4 s | empty desktop, the cursor moves, slight zoom in | 0.25 s: "Meet SimplyBar, a free system monitor for your Mac's menu bar." |
| 1.4 to 8.9 s | the real settings window opens; one click per module, then on "Show in menu bar" (CPU 4.7 s, memory 5.95 s, network 7.15 s, SSD 8.35 s); each item appears in the menu bar; window closed at 8.85 s | 4.65 s: "Open the settings and switch on the modules you want." |
| 8.9 to 14.4 s | zoom on the top right corner; clicks on CPU 9.5 s, memory 10.9 s, network 12.2 s, SSD 13.4 s; each popup refreshes every 0.5 s | 8.9 s: "Click any item to see the details." 11.2 s: "Everything updates in real time." |
| 14.4 to 23.0 s | zoom out; right click 15.65 s, "Edit Widgets" 17.3 s, gallery 17.5 s; CPU dragged (19.4 s), memory, network, SSD clicked (20.2, 20.84, 21.44 s), storage dragged (22.3 s), "Done" 23.0 s | 14.6 s: "To add widgets, right-click the desktop and choose Edit Widgets." 18.5 s: "Drag them in: CPU, memory, network, SSD and storage." |
| 23.0 to 24.6 s | finished desktop, CPU popup open again: **the poster** (24.2 s) | silence |
| 24.6 to 29.0 s | end card over the blurred desktop: icon, name, "Free and open source", "On the Mac App Store" (each line with its word) | 24.7 s: "SimplyBar. Free and open source, on the Mac App Store." |

## Why it works

- The benefit is said within 4 seconds, before any gesture; after that the voice only names what is on screen.
- One gesture per idea, and the gesture lands on the word (the click on "switch on", the widget drop on "CPU").
- The zoom only makes the small area that matters readable (the menu bar), then gives the overview back.
- The rhythm changes every 4 to 5 seconds (settings, menu bar, gallery, end): no dead time.
- The end gathers everything on screen (5 widgets, 4 menu bar items, an open popup): the natural poster.
- A 1.5 second silence before the end card lets the finished picture breathe.

## The voice

`src/narration.json`: voice `Charon`, model `gemini-2.5-pro-tts`, and this style, which gave the right take:

> Read this line of a short product video in English, in a warm, upbeat and confident voice, at a lively, brisk
> pace, without adding any words:

Without "lively, brisk pace", the first takes added up to 30 seconds on their own: too slow for a 30-second
video. One line per take: a line is recorded again without touching the others (`voice.py --force <id>`).
Other voices worth a try (Google's own labels): `Puck` (upbeat), `Kore` (firm), `Fenrir` (excitable).

## A blank storyboard for a new app

| Moment | Length | Content |
| --- | --- | --- |
| Hook | 0 to 4 s | the app's name and its benefit in one sentence, on the main screen |
| Gestures 1 to 4 (or 5) | 4 to 5 s each | one gesture, one idea, the gesture on the word that names it |
| Finished picture | 1 to 2 s | everything the app does, on screen, no voice: the poster |
| End card | 4 s | icon, name, short promise, where to get it ("On the App Store") |

- 60 to 70 words in English for 25 to 29 seconds (about 2.4 words per second, pauses included).
- Subtitle pages short, cut at the breaths; the longest fits on one line (about 1,150 px wide at 44 px).
- No price, no dated offer, no other brand on screen or in the voice.
- Write the storyboard as this table and show it to the user before recording anything.
