import { NextResponse } from "next/server";
import { getFundOverview } from "@/lib/supabase/fund";

export const dynamic = "force-dynamic";

// Public: aggregates only (no donor details, no per-line sales).
export async function GET() {
  try {
    const overview = await getFundOverview();
    return NextResponse.json({ success: true, ...overview });
  } catch (err) {
    console.error("[API Fund Summary Error]:", err);
    return NextResponse.json({ success: false, error: "Không tải được số liệu quỹ" }, { status: 500 });
  }
}
