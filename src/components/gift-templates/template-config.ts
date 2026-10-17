import type { GiftTemplateId } from "./types.ts";

/**
 * The looks a card can have. A look is a skin on the shared pages (see `skins/`): it decides how the
 * card is dressed, never what it contains. What a card contains is its `blocks` list (see `blocks.ts`).
 */
export interface TemplateInfo {
  id: GiftTemplateId;
  name: string;
  icon: string;
  desc: string;
}

export const TEMPLATES: readonly TemplateInfo[] = [
  {
    id: "storybook-sunset",
    name: "Storybook 20/10",
    icon: "🌅",
    desc: "Giấy kem ấm, chữ viết tay, tranh hoàng hôn",
  },
  {
    id: "vintage-scrapbook",
    name: "Sổ Hoa Khô",
    icon: "🌸",
    desc: "Giấy vintage, washi tape mộc mạc",
  },
  {
    id: "retro-nostalgia",
    name: "Retro 90s",
    icon: "📼",
    desc: "Nền chấm bi, tiêu đề 3D, màu hoài niệm",
  },
  {
    id: "kp-atelier",
    name: "K&P Atelier",
    icon: "💌",
    desc: "Giấy hồng phấn, chữ nghiêng đỏ rượu, ảnh polaroid",
  },
];

export const DEFAULT_TEMPLATE: GiftTemplateId = "storybook-sunset";

export const getTemplate = (id: unknown): TemplateInfo | undefined => TEMPLATES.find((t) => t.id === id);
