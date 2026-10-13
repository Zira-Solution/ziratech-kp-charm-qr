/**
 * Recognises a recording by what the file really contains. The file name and the declared type come
 * from the browser and prove nothing, so the format is read from the first bytes. Pure and unit-tested.
 */

export type AudioKind = "webm" | "ogg" | "m4a" | "wav" | "mp3";

export const MAX_VOICE_BYTES = 2 * 1024 * 1024;

export const AUDIO_CONTENT_TYPES: Record<AudioKind, string> = {
  webm: "audio/webm",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  mp3: "audio/mpeg",
};

const startsWith = (b: Uint8Array, offset: number, text: string) =>
  b.length >= offset + text.length && [...text].every((c, i) => b[offset + i] === c.charCodeAt(0));

export function sniffAudio(b: Uint8Array): AudioKind | null {
  if (b.length < 4) return null;
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "webm"; // EBML header (Matroska/WebM)
  if (startsWith(b, 0, "OggS")) return "ogg";
  if (startsWith(b, 4, "ftyp")) return "m4a"; // ISO base media (MP4 / M4A)
  if (startsWith(b, 0, "RIFF") && startsWith(b, 8, "WAVE")) return "wav";
  if (startsWith(b, 0, "ID3")) return "mp3";
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return "mp3"; // MPEG audio frame sync
  return null;
}
