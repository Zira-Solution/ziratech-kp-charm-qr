import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, isValidEmail } from "@/lib/validation/security";
import { clearFailures, getLockRemainingMs, recordFailure } from "@/lib/supabase/attempts";
import { createAuthClient } from "@/lib/supabase/auth";
import { toAdminEmail } from "@/config/auth";

// One message for every failure (unknown email, wrong password, not an admin) so the
// endpoint cannot be used to discover which accounts exist.
const INVALID_LOGIN = "Tên đăng nhập hoặc mật khẩu không chính xác.";

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
    const identifier = typeof body.email === "string" ? body.email : typeof body.identifier === "string" ? body.identifier : "";
    const email = toAdminEmail(identifier) ?? "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }
    if (!email || !isValidEmail(email) || password.length > 200) {
      return NextResponse.json({ success: false, error: INVALID_LOGIN }, { status: 401 });
    }

    // Lock the account (not just the IP) for 15 minutes after 10 failed attempts.
    const lockKey = `admin:${email}`;
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

    const supabase = await createAuthClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Hệ thống chưa cấu hình Supabase. Vui lòng liên hệ quản trị." },
        { status: 503 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    const isAdmin = !error && data.user?.app_metadata?.role === "admin";

    if (!isAdmin) {
      // Valid credentials but not an admin: drop the session that was just created.
      if (!error) await supabase.auth.signOut({ scope: "local" });
      await recordFailure(lockKey, 10);
      return NextResponse.json({ success: false, error: INVALID_LOGIN }, { status: 401 });
    }

    await clearFailures(lockKey);
    return NextResponse.json({
      success: true,
      user: { id: data.user.id, email: data.user.email ?? email },
      message: "Đăng nhập thành công",
    });
  } catch (err: any) {
    console.error("[Admin Login Error]:", err);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi máy chủ trong quá trình xác thực." },
      { status: 500 }
    );
  }
}
