import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase Auth for staff (a single "admin" role).
 * The session lives in httpOnly cookies set by the server; the browser never handles tokens.
 */

export interface AdminUser {
  id: string;
  email: string;
}

/** Auth client bound to the current request's cookies. Returns null when Supabase is not configured. */
export async function createAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          }
        } catch {
          // Called from a context that cannot set cookies; the next request will refresh instead.
        }
      },
    },
  });
}

/**
 * Returns the signed-in admin, or null.
 * Uses getUser(), which asks the Auth server to validate the token, so revoked or deleted users
 * are rejected immediately (unlike reading the cookie alone).
 * Only users whose app_metadata.role is "admin" qualify; app_metadata cannot be edited by the user.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createAuthClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  if (data.user.app_metadata?.role !== "admin") return null;

  return { id: data.user.id, email: data.user.email ?? "" };
}
