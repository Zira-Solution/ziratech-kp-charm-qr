import type { BlockId } from "../gift-templates/template-config";

/**
 * Blocks the studio can edit so far, in the order they appear on the page.
 * A template may declare more blocks than this; the studio and the template picker only offer these.
 */
export const BLOCK_ORDER: readonly BlockId[] = [
  "letter",
  "photos",
  "highlight",
  "finalMessage",
  "anniversary",
  "timeline",
  "music",
  "voice",
  "video",
];

export const IMPLEMENTED_BLOCKS: ReadonlySet<BlockId> = new Set<BlockId>([
  "letter",
  "photos",
  "highlight",
  "finalMessage",
  "anniversary",
  "timeline",
  "music",
  "video",
]);
