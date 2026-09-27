// The end card: icon, name, promise and where to get the app, each line arriving with its word.
import React from "react";
import { Img, interpolate, spring, staticFile } from "remotion";
import { BRAND } from "../brand";
import { clamp, VIDEO } from "../lib/geometry";
import { FPS, T, voiceStart } from "../scene/timeline";

const U = Math.min(VIDEO.w, VIDEO.h) / 1080;

const Icon: React.FC<{ size: number }> = ({ size }) =>
  BRAND.icon ? (
    <Img src={staticFile(BRAND.icon)} style={{ width: size, height: size }} />
  ) : (
    // A placeholder until public/app/icon.png exists: a rounded tile with the first letter of the name.
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        background: `linear-gradient(150deg, white -40%, ${BRAND.accent} 70%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        fontWeight: 700,
        color: "white",
      }}
    >
      {BRAND.name.slice(0, 1)}
    </div>
  );

export const EndCard: React.FC<{ seconds: number }> = ({ seconds }) => {
  if (seconds < T.endCard) return null;
  const frame = (seconds - T.endCard) * FPS;
  const pop = (delay: number) =>
    spring({ frame: frame - delay * FPS, fps: FPS, config: { damping: 16, stiffness: 140, mass: 0.8 } });
  const veil = interpolate(seconds, [T.endCard, T.endCard + 0.5], [0, 1], clamp);
  const icon = pop(0.1);
  const name = pop(0.2);
  const outro = voiceStart("outro") - T.endCard;
  const promise = pop(outro + T.endCardLines.promise - 0.1);
  const store = pop(outro + T.endCardLines.store - 0.1);
  const rise = (p: number) => ({ opacity: Math.min(1, p * 1.3), transform: `translateY(${(1 - p) * 26 * U}px)` });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(14,16,40,${0.34 * veil})` }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: VIDEO.h * 0.176,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white",
          textShadow: "0 2px 18px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            opacity: Math.min(1, icon * 1.4),
            transform: `scale(${0.6 + 0.4 * icon})`,
            filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.3))",
          }}
        >
          <Icon size={200 * U} />
        </div>
        <div style={{ fontSize: 112 * U, fontWeight: 700, letterSpacing: -2, marginTop: 18 * U, ...rise(name) }}>
          {BRAND.name}
        </div>
        <div style={{ fontSize: 50 * U, fontWeight: 500, marginTop: 6 * U, ...rise(promise) }}>{BRAND.promise}</div>
        <div
          style={{
            marginTop: 30 * U,
            padding: `${10 * U}px ${28 * U}px ${12 * U}px`,
            borderRadius: 40 * U,
            fontSize: 36 * U,
            fontWeight: 600,
            backgroundColor: "rgba(255,255,255,0.16)",
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.4)",
            ...rise(store),
          }}
        >
          {BRAND.store}
        </div>
      </div>
    </div>
  );
};
