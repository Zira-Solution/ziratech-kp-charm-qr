// Creates (or promotes) an admin account in Supabase Auth.
//
//   node --env-file=.env.local scripts/create-admin.mjs <username|email> [--password <pw>]
//   node --env-file=.env.local scripts/create-admin.mjs <email> --delete
//
// Without --password a strong random one is generated and printed once.
// The role lives in app_metadata, which users cannot edit themselves.
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const args = process.argv.slice(2);
// A bare username maps to an email on a reserved domain (keep in sync with src/config/auth.ts).
const rawId = args[0] && !args[0].startsWith("--") ? args[0].trim().toLowerCase() : undefined;
const email = rawId ? (rawId.includes("@") ? rawId : /^[a-z0-9._-]{3,32}$/.test(rawId) ? `${rawId}@example.com` : undefined) : undefined;
const del = args.includes("--delete");
const pwIndex = args.indexOf("--password");
const givenPassword = pwIndex >= 0 ? args[pwIndex + 1] : undefined;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !email.includes("@")) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <username|email> [--password <pw>] [--delete]");
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}
if (givenPassword !== undefined && givenPassword.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser(target) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
}

const existing = await findUser(email);

if (del) {
  if (!existing) {
    console.log(`No user ${email}.`);
  } else {
    const { error } = await supabase.auth.admin.deleteUser(existing.id);
    if (error) throw error;
    console.log(`Deleted ${email}.`);
  }
  process.exit(0);
}

const password = givenPassword ?? crypto.randomBytes(15).toString("base64url");

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    app_metadata: { ...existing.app_metadata, role: "admin" },
    email_confirm: true,
    ...(givenPassword ? { password: givenPassword } : {}),
  });
  if (error) throw error;
  console.log(`Updated ${email}: role=admin${givenPassword ? ", password changed" : ", password unchanged"}.`);
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (error) throw error;
  console.log(`Created admin ${email}.`);
  if (!givenPassword) console.log(`Generated password (shown once): ${password}`);
}
