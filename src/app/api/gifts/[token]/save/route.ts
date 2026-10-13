import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken, updateGiftProductCustomData } from "@/lib/supabase/products";
import { checkRateLimit } from "@/lib/validation/security";
import { parseGiftData } from "@/lib/validation/gift";
import { mediaConfigured, pruneVoices, voiceExists } from "@/lib/supabase/media";
import { hasGiftSession, normalizeToken } from "@/lib/auth/gift-session";

const MAX_SAVE_BODY_BYTES = 3_500_000; // 2.5M chars of photos + text, with headroom for JSON escaping

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

    // Photos are the bulk of a card (see MAX_TOTAL_PHOTO_CHARS); anything far beyond that is refused
    // before the body is read into memory.
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_SAVE_BODY_BYTES) {
      return NextResponse.json({ error: "Thiệp quá lớn. Hãy bớt ảnh hoặc chọn ảnh nhỏ hơn." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ" }, { status: 400 });
    }
    const giftData = (body as { giftData?: Record<string, unknown> } | null)?.giftData;

    if (!giftData || typeof giftData !== "object" || Array.isArray(giftData)) {
      return NextResponse.json({ error: "Thiếu dữ liệu thiệp" }, { status: 400 });
    }

    // The PIN is only ever stored as a hash, never inside gift_data.
    const { pinCode } = giftData;
    const newUnlockPin = typeof pinCode === "string" && /^\d{4}$/.test(pinCode) ? pinCode : undefined;

    // The card is rebuilt from allowlisted, validated fields: unknown fields are dropped, text is kept as
    // typed, photos and links are kept whole or rejected with a message.
    const parsed = parseGiftData(giftData, { token });
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const order = await getGiftProductByToken(token);
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy thiệp với mã này" }, { status: 404 });
    }

    // A recording path is only trusted if the file really is in this card's folder.
    const voicePath = parsed.value.voiceNote?.audioPath;
    if (voicePath && (!mediaConfigured() || !(await voiceExists(voicePath)))) {
      return NextResponse.json({ error: "Bản ghi âm không còn tồn tại. Vui lòng ghi âm lại." }, { status: 400 });
    }

    // The bracelet name comes from the order, not from the browser.
    const sanitizedGiftData = { ...parsed.value, braceletTitle: order.chainName };

    const updated = await updateGiftProductCustomData(token, sanitizedGiftData, newUnlockPin);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm hoặc lưu thất bại" }, { status: 404 });
    }

    // Remove recordings the saved card no longer uses (best effort, never blocks the save).
    await pruneVoices(token, voicePath ? [voicePath] : []);

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
