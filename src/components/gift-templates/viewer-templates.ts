import { ATELIER_SKIN } from "./skins/atelier";
import { RETRO_SKIN } from "./skins/retro";
import { VINTAGE_SKIN } from "./skins/vintage";
import { STORYBOOK_TEMPLATE } from "./storybook";
import { makeTemplate } from "./slides/make-template";
import type { GiftTemplate } from "./template-contract";
import type { GiftTemplateId } from "./types";

/** The template that draws each look: a skin on the shared pages. */
const TEMPLATES: Record<GiftTemplateId, GiftTemplate> = {
  "storybook-sunset": STORYBOOK_TEMPLATE,
  "vintage-scrapbook": makeTemplate(VINTAGE_SKIN),
  "retro-nostalgia": makeTemplate(RETRO_SKIN),
  "kp-atelier": makeTemplate(ATELIER_SKIN),
};

export const getViewerTemplate = (id: GiftTemplateId): GiftTemplate => TEMPLATES[id];
