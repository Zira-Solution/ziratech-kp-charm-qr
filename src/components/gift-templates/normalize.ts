import { deriveBlocks, isBlockId, type BlockId } from "./blocks.ts";
import { getMusicPreset } from "./music-presets.ts";
import { DEFAULT_TEMPLATE, getTemplate } from "./template-config.ts";
import type { GiftTemplateId, TimelineItem } from "./types.ts";
import type { CleanMessenger } from "../../lib/validation/gift.ts";

/**
 * A card ready to draw. Built from whatever was saved, never from sample data: a message that was not
 * ticked, or has no content, is simply absent, so a template can render exactly what is here.
 */
export interface ViewerGift {
  template: GiftTemplateId;
  /** Messages to show, in order. Every id here has its content below. */
  blocks: BlockId[];
  recipientName: string;
  /** Empty when the sender chose to stay anonymous. */
  sender: string;
  anonymous: boolean;
  /** How the sender addresses the recipient, e.g. "Anh - Em". */
  addressing: string;
  letter?: { title: string; subtitle: string; content: string; signature: string };
  photos: { url: string; caption: string; date: string }[];
  finalMessage?: string;
  finalTitle?: string;
  finalSubtitle?: string;
  video?: string;
  videoAspectRatio?: "16:9" | "1:1" | "9:16";
  song?: { source: "preset" | "link" | "upload"; presetId?: string; link?: string; audioPath?: string; audioUrl?: string; title: string; artist: string };
  voice?: { audioPath: string; audioUrl?: string; duration: string; noteText: string };
  anniversary?: { date: string; label: string };
  timeline: TimelineItem[];
  messenger?: CleanMessenger;
}

const MAX_PHOTOS = 6;
const MAX_TIMELINE = 5;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: unknown) => (typeof v === "string" ? v : "");
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

function photoList(v: unknown): ViewerGift["photos"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((p) => obj(p))
    .filter((p) => str(p.url).trim() !== "")
    .map((p) => ({ url: str(p.url).trim(), caption: str(p.caption), date: str(p.date) }));
}

function timelineList(v: unknown): TimelineItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((t) => obj(t))
    .filter((t) => DATE.test(str(t.date)) && str(t.title).trim() !== "")
    .slice(0, MAX_TIMELINE)
    .map((t) => ({ date: str(t.date), title: str(t.title), text: str(t.text) }));
}

/** Turns a saved card (or an editor payload) into what the templates draw. Never throws. */
export function normalizeGift(saved: unknown): ViewerGift {
  const g = obj(saved);

  // Cards saved before `blocks` existed: work the list out from their content, and put the old
  // highlight photos at the front of the album.
  const hasList = Array.isArray(g.blocks);
  const wanted = hasList ? (g.blocks as unknown[]) : deriveBlocks(g);
  const chosen = [...new Set(wanted.filter(isBlockId))];

  const album = photoList(g.memoryPhotos);
  const photos = (hasList ? album : [...photoList(g.momentPhotos), ...album]).slice(0, MAX_PHOTOS);

  const anonymous = g.anonymous === true;
  const out: ViewerGift = {
    template: getTemplate(g.template)?.id ?? DEFAULT_TEMPLATE,
    blocks: [],
    recipientName: str(g.recipientName).trim(),
    sender: anonymous ? "" : str(g.senderName).trim(),
    anonymous,
    addressing: str(g.addressing).trim(),
    finalMessage: undefined,
    photos: [],
    timeline: [],
  };

  const content: Record<BlockId, () => boolean> = {
    letter: () => {
      const text = str(g.letterContent).trim();
      if (!text) return false;
      out.letter = {
        title: str(g.letterTitle).trim() || "LỜI NHẮN",
        subtitle: str(g.letterSubtitle),
        content: text,
        signature: str(g.letterSignature),
      };
      return true;
    },
    photos: () => {
      out.photos = photos;
      return photos.length > 0;
    },
    video: () => {
      const link = str(g.videoUrl).trim();
      if (link) {
        out.video = link;
        const aspect = str(g.videoAspectRatio);
        if (["16:9", "1:1", "9:16"].includes(aspect)) {
          out.videoAspectRatio = aspect as "16:9" | "1:1" | "9:16";
        }
      }
      return !!link;
    },
    music: () => {
      const s = obj(g.song);
      const source = s.source;
      if (source === "preset" && str(s.presetId)) {
        // The melody's own name when the card does not carry one (a draft being previewed does not).
        out.song = { source, presetId: str(s.presetId), title: str(s.title) || getMusicPreset(s.presetId)?.name || "", artist: str(s.artist) };
      } else if (source === "upload" && (str(s.audioPath) || str(s.audioUrl))) {
        out.song = {
          source: "upload",
          audioPath: str(s.audioPath) || undefined,
          audioUrl: str(s.audioUrl) || undefined,
          title: str(s.title) || "Bài hát yêu thích",
          artist: str(s.artist),
        };
      } else if (source === "link" && str(s.link)) {
        out.song = { source, link: str(s.link), title: str(s.title), artist: str(s.artist) };
      }
      return !!out.song;
    },
    voice: () => {
      const v = obj(g.voiceNote);
      const audioPath = str(v.audioPath).trim();
      if (!audioPath) return false;
      out.voice = {
        audioPath,
        audioUrl: str(v.audioUrl) || undefined,
        duration: str(v.duration) || "00:00",
        noteText: str(v.noteText),
      };
      return true;
    },
    anniversary: () => {
      const a = obj(g.anniversary);
      if (!DATE.test(str(a.date))) return false;
      out.anniversary = { date: str(a.date), label: str(a.label).trim() || "Ngày kỷ niệm" };
      return true;
    },
    timeline: () => {
      out.timeline = timelineList(g.timeline);
      return out.timeline.length > 0;
    },
    finalMessage: () => {
      const text = str(g.finalMessage).trim();
      if (text) {
        out.finalMessage = text;
        if (str(g.finalTitle).trim()) out.finalTitle = str(g.finalTitle).trim();
        if (str(g.finalSubtitle).trim()) out.finalSubtitle = str(g.finalSubtitle).trim();
      }
      return !!text;
    },
  };

  // Keep the buyer's order; an unknown id was already dropped above.
  out.blocks = chosen.filter((id) => content[id]());
  if (g.messenger && typeof g.messenger === "object") {
    out.messenger = g.messenger as CleanMessenger;
  }
  return out;
}
