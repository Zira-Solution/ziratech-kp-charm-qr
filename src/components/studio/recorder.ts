// Pure helpers for the voice recorder. The browser parts (MediaRecorder, getUserMedia) live in
// blocks/VoiceBlock.tsx; everything that can be decided without a browser is here so it can be tested.

export const MAX_RECORD_SECONDS = 120;

/** Formats the browsers record in, best first. Chrome/Edge/Firefox: webm or ogg. Safari: mp4. */
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"] as const;

/** The first format this browser can record, or null when none (the recorder is then unavailable). */
export function pickRecorderMime(isSupported: (type: string) => boolean): string | null {
  return MIME_CANDIDATES.find((t) => isSupported(t)) ?? null;
}

/** File extension to use when uploading a recording of this type. */
export function extensionForMime(mime: string): "webm" | "m4a" | "ogg" {
  const base = mime.toLowerCase();
  if (base.startsWith("audio/mp4")) return "m4a";
  if (base.startsWith("audio/ogg")) return "ogg";
  return "webm";
}

/** 75 -> "01:15". */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Plain-language reason a microphone could not be used. */
export function describeMicError(err: unknown): string {
  const name = err instanceof DOMException || (err && typeof err === "object" && "name" in err) ? String((err as { name: unknown }).name) : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Bạn chưa cho phép dùng micro. Hãy bật quyền micro cho trang này trong trình duyệt rồi thử lại.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "Không tìm thấy micro trên thiết bị này.";
    case "NotReadableError":
    case "AbortError":
      return "Micro đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó rồi thử lại.";
    default:
      return "Không bật được micro. Vui lòng thử lại.";
  }
}
