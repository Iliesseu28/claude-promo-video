// The camera and the cursor of this video: a few keyframes and strokes, timed on T.
import { anchorOn, Keyframe } from "../lib/camera";
import { center } from "../lib/geometry";
import { cursorPath } from "../lib/cursor";
import { DONE_BUTTON, toggleRect } from "./layout";
import { T } from "./timeline";

/** Close on the rows while they are switched on, then the whole window again for the finished image. */
const ROWS_VIEW = { x: 740, y: 390 };

export const CAMERA: Keyframe[] = [
  { t: 0, zoom: 1, ax: 0.5, ay: 0.5 },
  { t: 1.0, zoom: 1.04, ax: 0.5, ay: 0.5 },
  { t: 4.9, zoom: 1.5, ...anchorOn(ROWS_VIEW, 1.5) },
  { t: 8.1, zoom: 1.55, ...anchorOn(ROWS_VIEW, 1.55) },
  { t: 8.9, zoom: 1.22, ...anchorOn(center(DONE_BUTTON), 1.22) },
  { t: 10.8, zoom: 1, ax: 0.5, ay: 0.5 },
];

export const PATH = cursorPath({ x: 1000, y: 720 }, ({ move, click }) => {
  move(0.1, 1.0, { x: 860, y: 640 }, 0.16);
  move(5.2, 5.85, center(toggleRect(0)), -0.12);
  click(T.toggles.reminders);
  move(6.2, 6.62, center(toggleRect(1)), 0.08);
  click(T.toggles.focus);
  move(6.95, 7.38, center(toggleRect(2)), -0.08);
  click(T.toggles.sync);
  move(8.4, 9.05, center(DONE_BUTTON), 0.12);
  click(T.done);
  // Out of the way for the finished image (the poster).
  move(9.6, 10.8, { x: 1150, y: 700 }, 0.1);
});
