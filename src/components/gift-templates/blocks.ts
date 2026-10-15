/**
 * The kinds of message a buyer can put on a card. The buyer ticks the ones they want and orders them;
 * the saved card carries that list as `blocks`. A template is only a look: it can draw every kind.
 * "names" (recipient, sender, how they address each other) is always present and is not listed here.
 */
export const BLOCK_IDS = ["letter", "photos", "voice", "video", "music", "anniversary", "timeline", "finalMessage"] as const;

export type BlockId = (typeof BLOCK_IDS)[number];

/** Names shown to the buyer. */
export const BLOCK_LABELS: Record<BlockId, string> = {
  letter: "Thư tay",
  photos: "Ảnh",
  voice: "Ghi âm",
  video: "Video",
  music: "Nhạc",
  anniversary: "Ngày kỷ niệm",
  timeline: "Mốc thời gian",
  finalMessage: "Lời kết",
};

/** Order used for cards saved before `blocks` existed. */
export const DEFAULT_BLOCK_ORDER: readonly BlockId[] = [
  "letter",
  "photos",
  "video",
  "music",
  "voice",
  "anniversary",
  "timeline",
  "finalMessage",
];

export const isBlockId = (value: unknown): value is BlockId => (BLOCK_IDS as readonly unknown[]).includes(value);

const text = (v: unknown) => typeof v === "string" && v.trim() !== "";
const items = (v: unknown) => Array.isArray(v) && v.length > 0;
const field = (o: Record<string, unknown>, key: string): Record<string, unknown> => {
  const v = o[key];
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
};

/**
 * For a card or payload without `blocks`: the messages that have content, in the default order.
 * Old highlight photos (`momentPhotos`) count as photos.
 */
export function deriveBlocks(input: unknown): BlockId[] {
  if (!input || typeof input !== "object" || Array.isArray(input)) return [];
  const g = input as Record<string, unknown>;

  const has: Record<BlockId, boolean> = {
    letter: text(g.letterContent),
    photos: items(g.memoryPhotos) || items(g.momentPhotos),
    video: text(g.videoUrl),
    music: ["preset", "link"].includes(String(field(g, "song").source)),
    voice: text(field(g, "voiceNote").audioPath),
    anniversary: text(field(g, "anniversary").date),
    timeline: items(g.timeline),
    finalMessage: text(g.finalMessage),
  };
  return DEFAULT_BLOCK_ORDER.filter((id) => has[id]);
}
