import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "./lib/geometry";
import { Promo } from "./Promo";
import { DURATION, FPS } from "./scene/timeline";
import video from "./video.json";

export const RemotionRoot: React.FC = () => (
  <Composition
    id={video.composition}
    component={Promo}
    durationInFrames={Math.round(DURATION * FPS)}
    fps={FPS}
    width={VIDEO.w}
    height={VIDEO.h}
  />
);
