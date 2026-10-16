/**
 * The card is one frame that fills the screen. Its shape follows the shape of the box it sits in:
 *
 *   portrait   phones, and a tablet held upright   picture on top, content below
 *   landscape  a tablet held sideways, computers   picture on the left, content on the right
 *
 * The decision is made from the box, not the window, so the "iPad" and "Điện thoại" frames of the
 * preview look right even on a desktop monitor.
 */
export type Layout = "portrait" | "landscape";

/** Narrower than this there is no room for two halves side by side. */
export const LANDSCAPE_MIN_WIDTH = 640;
/** The box must be at least this much wider than it is tall. */
export const LANDSCAPE_RATIO = 1.15;

export function layoutFor(width: number, height: number): Layout {
  if (!(width > 0) || !(height > 0)) return "portrait"; // not measured yet
  return width >= LANDSCAPE_MIN_WIDTH && width >= height * LANDSCAPE_RATIO ? "landscape" : "portrait";
}

/** The slide to show after moving by `delta`, kept inside 0..count-1. */
export function moveIndex(index: number, delta: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, index + delta));
}

/** What a screen reader says when the slide changes. */
export function slideAnnouncement(index: number, slides: readonly { label: string }[]): string {
  const slide = slides[index];
  return slide ? `Trang ${index + 1} trên ${slides.length}: ${slide.label}` : "";
}
