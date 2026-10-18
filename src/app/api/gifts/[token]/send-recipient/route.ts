import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken, updateGiftProductCustomData } from "@/lib/supabase/products";
import { checkRateLimit } from "@/lib/validation/security";
import { hasGiftSession, normalizeToken } from "@/lib/auth/gift-session";
import { sendGiftSurpriseRecipientEmail } from "@/lib/mail/mailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const params = await context.params;
    const token = normalizeToken(params.token);

    if (!token) {
      return NextResponse.json({ error: "Mã token không hợp lệ" }, { status: 400 });
    }

    // Rate limiting: at most 5 recipient emails per 10 minutes per IP/token
    const rateCheck = checkRateLimit(`send-recipient:${ip}:${token}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Bạn đã gửi thư quá nhiều lần. Vui lòng thử lại sau 10 phút." },
        { status: 429 }
      );
    }

    // Only the buyer who holds a valid create session for this card may trigger recipient email
    if (!hasGiftSession(req, "create", token)) {
      return NextResponse.json(
        { error: "Phiên tạo thiệp chưa xác thực hoặc đã hết hạn. Vui lòng nhập lại OTP tạo thiệp tại /gift." },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Dữ liệu gửi lên không đúng định dạng JSON" }, { status: 400 });
    }

    const rawEmail = typeof body?.recipientEmail === "string" ? body.recipientEmail.trim() : "";
    if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 254) {
      return NextResponse.json({ error: "Vui lòng nhập địa chỉ email người nhận hợp lệ" }, { status: 400 });
    }

    const order = await getGiftProductByToken(token);
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy thông tin thiệp với mã này" }, { status: 404 });
    }

    const savedGiftData = (order.giftData || {}) as Record<string, any>;
    const requirePin = savedGiftData.requirePin !== false;

    // Sender / recipient names from request or fallback to saved data
    const recipientName =
      (typeof body?.recipientName === "string" && body.recipientName.trim().slice(0, 100)) ||
      savedGiftData.recipientName ||
      "Bạn";

    const senderName =
      (typeof body?.senderName === "string" && body.senderName.trim().slice(0, 100)) ||
      savedGiftData.senderName ||
      order.customerName ||
      "Người gửi";

    const customMessage =
      typeof body?.customMessage === "string" ? body.customMessage.trim().slice(0, 500) : "";

    // PIN code: if client sends a 4-digit PIN, use it; otherwise check saved data
    const unlockPinCandidate = typeof body?.unlockPin === "string" ? body.unlockPin.trim() : "";
    const unlockPin = /^\d{4}$/.test(unlockPinCandidate)
      ? unlockPinCandidate
      : typeof savedGiftData.pinCode === "string" && /^\d{4}$/.test(savedGiftData.pinCode)
        ? savedGiftData.pinCode
        : undefined;

    const mailResult = await sendGiftSurpriseRecipientEmail({
      recipientEmail: rawEmail,
      recipientName,
      senderName,
      token,
      unlockPin,
      requirePin,
      customMessage,
      siteUrl: req.nextUrl.origin,
    });

    if (!mailResult.success) {
      return NextResponse.json(
        { error: mailResult.error || "Không thể gửi email đến người nhận" },
        { status: 500 }
      );
    }

    // Persist recipient email history in gift_data
    const updatedGiftData = {
      ...savedGiftData,
      recipientEmail: rawEmail,
      recipientEmailSent: true,
      recipientEmailSentAt: new Date().toISOString(),
    };
    await updateGiftProductCustomData(token, updatedGiftData);

    return NextResponse.json({
      success: true,
      simulated: mailResult.simulated,
      message: mailResult.simulated
        ? "✨ Đã mô phỏng gửi email bất ngờ thành công (môi trường thử nghiệm)!"
        : "✨ Đã bắn email bất ngờ kèm mã QR và hướng dẫn thành công đến người nhận!",
    });
  } catch (err: any) {
    console.error("[API Send Recipient Email Error]:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi gửi email cho người nhận" },
      { status: 500 }
    );
  }
}
