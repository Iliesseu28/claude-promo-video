// The pointer and the ring of each click, in video pixels. Generic: keep it as it is.
import React from "react";
import { Easing } from "remotion";
import { Camera } from "../lib/camera";
import { Click } from "../lib/cursor";
import { Point } from "../lib/geometry";

/** An arrow of about 12 by 19 points, black with a white rim, tip at (0, 0). */
const ARROW = "M0 0 L0 16.2 L3.9 12.5 L6.6 18.6 L9.3 17.4 L6.7 11.6 L11.8 11.6 Z";

export const Cursor: React.FC<{
  at: Point;
  camera: Camera;
  clicks: Click[];
  seconds: number;
  fade: number;
  /** Where a click landed, in video pixels now (the ring stays there while the cursor goes on). */
  placeOf: (click: Click) => Point;
}> = ({ at, camera, clicks, seconds, fade, placeOf }) => {
  // Bigger when the camera is close, as on a zoomed screen, but less than the zoom so it never fills the view.
  const size = 1.45 * Math.sqrt(camera.zoom);
  const recent = clicks.filter((c) => seconds >= c.t - 0.06 && seconds < c.t + 0.5);
  // The arrow shrinks to 88 % for about 2 frames on each press.
  const press = recent.some((c) => c.kind !== "release" && seconds < c.t + 0.07) ? 0.88 : 1;
  const holding = clicks.some(
    (p) =>
      p.kind === "press" && seconds >= p.t && !clicks.some((r) => r.kind === "release" && r.t > p.t && seconds >= r.t),
  );
  return (
    <>
      {recent
        .filter((c) => c.kind !== "release" && seconds >= c.t)
        .map((c) => {
          const u = (seconds - c.t) / 0.45;
          const radius = (8 + 22 * Easing.out(Easing.cubic)(u)) * size;
          const place = placeOf(c);
          return (
            <div
              key={c.t}
              style={{
                position: "absolute",
                left: place.x - radius,
                top: place.y - radius,
                width: radius * 2,
                height: radius * 2,
                borderRadius: "50%",
                border: `${2 * size}px solid rgba(255,255,255,${0.75 * (1 - u)})`,
                backgroundColor:
                  c.button === "right" ? `rgba(0,0,0,${0.12 * (1 - u)})` : `rgba(255,255,255,${0.16 * (1 - u)})`,
                boxShadow: `0 0 ${10 * size}px rgba(0,0,0,${0.18 * (1 - u)})`,
                opacity: fade,
              }}
            />
          );
        })}
      <div style={{ position: "absolute", left: at.x, top: at.y, opacity: fade }}>
        <svg
          width={20 * size}
          height={26 * size}
          viewBox="-2 -2 18 24"
          style={{
            position: "absolute",
            left: -2 * size,
            top: -2 * size,
            transform: `scale(${press * (holding ? 0.94 : 1)})`,
            transformOrigin: `${2 * size}px ${2 * size}px`,
            filter: `drop-shadow(0 ${1.2 * size}px ${1.6 * size}px rgba(0,0,0,0.38))`,
            overflow: "visible",
          }}
        >
          <path d={ARROW} fill="black" stroke="white" strokeWidth="1.15" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};
