// Pure parser for the "DOANH THU" sheet export (no framework imports, runnable by node --test).
// The sheet has three side-by-side blocks (17/10, 19/10, 20/10), each: product, price, note.
// Prices in the sheet are in thousands of VND.

export type SalesCategory =
  | "bracelet"
  | "keychain"
  | "keychain_phone"
  | "bear_mini"
  | "bear"
  | "diy"
  | "card"
  | "flower"
  | "blindbox"
  | "combo"
  | "unclassified";

export const SALES_CATEGORIES: readonly SalesCategory[] = [
  "bracelet",
  "keychain",
  "keychain_phone",
  "bear_mini",
  "bear",
  "diy",
  "card",
  "flower",
  "blindbox",
  "combo",
  "unclassified",
];

/** Unit prices in VND per category, as given by the owner. Donations are not priced. */
export const PRICE_LIST: Partial<Record<SalesCategory, number[]>> = {
  bracelet: [30000],
  keychain: [20000, 25000],
  keychain_phone: [25000, 30000],
  bear: [25000],
  bear_mini: [10000, 15000],
  diy: [30000],
  card: [3000],
  flower: [20000, 25000],
};

/**
 * Units behind a sheet amount. An amount equal to one price is 1 unit; otherwise it must divide by
 * exactly one price. Anything else is left unresolved (never guessed).
 */
export function deriveQty(category: SalesCategory, amount: number): { qty: number; resolved: boolean } {
  // DIY prices go up and down: every DIY line is one item at the amount written.
  if (category === "diy") return { qty: 1, resolved: true };
  // Confirmed by the owner: the 35 phone charm is one charm of another type.
  if (category === "keychain_phone" && amount === 35000) return { qty: 1, resolved: true };
  const prices = PRICE_LIST[category];
  if (!prices) return { qty: 1, resolved: false };
  if (prices.includes(amount)) return { qty: 1, resolved: true };
  const fits = prices.filter((p) => amount % p === 0);
  if (fits.length === 1) return { qty: amount / fits[0], resolved: true };
  return { qty: 1, resolved: false };
}

type SingleCategory = Exclude<SalesCategory, "combo" | "unclassified"> | "donation";

export interface SheetRow {
  /** 1-based line number in the CSV file. */
  sourceRow: number;
  /** ISO date, e.g. 2026-10-17. */
  soldOn: string;
  nameRaw: string;
  /** VND (sheet value x 1000). */
  amount: number;
  note: string | null;
}

export interface StallSaleRow extends SheetRow {
  category: SalesCategory;
  items: string[] | null;
  /** Units sold, derived from the price list. The money stays exactly as the sheet says. */
  qty: number;
  /** 0 for a normal line; 1, 2... when one sheet line was split into several items. */
  part: number;
  /** False when the amount could not be matched to the price list (qty stays 1, flagged for review). */
  qtyResolved: boolean;
}

export interface Classified {
  sales: StallSaleRow[];
  donations: SheetRow[];
  /** Cells that had a price but no product name (totals the sheet author typed in the data area). */
  skipped: Array<{ sourceRow: number; soldOn: string; amount: number }>;
}

export interface SplitPart {
  kind: "sale" | "donation";
  category?: SalesCategory;
  amount: number;
}

/**
 * Sheet lines the owner confirmed are really several items (or an item plus a 10k donation).
 * Keyed by "date:csv line". The parts must add up to the amount written in the sheet.
 */
export const SPLITS: Record<string, SplitPart[]> = {
  // vòng tay 40 = bracelet 30 + 10k donation
  "2026-10-17:4": [{ kind: "sale", category: "bracelet", amount: 30000 }, { kind: "donation", amount: 10000 }],
  "2026-10-17:8": [{ kind: "sale", category: "bracelet", amount: 30000 }, { kind: "donation", amount: 10000 }],
  "2026-10-17:20": [{ kind: "sale", category: "bracelet", amount: 30000 }, { kind: "donation", amount: 10000 }],
  // móc khoá vòng tay 60 = keychain 30 + bracelet 30
  "2026-10-17:7": [{ kind: "sale", category: "keychain", amount: 30000 }, { kind: "sale", category: "bracelet", amount: 30000 }],
  // DIY, gấu bông 43 = mini bear 15 + DIY 28
  "2026-10-17:19": [{ kind: "sale", category: "bear_mini", amount: 15000 }, { kind: "sale", category: "diy", amount: 28000 }],
  // gấu bông với móc khoá 35 = mini bear 15 + keychain 20
  "2026-10-19:14": [{ kind: "sale", category: "bear_mini", amount: 15000 }, { kind: "sale", category: "keychain", amount: 20000 }],
};

const BLOCKS: Array<{ col: number; soldOn: string }> = [
  { col: 0, soldOn: "2026-10-17" },
  { col: 3, soldOn: "2026-10-19" },
  { col: 6, soldOn: "2026-10-20" },
];
const FIRST_DATA_LINE = 4;
const PRICE_UNIT = 1000;

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Lower-case, collapsed spaces, one spelling of "khoá/khóa". */
export function normalizeName(raw: string): string {
  return raw
    .normalize("NFC")
    .toLowerCase()
    .replace(/khóa/g, "khoá")
    .replace(/\s+/g, " ")
    .trim();
}

// Exact-match table: a name that is not listed here is "unclassified" (never guessed).
const SINGLE: Record<string, SingleCategory> = {
  "vòng tay": "bracelet",
  "vòng đeo tay": "bracelet",
  "móc khoá": "keychain",
  "móc khoá mu ro di": "keychain", // confirmed by the owner
  "móc khoá đt": "keychain_phone",
  "móc treo đt": "keychain_phone",
  "gấu mini": "bear_mini",
  "gấu bông": "bear",
  diy: "diy",
  thiệp: "card",
  bông: "flower",
  donate: "donation",
  blindbox: "blindbox",
  mù: "blindbox",
};

// Multi-item cells, confirmed by the owner. The sheet total stays on one line.
const COMBOS: Record<string, string[]> = {
  "diy, gấu bông": ["diy", "bear"],
  "gấu bông với móc khoá": ["bear", "keychain"],
  "móc khoá vòng tay": ["keychain", "bracelet"],
};

export type Classification =
  | { kind: "single"; category: SingleCategory }
  | { kind: "combo"; items: string[] }
  | { kind: "unclassified" };

export function classify(nameRaw: string): Classification {
  const key = normalizeName(nameRaw);
  const combo = COMBOS[key];
  if (combo) return { kind: "combo", items: combo };
  const single = SINGLE[key];
  if (single) return { kind: "single", category: single };
  return { kind: "unclassified" };
}

/** Reads the three transaction blocks. The summary block (columns K-M) is ignored. */
export function classifySheet(rows: string[][], splits: Record<string, SplitPart[]> = SPLITS): Classified {
  const out: Classified = { sales: [], donations: [], skipped: [] };
  rows.forEach((cells, index) => {
    const sourceRow = index + 1;
    if (sourceRow < FIRST_DATA_LINE) return;
    for (const { col, soldOn } of BLOCKS) {
      const nameRaw = (cells[col] ?? "").trim();
      const priceText = (cells[col + 1] ?? "").trim();
      const note = (cells[col + 2] ?? "").trim() || null;
      if (!nameRaw && !priceText) continue;
      const price = Number(priceText.replace(",", "."));
      if (!Number.isFinite(price) || priceText === "") {
        throw new Error(`Dòng ${sourceRow} (${soldOn}): giá "${priceText}" không hợp lệ cho "${nameRaw}"`);
      }
      const amount = Math.round(price * PRICE_UNIT);
      if (!nameRaw) {
        out.skipped.push({ sourceRow, soldOn, amount });
        continue;
      }
      const base: SheetRow = { sourceRow, soldOn, nameRaw, amount, note };
      const split = splits[`${soldOn}:${sourceRow}`];
      if (split) {
        if (split.reduce((n, p) => n + p.amount, 0) !== amount) {
          throw new Error(`Dòng ${sourceRow} (${soldOn}): các phần tách không cộng đúng ${amount}`);
        }
        let part = 0;
        for (const p of split) {
          if (p.kind === "donation") out.donations.push({ ...base, amount: p.amount });
          else out.sales.push({ ...base, amount: p.amount, category: p.category!, items: null, qty: 1, part: part++, qtyResolved: true });
        }
        continue;
      }
      const c = classify(nameRaw);
      if (c.kind === "single" && c.category === "donation") out.donations.push(base);
      else if (c.kind === "single") {
        // Confirmed by the owner: the sheet wrote "móc khoá 15" for what is really a mini bear.
        // Also confirmed: "vòng tay 15" was a typo for a mini bear, and "gấu bông 10" is a mini bear.
        const toMiniBear =
          (c.category === "keychain" && amount === 15000) ||
          (c.category === "bracelet" && amount === 15000) ||
          (c.category === "bear" && amount === 10000);
        const category = (toMiniBear ? "bear_mini" : c.category) as SalesCategory;
        const { qty, resolved } = deriveQty(category, amount);
        out.sales.push({ ...base, category, items: null, qty, part: 0, qtyResolved: resolved });
      } else if (c.kind === "combo") {
        out.sales.push({ ...base, category: "combo", items: c.items, qty: 1, part: 0, qtyResolved: false });
      } else out.sales.push({ ...base, category: "unclassified", items: null, qty: 1, part: 0, qtyResolved: false });
    }
  });
  return out;
}

export interface DaySummary {
  soldOn: string;
  salesAmount: number;
  salesCount: number;
  donationAmount: number;
  donationCount: number;
  total: number;
}

/** Per-line money summed per day (stall sales + stall donations). */
export function summarizeByDay(data: Classified): DaySummary[] {
  return BLOCKS.map(({ soldOn }) => {
    const sales = data.sales.filter((s) => s.soldOn === soldOn);
    const donations = data.donations.filter((d) => d.soldOn === soldOn);
    const salesAmount = sales.reduce((n, s) => n + s.amount, 0);
    const donationAmount = donations.reduce((n, d) => n + d.amount, 0);
    return {
      soldOn,
      salesAmount,
      salesCount: sales.length,
      donationAmount,
      donationCount: donations.length,
      total: salesAmount + donationAmount,
    };
  });
}

export function countByCategory(data: Classified): Record<string, { count: number; amount: number }> {
  const result: Record<string, { count: number; amount: number }> = {};
  for (const s of data.sales) {
    const slot = (result[s.category] ??= { count: 0, amount: 0 });
    slot.count += s.qty;
    slot.amount += s.amount;
  }
  return result;
}
