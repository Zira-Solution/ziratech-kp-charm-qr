import type { GiftTemplateId } from "./types.ts";

/**
 * Which pieces of information a card template can show. The studio only offers the blocks of the
 * template being edited, and the server drops blocks the template does not support.
 * "names" is always present and is not listed.
 */
export type BlockId =
  | "letter"
  | "photos"
  | "highlight"
  | "finalMessage"
  | "music"
  | "voice"
  | "video"
  | "anniversary"
  | "timeline";

/** Names shown to the buyer for each block. */
export const BLOCK_LABELS: Record<BlockId, string> = {
  letter: "Thư tay",
  photos: "Album ảnh",
  highlight: "Ảnh nổi bật",
  finalMessage: "Lời kết",
  music: "Nhạc nền",
  voice: "Ghi âm",
  video: "Video",
  anniversary: "Ngày kỷ niệm",
  timeline: "Mốc thời gian",
};

export interface TemplateInfo {
  id: GiftTemplateId;
  name: string;
  icon: string;
  desc: string;
  blocks: readonly BlockId[];
  /** How many highlight photos the template has room for (0 when it has no highlight block). */
  highlightMax: number;
}

export const TEMPLATES: readonly TemplateInfo[] = [
  {
    id: "storybook-sunset",
    name: "Storybook 20/10",
    icon: "🌅",
    desc: "Mẫu chuẩn thiết kế 7 slide tương tác",
    blocks: ["letter", "photos", "highlight", "finalMessage", "music", "voice", "video", "timeline"],
    highlightMax: 1,
  },
  {
    id: "vintage-scrapbook",
    name: "Sổ Hoa Khô",
    icon: "🌸",
    desc: "Giấy vintage, washi tape mộc mạc",
    blocks: ["letter", "photos", "finalMessage", "anniversary"],
    highlightMax: 0,
  },
  {
    id: "retro-nostalgia",
    name: "Retro 90s",
    icon: "📼",
    desc: "Băng cassette, phong cách hoài niệm",
    blocks: ["letter", "photos", "highlight", "finalMessage", "music", "voice", "video"],
    highlightMax: 2,
  },
];

export const DEFAULT_TEMPLATE: GiftTemplateId = "storybook-sunset";

export const getTemplate = (id: unknown): TemplateInfo | undefined => TEMPLATES.find((t) => t.id === id);

export const templateHasBlock = (id: GiftTemplateId, block: BlockId): boolean =>
  getTemplate(id)?.blocks.includes(block) ?? false;
