import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("kp_admin_token")?.value;
    const user = getAuthenticatedUser(req.headers, cookieToken);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error("[Admin Auth Me Error]:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi kiểm tra phiên làm việc" },
      { status: 500 }
    );
  }
}
