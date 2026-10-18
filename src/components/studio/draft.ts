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

export interface MessengerDraft {
  wallpaperUrl: string;
  chatWallpaperUrl?: string;
  avatarUrl: string;
  notificationText: string;
  messages: string[];
  showFloatingHearts: boolean;
  giftLeadMessage: string;
  voiceLeadMessage: string;
  voiceAfterMessage: string;
  videoUrl?: string;
  videoLeadMessage?: string;
  videoTitle?: string;
}

export const DEFAULT_MESSENGER_DRAFT: MessengerDraft = {
  wallpaperUrl: "/images/default_lockscreen_girl.jpg",
  chatWallpaperUrl: "/images/messenger_pink_theme_bg.png",
  avatarUrl: "/images/default_avatar.png",
  notificationText: "hello bé iu",
  messages: [
    "Hello bé iu của anh ❤️",
    "Hôm nay là 20/10, ngày phụ nữ Việt Nam nè 🌸",
    "Anh có chuẩn bị một món quà bất ngờ nho nhỏ dành riêng cho em",
    "Cảm ơn em vì đã luôn ở bên cạnh anh, làm cho mỗi ngày trôi qua đều thật ấm áp và ngập tràn hạnh phúc",
    "Chúc công chúa của anh luôn xinh đẹp, rạng rỡ và luôn nở nụ cười thật tươi nhé ✨",
    "Thương em nhiều lắm! 💕",
    "Giữ lá thư nhỏ bên dưới để mở thư tay anh viết riêng cho em nhé 💌",
  ],
  showFloatingHearts: true,
  giftLeadMessage: "Còn một món quà nhỏ nữa anh để dành cho em, chạm vào hộp quà bên dưới nhé 🎁",
  voiceLeadMessage: "Anh có ghi âm một đoạn nhỏ gửi em, em nghe thử nhé 🎧",
  voiceAfterMessage: "Anh thương em nhiều lắm, chúc em ngày 20/10 thật vui nha 💕",
  videoUrl: "",
  videoLeadMessage: "Anh có một video nhỏ gửi cho em nè 🎬",
  videoTitle: "Video kỷ niệm dành riêng cho em",
};

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
  videoAspectRatio: "16:9" | "1:1" | "9:16";
  song: SongDraft;
  voice: VoiceDraft;
  /** Whether the recipient must enter a 4-digit OTP/PIN to unlock the card (defaults to true). */
  requirePin: boolean;
  /** New 4-digit "OTP xem thiệp". Empty keeps the current one. */
  unlockPin: string;
  messenger: MessengerDraft;
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
    videoAspectRatio: "16:9",
    song: { source: "none", presetId: "", link: "", title: "", artist: "" },
    voice: { audioPath: "", audioUrl: "", durationSec: 0, noteText: "" },
    requirePin: true,
    unlockPin: "",
    messenger: { ...DEFAULT_MESSENGER_DRAFT, messages: [...DEFAULT_MESSENGER_DRAFT.messages] },
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
  d.requirePin = g.requirePin !== false;
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
  const aspect = str(g.videoAspectRatio);
  d.videoAspectRatio = (["16:9", "1:1", "9:16"].includes(aspect) ? aspect : "16:9") as "16:9" | "1:1" | "9:16";

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

  const m = g.messenger as Record<string, unknown> | undefined;
  if (m && typeof m === "object") {
    d.messenger = {
      wallpaperUrl: str(m.wallpaperUrl) || DEFAULT_MESSENGER_DRAFT.wallpaperUrl,
      chatWallpaperUrl: str(m.chatWallpaperUrl) || DEFAULT_MESSENGER_DRAFT.chatWallpaperUrl,
      avatarUrl: str(m.avatarUrl) || DEFAULT_MESSENGER_DRAFT.avatarUrl,
      notificationText: str(m.notificationText) || DEFAULT_MESSENGER_DRAFT.notificationText,
      messages: Array.isArray(m.messages)
        ? (m.messages as unknown[]).map(str).filter(Boolean)
        : [...DEFAULT_MESSENGER_DRAFT.messages],
      showFloatingHearts: m.showFloatingHearts !== false,
      giftLeadMessage: str(m.giftLeadMessage) || DEFAULT_MESSENGER_DRAFT.giftLeadMessage,
      voiceLeadMessage: str(m.voiceLeadMessage) || DEFAULT_MESSENGER_DRAFT.voiceLeadMessage,
      voiceAfterMessage: str(m.voiceAfterMessage) || DEFAULT_MESSENGER_DRAFT.voiceAfterMessage,
      videoUrl: str(m.videoUrl) || str(g.videoUrl) || "",
      videoLeadMessage: str(m.videoLeadMessage) || DEFAULT_MESSENGER_DRAFT.videoLeadMessage || "Anh có một video nhỏ gửi cho em nè 🎬",
      videoTitle: str(m.videoTitle) || DEFAULT_MESSENGER_DRAFT.videoTitle || "Video kỷ niệm dành riêng cho em",
    };
    if (d.messenger.videoUrl && !d.videoUrl) {
      d.videoUrl = d.messenger.videoUrl;
    }
  }

  return d;
}

/** The body sent to POST /api/gifts/[token]/save. The server validates everything again. */
export function draftToPayload(d: GiftDraft): { giftData: Record<string, unknown> } {
  const videoUrl = (d.messenger?.videoUrl || d.videoUrl || "").trim();
  const giftData: Record<string, unknown> = {
    template: d.template,
    blocks: d.blocks,
    senderName: d.senderName,
    recipientName: d.recipientName,
    requirePin: d.requirePin,
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
    videoUrl,
    videoAspectRatio: d.videoAspectRatio || "16:9",
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
    messenger: {
      ...d.messenger,
      chatWallpaperUrl: d.messenger.chatWallpaperUrl || DEFAULT_MESSENGER_DRAFT.chatWallpaperUrl,
      videoUrl: videoUrl || undefined,
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
    video: d.videoUrl.trim() !== "" || (d.messenger?.videoUrl?.trim() ?? "") !== "",
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
