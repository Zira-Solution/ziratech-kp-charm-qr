// Pure parser for the expenses sheet export (data/chi-phi.csv). Columns:
// orderer, product, budget, cost, date, note, buyer, status. The columns to the right (team
// contributions) are not expenses and are ignored.

export interface ExpenseRow {
  /** 1-based line number in the CSV file. */
  sourceRow: number;
  label: string;
  /** VND. */
  amount: number;
  /** ISO date, or null when the sheet has none. */
  spentOn: string | null;
  note: string | null;
}

export interface ParsedExpenses {
  expenses: ExpenseRow[];
  /** The total the sheet itself states on its last row, in VND (null when absent). */
  sheetTotal: number | null;
}

/** "289.252,00 đ" -> 289252. Returns null when the cell holds no amount. */
export function parseMoney(text: string): number | null {
  const whole = text.split(",")[0].replace(/\D/g, "");
  return whole === "" ? null : Number(whole);
}

/** "10/10/2026" -> "2026-10-10". */
export function parseDate(text: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

export function parseExpenses(rows: string[][]): ParsedExpenses {
  const expenses: ExpenseRow[] = [];
  let sheetTotal: number | null = null;
  rows.forEach((cells, index) => {
    if (index === 0) return; // header
    const sourceRow = index + 1;
    const label = (cells[1] ?? "").trim();
    const amount = parseMoney(cells[3] ?? "");
    if (!label) {
      if (amount !== null) sheetTotal = amount; // the summary row at the bottom
      return;
    }
    if (amount === null) throw new Error(`Dòng ${sourceRow}: "${label}" không có số tiền chi`);
    const parts = [
      ["Người đặt", cells[0]],
      ["Người mua", cells[6]],
      ["Tình trạng", cells[7]],
      ["Ghi chú", cells[5]],
    ]
      .map(([key, value]) => [key, (value ?? "").trim()])
      .filter(([, value]) => value !== "")
      .map(([key, value]) => `${key}: ${value}`);
    expenses.push({
      sourceRow,
      label,
      amount,
      spentOn: parseDate(cells[4] ?? ""),
      note: parts.length > 0 ? parts.join("; ") : null,
    });
  });
  return { expenses, sheetTotal };
}
