import { NextRequest, NextResponse } from "next/server";
import { createGiftProductInDb, markProductEmailSent, toAdminView } from "@/lib/supabase/products";
import { resolveSiteUrl, sendGiftActivationEmail } from "@/lib/mail/mailer";
import { CreateProductPayload } from "@/types/gift-order";
import { getAdminUser } from "@/lib/supabase/auth";
import { isValidEmail } from "@/lib/validation/security";
import { getActiveChain } from "@/lib/supabase/chains";
import { MAX_CHARM_AMOUNT } from "@/config/catalog";

const PHONE_PATTERN = /^[0-9+\s().-]{8,20}$/;

const badRequest = (error: string) => NextResponse.json({ success: false, error }, { status: 400 });

export async function POST(req: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Vui lòng đăng nhập để tiếp tục." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // --- customer ---
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";

    if (!customerName || !customerEmail) {
      return badRequest("Vui lòng nhập đầy đủ tên và email của khách hàng");
    }
    if (customerName.length > 120) {
      return badRequest("Tên khách hàng quá dài (tối đa 120 ký tự)");
    }
    if (!isValidEmail(customerEmail)) {
      return badRequest("Email của khách hàng không hợp lệ");
    }
    if (customerPhone && !PHONE_PATTERN.test(customerPhone)) {
      return badRequest("Số điện thoại không hợp lệ");
    }

    // --- product: the chain price comes from the database; the browser only sends the chain id ---
    const chain = await getActiveChain(body.chainId);
    if (!chain) {
      return badRequest("Loại dây vòng không hợp lệ hoặc đã bị ẩn");
    }

    // Charms are bought separately at the counter; staff enter the money collected for them.
    const charmAmount = body.charmAmount === undefined || body.charmAmount === "" ? 0 : Number(body.charmAmount);
    if (!Number.isInteger(charmAmount) || charmAmount < 0 || charmAmount > MAX_CHARM_AMOUNT) {
      return badRequest("Tiền charm không hợp lệ");
    }

    const payload: CreateProductPayload = {
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
      chainId: chain.id,
      chainName: chain.name,
      chainPrice: chain.price,
      charms: [],
      totalPrice: chain.price + charmAmount,
      paymentMethod: body.paymentMethod === "transfer" ? "transfer" : "cash",
    };

    // 1. Create product & generate unique token
    const { order, issued } = await createGiftProductInDb(payload);

    // 2. Send email to customer
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const requestOrigin = host ? `${proto}://${host}` : req.nextUrl.origin;
    const siteUrl = resolveSiteUrl(requestOrigin);

    const mailRes = await sendGiftActivationEmail({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      token: order.token,
      creatorKey: issued.creatorKey,
      chainName: order.chainName,
      siteUrl,
    });

    // Simulated mode (no SMTP configured) does not count as sent.
    if (mailRes.success && !mailRes.simulated) {
      await markProductEmailSent(order.token);
      order.emailSent = true;
    }

    // The plaintext codes are returned only here, once, so staff can hand over the printed card.
    return NextResponse.json({
      success: true,
      token: order.token,
      product: toAdminView(order),
      issuedCodes: issued,
      emailSent: order.emailSent,
      isSimulatedEmail: mailRes.simulated || false,
      createdBy: {
        staffEmail: user.email,
      },
    });
  } catch (err: any) {
    console.error("[API Create Product Error]:", err);
    return NextResponse.json(
      { success: false, error: "Không thể tạo đơn lúc này. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
