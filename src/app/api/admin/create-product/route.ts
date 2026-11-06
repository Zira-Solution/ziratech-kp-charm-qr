import { NextRequest, NextResponse } from "next/server";
import { createGiftProductInDb, markProductEmailSent, toAdminView } from "@/lib/supabase/products";
import { resolveSiteUrl, sendGiftActivationEmail } from "@/lib/mail/mailer";
import { CreateProductPayload } from "@/types/gift-order";
import { getAdminUser } from "@/lib/supabase/auth";
import { isValidEmail } from "@/lib/validation/security";
import { EMAIL_SENDING_ENABLED } from "@/config/features";

// The web records no money: every order is one bracelet with no price, identified by the buyer's email.
const DEFAULT_CHAIN = { id: "kp-bracelet", name: "Vòng K&P" };

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

    // --- customer: only the email is asked; it also stands in for the name (no name is invented) ---
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    if (!customerEmail) {
      return badRequest("Vui lòng nhập email của khách hàng");
    }
    if (!isValidEmail(customerEmail)) {
      return badRequest("Email của khách hàng không hợp lệ");
    }

    const payload: CreateProductPayload = {
      customerName: customerEmail,
      customerEmail,
      chainId: DEFAULT_CHAIN.id,
      chainName: DEFAULT_CHAIN.name,
      chainPrice: 0,
      charms: [],
      totalPrice: 0,
      paymentMethod: "cash",
    };

    // 1. Create product & generate unique token
    const { order, issued } = await createGiftProductInDb(payload);

    // 2. Send email to customer
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const requestOrigin = host ? `${proto}://${host}` : req.nextUrl.origin;
    const siteUrl = resolveSiteUrl(requestOrigin);

    // With e-mail switched off nothing is sent; staff get the codes in the response instead.
    const mailRes = EMAIL_SENDING_ENABLED
      ? await sendGiftActivationEmail({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          token: order.token,
          creatorKey: issued.creatorKey,
          chainName: order.chainName,
          siteUrl,
        })
      : { success: true, simulated: true };

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
