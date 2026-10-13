import "server-only";
import { createServerClient } from "./server";
import { AUDIO_CONTENT_TYPES, MAX_VOICE_BYTES, type AudioKind } from "@/lib/validation/audio";

/**
 * Voice recordings live in a private Supabase Storage bucket, one folder per card
 * (`<token>/voice-<timestamp>.<ext>`). Nothing is public: playback uses short-lived signed links that
 * the API creates after checking the visitor's card session.
 */

export const BUCKET = "gift-media";
export const SIGNED_URL_SECONDS = 60 * 60;

/** Whether Storage is available (it is not when Supabase is not configured, e.g. local development). */
export const mediaConfigured = () => createServerClient() !== null;

const state = globalThis as unknown as { __kp_bucket_ready?: Promise<void> };

/** Creates the bucket the first time it is needed. Safe to call on every upload. */
function ensureBucket(): Promise<void> {
  state.__kp_bucket_ready ??= (async () => {
    const supabase = createServerClient();
    if (!supabase) throw new Error("STORAGE_NOT_CONFIGURED");

    const existing = await supabase.storage.getBucket(BUCKET);
    if (existing.data) return;

    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_VOICE_BYTES,
      allowedMimeTypes: Object.values(AUDIO_CONTENT_TYPES),
    });
    if (error && !/already exists|duplicate/i.test(error.message)) {
      throw new Error(`[Storage] create bucket failed: ${error.message}`);
    }
  })().catch((err) => {
    state.__kp_bucket_ready = undefined; // try again next time
    throw err;
  });
  return state.__kp_bucket_ready;
}

/** Stores one recording and returns its path. */
export async function uploadVoice(token: string, bytes: Uint8Array, kind: AudioKind): Promise<string> {
  await ensureBucket();
  const supabase = createServerClient()!;
  const path = `${token}/voice-${Date.now()}.${kind}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: AUDIO_CONTENT_TYPES[kind],
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw new Error(`[Storage] upload failed: ${error.message}`);
  return path;
}

/** A link that plays the recording for the next hour, or undefined when it cannot be made. */
export async function signedVoiceUrl(path: string): Promise<string | undefined> {
  const supabase = createServerClient();
  if (!supabase) return undefined;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) {
    console.warn("[Storage] could not sign a link:", error.message);
    return undefined;
  }
  return data.signedUrl;
}

async function listVoices(token: string): Promise<string[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.storage.from(BUCKET).list(token, { limit: 100 });
  if (error || !data) return [];
  return data.map((f) => f.name).filter((n) => n.startsWith("voice-"));
}

/** True when the recording is really in storage (the save endpoint checks this before trusting a path). */
export async function voiceExists(path: string): Promise<boolean> {
  const [folder, name] = path.split("/");
  return !!folder && !!name && (await listVoices(folder)).includes(name);
}

/**
 * Deletes this card's recordings except the ones in `keep`. Called after an upload and after a save,
 * so the card never holds more than the saved recording plus the one being worked on.
 */
export async function pruneVoices(token: string, keep: string[]): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) return;
  try {
    const stale = (await listVoices(token)).map((n) => `${token}/${n}`).filter((p) => !keep.includes(p));
    if (stale.length) {
      const { error } = await supabase.storage.from(BUCKET).remove(stale);
      if (error) console.warn("[Storage] could not remove old recordings:", error.message);
    }
  } catch (err) {
    console.warn("[Storage] prune failed:", err);
  }
}
