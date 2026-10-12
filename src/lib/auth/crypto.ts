import "server-only";
import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt) as (
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number
) => Promise<Buffer>;

const HASH_PREFIX = "scrypt$";
const KEY_LEN = 32;

// ---------------------------------------------------------------------------
// Signing secret
// ---------------------------------------------------------------------------

const devSecretStore = globalThis as unknown as { __kp_dev_auth_secret?: string };

/**
 * Secret used to sign admin sessions and gift-access cookies.
 * Production requires AUTH_SECRET (>= 32 chars). Development falls back to a random
 * per-process secret, so sessions simply stop working after a restart.
 */
export function getAuthSecret(): string {
  const configured = process.env.AUTH_SECRET || process.env.ADMIN_JWT_SECRET;
  if (configured && configured.length >= 32) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }

  if (!devSecretStore.__kp_dev_auth_secret) {
    console.warn("[auth] AUTH_SECRET is not set - using a temporary random secret (dev only).");
    devSecretStore.__kp_dev_auth_secret = crypto.randomBytes(32).toString("hex");
  }
  return devSecretStore.__kp_dev_auth_secret;
}

// ---------------------------------------------------------------------------
// Constant-time helpers
// ---------------------------------------------------------------------------

function digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

/** Constant-time string comparison (length-independent). */
export function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

// ---------------------------------------------------------------------------
// Signed payloads (HMAC-SHA256, "<payload>.<signature>")
// ---------------------------------------------------------------------------

function sign(data: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(data).digest("base64url");
}

export function signPayload(payload: Record<string, unknown>, ttlMs: number): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttlMs })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyPayload<T extends Record<string, unknown>>(token: unknown): (T & { exp: number }) | null {
  try {
    if (typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [body, signature] = parts;
    const expected = Buffer.from(sign(body));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Secret hashing (creator keys and unlock PINs are never stored in plaintext)
// ---------------------------------------------------------------------------

export function isHashedSecret(stored: string): boolean {
  return stored.startsWith(HASH_PREFIX);
}

export async function hashSecret(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(plain, salt, KEY_LEN);
  return `${HASH_PREFIX}${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** Synchronous variant, only used to seed the development demo record. */
export function hashSecretSync(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, KEY_LEN);
  return `${HASH_PREFIX}${salt.toString("hex")}$${hash.toString("hex")}`;
}

// A throwaway hash so lookups for unknown tokens cost the same as real ones.
const DUMMY_HASH = hashSecretSync("kp-atelier-timing-equalizer");

export interface SecretCheck {
  ok: boolean;
  /** True when the match was against an old plaintext value that should now be re-hashed. */
  legacy: boolean;
}

/**
 * Checks `input` against a stored secret. Hashed values use scrypt; plaintext values written
 * by earlier versions are still accepted once so they can be upgraded to a hash.
 * `normalize` must be applied identically when the secret is first hashed.
 */
export async function checkSecret(
  stored: string | null | undefined,
  input: string,
  normalize: (value: string) => string = (v) => v
): Promise<SecretCheck> {
  const value = stored || "";
  const candidate = normalize(input);

  if (isHashedSecret(value)) {
    return { ok: await verifyHash(value, candidate), legacy: false };
  }

  if (value) {
    // Legacy plaintext row.
    return { ok: safeEqual(normalize(value), candidate), legacy: true };
  }

  await verifyHash(DUMMY_HASH, candidate);
  return { ok: false, legacy: false };
}

async function verifyHash(stored: string, candidate: string): Promise<boolean> {
  const [, saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(candidate, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

// ---------------------------------------------------------------------------
// Code generation (crypto-grade randomness)
// ---------------------------------------------------------------------------

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I

function randomChars(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return out;
}

/** Bracelet identifier printed on the card, e.g. KP-2010-A7K2QX. */
export function generateProductToken(): string {
  return `KP-2010-${randomChars(6)}`;
}

/** Secret 1: lets the buyer design the card, e.g. TAO-K7M2PQ4X. */
export function generateCreatorKey(): string {
  return `TAO-${randomChars(8)}`;
}

/** Secret 2: 4-digit PIN the recipient enters to open the gift. */
export function generateUnlockPin(): string {
  return String(crypto.randomInt(10000)).padStart(4, "0");
}

export const normalizeCreatorKey = (value: string) => value.trim().toUpperCase();
export const normalizeUnlockPin = (value: string) => value.trim();
