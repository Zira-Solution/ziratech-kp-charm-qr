import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { signPayload, verifyPayload } from "@/lib/auth/crypto";

/**
 * Short-lived, signed, httpOnly cookie issued after a correct creator key ("create") or unlock
 * PIN ("open"). Gift content is only ever returned to requests carrying a matching cookie.
 */
export type GiftScope = "create" | "open";

const TTL_MS: Record<GiftScope, number> = {
  create: 6 * 60 * 60 * 1000,
  open: 2 * 60 * 60 * 1000,
};

export const TOKEN_PATTERN = /^[A-Z0-9-]{1,40}$/;

export function normalizeToken(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const token = raw.trim().toUpperCase();
  return TOKEN_PATTERN.test(token) ? token : null;
}

const cookieName = (scope: GiftScope, token: string) => `kp_g_${scope}_${token}`;

export function issueGiftSession(res: NextResponse, scope: GiftScope, token: string): void {
  res.cookies.set({
    name: cookieName(scope, token),
    value: signPayload({ t: token, s: scope }, TTL_MS[scope]),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/gifts",
    maxAge: TTL_MS[scope] / 1000,
  });
}

export function hasGiftSession(req: NextRequest, scope: GiftScope, token: string): boolean {
  const payload = verifyPayload<{ t: string; s: string }>(req.cookies.get(cookieName(scope, token))?.value);
  return !!payload && payload.t === token && payload.s === scope;
}
