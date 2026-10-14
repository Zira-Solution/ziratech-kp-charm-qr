import { NextResponse } from "next/server";
import { getDonationSummary } from "@/lib/supabase/donations";

export const dynamic = "force-dynamic";

// Public: only the totals, never donor names or transfer notes.
export async function GET() {
  try {
    const { total, count } = await getDonationSummary();
    return NextResponse.json({ success: true, total, count });
  } catch (err) {
    console.error("[API Donation Summary Error]:", err);
    return NextResponse.json({ success: false, error: "Không tải được số liệu quỹ" }, { status: 500 });
  }
}
