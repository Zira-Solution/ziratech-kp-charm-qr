import type { ReactNode } from "react";
import type { BlockId } from "./blocks";
import type { Layout } from "./layout";
import type { ViewerGift } from "./normalize";
import type { GiftTemplateId } from "./types";

/** One page of the card. */
export interface SlideDef {
  id: string;
  /** Short name for the navigation list and for screen readers. */
  label: string;
  /** Material Symbols icon name. */
  icon: string;
}

/** What the page tells a template about where it is being drawn. */
export interface TemplateContext {
  layout: Layout;
  /** Width of the box the card sits in, in pixels. */
  width: number;
  index: number;
  count: number;
  go: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Asks the server for a fresh link to the recording (the old one expires after an hour). */
  refreshVoiceUrl?: () => Promise<string | null>;
}

/**
 * A look for the card. It draws the pages; the page around it (layout for the device, navigation, keys,
 * swipe) belongs to the shared viewer, so every template behaves the same on phone, iPad and desktop.
 */
export interface GiftTemplate {
  id: GiftTemplateId;
  /** The pages for this card: the opening, one per ticked message in the buyer's order, the closing. */
  slides: (gift: ViewerGift) => SlideDef[];
  render: (slide: SlideDef, gift: ViewerGift, ctx: TemplateContext) => ReactNode;
}

const BLOCK_SLIDE: Record<BlockId, { label: string; icon: string }> = {
  letter: { label: "Thư tay", icon: "mail" },
  photos: { label: "Ảnh", icon: "photo_library" },
  voice: { label: "Ghi âm", icon: "mic" },
  video: { label: "Video", icon: "movie" },
  music: { label: "Nhạc", icon: "music_note" },
  anniversary: { label: "Ngày kỷ niệm", icon: "event" },
  timeline: { label: "Mốc thời gian", icon: "timeline" },
  finalMessage: { label: "Lời kết", icon: "favorite" },
};

/** Opening, one page per ticked message, closing. A template may use this as it is. */
export function defaultSlides(gift: ViewerGift): SlideDef[] {
  return [
    { id: "open", label: "Mở quà", icon: "featured_seasonal_and_gifts" },
    ...gift.blocks.map((block) => ({ id: block, ...BLOCK_SLIDE[block] })),
    { id: "closing", label: "Lời cảm ơn", icon: "favorite" },
  ];
}
