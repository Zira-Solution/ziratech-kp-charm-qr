import type { GiftTemplateId, SongSource, TimelineItem } from "../gift-templates/types.ts";
import { DEFAULT_TEMPLATE, getTemplate } from "../gift-templates/template-config.ts";
import { deriveBlocks, isBlockId, type BlockId } from "../gift-templates/blocks.ts";
import { MAX_PHOTOS } from "../../lib/validation/gift.ts";

/** What the buyer is editing in the studio. Strings are never null so inputs stay controlled. */
export interface PhotoDraft {
  url: string;
  caption: string;
  date: string;
}

export interface SongDraft {
  source: SongSource;
  presetId: string;
  link: string;
  title: string;
  artist: string;
}

export interface VoiceDraft {
  audioPath: string; // storage path of the saved recording ("" = none)
  audioUrl: string; // short-lived link to play it back ("" = none)
  durationSec: number;
  noteText: string;
}

export interface GiftDraft {
  template: GiftTemplateId;
  /** The messages the buyer ticked, in the order they are shown. Unticked ones keep their content here. */
  blocks: BlockId[];
  senderName: string;
  recipientName: string;
  addressing: string;
  anonymous: boolean;
  letterTitle: string;
  letterSubtitle: string;
  letterContent: string;
  letterSignature: string;
  photos: PhotoDraft[];
  finalMessage: string;
  anniversaryDate: string;
  anniversaryLabel: string;
  timeline: TimelineItem[];
  videoUrl: string;
  song: SongDraft;
  voice: VoiceDraft;
  /** New 4-digit "OTP xem thiệp". Empty keeps the current one. */
  unlockPin: string;
}

export function emptyDraft(): GiftDraft {
  return {
    template: DEFAULT_TEMPLATE,
    blocks: [],
    senderName: "",
    recipientName: "",
    addressing: "",
    anonymous: false,
    letterTitle: "",
    letterSubtitle: "",
    letterContent: "",
    letterSignature: "",
    photos: [],
    finalMessage: "",
    anniversaryDate: "",
    anniversaryLabel: "",
    timeline: [],
    videoUrl: "",
    song: { source: "none", presetId: "", link: "", title: "", artist: "" },
    voice: { audioPath: "", audioUrl: "", durationSec: 0, noteText: "" },
    unlockPin: "",
  };
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

const photoList = (v: unknown): PhotoDraft[] =>
  Array.isArray(v)
    ? v
        .filter((p) => p && typeof p === "object" && str((p as { url?: unknown }).url))
        .map((p) => {
          const o = p as Record<string, unknown>;
          return { url: str(o.url), caption: str(o.caption), date: str(o.date) };
        })
    : [];

const secondsFrom = (duration: unknown): number => {
  const m = /^(\d{2}):(\d{2})$/.exec(str(duration));
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
};

/** Rebuilds the draft from a saved card (the shape stored in gift_data). Unknown parts stay empty. */
export function draftFromSaved(saved: unknown): GiftDraft {
  const d = emptyDraft();
  if (!saved || typeof saved !== "object") return d;
  const g = saved as Record<string, unknown>;

  d.template = getTemplate(g.template)?.id ?? DEFAULT_TEMPLATE;
  d.senderName = str(g.senderName);
  d.recipientName = str(g.recipientName);
  d.addressing = str(g.addressing);
  d.anonymous = g.anonymous === true;
  d.letterTitle = str(g.letterTitle);
  d.letterSubtitle = str(g.letterSubtitle);
  d.letterContent = str(g.letterContent);
  d.letterSignature = str(g.letterSignature);

  // A card saved before `blocks` existed: work the list out from its content and put its old
  // highlight photos at the front of the album.
  const hasList = Array.isArray(g.blocks);
  d.blocks = [...new Set((hasList ? (g.blocks as unknown[]) : deriveBlocks(g)).filter(isBlockId))];
  const album = photoList(g.memoryPhotos);
  d.photos = (hasList ? album : [...photoList(g.momentPhotos), ...album]).slice(0, MAX_PHOTOS);
  d.finalMessage = str(g.finalMessage);

  const a = g.anniversary as Record<string, unknown> | undefined;
  if (a && typeof a === "object") {
    d.anniversaryDate = str(a.date);
    d.anniversaryLabel = str(a.label);
  }

  if (Array.isArray(g.timeline)) {
    d.timeline = g.timeline.map((t) => {
      const o = (t ?? {}) as Record<string, unknown>;
      return { date: str(o.date), title: str(o.title), text: str(o.text) };
    });
  }

  d.videoUrl = str(g.videoUrl);

  const s = g.song as Record<string, unknown> | undefined;
  if (s && typeof s === "object" && (s.source === "preset" || s.source === "link")) {
    d.song = {
      source: s.source,
      presetId: str(s.presetId),
      link: str(s.link),
      title: s.source === "link" ? str(s.title) : "",
      artist: s.source === "link" ? str(s.artist) : "",
    };
  }

  const v = g.voiceNote as Record<string, unknown> | undefined;
  if (v && typeof v === "object") {
    d.voice = {
      audioPath: str(v.audioPath),
      audioUrl: str(v.audioUrl),
      durationSec: secondsFrom(v.duration),
      noteText: str(v.noteText),
    };
  }
  return d;
}

/** The body sent to POST /api/gifts/[token]/save. The server validates everything again. */
export function draftToPayload(d: GiftDraft): { giftData: Record<string, unknown> } {
  const giftData: Record<string, unknown> = {
    template: d.template,
    blocks: d.blocks,
    senderName: d.senderName,
    recipientName: d.recipientName,
    addressing: d.addressing,
    anonymous: d.anonymous,
    letterTitle: d.letterTitle,
    letterSubtitle: d.letterSubtitle,
    letterContent: d.letterContent,
    letterSignature: d.letterSignature,
    memoryPhotos: d.photos,
    finalMessage: d.finalMessage,
    anniversary: { date: d.anniversaryDate, label: d.anniversaryLabel },
    timeline: d.timeline,
    videoUrl: d.videoUrl,
    song: {
      source: d.song.source,
      presetId: d.song.presetId,
      link: d.song.link,
      title: d.song.title,
      artist: d.song.artist,
    },
    voiceNote: {
      audioPath: d.voice.audioPath || undefined,
      durationSec: d.voice.durationSec,
      noteText: d.voice.noteText,
    },
  };
  if (/^\d{4}$/.test(d.unlockPin)) giftData.pinCode = d.unlockPin;
  return { giftData };
}

/**
 * The ticked messages that have no content yet, in the buyer's order. The server refuses to save a
 * ticked message that is empty, so the studio points at it first.
 */
export function emptyBlocks(d: GiftDraft): BlockId[] {
  const filled: Record<BlockId, boolean> = {
    letter: d.letterContent.trim() !== "",
    photos: d.photos.length > 0,
    voice: d.voice.audioPath !== "",
    video: d.videoUrl.trim() !== "",
    music: d.song.source !== "none",
    anniversary: d.anniversaryDate.trim() !== "",
    timeline: d.timeline.length > 0,
    finalMessage: d.finalMessage.trim() !== "",
  };
  return d.blocks.filter((block) => !filled[block]);
}

/** Whole days from `date` (YYYY-MM-DD) to `today`; negative when the date is still ahead. */
export function daysSince(date: string, today: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const start = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((now - start) / 86_400_000);
}
