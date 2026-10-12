import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken, setGiftSecretHash } from "@/lib/supabase/products";
import { checkRateLimit } from "@/lib/validation/security";
import {
  checkSecret,
  hashSecret,
  normalizeCreatorKey,
  normalizeUnlockPin,
} from "@/lib/auth/crypto";
import { issueGiftSession, normalizeToken } from "@/lib/auth/gift-session";
import { clearFailures, getLockRemainingMs, recordFailure } from "@/lib/supabase/attempts";

// Same message for "unknown token" and "wrong code" so the endpoint cannot be used to find valid tokens.
const INVALID_CREDENTIALS = "Mã vòng hoặc mã xác thực không chính xác. Vui lòng kiểm tra lại.";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const rateCheck = checkRateLimit(`gift-verify:${ip}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Thao tác quá nhanh. Vui lòng đợi 1 phút rồi thử lại." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { passcode, mode } = body;

    if (mode !== "create" && mode !== "open") {
      return NextResponse.json(
        { success: false, error: "Chế độ xác thực không hợp lệ (yêu cầu 'create' hoặc 'open')." },
        { status: 400 }
      );
    }

    const token = normalizeToken(body.token);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mã vòng tay (Mã định danh sản phẩm)." },
        { status: 400 }
      );
    }

    if (!passcode || typeof passcode !== "string" || passcode.length > 64) {
      return NextResponse.json(
        {
          success: false,
          error: mode === "create"
            ? "Vui lòng nhập mật khẩu tạo thiệp bạn đã nhận qua Gmail."
            : "Vui lòng nhập mã mở quà (PIN) in trên thẻ vật lý.",
        },
        { status: 400 }
      );
    }

    // Lockout: 5 wrong attempts lock this token (for this mode) for 15 minutes.
    const lockKey = `gift:${mode}:${token}`;
    const lockedMs = await getLockRemainingMs(lockKey);
    if (lockedMs > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(lockedMs / 60000)} phút.`,
        },
        { status: 429 }
      );
    }

    const product = await getGiftProductByToken(token);
    const normalize = mode === "create" ? normalizeCreatorKey : normalizeUnlockPin;
    const stored = mode === "create" ? product?.creatorKeyHash : product?.unlockPinHash;

    const check = await checkSecret(stored, passcode, normalize);
    if (!product || !check.ok) {
      await recordFailure(lockKey);
      return NextResponse.json({ success: false, error: INVALID_CREDENTIALS }, { status: 401 });
    }

    await clearFailures(lockKey);

    // The stored value was an old plaintext code: replace it with a hash now that it is verified.
    if (check.legacy) {
      await setGiftSecretHash(token, mode === "create" ? "creator" : "unlock", await hashSecret(normalize(passcode)));
    }

    if (mode === "create") {
      const res = NextResponse.json({
        success: true,
        mode: "create",
        token: product.token,
        redirectUrl: `/create/${product.token}`,
        message: "Xác thực mã tạo thiệp thành công! Đang chuyển hướng vào studio thiết kế...",
      });
      issueGiftSession(res, "create", product.token);
      return res;
    }

    const isCompleted = product.status === "completed" && !!product.giftData;
    const res = NextResponse.json({
      success: true,
      mode: "open",
      token: product.token,
      isCompleted,
      redirectUrl: `/g/${product.token}`,
      message: isCompleted
        ? "Đã mở khóa món quà thành công!"
        : "Đã xác thực mã mở quà. Người gửi đang nắn nót chuẩn bị thiệp cho bạn!",
    });
    issueGiftSession(res, "open", product.token);
    return res;
  } catch (err: any) {
    console.error("[API Verify Gift Error]:", err);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi hệ thống khi kiểm tra mã." },
      { status: 500 }
    );
  }
}
