import { LEGACY_TEMPLATES } from "./legacy-templates";
import type { GiftTemplate } from "./template-contract";
import type { GiftTemplateId } from "./types";

/**
 * The template that draws each look. A template moved to the new contract replaces its entry here;
 * the others keep using the wrapped original until their turn.
 */
const TEMPLATES: Record<GiftTemplateId, GiftTemplate> = {
  "storybook-sunset": LEGACY_TEMPLATES["storybook-sunset"],
  "vintage-scrapbook": LEGACY_TEMPLATES["vintage-scrapbook"],
  "retro-nostalgia": LEGACY_TEMPLATES["retro-nostalgia"],
};

export const getViewerTemplate = (id: GiftTemplateId): GiftTemplate => TEMPLATES[id];
