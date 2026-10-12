import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("[Admin Auth Me Error]:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi kiểm tra phiên làm việc" },
      { status: 500 }
    );
  }
}
