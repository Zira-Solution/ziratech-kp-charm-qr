import { NextRequest, NextResponse } from "next/server";
import { updateGiftProductCustomData } from "@/lib/supabase/products";
import { checkRateLimit } from "@/lib/validation/security";
import { cleanText, parsePhotos } from "@/lib/validation/gift";
import { hasGiftSession, normalizeToken } from "@/lib/auth/gift-session";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const rateCheck = checkRateLimit(`gift-save:${ip}`, 25, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Thao tác quá nhanh. Vui lòng chờ 1 phút rồi thử lại." },
        { status: 429 }
      );
    }

    const params = await context.params;
    const token = normalizeToken(params.token);
    if (!token) {
      return NextResponse.json({ error: "Mã token không hợp lệ" }, { status: 400 });
    }

    // Only a caller who entered the creator key for this token may overwrite its card.
    if (!hasGiftSession(req, "create", token)) {
      return NextResponse.json(
        { error: "Phiên tạo thiệp đã hết hạn hoặc chưa xác thực. Vui lòng nhập lại OTP tạo thiệp tại cổng /gift." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { giftData } = body;

    if (!giftData || typeof giftData !== "object") {
      return NextResponse.json({ error: "Thiếu dữ liệu thiệp" }, { status: 400 });
    }

    // The PIN is only ever stored as a hash, never inside gift_data.
    const { pinCode, ...giftFields } = giftData;
    const newUnlockPin = typeof pinCode === "string" && /^\d{4}$/.test(pinCode) ? pinCode : undefined;

    // Text is stored as typed (React escapes it on render); photos are kept whole or rejected.
    const photos = parsePhotos(giftData.memoryPhotos);
    if (!photos.ok) {
      return NextResponse.json({ error: photos.error }, { status: 400 });
    }

    const sanitizedGiftData = {
      ...giftFields,
      recipientName: cleanText(giftData.recipientName, 100) || "Người nhận",
      senderName: cleanText(giftData.senderName, 100) || "Người gửi",
      letterTitle: cleanText(giftData.letterTitle, 200) || "LỜI NHẮN",
      letterSubtitle: cleanText(giftData.letterSubtitle, 200),
      letterContent: cleanText(giftData.letterContent, 3000),
      letterSignature: cleanText(giftData.letterSignature, 100),
      template: ["vintage-scrapbook", "retro-nostalgia", "storybook-sunset"].includes(giftData.template)
        ? giftData.template
        : "vintage-scrapbook",
      memoryPhotos: photos.photos,
    };

    const updated = await updateGiftProductCustomData(token, sanitizedGiftData, newUnlockPin);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm hoặc lưu thất bại" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu và kích hoạt thiệp kỷ niệm thành công!",
      viewUrl: `/g/${token}`,
    });
  } catch (err: any) {
    console.error("[API Save Gift Data Error]:", err);
    return NextResponse.json(
      { error: "Lỗi lưu thiệp kỷ niệm" },
      { status: 500 }
    );
  }
}
