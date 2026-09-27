// The video: a stage filmed by a moving camera, the app on it, a cursor, subtitles, an end card, a voice and sounds.
// Everything depends on the time (frame / FPS) and nothing on chance: every render is the same.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FONT, WALLPAPER } from "./brand";
import { cameraAt, stageTransform, toScreen } from "./lib/camera";
import { cursorAt } from "./lib/cursor";
import { clamp, STAGE } from "./lib/geometry";
import { Cursor } from "./components/Cursor";
import { EndCard } from "./components/EndCard";
import { Subtitles } from "./components/Subtitles";
import { AppWindow } from "./scene/AppWindow";
import { CAMERA, PATH } from "./scene/moves";
import { DURATION, FPS, frame as toFrame, isRecorded, LINES, PAGES, T, voiceLength, voiceStart } from "./scene/timeline";

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = frame / FPS;
  const camera = cameraAt(CAMERA, seconds);
  const cursor = cursorAt(PATH, seconds);
  const ending = interpolate(seconds, [T.endCard, T.endCard + 0.6], [0, 1], clamp);

  return (
    // The same background behind the stage: the blur of the end card then never shows dark edges.
    <AbsoluteFill style={{ background: WALLPAPER, fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: STAGE.w,
          height: STAGE.h,
          transformOrigin: "0 0",
          transform: stageTransform(camera),
          filter: ending > 0 ? `blur(${ending * 18}px)` : undefined,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: WALLPAPER }} />
        <AppWindow seconds={seconds} />
      </div>
      <Cursor
        at={toScreen(camera, cursor)}
        camera={camera}
        clicks={PATH.clicks}
        seconds={seconds}
        fade={1 - ending}
        placeOf={(click) => toScreen(camera, cursorAt(PATH, click.t))}
      />
      <EndCard seconds={seconds} />
      <Subtitles pages={PAGES} seconds={seconds} />

      {/* One recording per voice line (public/voice/<id>.wav, made by scripts/voice.py). */}
      {LINES.filter(isRecorded).map((id) => (
        <Sequence
          key={id}
          from={toFrame(voiceStart(id))}
          durationInFrames={Math.ceil(voiceLength(id) * FPS) + 2}
          layout="none"
        >
          <Audio src={staticFile(`voice/${id}.wav`)} />
        </Sequence>
      ))}
      {/* A click sound on each click, and a very quiet pad under the voice (public/gen, made by scripts/prepare.py). */}
      {PATH.clicks
        .filter((c) => c.kind !== "release")
        .map((c) => (
          <Sequence key={c.t} from={toFrame(Math.max(0, c.t - 0.02))} durationInFrames={8} layout="none">
            <Audio src={staticFile("gen/click.wav")} volume={() => (c.button === "right" ? 0.8 : 1)} />
          </Sequence>
        ))}
      <Sequence durationInFrames={toFrame(DURATION)} layout="none">
        <Audio src={staticFile("gen/pad.wav")} volume={() => 0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
