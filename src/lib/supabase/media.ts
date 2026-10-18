import "server-only";
import { createServerClient } from "./server";
import { AUDIO_CONTENT_TYPES, MAX_SONG_BYTES, MAX_VIDEO_BYTES, MAX_VOICE_BYTES, type AudioKind } from "@/lib/validation/audio";

/**
 * Media files (voice notes, uploaded songs, uploaded videos) live in a private Supabase Storage bucket,
 * one folder per card (`<token>/<type>-<timestamp>.<ext>`). Nothing is public: playback uses short-lived
 * signed links that the API creates after checking the visitor's card session.
 * In local dev without Supabase, an in-memory buffer store ensures all uploads and previews work flawlessly.
 */

export const BUCKET = "gift-media";
export const SIGNED_URL_SECONDS = 60 * 60;
export const MAX_MEDIA_STORAGE_BYTES = 30 * 1024 * 1024; // 30MB

/** In-memory store for local development when Supabase is not configured */
interface MemoryMediaItem {
  bytes: Uint8Array;
  contentType: string;
}

const memoryState = globalThis as unknown as {
  __kp_memory_media?: Map<string, MemoryMediaItem>;
  __kp_bucket_ready?: Promise<void>;
};

memoryState.__kp_memory_media ??= new Map<string, MemoryMediaItem>();

export const getInMemoryMedia = (path: string): MemoryMediaItem | undefined =>
  memoryState.__kp_memory_media?.get(path);

/** Whether Storage is available (either real Supabase or local in-memory fallback). */
export const mediaConfigured = () => true;

/** Creates or updates the bucket the first time it is needed. Safe to call on every upload. */
function ensureBucket(): Promise<void> {
  memoryState.__kp_bucket_ready ??= (async () => {
    const supabase = createServerClient();
    if (!supabase) return; // In-memory fallback

    const existing = await supabase.storage.getBucket(BUCKET);
    if (!existing.data) {
      const { error } = await supabase.storage.createBucket(BUCKET, {
        public: false,
        fileSizeLimit: MAX_MEDIA_STORAGE_BYTES,
      });
      if (error && !/already exists|duplicate/i.test(error.message)) {
        throw new Error(`[Storage] create bucket failed: ${error.message}`);
      }
    }
  })().catch((err) => {
    memoryState.__kp_bucket_ready = undefined; // try again next time
    throw err;
  });
  return memoryState.__kp_bucket_ready;
}

/** Stores one voice recording and returns its path. */
export async function uploadVoice(token: string, bytes: Uint8Array, kind: AudioKind): Promise<string> {
  return uploadMediaFile(token, bytes, "voice", kind, AUDIO_CONTENT_TYPES[kind]);
}

/** Stores one custom song file (MP3 / M4A) and returns its path. */
export async function uploadSong(token: string, bytes: Uint8Array, ext: string, contentType: string): Promise<string> {
  return uploadMediaFile(token, bytes, "song", ext, contentType);
}

/** Stores one custom video file (MP4 / WebM / MOV) and returns its path. */
export async function uploadVideo(token: string, bytes: Uint8Array, ext: string, contentType: string): Promise<string> {
  return uploadMediaFile(token, bytes, "video", ext, contentType);
}

/** Generic upload for any supported card media. */
export async function uploadMediaFile(
  token: string,
  bytes: Uint8Array,
  type: "voice" | "song" | "video",
  ext: string,
  contentType: string
): Promise<string> {
  await ensureBucket();
  const path = `${token}/${type}-${Date.now()}.${ext.replace(/^\./, "")}`;
  const supabase = createServerClient();

  if (!supabase) {
    // In-memory fallback for local dev
    memoryState.__kp_memory_media?.set(path, { bytes, contentType });
    return path;
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw new Error(`[Storage] upload failed: ${error.message}`);
  return path;
}

/** A link that plays the media for the next hour, or undefined when it cannot be made. */
export async function signedMediaUrl(path: string): Promise<string | undefined> {
  if (!path) return undefined;
  const supabase = createServerClient();

  if (!supabase) {
    if (memoryState.__kp_memory_media?.has(path)) {
      return `/api/gifts/media-stream?path=${encodeURIComponent(path)}`;
    }
    return undefined;
  }

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) {
    console.warn("[Storage] could not sign link:", error.message);
    return undefined;
  }
  return data.signedUrl;
}

export const signedVoiceUrl = signedMediaUrl;

async function listMedia(token: string, prefix?: string): Promise<string[]> {
  const supabase = createServerClient();
  if (!supabase) {
    const names: string[] = [];
    const prefixSlash = `${token}/`;
    for (const key of memoryState.__kp_memory_media?.keys() ?? []) {
      if (key.startsWith(prefixSlash)) {
        const name = key.slice(prefixSlash.length);
        if (!prefix || name.startsWith(`${prefix}-`)) {
          names.push(name);
        }
      }
    }
    return names;
  }

  const { data, error } = await supabase.storage.from(BUCKET).list(token, { limit: 100 });
  if (error || !data) return [];
  return data
    .map((f) => f.name)
    .filter((n) => !prefix || n.startsWith(`${prefix}-`));
}

/** True when the file is really in storage or in-memory cache. */
export async function mediaExists(path: string): Promise<boolean> {
  const [folder, name] = path.split("/");
  if (!folder || !name) return false;
  return (await listMedia(folder)).includes(name);
}

export const voiceExists = mediaExists;

/**
 * Deletes this card's media files of a given type except the ones in `keep`.
 */
export async function pruneMedia(token: string, prefix: "voice" | "song" | "video", keep: string[]): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    const prefixSlash = `${token}/`;
    for (const key of memoryState.__kp_memory_media?.keys() ?? []) {
      if (key.startsWith(prefixSlash)) {
        const name = key.slice(prefixSlash.length);
        if (name.startsWith(`${prefix}-`) && !keep.includes(key)) {
          memoryState.__kp_memory_media?.delete(key);
        }
      }
    }
    return;
  }

  try {
    const list = await listMedia(token, prefix);
    const stale = list.map((n) => `${token}/${n}`).filter((p) => !keep.includes(p));
    if (stale.length > 0) {
      const { error } = await supabase.storage.from(BUCKET).remove(stale);
      if (error) console.warn(`[Storage] could not remove old ${prefix} files:`, error.message);
    }
  } catch (err) {
    console.warn(`[Storage] prune ${prefix} failed:`, err);
  }
}

export async function pruneVoices(token: string, keep: string[]): Promise<void> {
  return pruneMedia(token, "voice", keep);
}
