// Admins sign in with Supabase Auth, which identifies accounts by email.
// A bare username (no "@") is mapped to an email on a reserved domain nobody can register,
// so a username account can never be taken over through a password-recovery email.
export const ADMIN_USERNAME_DOMAIN = "example.com";

const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

/** Turns what the admin typed (username or email) into the Auth email, or null if it is not valid. */
export function toAdminEmail(identifier: string): string | null {
  const id = identifier.trim().toLowerCase();
  if (!id) return null;
  if (id.includes("@")) return id;
  return USERNAME_PATTERN.test(id) ? `${id}@${ADMIN_USERNAME_DOMAIN}` : null;
}
