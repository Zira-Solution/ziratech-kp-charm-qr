import { ATELIER_SKIN } from "./skins/atelier";
import { RETRO_SKIN } from "./skins/retro";
import { STORYBOOK_SKIN } from "./skins/storybook";
import { VINTAGE_SKIN } from "./skins/vintage";
import { makeTemplate } from "./slides/make-template";
import type { GiftTemplate } from "./template-contract";
import type { GiftTemplateId } from "./types";

/** The template that draws each look: a skin on the shared pages. */
const TEMPLATES: Record<GiftTemplateId, GiftTemplate> = {
  "storybook-sunset": makeTemplate(STORYBOOK_SKIN),
  "vintage-scrapbook": makeTemplate(VINTAGE_SKIN),
  "retro-nostalgia": makeTemplate(RETRO_SKIN),
  "kp-atelier": makeTemplate(ATELIER_SKIN),
};

export const getViewerTemplate = (id: GiftTemplateId): GiftTemplate => TEMPLATES[id];
