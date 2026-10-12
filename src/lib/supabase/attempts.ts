import "server-only";
import { createServerClient } from "./server";

export const MAX_FAILURES = 5;
export const LOCK_MS = 15 * 60 * 1000;

interface AttemptState {
  failures: number;
  lockedUntil: number;
}

// Persisted in the `access_attempts` table so lockouts survive serverless cold starts and are
// shared across instances. Falls back to process memory when Supabase is not configured.
const memory = ((globalThis as unknown as { __kp_attempts?: Map<string, AttemptState> }).__kp_attempts ??= new Map());

async function load(key: string): Promise<AttemptState> {
  const supabase = createServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("access_attempts")
      .select("failures, locked_until")
      .eq("key", key)
      .maybeSingle();
    if (!error) {
      return {
        failures: data?.failures ?? 0,
        lockedUntil: data?.locked_until ? Date.parse(data.locked_until) : 0,
      };
    }
    console.warn("[attempts] Supabase read failed, using memory:", error.message);
  }
  return memory.get(key) ?? { failures: 0, lockedUntil: 0 };
}

async function save(key: string, state: AttemptState): Promise<void> {
  memory.set(key, state);
  const supabase = createServerClient();
  if (!supabase) return;
  const { error } = await supabase.from("access_attempts").upsert({
    key,
    failures: state.failures,
    locked_until: state.lockedUntil ? new Date(state.lockedUntil).toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn("[attempts] Supabase write failed, kept in memory:", error.message);
}

/** Milliseconds left on an active lock, or 0 when the key is not locked. */
export async function getLockRemainingMs(key: string): Promise<number> {
  const state = await load(key);
  return Math.max(0, state.lockedUntil - Date.now());
}

/** Records a failed attempt. Locks the key for `lockMs` once `max` failures are reached. */
export async function recordFailure(
  key: string,
  max = MAX_FAILURES,
  lockMs = LOCK_MS
): Promise<{ locked: boolean; remaining: number }> {
  let state = await load(key);
  if (state.lockedUntil && state.lockedUntil <= Date.now()) {
    state = { failures: 0, lockedUntil: 0 };
  }

  const failures = state.failures + 1;
  const locked = failures >= max;
  await save(key, { failures, lockedUntil: locked ? Date.now() + lockMs : 0 });
  return { locked, remaining: Math.max(0, max - failures) };
}

export async function clearFailures(key: string): Promise<void> {
  memory.delete(key);
  const supabase = createServerClient();
  if (!supabase) return;
  const { error } = await supabase.from("access_attempts").delete().eq("key", key);
  if (error) console.warn("[attempts] Supabase delete failed:", error.message);
}
