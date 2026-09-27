// The two coordinate systems of the video: video pixels, and points of the stage (the drawn screen the camera films).
import type { CSSProperties } from "react";
import video from "../video.json";

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export const VIDEO = { w: video.width, h: video.height };
/** Video pixels per point when the camera shows the whole stage (4/3: a 1440 x 810 point stage in 1920 x 1080). */
export const K = 4 / 3;
export const STAGE = { w: VIDEO.w / K, h: VIDEO.h / K };

export const center = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

export const box = (r: Rect): CSSProperties => ({
  position: "absolute",
  left: r.x,
  top: r.y,
  width: r.w,
  height: r.h,
});

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
