/**
 * Validation for the gift card content a buyer saves from the studio.
 * Text is stored exactly as typed (React escapes it when it is rendered), and photos are checked
 * for type and size instead of being cut off.
 */

/** Plain text: strips control characters (keeps line breaks), trims, and caps the length. */
export function cleanText(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export const MAX_PHOTOS = 6;
/** Longest accepted photo data URL, in characters (~300 KB of image data). The studio compresses below this. */
export const MAX_PHOTO_CHARS = 400_000;
/** Cap on all photos together, so one card cannot become a huge row. */
export const MAX_TOTAL_PHOTO_CHARS = 2_000_000;
const MAX_PHOTO_LINK_CHARS = 500;

const DATA_IMAGE = /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;

export interface CleanPhoto {
  url: string;
  caption: string;
  date: string;
}

export type PhotosResult = { ok: true; photos: CleanPhoto[] } | { ok: false; error: string };

/** Validates the album. Photos are kept whole or rejected with a message, never truncated. */
export function parsePhotos(input: unknown): PhotosResult {
  if (input === undefined || input === null) return { ok: true, photos: [] };
  if (!Array.isArray(input)) return { ok: false, error: "Danh sách ảnh không hợp lệ" };
  if (input.length > MAX_PHOTOS) return { ok: false, error: `Tối đa ${MAX_PHOTOS} ảnh kỷ niệm` };

  const photos: CleanPhoto[] = [];
  let total = 0;

  for (let i = 0; i < input.length; i++) {
    const p = (input[i] ?? {}) as Record<string, unknown>;
    const url = typeof p.url === "string" ? p.url.trim() : "";
    const n = i + 1;

    if (!url) return { ok: false, error: `Ảnh số ${n} bị trống` };

    if (url.startsWith("data:")) {
      if (!DATA_IMAGE.test(url)) return { ok: false, error: `Ảnh số ${n} không đúng định dạng (chỉ nhận JPEG, PNG, WebP, GIF)` };
      if (url.length > MAX_PHOTO_CHARS) return { ok: false, error: `Ảnh số ${n} quá lớn. Hãy chọn ảnh khác hoặc ảnh nhỏ hơn` };
    } else if (/^https:\/\//i.test(url)) {
      if (url.length > MAX_PHOTO_LINK_CHARS) return { ok: false, error: `Liên kết ảnh số ${n} quá dài` };
    } else {
      return { ok: false, error: `Ảnh số ${n} không hợp lệ` };
    }

    total += url.length;
    if (total > MAX_TOTAL_PHOTO_CHARS) return { ok: false, error: "Tổng dung lượng ảnh quá lớn. Hãy bớt ảnh hoặc chọn ảnh nhỏ hơn" };

    photos.push({ url, caption: cleanText(p.caption, 200), date: cleanText(p.date, 50) });
  }

  return { ok: true, photos };
}
