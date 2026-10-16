/**
 * Which of three arrangements the card page uses. The decision is made from the width of the box the
 * card sits in, not the width of the window, so the "iPad" and "Điện thoại" frames of the preview look
 * right even on a desktop monitor.
 *
 *   phone    under 640px   the slide fills the screen
 *   tablet   640 - 1023px  one large slide in the middle, arrows at its sides
 *   desktop  1024px and up a left pane (greeting, list of messages) beside a large slide
 */
export type Layout = "phone" | "tablet" | "desktop";

export const TABLET_MIN = 640;
export const DESKTOP_MIN = 1024;

export function layoutFor(width: number): Layout {
  if (!(width > 0)) return "phone"; // not measured yet
  if (width >= DESKTOP_MIN) return "desktop";
  return width >= TABLET_MIN ? "tablet" : "phone";
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
