// When each subtitle page shows. Generic: keep it as it is.

/** A page of subtitles: `at` seconds into its voice line. Cut long sentences where the voice breathes. */
export type Page = { line: string; at: number; text: string };
export type TimedPage = Page & { start: number; end: number };

export const timePages = (
  pages: Page[],
  lineStart: (id: string) => number,
  lineEnd: (id: string) => number,
  duration: number,
): TimedPage[] =>
  pages.map((page, index) => {
    const start = lineStart(page.line) + page.at;
    const next = pages[index + 1];
    const nextStart = next ? lineStart(next.line) + next.at : Infinity;
    const sameLine = next !== undefined && next.line === page.line;
    // A page stays a moment after its words, has faded out when the next one fades in, and is gone before the
    // last frame.
    const end = Math.min(sameLine ? nextStart : lineEnd(page.line) + 0.25, nextStart - 0.05, duration - 0.12);
    return { ...page, start, end };
  });
