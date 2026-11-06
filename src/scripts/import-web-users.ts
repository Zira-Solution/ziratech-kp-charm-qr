// Records people who used the website, from a plain list of e-mails (one per line), so the admin
// can count them. NOTHING is e-mailed: the rows get no creator key and no PIN, so they cannot be
// opened until an admin re-issues a key from the "Đơn hàng" tab.
//
//   cd src
//   node --experimental-strip-types --no-warnings scripts/import-web-users.ts <emails.txt> --dry-run
//   node --experimental-strip-types --no-warnings --env-file=.env.local scripts/import-web-users.ts <emails.txt>
//
// Keep the e-mail list OUTSIDE the repository. Safe to run again: an e-mail that already has an
// order is skipped, and the token of an imported row is derived from the e-mail.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Cách dùng: import-web-users.ts <file-email.txt> [--dry-run]");
  process.exit(1);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emails: string[] = [];
const bad: string[] = [];
for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
  const email = line.trim().toLowerCase();
  if (!email) continue;
  if (!EMAIL.test(email)) bad.push(email);
  else if (!emails.includes(email)) emails.push(email);
}
const duplicates = readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.trim()).length - bad.length - emails.length;
console.log(`Đọc được ${emails.length} email hợp lệ, ${duplicates} dòng trùng, ${bad.length} dòng sai định dạng.`);
if (bad.length > 0) console.log("Sai định dạng:", bad);

const tokenOf = (email: string) => `KP-IMP-${createHash("sha256").update(email).digest("hex").slice(0, 10).toUpperCase()}`;

if (dryRun) {
  console.log("--dry-run: không ghi gì vào database.");
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (dùng --env-file=.env.local).");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const existing = await supabase.from("gift_products").select("customer_email");
if (existing.error) {
  console.error(`Đọc gift_products lỗi: ${existing.error.message}`);
  process.exit(1);
}
const have = new Set((existing.data ?? []).map((r) => String(r.customer_email).trim().toLowerCase()));
const fresh = emails.filter((e) => !have.has(e));
console.log(`Đã có đơn: ${emails.length - fresh.length} email (bỏ qua). Sẽ thêm: ${fresh.length}.`);

if (fresh.length > 0) {
  const { error } = await supabase.from("gift_products").upsert(
    fresh.map((email) => ({
      token: tokenOf(email),
      creator_key: "", // empty on purpose: cannot be opened until an admin re-issues a key
      unlock_pin: "",
      customer_name: email,
      customer_email: email,
      chain_id: "kp-bracelet",
      chain_name: "Vòng K&P",
      chain_price: 0,
      charms: [],
      total_price: 0,
      payment_method: "cash",
      status: "pending",
      email_sent: false,
    })),
    { onConflict: "token", ignoreDuplicates: true }
  );
  if (error) {
    console.error(`Ghi gift_products lỗi: ${error.message}`);
    process.exit(1);
  }
}
const total = await supabase.from("gift_products").select("*", { count: "exact", head: true }).is("deleted_at", null);
console.log(`Xong. Tổng số đơn (người dùng web) hiện có: ${total.count}.`);
