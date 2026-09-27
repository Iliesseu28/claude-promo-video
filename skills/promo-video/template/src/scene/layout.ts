// Where things are on the stage, in points (the stage is 1440 x 810 points in a 1920 x 1080 video).
// Click targets come from here, never from guesses: in an image of your app, measure them on the PNG.
import { Rect } from "../lib/geometry";

export const FEATURES = ["reminders", "focus", "sync"] as const;
export type FeatureId = (typeof FEATURES)[number];
export const LABELS: Record<FeatureId, { title: string; detail: string }> = {
  reminders: { title: "Reminders", detail: "A nudge before each task" },
  focus: { title: "Focus mode", detail: "Silence everything else" },
  sync: { title: "Sync", detail: "On all your devices" },
};

export const WINDOW: Rect = { x: 380, y: 155, w: 680, h: 500 };
export const TITLE_BAR = 48;

export const rowRect = (index: number): Rect => ({
  x: WINDOW.x + 32,
  y: WINDOW.y + TITLE_BAR + 36 + index * 96,
  w: WINDOW.w - 64,
  h: 80,
});

export const toggleRect = (index: number): Rect => {
  const row = rowRect(index);
  return { x: row.x + row.w - 22 - 66, y: row.y + 21, w: 66, h: 38 };
};

export const DONE_BUTTON: Rect = { x: WINDOW.x + WINDOW.w - 32 - 150, y: WINDOW.y + WINDOW.h - 32 - 54, w: 150, h: 54 };
export const BADGE: Rect = { x: WINDOW.x + 32, y: DONE_BUTTON.y, w: 300, h: 54 };
