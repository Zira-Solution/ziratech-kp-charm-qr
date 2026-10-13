/**
 * Validation and cleaning for the gift card content a buyer saves from the studio.
 *
 * Pure functions (no framework imports) so they can be unit-tested with `npm test`.
 * Rules: text is stored exactly as typed (React escapes it when rendering); photos and links are
 * kept whole or rejected with a message, never truncated; the result is rebuilt from an allowlist of
 * fields, so unknown fields sent by the browser never reach the database.
 */
import { DEFAULT_TEMPLATE, getTemplate, templateHasBlock } from "../../components/gift-templates/template-config.ts";
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
/** Cap on every photo of one card together, so a card cannot become a huge database row. */
export const MAX_TOTAL_PHOTO_CHARS = 2_500_000;
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

// ---------------------------------------------------------------- the whole card
/** What is stored in `gift_products.gift_data`. Every block except names/letter is optional. */
export interface StoredGiftData {
  template: GiftTemplateId;
  recipientName: string;
  senderName: string;
  addressing?: string;
  anonymous?: boolean;
  letterTitle: string;
  letterSubtitle: string;
  letterContent: string;
  letterSignature: string;
  memoryPhotos: CleanPhoto[];
  momentPhotos?: { url: string; caption: string }[];
  coverIllustrationUrl?: string;
  finalMessage?: string;
  videoUrl?: string;
  song?: CleanSong;
  voiceNote?: CleanVoice;
  anniversary?: { date: string; label: string };
  timeline?: TimelineItem[];
}

/**
 * Rebuilds the card from allowlisted fields. Blocks the chosen template does not support are dropped,
 * so nothing hidden in the studio can be saved.
 */
export function parseGiftData(input: unknown, ctx: { token: string }): Parsed<StoredGiftData> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail("Thiếu dữ liệu thiệp");
  const g = input as Record<string, unknown>;

  const template = getTemplate(g.template)?.id ?? DEFAULT_TEMPLATE;
  const info = getTemplate(template)!;
  const has = (block: Parameters<typeof templateHasBlock>[1]) => templateHasBlock(template, block);

  const recipientName = cleanText(g.recipientName, 100);
  if (!recipientName) return fail("Vui lòng nhập tên người nhận");
  const letterContent = cleanText(g.letterContent, 3000);
  if (!letterContent) return fail("Vui lòng viết lời nhắn gửi vào bức thư");

  const out: StoredGiftData = {
    template,
    recipientName,
    senderName: cleanText(g.senderName, 100) || "Người gửi",
    letterTitle: cleanText(g.letterTitle, 200) || "LỜI NHẮN",
    letterSubtitle: cleanText(g.letterSubtitle, 200),
    letterContent,
    letterSignature: cleanText(g.letterSignature, 100),
    memoryPhotos: [],
  };

  const addressing = cleanText(g.addressing, 40);
  if (addressing) out.addressing = addressing;
  if (g.anonymous === true) out.anonymous = true;

  let photoChars = 0;

  if (has("photos")) {
    const photos = parsePhotos(g.memoryPhotos, { max: MAX_PHOTOS, label: "Ảnh" });
    if (!photos.ok) return photos;
    out.memoryPhotos = photos.value;
    photoChars += photos.value.reduce((n, p) => n + p.url.length, 0);
  }

  if (has("highlight")) {
    const moments = parsePhotos(g.momentPhotos, { max: info.highlightMax, label: "Ảnh nổi bật" });
    if (!moments.ok) return moments;
    out.momentPhotos = moments.value.map((p) => ({ url: p.url, caption: p.caption }));
    if (moments.value[0]) out.coverIllustrationUrl = moments.value[0].url;
    photoChars += moments.value.reduce((n, p) => n + p.url.length, 0);
  }

  if (photoChars > MAX_TOTAL_PHOTO_CHARS) {
    return fail("Tổng dung lượng ảnh quá lớn. Hãy bớt ảnh hoặc chọn ảnh nhỏ hơn");
  }

  if (has("finalMessage")) out.finalMessage = cleanText(g.finalMessage, 200);

  if (has("anniversary")) {
    const a = parseAnniversary(g.anniversary);
    if (!a.ok) return a;
    if (a.value) out.anniversary = a.value;
  }

  if (has("timeline")) {
    const t = parseTimeline(g.timeline);
    if (!t.ok) return t;
    out.timeline = t.value;
  }

  if (has("video")) {
    const raw = typeof g.videoUrl === "string" ? g.videoUrl.trim() : "";
    if (raw) {
      const v = parseHttpsLink(raw, VIDEO_HOSTS, "Liên kết video");
      if (!v.ok) return v;
      out.videoUrl = v.value;
    }
  }

  if (has("music")) {
    const s = parseSong(g.song);
    if (!s.ok) return s;
    out.song = s.value;
  }

  if (has("voice")) {
    const v = parseVoice(g.voiceNote, ctx.token);
    if (!v.ok) return v;
    out.voiceNote = v.value;
  }

  return ok(out);
}
