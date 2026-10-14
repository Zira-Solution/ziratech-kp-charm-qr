import "server-only";
import { createServerClient } from "./server";

/** Money received into the charity fund bank account, recorded by the SePay webhook. */
export interface Donation {
  id: string;
  sepayId: number;
  gateway: string;
  accountNumber: string;
  amount: number;
  content: string;
  referenceCode: string;
  transactionDate: string;
}

export interface DonationSummary {
  total: number;
  count: number;
}

export interface NewDonation {
  sepayId: number;
  gateway: string;
  accountNumber: string;
  amount: number;
  content: string;
  referenceCode: string;
  transactionDate: string;
}

const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);
const UNIQUE_VIOLATION = "23505";
const PAGE_SIZE = 1000;

type Row = {
  id: string;
  sepay_id: number;
  gateway: string;
  account_number: string;
  amount: number;
  content: string;
  reference_code: string;
  transaction_date: string;
};

const fromRow = (r: Row): Donation => ({
  id: r.id,
  sepayId: Number(r.sepay_id),
  gateway: r.gateway,
  accountNumber: r.account_number,
  amount: Number(r.amount),
  content: r.content,
  referenceCode: r.reference_code,
  transactionDate: r.transaction_date,
});

function fail(action: string, error: { message: string; code?: string }): Error {
  return new Error(`[Supabase] ${action} failed: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

/** Stores one incoming transfer. Returns false when SePay already delivered it (retry), true when new. */
export async function recordDonation(d: NewDonation): Promise<boolean> {
  const supabase = createServerClient();
  if (!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");

  const { error } = await supabase.from("donations").insert({
    sepay_id: d.sepayId,
    gateway: d.gateway,
    account_number: d.accountNumber,
    amount: d.amount,
    content: d.content,
    reference_code: d.referenceCode,
    transaction_date: d.transactionDate,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) return false;
    if (error.code && MISSING_TABLE_CODES.has(error.code)) throw new Error("DONATIONS_TABLE_MISSING");
    throw fail("record donation", error);
  }
  return true;
}

/** Newest-first statement for the admin. `ready` is false until the donations table has been created. */
export async function listDonations(limit = 500): Promise<{ donations: Donation[]; ready: boolean }> {
  const supabase = createServerClient();
  if (!supabase) return { donations: [], ready: false };

  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .order("transaction_date", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code && MISSING_TABLE_CODES.has(error.code)) return { donations: [], ready: false };
    throw fail("list donations", error);
  }
  return { donations: (data as Row[]).map(fromRow), ready: true };
}

/** Total raised and number of transfers. Pages through the table so the sum stays correct past 1000 rows. */
export async function getDonationSummary(): Promise<DonationSummary> {
  const supabase = createServerClient();
  if (!supabase) return { total: 0, count: 0 };

  let total = 0;
  let count = 0;
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("donations")
      .select("amount")
      .order("transaction_date", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      if (error.code && MISSING_TABLE_CODES.has(error.code)) return { total: 0, count: 0 };
      throw fail("sum donations", error);
    }
    for (const row of data as Array<{ amount: number }>) total += Number(row.amount);
    count += data.length;
    if (data.length < PAGE_SIZE) break;
  }
  return { total, count };
}
