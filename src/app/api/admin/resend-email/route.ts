import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken, markProductEmailSent, setGiftSecretHash } from "@/lib/supabase/products";
import { resolveSiteUrl, sendGiftActivationEmail } from "@/lib/mail/mailer";
import { getAdminUser } from "@/lib/supabase/auth";
import { generateCreatorKey, hashSecret, normalizeCreatorKey } from "@/lib/auth/crypto";
import { normalizeToken } from "@/lib/auth/gift-session";

export async function POST(req: NextRequest) {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Vui lòng đăng nhập" },
        { status: 401 }
      );
    }


    const body = await req.json();
    const token = normalizeToken(body.token);
    if (!token) {
      return NextResponse.json({ error: "Thiếu mã token sản phẩm" }, { status: 400 });
    }

    const product = await getGiftProductByToken(token);
    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    // Codes are stored as hashes and cannot be recovered, so resending issues a NEW creator key.
    // The unlock PIN is left untouched because it may already be printed on the physical card.
    const creatorKey = generateCreatorKey();
    await setGiftSecretHash(product.token, "creator", await hashSecret(normalizeCreatorKey(creatorKey)));

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const requestOrigin = host ? `${proto}://${host}` : req.nextUrl.origin;
    const siteUrl = resolveSiteUrl(requestOrigin);

    const mailRes = await sendGiftActivationEmail({
      customerName: product.customerName,
      customerEmail: product.customerEmail,
      token: product.token,
      creatorKey,
      chainName: product.chainName,
      siteUrl,
    });

    if (mailRes.success && !mailRes.simulated) {
      await markProductEmailSent(product.token);
    }

    // If the email did not really go out, hand the new key to staff so the customer is not locked out.
    const emailDelivered = mailRes.success && !mailRes.simulated;
    return NextResponse.json({
      success: mailRes.success,
      simulated: mailRes.simulated || false,
      ...(emailDelivered ? {} : { creatorKey }),
      message: mailRes.success
        ? `Đã cấp lại OTP tạo thiệp và gửi email đến ${product.customerEmail}`
        : "Đã cấp lại OTP tạo thiệp nhưng gửi email thất bại",
      error: mailRes.success ? undefined : mailRes.error || "Gửi email thất bại",
    });
  } catch (err: any) {
    console.error("[API Resend Email Error]:", err);
    return NextResponse.json(
      { error: "Lỗi gửi lại email" },
      { status: 500 }
    );
  }
}
