import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { listSalesByDayCategory } from "@/lib/supabase/fund";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { rows, ready } = await listSalesByDayCategory();
    return NextResponse.json({ success: true, rows, ready });
  } catch (err) {
    console.error("[API Admin Sales Error]:", err);
    return NextResponse.json({ success: false, error: "Không tải được bảng bán hàng" }, { status: 500 });
  }
}
