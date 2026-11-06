// Imports the expenses sheet (data/chi-phi.csv) into campaign_expenses.
//
//   cd src
//   node --experimental-strip-types --no-warnings scripts/seed-expenses.ts --dry-run
//   node --experimental-strip-types --no-warnings --env-file=.env.local scripts/seed-expenses.ts
//
// Safe to run again: rows are upserted by their CSV line number.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { parseCsv } from "../lib/sales/doanh-thu.ts";
import { parseExpenses } from "../lib/sales/chi-phi.ts";

const CSV_PATH = new URL("../../data/chi-phi.csv", import.meta.url);
const dryRun = process.argv.includes("--dry-run");
const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const { expenses, sheetTotal } = parseExpenses(parseCsv(readFileSync(CSV_PATH, "utf8")));
const sum = expenses.reduce((n, e) => n + e.amount, 0);

console.table(expenses.map((e) => ({ dong_csv: e.sourceRow, ngay: e.spentOn, khoan_chi: e.label, so_tien: vnd(e.amount) })));
console.log(`Số khoản: ${expenses.length}. Tổng cộng các dòng: ${vnd(sum)}đ. Tổng ghi trong sheet: ${sheetTotal === null ? "không có" : vnd(sheetTotal) + "đ"}.`);

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
const { error } = await supabase.from("campaign_expenses").upsert(
  expenses.map((e) => ({ label: e.label, amount: e.amount, spent_on: e.spentOn, note: e.note, source_row: e.sourceRow })),
  { onConflict: "source_row" }
);
if (error) {
  console.error(`Ghi campaign_expenses lỗi: ${error.message}`);
  process.exit(1);
}
console.log(`campaign_expenses: đã ghi ${expenses.length} dòng`);
