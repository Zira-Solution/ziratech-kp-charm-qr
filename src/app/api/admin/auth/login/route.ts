import { NextRequest, NextResponse } from "next/server";
import {
  authenticateWithCredentials,
  signSessionToken,
} from "@/lib/auth/admin-auth";
import { checkRateLimit } from "@/lib/validation/security";
import { clearFailures, getLockRemainingMs, recordFailure } from "@/lib/supabase/attempts";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "admin-login";
    const { allowed } = checkRateLimit(`admin-login-${ip}`, 10, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Thao tác quá nhanh. Vui lòng đợi 1 phút rồi thử lại." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tài khoản và mật khẩu." },
        { status: 400 }
      );
    }

    if (typeof identifier !== "string" || typeof password !== "string" || identifier.length > 120 || password.length > 200) {
      return NextResponse.json(
        { success: false, error: "Tài khoản hoặc mật khẩu không hợp lệ." },
        { status: 400 }
      );
    }

    // Lock the account (not just the IP) for 15 minutes after repeated failures.
    const lockKey = `admin:${identifier.trim().toLowerCase()}`;
    const lockedMs = await getLockRemainingMs(lockKey);
    if (lockedMs > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Tài khoản tạm khóa do nhập sai nhiều lần. Thử lại sau ${Math.ceil(lockedMs / 60000)} phút.`,
        },
        { status: 429 }
      );
    }

    const user = authenticateWithCredentials(identifier, password);
    if (!user) {
      await recordFailure(lockKey, 10);
      return NextResponse.json(
        {
          success: false,
          error: "Tài khoản hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại quyền truy cập.",
        },
        { status: 401 }
      );
    }

    await clearFailures(lockKey);

    // Sign session token (hạn 24 giờ)
    const token = signSessionToken(user, 24 * 60 * 60 * 1000);

    const res = NextResponse.json({
      success: true,
      user,
      token,
      message: `Đăng nhập thành công với vai trò ${user.roleTitle}`,
    });

    // Set secure cookie
    res.cookies.set({
      name: "kp_admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 1 day
    });

    return res;
  } catch (err: any) {
    console.error("[Admin Login Error]:", err);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi máy chủ trong quá trình xác thực." },
      { status: 500 }
    );
  }
}
