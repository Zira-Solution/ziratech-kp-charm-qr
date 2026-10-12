import { NextRequest, NextResponse } from "next/server";
import { createGiftProductInDb, markProductEmailSent, toAdminView } from "@/lib/supabase/products";
import { sendGiftActivationEmail } from "@/lib/mail/mailer";
import { CreateProductPayload } from "@/types/gift-order";
import { getAuthenticatedUser } from "@/lib/auth/admin-auth";
import { isValidEmail } from "@/lib/validation/security";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("kp_admin_token")?.value;
    const user = getAuthenticatedUser(req.headers, cookieToken);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Vui lòng đăng nhập tài khoản nhân viên quầy POS để tiếp tục.",
        },
        { status: 401 }
      );
    }

    // PHÂN QUYỀN: Kiểm tra quyền tạo đơn / add POS
    if (!user.permissions.canCreateOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Từ chối truy cập (403): Tài khoản mang vai trò "${user.roleTitle}" không có phân quyền tạo/thêm đơn hàng tại quầy POS. Chỉ Quản trị viên (Admin) hoặc Nhân viên Thu Ngân (Cashier) mới được phép tạo đơn!`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      chainId,
      chainName,
      chainPrice,
      charms,
      totalPrice,
      paymentMethod,
    } = body;

    // Validation
    if (typeof customerName !== "string" || typeof customerEmail !== "string" || !customerName.trim() || !customerEmail.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tên và email của khách hàng" },
        { status: 400 }
      );
    }

    if (!isValidEmail(customerEmail) || customerName.length > 120) {
      return NextResponse.json(
        { error: "Tên hoặc email của khách hàng không hợp lệ" },
        { status: 400 }
      );
    }

    if (!chainId || !chainName) {
      return NextResponse.json(
        { error: "Vui lòng chọn loại dây vòng" },
        { status: 400 }
      );
    }

    const payload: CreateProductPayload = {
      customerName,
      customerEmail,
      customerPhone,
      chainId,
      chainName,
      chainPrice: Number(chainPrice) || 0,
      charms: Array.isArray(charms) ? charms : [],
      totalPrice: Number(totalPrice) || 0,
      paymentMethod: paymentMethod === "transfer" ? "transfer" : "cash",
    };

    // 1. Create product & generate unique token
    const { order, issued } = await createGiftProductInDb(payload);

    // 2. Send email to customer
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const mailRes = await sendGiftActivationEmail({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      token: order.token,
      creatorKey: issued.creatorKey,
      unlockPin: issued.unlockPin,
      chainName: order.chainName,
      charms: order.charms,
      siteUrl: origin,
    });

    if (mailRes.success) {
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
        staffName: user.name,
        role: user.role,
        roleTitle: user.roleTitle,
      },
    });
  } catch (err: any) {
    console.error("[API Create Product Error]:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi tạo sản phẩm tại quầy" },
      { status: 500 }
    );
  }
}
