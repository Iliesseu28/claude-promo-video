// The camera: where it looks and how close, at any time, from a few keyframes. Generic: keep it as it is.
import { Easing } from "remotion";
import { K, Point, STAGE, VIDEO } from "./geometry";

export type Camera = { zoom: number; x: number; y: number };

/**
 * A keyframe: a zoom, and where the view sits in the room it has at that zoom (ax, ay: 0 against the left or top
 * edge of the stage, 1 against the right or bottom one). The view never shows beyond the stage, and a view pinned
 * to a corner stays pinned while it zooms (a centred camera clamped afterwards lets the corner slide out of frame).
 */
export type Keyframe = { t: number; zoom: number; ax: number; ay: number };

const smooth = Easing.bezier(0.45, 0, 0.25, 1);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** The anchors that centre the view on this point at this zoom, as far as the stage allows. */
export const anchorOn = (p: Point, zoom: number): { ax: number; ay: number } => {
  const w = STAGE.w / zoom;
  const h = STAGE.h / zoom;
  return {
    ax: STAGE.w > w ? clamp01((p.x - w / 2) / (STAGE.w - w)) : 0.5,
    ay: STAGE.h > h ? clamp01((p.y - h / 2) / (STAGE.h - h)) : 0.5,
  };
};

export const cameraAt = (keys: Keyframe[], seconds: number): Camera => {
  const next = keys.findIndex((k) => k.t > seconds);
  const a = keys[Math.max(0, next === -1 ? keys.length - 1 : next - 1)];
  const b = next <= 0 ? a : keys[next];
  const u = a === b ? 0 : smooth((seconds - a.t) / (b.t - a.t));
  // The zoom moves on a log scale, so a push in feels as steady at its end as at its start.
  const zoom = Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * u);
  const ax = a.ax + (b.ax - a.ax) * u;
  const ay = a.ay + (b.ay - a.ay) * u;
  const w = STAGE.w / zoom;
  const h = STAGE.h / zoom;
  return { zoom, x: w / 2 + ax * (STAGE.w - w), y: h / 2 + ay * (STAGE.h - h) };
};

/** Video pixels of a stage point. */
export const toScreen = (c: Camera, p: Point): Point => ({
  x: (p.x - c.x) * c.zoom * K + VIDEO.w / 2,
  y: (p.y - c.y) * c.zoom * K + VIDEO.h / 2,
});

/** The CSS transform that films the stage (a div of STAGE.w x STAGE.h, origin at its top left) with this camera. */
export const stageTransform = (c: Camera) => {
  const scale = c.zoom * K;
  return `translate(${VIDEO.w / 2 - c.x * scale}px, ${VIDEO.h / 2 - c.y * scale}px) scale(${scale})`;
};
