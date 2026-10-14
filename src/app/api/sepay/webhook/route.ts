import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { recordDonation } from "@/lib/supabase/donations";

// SePay posts every bank-balance change of the linked account here.
// Auth: header `Authorization: Apikey <SEPAY_API_KEY>`. SePay treats HTTP 200/201 with {"success": true}
// as delivered and retries anything else, so duplicates and ignorable events still answer success.

const reply = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status });

function apiKeyMatches(header: string | null): boolean {
  const expected = process.env.SEPAY_API_KEY;
  if (!expected || !header) return false;
  const match = /^Apikey\s+(.+)$/i.exec(header.trim());
  if (!match) return false;
  const given = Buffer.from(match[1]);
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

/** SePay sends "2026-10-14 15:30:00" in Vietnam time (UTC+7). */
function parseTransactionDate(value: unknown): string {
  if (typeof value === "string") {
    const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(" ", "T")}+07:00` : value;
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(req: NextRequest) {
  if (!process.env.SEPAY_API_KEY) {
    console.error("[SePay webhook] SEPAY_API_KEY is not set");
    return reply({ success: false, error: "Webhook chưa được cấu hình" }, 503);
  }
  if (!apiKeyMatches(req.headers.get("authorization"))) {
    return reply({ success: false, error: "Unauthorized" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ success: false, error: "Invalid JSON" }, 400);
  }

  // Only money coming in counts; outgoing transfers are not donations.
  if (body.transferType !== "in") return reply({ success: true, ignored: "not an incoming transfer" });

  const sepayId = Number(body.id);
  const amount = Number(body.transferAmount);
  if (!Number.isSafeInteger(sepayId) || !Number.isFinite(amount) || amount <= 0) {
    return reply({ success: false, error: "Invalid transaction" }, 400);
  }

  try {
    const isNew = await recordDonation({
      sepayId,
      gateway: text(body.gateway, 100),
      accountNumber: text(body.accountNumber, 50),
      amount: Math.round(amount),
      content: text(body.content, 500),
      referenceCode: text(body.referenceCode, 100),
      transactionDate: parseTransactionDate(body.transactionDate),
    });
    return reply({ success: true, duplicate: !isNew });
  } catch (err) {
    console.error("[SePay webhook Error]:", err);
    // Non-2xx makes SePay retry later, which is what we want while the database is unavailable.
    return reply({ success: false, error: "Không ghi được giao dịch" }, 500);
  }
}
