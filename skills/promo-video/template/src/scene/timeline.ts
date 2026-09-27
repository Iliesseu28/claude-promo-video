// When things happen, in seconds from the start. The voice sets the pace: each gesture lands on the word that names
// it. Until you record the voice, line lengths are estimated from their words; after `scripts/voice.py`, they are
// measured, and `scripts/words.py` prints the time of every word to put in T.
import narration from "../narration.json";
import recorded from "../voice.json";
import video from "../video.json";
import { Page, timePages } from "../lib/subtitles";

export const FPS = video.fps;
export const DURATION = video.duration;
export const frame = (seconds: number) => Math.round(seconds * FPS);

export const LINES = narration.lines.map((line) => line.id);
const lineOf = (id: string) => {
  const line = narration.lines.find((l) => l.id === id);
  if (!line) throw new Error(`No voice line "${id}" in src/narration.json`);
  return line;
};

const measured: Record<string, number> = recorded;
/** True once scripts/voice.py has recorded public/voice/<id>.wav. */
export const isRecorded = (id: string) => id in measured;
/** Length of a line: measured on its recording, or about 2.8 words per second until then. */
export const voiceLength = (id: string) =>
  measured[id] ?? 0.3 + lineOf(id).text.split(/\s+/).filter(Boolean).length / 2.8;
export const voiceStart = (id: string) => lineOf(id).start;
export const voiceEnd = (id: string) => voiceStart(id) + voiceLength(id);

// A new take (scripts/voice.py --force) may be longer: fail loudly rather than play two lines at once.
LINES.forEach((id, index) => {
  const next = LINES[index + 1];
  const limit = next ? voiceStart(next) : DURATION;
  if (voiceEnd(id) > limit) {
    throw new Error(`Voice line "${id}" ends at ${voiceEnd(id).toFixed(2)} s, after ${next ?? "the end"} (${limit} s)`);
  }
});

/** Subtitles: one page per sentence, the long ones cut where the voice breathes (seconds into the line). */
const SUBTITLES: Page[] = [
  { line: "intro", at: 0, text: "Meet YourApp, the simple way" },
  { line: "intro", at: 1.76, text: "to keep your day on track." },
  { line: "features", at: 0, text: "Switch on what you need:" },
  { line: "features", at: 1.3, text: "reminders, focus mode and sync." },
  { line: "done", at: 0, text: "Click Done, and you are all set." },
  { line: "outro", at: 0, text: "YourApp. Free and simple, on the App Store." },
];
export const PAGES = timePages(SUBTITLES, voiceStart, voiceEnd, DURATION);

/** Every gesture, on the word that names it (times printed by scripts/words.py for a take of these lines). */
export const T = {
  windowOpen: 1.0,
  toggles: { reminders: 6.0, focus: 6.78, sync: 7.52 },
  done: 9.2,
  /** The end card, just before the last line; its lines come with their words (seconds into that line). */
  endCard: 12.4,
  endCardLines: { promise: 0.58, store: 1.54 },
};
