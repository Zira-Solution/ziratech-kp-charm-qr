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

export const MAX_SONG_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25MB

export type VideoKind = "mp4" | "webm" | "mov";

export const VIDEO_CONTENT_TYPES: Record<VideoKind, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

const startsWith = (b: Uint8Array, offset: number, text: string) =>
  b.length >= offset + text.length && [...text].every((c, i) => b[offset + i] === c.charCodeAt(0));

export function sniffAudio(b: Uint8Array): AudioKind | null {
  if (b.length < 4) return null;

  // Reject known non-audio magic signatures immediately
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return null; // PNG
  if (b[0] === 0x4d && b[1] === 0x5a) return null; // Windows executable (MZ)
  if (startsWith(b, 0, "<html") || startsWith(b, 0, "<?xml") || startsWith(b, 0, "<!doc")) return null;

  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "webm"; // EBML header (Matroska/WebM)
  if (startsWith(b, 0, "OggS")) return "ogg";
  if (startsWith(b, 4, "ftyp")) return "m4a"; // ISO base media (MP4 / M4A)
  if (startsWith(b, 0, "RIFF") && startsWith(b, 8, "WAVE")) return "wav";
  if (startsWith(b, 0, "ID3")) return "mp3";
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return "mp3"; // MPEG audio frame sync

  // MP3 files in the wild often have metadata (cover art, BOM, padding) before ID3 or audio frames.
  // Scan up to the first 8192 bytes for ID3 tag or valid MPEG audio frame sync.
  const scanLimit = Math.min(b.length - 3, 8192);
  for (let i = 1; i < scanLimit; i++) {
    // ID3 tag within the first 1KB
    if (i < 1024 && b[i] === 0x49 && b[i + 1] === 0x44 && b[i + 2] === 0x33) {
      return "mp3";
    }
    // MPEG audio frame sync: 11 bits set (0xFF then 0xE0..) with non-reserved version and layer
    if (b[i] === 0xff && (b[i + 1] & 0xe0) === 0xe0) {
      const versionId = (b[i + 1] >> 3) & 0x03;
      const layerId = (b[i + 1] >> 1) & 0x03;
      if (versionId !== 1 && layerId !== 0) {
        return "mp3";
      }
    }
  }

  // Check for ID3v1 tag at the end of the file (standard 128-byte footer starting with "TAG")
  if (b.length >= 128) {
    const endOffset = b.length - 128;
    if (b[endOffset] === 0x54 && b[endOffset + 1] === 0x41 && b[endOffset + 2] === 0x47) {
      return "mp3";
    }
  }

  return null;
}

export function sniffVideo(b: Uint8Array): VideoKind | null {
  if (b.length < 12) return null;
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "webm";
  if (startsWith(b, 4, "ftyp")) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]).toLowerCase();
    if (brand.startsWith("qt")) return "mov";
    return "mp4";
  }
  if (startsWith(b, 4, "moov")) return "mov";
  return null;
}

