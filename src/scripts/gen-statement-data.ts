// Regenerates the data block of lib/sales/statement-data.ts from data/doanh-thu.csv, so the public
// statement on the home page always mirrors the sheet.
//
//   cd src
//   node --experimental-strip-types --no-warnings scripts/gen-statement-data.ts
import { readFileSync, writeFileSync } from "node:fs";
import { classifySheet, parseCsv, parseFinanceBlock } from "../lib/sales/doanh-thu.ts";
import { categoryLabel } from "../lib/sales/labels.ts";
import { parseExpenses } from "../lib/sales/chi-phi.ts";

const CSV_PATH = new URL("../../data/doanh-thu.csv", import.meta.url);
// The itemised expense sheet (kept out of git because it names people). Needed only to regenerate.
const EXPENSES_PATH = new URL("../../data/chi-phi.csv", import.meta.url);
const TARGET = new URL("../lib/sales/statement-data.ts", import.meta.url);
const START = "export const STATEMENT_SUMMARY";
const END = "/** Builds a downloadable";
const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const DAYS = ["2026-10-17", "2026-10-19", "2026-10-20"];

const sheetRows = parseCsv(readFileSync(CSV_PATH, "utf8"));
const data = classifySheet(sheetRows);
const finance = parseFinanceBlock(sheetRows);
for (const [name, value] of Object.entries(finance)) {
  if (value === null) throw new Error(`Thiếu "${name}" trong khối tài chính của sheet`);
}
const pct = (part: number, whole: number) => Math.round((part / whole) * 1000) / 10;

const salesAmount = data.sales.reduce((n, s) => n + s.amount, 0);
const donationAmount = data.donations.reduce((n, d) => n + d.amount, 0);
const totalRevenue = salesAmount + donationAmount;

// A sheet line that was split into several items shows the item names instead of the raw text.
const splitLines = new Set(
  data.sales.filter((s) => s.part > 0).map((s) => `${s.soldOn}:${s.sourceRow}`)
);

const transactions = [
  ...data.sales.map((s) => {
    const split = splitLines.has(`${s.soldOn}:${s.sourceRow}`);
    return {
      id: `sale-${s.soldOn}-${s.sourceRow}${s.part > 0 ? `-${s.part}` : ""}`,
      soldOn: s.soldOn,
      sourceRow: s.sourceRow,
      sort: s.sourceRow * 10 + s.part,
      name: split ? categoryLabel(s.category) : s.nameRaw,
      category: s.category,
      categoryLabel: categoryLabel(s.category),
      isDonation: false,
      amount: s.amount,
      note: s.note,
    };
  }),
  ...data.donations.map((d) => ({
    id: `donation-${d.soldOn}-${d.sourceRow}`,
    soldOn: d.soldOn,
    sourceRow: d.sourceRow,
    sort: d.sourceRow * 10 + 9,
    name: "donate",
    category: "donation",
    categoryLabel: "Quyên góp",
    isDonation: true,
    amount: d.amount,
    note: d.note,
  })),
]
  .sort((a, b) => a.soldOn.localeCompare(b.soldOn) || a.sort - b.sort)
  .map(({ sort: _sort, ...rest }) => rest);

const days = DAYS.map((soldOn) => {
  const sales = data.sales.filter((s) => s.soldOn === soldOn);
  const donations = data.donations.filter((d) => d.soldOn === soldOn);
  const sAmount = sales.reduce((n, s) => n + s.amount, 0);
  const dAmount = donations.reduce((n, d) => n + d.amount, 0);
  const [y, m, d] = soldOn.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return {
    soldOn,
    dayLabel: `${weekday}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`,
    dayShort: `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`,
    salesAmount: sAmount,
    salesCount: sales.length,
    donationAmount: dAmount,
    donationCount: donations.length,
    total: sAmount + dAmount,
    percentage: pct(sAmount + dAmount, totalRevenue),
  };
});

const byCategory = new Map<string, { count: number; amount: number }>();
for (const s of data.sales) {
  const slot = byCategory.get(s.category) ?? { count: 0, amount: 0 };
  slot.count += s.qty;
  slot.amount += s.amount;
  byCategory.set(s.category, slot);
}
const categories = [...byCategory.entries()]
  .sort((a, b) => b[1].amount - a[1].amount)
  .map(([category, v]) => ({
    category,
    label: categoryLabel(category),
    count: v.count,
    amount: v.amount,
    percentage: pct(v.amount, salesAmount),
  }));

const source = readFileSync(TARGET, "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf(START);
const end = source.indexOf(END);
if (start < 0 || end < 0) throw new Error("Không tìm thấy vùng dữ liệu trong statement-data.ts");
// Keep the transfer details that are not in the sheet.
const keep = (field: string) => {
  const m = new RegExp(`  ${field}: ("[^"]*"),`).exec(source.slice(start, end));
  if (!m) throw new Error(`Thiếu ${field} trong STATEMENT_SUMMARY`);
  return m[1];
};

const expensesTotal = parseExpenses(parseCsv(readFileSync(EXPENSES_PATH, "utf8"))).expenses.reduce((n, e) => n + e.amount, 0);

if (finance.sales !== totalRevenue) {
  console.warn(`Cảnh báo: tổng cộng từng dòng (${totalRevenue}) khác "tổng tiền bán" của sheet (${finance.sales}).`);
}

const block = `export const STATEMENT_SUMMARY: StatementSummary = {
  capitalAmount: ${finance.capital},
  fundTotal: ${finance.capital! + totalRevenue},
  expensesAmount: ${expensesTotal},
  totalRevenue: ${totalRevenue},
  stallSalesAmount: ${salesAmount},
  stallSalesCount: ${data.sales.length},
  donationAmount: ${donationAmount},
  donationCount: ${data.donations.length},
  transferredAmount: ${finance.transferred},
  transferRecipient: ${keep("transferRecipient")},
  transferStatus: ${keep("transferStatus")},
  transferredAt: ${keep("transferredAt")},
  proofPath: ${keep("proofPath")},
  acknowledgmentPath: ${keep("acknowledgmentPath")},
};

export const STATEMENT_DAYS: StatementDay[] = ${JSON.stringify(days, null, 2)};

export const STATEMENT_CATEGORIES: StatementCategory[] = ${JSON.stringify(categories, null, 2)};

export const STATEMENT_TRANSACTIONS: StatementItem[] = ${JSON.stringify(transactions, null, 2)};

`;
const out = source.slice(0, start) + block + source.slice(end);
writeFileSync(TARGET, source.includes("\r\n") ? out.replace(/\n/g, "\r\n") : out);
console.log(`Đã ghi ${transactions.length} giao dịch, tổng ${totalRevenue}đ.`);
