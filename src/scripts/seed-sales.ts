// Imports the "DOANH THU" sheet (data/doanh-thu.csv) into stall_sales, donations and fund_transfers.
//
//   cd src
//   node --experimental-strip-types --no-warnings scripts/seed-sales.ts --dry-run
//   node --experimental-strip-types --no-warnings --env-file=.env.local scripts/seed-sales.ts
//
// Safe to run again: rows are upserted by (date, CSV line number). The service-role key comes from
// the environment and is never written to a file.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  classifySheet,
  countByCategory,
  parseCsv,
  summarizeByDay,
} from "../lib/sales/doanh-thu.ts";

const CSV_PATH = new URL("../../data/doanh-thu.csv", import.meta.url);
const TRANSFERRED_AMOUNT = 1_800_000; // "đã chuyển từ thiện" in the sheet summary
const TRANSFER_SOURCE = "sheet-doanh-thu";
const TRANSFER_NOTE = "Đã chuyển từ thiện theo sheet";
const DONATION_NOTE = "Ẩn danh - ủng hộ trực tiếp tại gian hàng";

const dryRun = process.argv.includes("--dry-run");
const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const data = classifySheet(parseCsv(readFileSync(CSV_PATH, "utf8")));

console.log("\n== Số tiền theo ngày (cộng từng dòng, đồng) ==");
console.table(
  summarizeByDay(data).map((d) => ({
    ngay: d.soldOn,
    dong_ban_hang: d.salesCount,
    tien_ban_hang: vnd(d.salesAmount),
    dong_donate: d.donationCount,
    tien_donate: vnd(d.donationAmount),
    tong: vnd(d.total),
  }))
);

console.log("== Số lượng (theo bảng giá) và tiền theo nhóm sản phẩm (stall_sales) ==");
console.table(
  Object.entries(countByCategory(data)).map(([category, v]) => ({ category, so_luong: v.count, tien: vnd(v.amount) }))
);

const unresolvedQty = data.sales.filter((s) => !s.qtyResolved);
console.log(`== Dòng chưa chia được số lượng theo bảng giá (qty = 1, giữ nguyên tiền): ${unresolvedQty.length} ==`);
if (unresolvedQty.length > 0)
  console.table(unresolvedQty.map((s) => ({ dong_csv: s.sourceRow, ngay: s.soldOn, ten: s.nameRaw, nhom: s.category, tien: vnd(s.amount) })));

const unclassified = data.sales.filter((s) => s.category === "unclassified");
console.log(`== Dòng chưa phân loại: ${unclassified.length} ==`);
if (unclassified.length > 0) console.table(unclassified.map((s) => ({ dong_csv: s.sourceRow, ngay: s.soldOn, ten: s.nameRaw, gia: s.amount })));

if (data.skipped.length > 0) {
  console.log("== Ô có số nhưng không có tên sản phẩm (bỏ qua, không nhập) ==");
  console.table(data.skipped.map((s) => ({ dong_csv: s.sourceRow, ngay: s.soldOn, so_tien: s.amount })));
}

if (dryRun) {
  console.log("\n--dry-run: không ghi gì vào database.");
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (dùng --env-file=.env.local).");
  process.exit(1);
}
if (unclassified.length > 0) {
  console.error("Còn dòng chưa phân loại. Dừng, không ghi. Hãy xác nhận tên rồi thêm vào bảng phân loại.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function upsert(table: string, rows: Record<string, unknown>[], onConflict: string) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) {
    console.error(`Ghi ${table} lỗi: ${error.message}`);
    process.exit(1);
  }
  console.log(`${table}: đã ghi ${rows.length} dòng`);
}

await upsert(
  "stall_sales",
  data.sales.map((s) => ({
    sold_on: s.soldOn,
    product_name_raw: s.nameRaw,
    category: s.category,
    items: s.items,
    qty: s.qty,
    unit_price: s.amount / s.qty, // exact: qty only divides the amount when it matches a list price
    note: s.note,
    channel: "stall",
    source_row: s.sourceRow,
    part: s.part,
  })),
  "sold_on,source_row,part"
);

await upsert(
  "donations",
  data.donations.map((d) => ({
    sepay_id: null,
    gateway: "",
    account_number: "",
    amount: d.amount,
    content: d.note ? `${DONATION_NOTE} (${d.note})` : DONATION_NOTE,
    reference_code: "",
    transaction_date: `${d.soldOn}T00:00:00+07:00`, // the sheet records the day only
    channel: "stall",
    status: "received",
    donated_on: d.soldOn,
    source_row: d.sourceRow,
  })),
  "donated_on,source_row"
);

// Transferred to Sân Nhà Nhiều Chó on 25/10/2026 at 22:18 via MB Bank -> VCB.
await upsert(
  "fund_transfers",
  [
    {
      amount: TRANSFERRED_AMOUNT,
      note: "Team K&P chuyển tiền từ thiện cho các bé chó mèo của SNNC qua VCB 1060402678 lúc 22:18 ngày 25/10/2026",
      proof_path: "/images/proof_chuyen_khoan_san_nha_nhieu_cho.jpg",
      transferred_at: "2026-10-25T22:18:00+07:00",
      source: TRANSFER_SOURCE,
    },
  ],
  "source"
);

console.log("\nXong. Chi phí nhập riêng bằng scripts/seed-expenses.ts.");
