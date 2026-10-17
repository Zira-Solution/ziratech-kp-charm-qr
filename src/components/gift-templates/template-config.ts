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
    "voice",
    "video",
    "music",
    "anniversary",
    "timeline",
    "finalMessage",
  ],
  "vintage-scrapbook": [
    "letter",
    "photos",
    "music",
    "anniversary",
    "finalMessage",
  ],
  "retro-nostalgia": [
    "letter",
    "photos",
    "voice",
    "video",
    "music",
    "finalMessage",
  ],
  "kp-atelier": [
    "letter",
    "photos",
    "voice",
    "music",
    "anniversary",
    "timeline",
    "finalMessage",
  ],
};

export const TEMPLATES: readonly TemplateInfo[] = [
  {
    id: "storybook-sunset",
    name: "Storybook 20/10",
    icon: "🌅",
    desc: "Giấy kem ấm, chữ viết tay, tranh hoàng hôn",
    tag: "Trọn vẹn 8 trang",
    accentColor: "#721a28",
    previewBg: "linear-gradient(135deg, #fdfbf7 0%, #f4ede4 100%)",
    allowedBlocks: TEMPLATE_ALLOWED_BLOCKS["storybook-sunset"],
  },
];

export const DEFAULT_TEMPLATE: GiftTemplateId = "storybook-sunset";

export const getTemplate = (id: unknown): TemplateInfo | undefined => TEMPLATES.find((t) => t.id === id);

export const getTemplateAllowedBlocks = (id: unknown): readonly BlockId[] => {
  const tpl = getTemplate(id);
  return tpl ? tpl.allowedBlocks : TEMPLATE_ALLOWED_BLOCKS[DEFAULT_TEMPLATE];
};
