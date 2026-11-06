import assert from "node:assert/strict";
import { test } from "node:test";
import { classify, classifySheet, countByCategory, normalizeName, parseCsv, summarizeByDay } from "../lib/sales/doanh-thu.ts";
import {
  STATEMENT_CATEGORIES,
  STATEMENT_DAYS,
  STATEMENT_SUMMARY,
  STATEMENT_TRANSACTIONS,
  buildStatementCsv,
} from "../lib/sales/statement-data.ts";

const CSV = [
  "DOANH THU,,,,,,,,,,,,",
  "17/10,,,19/10,,,20/10,,,,,,",
  "Sản phẩm,Giá,Ghi chú,sản phẩm ,giá,ghi chú,sản phẩm ,giá,ghi chú,,,,",
  "Vòng đeo tay,40,,gấu mini ,20,,bông,260,,,,,",
  "móc khoá ,20,,móc khóa,20,,donate,30,,,Tổng doanh thu,,",
  '"DIY, gấu bông",43,ghi chú gốc,gấu bông với móc khoá,35,,mù,5,,,,,',
  "móc khoá vòng tay,60,,xyz lạ,10,,,,,,,,",
  "gấu mini,10,,,520,,,485,,,,,",
  ",744,,,,,,,,,,,",
].join("\r\n");

test("parseCsv handles quoted commas and CRLF", () => {
  const rows = parseCsv(CSV);
  assert.equal(rows[5][0], "DIY, gấu bông");
  assert.equal(rows.length, 9);
});

test("normalizeName unifies spelling", () => {
  assert.equal(normalizeName("  Móc  Khóa "), "móc khoá");
});

test("classify never guesses", () => {
  assert.deepEqual(classify("vòng đeo tay"), { kind: "single", category: "bracelet" });
  assert.deepEqual(classify("móc khóa đt"), { kind: "single", category: "keychain_phone" });
  assert.deepEqual(classify("xyz lạ"), { kind: "unclassified" });
  assert.deepEqual(classify("gấu bông với móc khoá"), { kind: "combo", items: ["bear", "keychain"] });
});

test("classifySheet keeps every line as written and prices x1000", () => {
  const data = classifySheet(parseCsv(CSV), {});
  const combo = data.sales.find((s) => s.nameRaw === "DIY, gấu bông");
  assert.ok(combo);
  assert.equal(combo.category, "combo");
  assert.deepEqual(combo.items, ["diy", "bear"]);
  assert.equal(combo.amount, 43000);
  assert.equal(combo.note, "ghi chú gốc");
  assert.equal(combo.sourceRow, 6);
  // donate goes to donations, not stall sales
  assert.equal(data.donations.length, 1);
  assert.equal(data.donations[0].amount, 30000);
  assert.equal(data.sales.some((s) => s.category === "unclassified"), true);
  // price without a name is skipped, not imported
  assert.deepEqual(
    data.skipped.map((s) => [s.sourceRow, s.amount]),
    [
      [8, 520000],
      [8, 485000],
      [9, 744000],
    ]
  );
});

test("summaries add up the money of each line", () => {
  const data = classifySheet(parseCsv(CSV), {});
  const days = summarizeByDay(data);
  assert.equal(days[0].total, 40000 + 20000 + 43000 + 60000 + 10000);
  assert.equal(days[2].donationAmount, 30000);
  assert.equal(countByCategory(data).combo.count, 3);
});

test("statement dataset is mathematically consistent with stall records", () => {
  assert.equal(STATEMENT_TRANSACTIONS.length, 74);
  assert.equal(STATEMENT_SUMMARY.stallSalesCount, 61);
  assert.equal(STATEMENT_SUMMARY.donationCount, 13);
  assert.equal(STATEMENT_SUMMARY.stallSalesAmount, 1909000);
  assert.equal(STATEMENT_SUMMARY.donationAmount, 291000);
  assert.equal(STATEMENT_SUMMARY.totalRevenue, 2200000);

  const dayTotal = STATEMENT_DAYS.reduce((sum, d) => sum + d.total, 0);
  assert.equal(dayTotal, STATEMENT_SUMMARY.totalRevenue);

  const categoryTotal = STATEMENT_CATEGORIES.reduce((sum, c) => sum + c.amount, 0);
  assert.equal(categoryTotal, STATEMENT_SUMMARY.stallSalesAmount);

  const csv = buildStatementCsv();
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("Ngày,Dòng trong bảng,Nội dung giao dịch"));
  assert.ok(csv.includes("Vòng đeo tay"));
  assert.ok(csv.includes("donate"));
});

test("deriveQty keeps the sheet money and only splits it by the price list", async () => {
  const { deriveQty } = await import("../lib/sales/doanh-thu.ts");
  assert.deepEqual(deriveQty("bracelet", 30000), { qty: 1, resolved: true });
  assert.deepEqual(deriveQty("card", 9000), { qty: 3, resolved: true });
  assert.deepEqual(deriveQty("flower", 260000), { qty: 13, resolved: true });
  assert.deepEqual(deriveQty("bear_mini", 20000), { qty: 2, resolved: true });
  // 40 is not a multiple of 30: left unresolved, never guessed
  assert.deepEqual(deriveQty("bracelet", 40000), { qty: 1, resolved: false });
});

test("keychain written at 15 is a mini bear", () => {
  const data = classifySheet(parseCsv(["a", "b", "c", "móc khoá,15,,,,,,,"].join("\n")), {});
  assert.equal(data.sales[0].category, "bear_mini");
  assert.equal(data.sales[0].nameRaw, "móc khoá");
});

test("owner-confirmed corrections: DIY is one item per line, odd phone charm, mislabelled mini bears", async () => {
  const { deriveQty } = await import("../lib/sales/doanh-thu.ts");
  assert.deepEqual(deriveQty("diy", 78000), { qty: 1, resolved: true });
  assert.deepEqual(deriveQty("diy", 60000), { qty: 1, resolved: true });
  assert.deepEqual(deriveQty("keychain_phone", 35000), { qty: 1, resolved: true });
  const data = classifySheet(parseCsv(["a", "b", "c", "vòng tay,15,,,,,,,", "gấu bông,10,,,,,,,"].join("\n")), {});
  assert.deepEqual(data.sales.map((x) => x.category), ["bear_mini", "bear_mini"]);
});

test("owner-confirmed splits: 40 = bracelet 30 + 10k donation, two-item lines, totals unchanged", async () => {
  const { SPLITS } = await import("../lib/sales/doanh-thu.ts");
  for (const [key, parts] of Object.entries(SPLITS)) {
    assert.ok(parts.length === 2, key + " has two parts");
  }
  const rows = parseCsv(["a", "b", "c", "vòng tay,40,,,,,,,", "móc khoá vòng tay,60,,,,,,,"].join("\n"));
  const data = classifySheet(rows, {
    "2026-10-17:4": SPLITS["2026-10-17:4"],
    "2026-10-17:5": SPLITS["2026-10-17:7"],
  });
  assert.deepEqual(data.sales.map((s) => [s.category, s.amount, s.part]), [
    ["bracelet", 30000, 0],
    ["keychain", 30000, 0],
    ["bracelet", 30000, 1],
  ]);
  assert.deepEqual(data.donations.map((x) => x.amount), [10000]);
});

test("expense sheet: money, dates and the bottom total are read as written", async () => {
  const { parseExpenses, parseMoney, parseDate } = await import("../lib/sales/chi-phi.ts");
  assert.equal(parseMoney('289.252,00 đ'), 289252);
  assert.equal(parseMoney(""), null);
  assert.equal(parseDate("10/10/2026"), "2026-10-10");
  const csv = [
    "Người dat hang,Sản phẩm,Ngân sách,Chi phí,Ngày giao dịch,Ghi chú,Người mua,Cột 1",
    'Gia Hân,Vòng Tay,,"184.140,00 đ",14/10/2026,,Gia Hân,Đã chuyển',
    'Mỹ lệ,dây,,"51.336,00 đ",17/10/2026,,,',
    ',,"0,00 đ","235.476,00 đ",,,,',
  ].join("\n");
  const { expenses, sheetTotal } = parseExpenses(parseCsv(csv));
  assert.equal(expenses.length, 2);
  assert.equal(expenses[0].amount, 184140);
  assert.equal(expenses[0].note, "Người đặt: Gia Hân; Người mua: Gia Hân; Tình trạng: Đã chuyển");
  assert.equal(sheetTotal, 235476);
});

test("a phone charm written in full is still a phone charm", () => {
  assert.deepEqual(classify("móc khóa điện thoại "), { kind: "single", category: "keychain_phone" });
});

test("finance block of the sheet is read in VND", async () => {
  const { parseFinanceBlock } = await import("../lib/sales/doanh-thu.ts");
  const rows = parseCsv(
    [
      "a,b,c,d,e,f,g,h,i,j,k,l",
      "x,,,,,,,,,tổng tiền bán,,2200,",
      "x,,,,,,,,,tiền vốn,,1600,( phí phát sinh 200)",
      "x,,,,,,,,,tiền mua đồ chi phí,,2000,",
      "x,,,,,,,,,ĐÃ CHUYỂN TỪ THIỆN ,,1800",
    ].join("\n")
  );
  assert.deepEqual(parseFinanceBlock(rows), { sales: 2200000, capital: 1600000, expenses: 2000000, transferred: 1800000 });
});
