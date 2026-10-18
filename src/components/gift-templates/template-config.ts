import type { GiftTemplateId } from "./types.ts";
import type { BlockId } from "./blocks.ts";

/**
 * The looks a card can have. Each template has a distinct visual personality
 * and supports a tailored set of message blocks.
 */
export interface TemplateInfo {
  id: GiftTemplateId;
  name: string;
  icon: string;
  desc: string;
  tag: string;
  accentColor: string;
  previewBg: string;
  allowedBlocks: readonly BlockId[];
}

export const TEMPLATE_ALLOWED_BLOCKS: Record<GiftTemplateId, readonly BlockId[]> = {
  "storybook-sunset": [
    "letter",
    "photos",
    "video",
    "music",
    "voice",
    "finalMessage",
  ],
  "messenger": [
    "letter",
    "photos",
    "voice",
    "music",
    "finalMessage",
  ],
  "vintage-scrapbook": [
    "letter",
    "photos",
    "music",
  ],
  "retro-nostalgia": [
    "letter",
    "photos",
    "voice",
    "video",
    "music",
  ],
  "kp-atelier": [
    "letter",
    "photos",
    "voice",
    "music",
  ],
};

export const TEMPLATES: readonly TemplateInfo[] = [
  {
    id: "storybook-sunset",
    name: "Storybook Hoàng Hôn",
    icon: "🌅",
    desc: "Trọn vẹn 7 trang nghệ thuật: Giấy kem ấm, chữ viết tay, cassette nhạc, album ảnh",
    tag: "Mẫu 1 · 7 Trang Nghệ Thuật",
    accentColor: "#721a28",
    previewBg: "linear-gradient(135deg, #fdfbf7 0%, #f4ede4 100%)",
    allowedBlocks: TEMPLATE_ALLOWED_BLOCKS["storybook-sunset"],
  },
  {
    id: "messenger",
    name: "Hộp Quà Messenger",
    icon: "💬",
    desc: "Màn hình khóa iPhone 20/10, tin nhắn Messenger tâm tình, cuộn phim kỷ niệm, thư tay & voice note",
    tag: "Mẫu 2 · Khóa iPhone & Chat",
    accentColor: "#e11d48",
    previewBg: "linear-gradient(135deg, #fce7f3 0%, #ffe4e6 100%)",
    allowedBlocks: TEMPLATE_ALLOWED_BLOCKS["messenger"],
  },
];

export const DEFAULT_TEMPLATE: GiftTemplateId = "storybook-sunset";

export const getTemplate = (id: unknown): TemplateInfo | undefined => TEMPLATES.find((t) => t.id === id);

export const getTemplateAllowedBlocks = (id: unknown): readonly BlockId[] => {
  const tpl = getTemplate(id);
  return tpl ? tpl.allowedBlocks : TEMPLATE_ALLOWED_BLOCKS[DEFAULT_TEMPLATE];
};
