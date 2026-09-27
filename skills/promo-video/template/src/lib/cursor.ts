// The cursor: curved strokes between targets, and clicks. Generic: keep it as it is.
import { Easing } from "remotion";
import { Point } from "./geometry";

/** A hand moves fast, then slows down onto its target. */
const reach = Easing.bezier(0.3, 0.05, 0.12, 1);

export type Move = { from: number; to: number; target: Point; bend: number };
export type Click = { t: number; button: "left" | "right"; kind?: "press" | "release" };
export type CursorPath = { start: Point; moves: Move[]; clicks: Click[] };

type Script = (tools: {
  /** Moves from where the cursor is to `target` between two times; `bend` curves the stroke (0.04 to 0.18). */
  move: (from: number, to: number, target: Point, bend?: number) => void;
  click: (t: number, button?: Click["button"]) => void;
  /** A drag: press, move, release. */
  press: (t: number) => void;
  release: (t: number) => void;
}) => void;

export const cursorPath = (start: Point, script: Script): CursorPath => {
  const moves: Move[] = [];
  const clicks: Click[] = [];
  script({
    move: (from, to, target, bend = 0.12) => {
      const last = moves[moves.length - 1];
      if (to <= from) throw new Error(`Cursor move at ${from} s ends before it starts`);
      if (last && from < last.to) throw new Error(`Cursor move at ${from} s starts before the one at ${last.from} s ends`);
      moves.push({ from, to, target, bend });
    },
    click: (t, button = "left") => clicks.push({ t, button }),
    press: (t) => clicks.push({ t, button: "left", kind: "press" }),
    release: (t) => clicks.push({ t, button: "left", kind: "release" }),
  });
  return { start, moves, clicks };
};

export const cursorAt = (path: CursorPath, seconds: number): Point => {
  let position = path.start;
  for (const m of path.moves) {
    if (seconds <= m.from) break;
    const from = position;
    if (seconds >= m.to) {
      position = m.target;
      continue;
    }
    // A curved stroke: a quadratic Bezier bent to one side of the straight line.
    const u = reach((seconds - m.from) / (m.to - m.from));
    const dx = m.target.x - from.x;
    const dy = m.target.y - from.y;
    const control = { x: (from.x + m.target.x) / 2 - dy * m.bend, y: (from.y + m.target.y) / 2 + dx * m.bend };
    const a = (1 - u) * (1 - u);
    const b = 2 * (1 - u) * u;
    const c = u * u;
    return { x: a * from.x + b * control.x + c * m.target.x, y: a * from.y + b * control.y + c * m.target.y };
  }
  return position;
};
