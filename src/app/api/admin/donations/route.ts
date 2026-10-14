import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { getDonationSummary, listDonations } from "@/lib/supabase/donations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const [{ donations, ready }, summary] = await Promise.all([listDonations(), getDonationSummary()]);
    return NextResponse.json({ success: true, donations, ready, total: summary.total, count: summary.count });
  } catch (err) {
    console.error("[API List Donations Error]:", err);
    return NextResponse.json({ success: false, error: "Không tải được sao kê quỹ" }, { status: 500 });
  }
}
