/**
 * Validation and cleaning for the gift card content a buyer saves from the studio.
 *
 * Pure functions (no framework imports) so they can be unit-tested with `npm test`.
 * Rules: text is stored exactly as typed (React escapes it when rendering); photos and links are
 * kept whole or rejected with a message, never truncated; the result is rebuilt from an allowlist of
 * fields, so unknown fields sent by the browser never reach the database.
 */
import { DEFAULT_TEMPLATE, getTemplate } from "../../components/gift-templates/template-config.ts";
import { BLOCK_LABELS, deriveBlocks, isBlockId, type BlockId } from "../../components/gift-templates/blocks.ts";
import { getMusicPreset } from "../../components/gift-templates/music-presets.ts";
import type { GiftTemplateId, SongSource, TimelineItem } from "../../components/gift-templates/types.ts";

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };
const ok = <T>(value: T): Parsed<T> => ({ ok: true, value });
const fail = <T = never>(error: string): Parsed<T> => ({ ok: false, error });

/** Plain text: strips control characters (keeps line breaks), trims, and caps the length. */
export function cleanText(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

// ---------------------------------------------------------------- limits
export const MAX_PHOTOS = 6;
/** Longest accepted photo data URL, in characters (~300 KB of image data). The studio compresses below this. */
export const MAX_PHOTO_CHARS = 400_000;
const MAX_PHOTO_LINK_CHARS = 500;
export const MAX_TIMELINE = 5;
export const MAX_LINK_CHARS = 300;
export const MAX_VOICE_SECONDS = 120;

/** Hosts a buyer may link to. Only https, and only these sites (or their subdomains). */
export const MUSIC_HOSTS = ["youtube.com", "youtu.be", "music.youtube.com", "open.spotify.com", "soundcloud.com"] as const;
export const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com", "drive.google.com"] as const;

const DATA_IMAGE = /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;

// ---------------------------------------------------------------- links
/** An https link on one of `allowedHosts`: no credentials, no look-alike hosts, bounded length. */
export function parseHttpsLink(input: unknown, allowedHosts: readonly string[], what: string): Parsed<string> {
  if (typeof input !== "string") return fail(`${what} không hợp lệ`);
  const raw = input.trim();
  if (!raw) return fail(`${what} đang để trống`);
  if (raw.length > MAX_LINK_CHARS) return fail(`${what} quá dài`);

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fail(`${what} không hợp lệ`);
  }
  if (url.protocol !== "https:") return fail(`${what} phải bắt đầu bằng https://`);
  if (url.username || url.password) return fail(`${what} không hợp lệ`);

  const host = url.hostname.toLowerCase();
  if (!allowedHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
    return fail(`${what} chỉ nhận liên kết từ: ${allowedHosts.join(", ")}`);
  }
  return ok(url.href);
}

// ---------------------------------------------------------------- dates
/** A real calendar date written YYYY-MM-DD, year 1900-2100. */
export function parseDate(input: unknown, what: string): Parsed<string> {
  if (typeof input !== "string") return fail(`${what} không hợp lệ`);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!m) return fail(`${what} phải có dạng năm-tháng-ngày (ví dụ 2025-10-20)`);

  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  const real = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
  if (!real || y < 1900 || y > 2100) return fail(`${what} không phải một ngày có thật`);
  return ok(input.trim());
}

// ---------------------------------------------------------------- photos
export interface CleanPhoto {
  url: string;
  caption: string;
  date: string;
}

/** Validates an album. Photos are kept whole or rejected with a message, never truncated. */
export function parsePhotos(input: unknown, opts: { max?: number; label?: string } = {}): Parsed<CleanPhoto[]> {
  const max = opts.max ?? MAX_PHOTOS;
  const label = opts.label ?? "Ảnh";
  if (input === undefined || input === null) return ok([]);
  if (!Array.isArray(input)) return fail(`Danh sách ${label.toLowerCase()} không hợp lệ`);
  if (input.length > max) return fail(`Tối đa ${max} ${label.toLowerCase()}`);

  const photos: CleanPhoto[] = [];
  for (let i = 0; i < input.length; i++) {
    const p = (input[i] ?? {}) as Record<string, unknown>;
    const url = typeof p.url === "string" ? p.url.trim() : "";
    const n = i + 1;

    if (!url) return fail(`${label} số ${n} bị trống`);

    if (url.startsWith("data:")) {
      if (!DATA_IMAGE.test(url)) return fail(`${label} số ${n} không đúng định dạng (chỉ nhận JPEG, PNG, WebP, GIF)`);
      if (url.length > MAX_PHOTO_CHARS) return fail(`${label} số ${n} quá lớn. Hãy chọn ảnh khác hoặc ảnh nhỏ hơn`);
    } else if (/^https:\/\//i.test(url)) {
      if (url.length > MAX_PHOTO_LINK_CHARS) return fail(`Liên kết ${label.toLowerCase()} số ${n} quá dài`);
    } else {
      return fail(`${label} số ${n} không hợp lệ`);
    }

    photos.push({ url, caption: cleanText(p.caption, 200), date: cleanText(p.date, 50) });
  }
  return ok(photos);
}

// ---------------------------------------------------------------- anniversary + timeline
export function parseAnniversary(input: unknown): Parsed<{ date: string; label: string } | undefined> {
  if (input === undefined || input === null) return ok(undefined);
  const a = input as Record<string, unknown>;
  const rawDate = typeof a.date === "string" ? a.date.trim() : "";
  if (!rawDate) return ok(undefined);

  const date = parseDate(rawDate, "Ngày kỷ niệm");
  if (!date.ok) return date;
  return ok({ date: date.value, label: cleanText(a.label, 60) || "Ngày kỷ niệm" });
}

export function parseTimeline(input: unknown): Parsed<TimelineItem[]> {
  if (input === undefined || input === null) return ok([]);
  if (!Array.isArray(input)) return fail("Danh sách mốc thời gian không hợp lệ");
  if (input.length > MAX_TIMELINE) return fail(`Tối đa ${MAX_TIMELINE} mốc kỷ niệm`);

  const items: TimelineItem[] = [];
  for (let i = 0; i < input.length; i++) {
    const t = (input[i] ?? {}) as Record<string, unknown>;
    const n = i + 1;
    const date = parseDate(t.date, `Ngày của mốc số ${n}`);
    if (!date.ok) return date;
    const title = cleanText(t.title, 60);
    if (!title) return fail(`Mốc số ${n} thiếu tiêu đề`);
    items.push({ date: date.value, title, text: cleanText(t.text, 200) });
  }
  return ok(items);
}

// ---------------------------------------------------------------- music
export interface CleanSong {
  source: SongSource;
  title: string;
  artist: string;
  duration: string;
  presetId?: string;
  link?: string;
}

export function parseSong(input: unknown): Parsed<CleanSong> {
  const none: CleanSong = { source: "none", title: "", artist: "", duration: "" };
  if (input === undefined || input === null) return ok(none);

  const s = input as Record<string, unknown>;
  switch (s.source) {
    case undefined:
    case "none":
      return ok(none);

    case "preset": {
      const preset = getMusicPreset(s.presetId);
      if (!preset) return fail("Giai điệu đã chọn không có trong danh sách");
      return ok({ source: "preset", presetId: preset.id, title: preset.name, artist: "", duration: "--:--" });
    }

    case "link": {
      const link = parseHttpsLink(s.link, MUSIC_HOSTS, "Liên kết nhạc");
      if (!link.ok) return link;
      return ok({
        source: "link",
        link: link.value,
        title: cleanText(s.title, 100) || "Bài hát yêu thích",
        artist: cleanText(s.artist, 100),
        duration: "--:--",
      });
    }

    default:
      return fail("Kiểu nhạc không hợp lệ");
  }
}

// ---------------------------------------------------------------- voice note
export interface CleanVoice {
  audioPath?: string;
  duration: string;
  noteText: string;
}

const formatDuration = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

/** The recording must live in this card's own folder: `<token>/voice-<timestamp>.<ext>`. */
export function parseVoice(input: unknown, token: string): Parsed<CleanVoice> {
  const v = (input ?? {}) as Record<string, unknown>;
  const noteText = cleanText(v.noteText, 500);

  if (v.audioPath === undefined || v.audioPath === null || v.audioPath === "") {
    return ok({ duration: "00:00", noteText });
  }
  if (typeof v.audioPath !== "string") return fail("Bản ghi âm không hợp lệ");

  const allowed = new RegExp(`^${token}/voice-\\d{10,15}\\.(webm|ogg|m4a|mp4|wav|mp3)$`);
  if (!allowed.test(v.audioPath)) return fail("Bản ghi âm không thuộc thiệp này");

  const raw = Number(v.durationSec);
  const seconds = Number.isFinite(raw) ? Math.min(MAX_VOICE_SECONDS, Math.max(1, Math.round(raw))) : 1;
  return ok({ audioPath: v.audioPath, duration: formatDuration(seconds), noteText });
}

export interface CleanMessenger {
  wallpaperUrl: string;
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

export function parseMessenger(input: unknown): CleanMessenger {
  const m = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const messagesRaw = Array.isArray(m.messages) ? m.messages : [];
  const cleanMessages = messagesRaw
    .map((s) => cleanText(s, 500))
    .filter((s) => s.length > 0)
    .slice(0, 30);

  return {
    wallpaperUrl: cleanText(m.wallpaperUrl, 500_000) || "/images/default_lockscreen_girl.jpg",
    avatarUrl: cleanText(m.avatarUrl, 500_000) || "/images/default_avatar.png",
    notificationText: cleanText(m.notificationText, 200) || "hello bé iu",
    messages:
      cleanMessages.length > 0
        ? cleanMessages
        : [
            "Hello bé iu của anh ❤️",
            "Hôm nay là 20/10, ngày phụ nữ Việt Nam nè 🌸",
            "Anh có chuẩn bị một món quà bất ngờ nho nhỏ dành riêng cho em",
            "Cảm ơn em vì đã luôn ở bên cạnh anh, làm cho mỗi ngày trôi qua đều thật ấm áp và ngập tràn hạnh phúc",
            "Chúc công chúa của anh luôn xinh đẹp, rạng rỡ và luôn nở nụ cười thật tươi nhé ✨",
            "Thương em nhiều lắm! 💕",
            "Giữ lá thư nhỏ bên dưới để mở thư tay anh viết riêng cho em nhé 💌",
          ],
    showFloatingHearts: m.showFloatingHearts !== false,
    giftLeadMessage:
      cleanText(m.giftLeadMessage, 300) ||
      "Còn một món quà nhỏ nữa anh để dành cho em, chạm vào hộp quà bên dưới nhé 🎁",
    voiceLeadMessage:
      cleanText(m.voiceLeadMessage, 300) || "Anh có ghi âm một đoạn nhỏ gửi em, em nghe thử nhé 🎧",
    voiceAfterMessage:
      cleanText(m.voiceAfterMessage, 300) || "Anh thương em nhiều lắm, chúc em ngày 20/10 thật vui nha 💕",
    videoUrl: cleanText(m.videoUrl, 500) || undefined,
    videoLeadMessage:
      cleanText(m.videoLeadMessage, 300) || "Anh có một video nhỏ gửi cho em nè 🎬",
    videoTitle: cleanText(m.videoTitle, 150) || "Video kỷ niệm dành riêng cho em",
  };
}

// ---------------------------------------------------------------- the whole card
/** What is stored in `gift_products.gift_data`. Content exists only for the messages listed in `blocks`. */
export interface StoredGiftData {
  template: GiftTemplateId;
  /** The messages the buyer ticked, in the order they are shown. */
  blocks: BlockId[];
  recipientName: string;
  senderName: string;
  /** Whether recipient must enter a 4-digit OTP/PIN to view the card (defaults to true). */
  requirePin?: boolean;
  addressing?: string;
  anonymous?: boolean;
  letterTitle?: string;
  letterSubtitle?: string;
  letterContent?: string;
  letterSignature?: string;
  memoryPhotos: CleanPhoto[];
  finalMessage?: string;
  videoUrl?: string;
  videoAspectRatio?: "16:9" | "1:1" | "9:16";
  song?: CleanSong;
  voiceNote?: CleanVoice;
  anniversary?: { date: string; label: string };
  timeline?: TimelineItem[];
  messenger?: CleanMessenger;
}

/** The ticked messages: known ids only, no repeats, at least one. Their order is kept. */
export function parseBlocks(input: unknown): Parsed<BlockId[]> {
  if (!Array.isArray(input)) return fail("Danh sách thông điệp không hợp lệ");
  const seen = new Set<BlockId>();
  for (const id of input) {
    if (!isBlockId(id)) return fail("Có loại thông điệp không hợp lệ");
    if (seen.has(id)) return fail(`Thông điệp "${BLOCK_LABELS[id]}" bị chọn hai lần`);
    seen.add(id);
  }
  if (seen.size === 0) return fail("Hãy chọn ít nhất một thông điệp");
  return ok([...seen]);
}

/**
 * Rebuilds the card from allowlisted fields. Only the ticked messages (`blocks`) are kept, and each of
 * them must have content. A payload without `blocks` (an older studio tab) gets its list worked out
 * from what it contains. Only the recipient's name is required.
 */
export function parseGiftData(input: unknown, ctx: { token: string }): Parsed<StoredGiftData> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail("Thiếu dữ liệu thiệp");
  const g = input as Record<string, unknown>;

  const recipientName = cleanText(g.recipientName, 100);
  if (!recipientName) return fail("Vui lòng nhập tên người nhận");

  const list = parseBlocks(g.blocks === undefined ? deriveBlocks(g) : g.blocks);
  if (!list.ok) return list;
  const blocks = list.value;
  const has = (block: BlockId) => blocks.includes(block);
  const empty = (block: BlockId) => fail(`Mục ${BLOCK_LABELS[block]} đang trống, hãy điền hoặc bỏ tích`);

  const out: StoredGiftData = {
    template: getTemplate(g.template)?.id ?? DEFAULT_TEMPLATE,
    blocks,
    recipientName,
    senderName: cleanText(g.senderName, 100) || "Người gửi",
    memoryPhotos: [],
    requirePin: g.requirePin !== false,
  };

  const addressing = cleanText(g.addressing, 40);
  if (addressing) out.addressing = addressing;
  if (g.anonymous === true) out.anonymous = true;

  if (has("letter")) {
    const content = cleanText(g.letterContent, 3000);
    if (!content) return empty("letter");
    out.letterContent = content;
    out.letterTitle = cleanText(g.letterTitle, 200) || "LỜI NHẮN";
    out.letterSubtitle = cleanText(g.letterSubtitle, 200);
    out.letterSignature = cleanText(g.letterSignature, 100);
  }

  if (has("photos")) {
    const photos = parsePhotos(g.memoryPhotos, { max: MAX_PHOTOS, label: "Ảnh" });
    if (!photos.ok) return photos;
    if (photos.value.length === 0) return empty("photos");
    out.memoryPhotos = photos.value;
  }

  if (has("finalMessage")) {
    const message = cleanText(g.finalMessage, 200);
    if (!message) return empty("finalMessage");
    out.finalMessage = message;
  }

  if (has("anniversary")) {
    const a = parseAnniversary(g.anniversary);
    if (!a.ok) return a;
    if (!a.value) return empty("anniversary");
    out.anniversary = a.value;
  }

  if (has("timeline")) {
    const t = parseTimeline(g.timeline);
    if (!t.ok) return t;
    if (t.value.length === 0) return empty("timeline");
    out.timeline = t.value;
  }

  if (has("video")) {
    const raw = typeof g.videoUrl === "string" ? g.videoUrl.trim() : "";
    if (!raw) return empty("video");
    const v = parseHttpsLink(raw, VIDEO_HOSTS, "Liên kết video");
    if (!v.ok) return v;
    out.videoUrl = v.value;
    const aspect = typeof g.videoAspectRatio === "string" ? g.videoAspectRatio.trim() : "";
    if (["16:9", "1:1", "9:16"].includes(aspect)) {
      out.videoAspectRatio = aspect as "16:9" | "1:1" | "9:16";
    }
  }

  if (has("music")) {
    const s = parseSong(g.song);
    if (!s.ok) return s;
    if (s.value.source === "none") return empty("music");
    out.song = s.value;
  }

  if (has("voice")) {
    const v = parseVoice(g.voiceNote, ctx.token);
    if (!v.ok) return v;
    if (!v.value.audioPath) return empty("voice");
    out.voiceNote = v.value;
  }

  if (out.template === "messenger" || g.messenger !== undefined) {
    out.messenger = parseMessenger(g.messenger);
  }

  return ok(out);
}
