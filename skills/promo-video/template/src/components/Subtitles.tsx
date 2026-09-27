// Subtitles: a dark pill, centred near the bottom, one short page at a time. Generic: keep it as it is.
import React from "react";
import { VIDEO } from "../lib/geometry";
import { TimedPage } from "../lib/subtitles";

/** Sizes are set for 1080 pixels on the short side of the video, and scale with it (886 on an iPhone preview). */
const U = Math.min(VIDEO.w, VIDEO.h) / 1080;

export const Subtitles: React.FC<{ pages: TimedPage[]; seconds: number }> = ({ pages, seconds }) => {
  const page = pages.find((p) => seconds >= p.start - 0.05 && seconds < p.end);
  if (!page) return null;
  const opacity = Math.min(1, (seconds - page.start + 0.05) / 0.12, (page.end - seconds) / 0.12);
  return (
    <div
      style={{
        position: "absolute",
        left: 40 * U,
        right: 40 * U,
        bottom: 104 * U,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* The opacity sits on the pill itself: on a parent, Chrome switches off the blur behind the pill. */}
      <div
        style={{
          opacity,
          padding: `${12 * U}px ${30 * U}px ${14 * U}px`,
          borderRadius: 20 * U,
          backgroundColor: "rgba(12,14,24,0.66)",
          backdropFilter: `blur(${12 * U}px)`,
          color: "white",
          fontSize: 44 * U,
          fontWeight: 600,
          letterSpacing: -0.2,
          lineHeight: 1.2,
          textAlign: "center",
          // One line per page, never cut: keep pages short instead (the longest must fit the width).
          whiteSpace: "nowrap",
        }}
      >
        {page.text}
      </div>
    </div>
  );
};
