// A stand-in for your app, drawn in CSS so the template renders with no image at all.
// For the real video, replace what this window draws with images of your app's own views, placed with <Img> at the
// rects of layout.ts (see references/recipe.md, step 3): never a mock-up that the app does not show.
import React from "react";
import { interpolate, spring } from "remotion";
import { BRAND } from "../brand";
import { box, clamp, Rect } from "../lib/geometry";
import { BADGE, DONE_BUTTON, FEATURES, LABELS, rowRect, TITLE_BAR, toggleRect, WINDOW } from "./layout";
import { FPS, T } from "./timeline";

const Toggle: React.FC<{ rect: Rect; on: number }> = ({ rect, on }) => {
  const knob = rect.h - 6;
  return (
    <div
      style={{
        ...box(rect),
        borderRadius: rect.h / 2,
        backgroundColor: on > 0.5 ? BRAND.accent : "rgba(120,120,135,0.28)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: 3 + on * (rect.w - knob - 6),
          width: knob,
          height: knob,
          borderRadius: "50%",
          backgroundColor: "white",
          boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
};

export const AppWindow: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = seconds * FPS;
  const open = spring({ frame: frame - T.windowOpen * FPS, fps: FPS, config: { damping: 18, stiffness: 120 } });
  if (seconds < T.windowOpen) return null;
  /** 0 to 1 over the 0.15 s after a click on the toggle: the knob slides. */
  const switched = (t: number) => interpolate(seconds, [t + 0.03, t + 0.18], [0, 1], clamp);
  const pressed = seconds >= T.done && seconds < T.done + 0.12 ? 0.96 : 1;
  const badge = interpolate(seconds, [T.done + 0.1, T.done + 0.35], [0, 1], clamp);

  return (
    <div
      style={{
        ...box(WINDOW),
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "rgba(248,248,251,0.97)",
        boxShadow: "0 30px 80px rgba(10,12,40,0.45), 0 0 0 1px rgba(255,255,255,0.5)",
        opacity: Math.min(1, open * 1.3),
        transform: `translateY(${(1 - open) * 24}px) scale(${0.94 + 0.06 * open})`,
      }}
    >
      <div
        style={{
          height: TITLE_BAR,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          fontWeight: 600,
          color: "#2a2d3a",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {BRAND.name}
      </div>
      {FEATURES.map((id, index) => {
        const row = rowRect(index);
        const local = (r: Rect): Rect => ({ ...r, x: r.x - WINDOW.x, y: r.y - WINDOW.y });
        return (
          <React.Fragment key={id}>
            <div
              style={{
                ...box(local(row)),
                borderRadius: 14,
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                paddingLeft: 22,
                gap: 18,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: BRAND.accent, opacity: 0.85 }} />
              <div>
                <div style={{ fontSize: 21, fontWeight: 600, color: "#1f2230" }}>{LABELS[id].title}</div>
                <div style={{ fontSize: 15, color: "#6b6f80", marginTop: 3 }}>{LABELS[id].detail}</div>
              </div>
            </div>
            <Toggle rect={local(toggleRect(index))} on={switched(T.toggles[id])} />
          </React.Fragment>
        );
      })}
      <div
        style={{
          ...box({ ...BADGE, x: BADGE.x - WINDOW.x, y: BADGE.y - WINDOW.y }),
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 20,
          fontWeight: 600,
          color: "#1d8f55",
          opacity: badge,
          transform: `translateX(${(1 - badge) * -12}px)`,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="13" fill="#1d8f55" />
          <path d="M8 14.5 L12.2 18.5 L20 10" stroke="white" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </svg>
        You are all set
      </div>
      <div
        style={{
          ...box({ ...DONE_BUTTON, x: DONE_BUTTON.x - WINDOW.x, y: DONE_BUTTON.y - WINDOW.y }),
          borderRadius: 14,
          backgroundColor: BRAND.accent,
          color: "white",
          fontSize: 21,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pressed})`,
        }}
      >
        Done
      </div>
    </div>
  );
};
