import "server-only";
import { createServerClient } from "./server";

/** Revenue split by channel plus per-category sales, read from the fund_* views. */
export interface FundOverview {
  ready: boolean;
  totalRevenue: number;
  transferred: number;
  expenses: number;
  channels: { stall: number; donationStall: number; donationWeb: number };
  /** Units sold per category over all days. */
  byCategory: Array<{ category: string; qty: number; amount: number }>;
}

export interface SalesDayCategory {
  soldOn: string;
  category: string;
  qty: number;
  amount: number;
}

const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

const EMPTY: FundOverview = {
  ready: false,
  totalRevenue: 0,
  transferred: 0,
  expenses: 0,
  channels: { stall: 0, donationStall: 0, donationWeb: 0 },
  byCategory: [],
};

function fail(action: string, error: { message: string; code?: string }): Error {
  return new Error(`[Supabase] ${action} failed: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

/** Per day and category sales rows for the admin table. `ready` is false until the views exist. */
export async function listSalesByDayCategory(): Promise<{ rows: SalesDayCategory[]; ready: boolean }> {
  const supabase = createServerClient();
  if (!supabase) return { rows: [], ready: false };
  const { data, error } = await supabase
    .from("fund_sales_by_day_category")
    .select("sold_on, category, qty, amount")
    .order("sold_on", { ascending: true });
  if (error) {
    if (error.code && MISSING_TABLE_CODES.has(error.code)) return { rows: [], ready: false };
    throw fail("list sales", error);
  }
  const rows = (data as Array<{ sold_on: string; category: string; qty: number; amount: number }>).map((r) => ({
    soldOn: r.sold_on,
    category: r.category,
    qty: Number(r.qty),
    amount: Number(r.amount),
  }));
  return { rows, ready: true };
}

export async function getFundOverview(): Promise<FundOverview> {
  const supabase = createServerClient();
  if (!supabase) return EMPTY;

  const [summary, channels, sales] = await Promise.all([
    supabase.from("fund_summary").select("total_revenue, transferred, expenses").maybeSingle(),
    supabase.from("fund_by_channel").select("channel, amount"),
    listSalesByDayCategory(),
  ]);

  for (const { error } of [summary, channels]) {
    if (!error) continue;
    if (error.code && MISSING_TABLE_CODES.has(error.code)) return EMPTY;
    throw fail("read fund view", error);
  }

  const amountOf = (channel: string) =>
    Number((channels.data as Array<{ channel: string; amount: number }>).find((c) => c.channel === channel)?.amount ?? 0);

  const perCategory = new Map<string, { qty: number; amount: number }>();
  for (const r of sales.rows) {
    const slot = perCategory.get(r.category) ?? { qty: 0, amount: 0 };
    slot.qty += r.qty;
    slot.amount += r.amount;
    perCategory.set(r.category, slot);
  }

  const s = summary.data as { total_revenue: number; transferred: number; expenses: number } | null;
  return {
    ready: true,
    totalRevenue: Number(s?.total_revenue ?? 0),
    transferred: Number(s?.transferred ?? 0),
    expenses: Number(s?.expenses ?? 0),
    channels: { stall: amountOf("stall"), donationStall: amountOf("donation_stall"), donationWeb: amountOf("donation_web") },
    byCategory: [...perCategory.entries()].map(([category, v]) => ({ category, ...v })),
  };
}
