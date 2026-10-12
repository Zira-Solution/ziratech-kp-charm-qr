import { NextRequest, NextResponse } from "next/server";
import { getGiftProductByToken, toPublicView } from "@/lib/supabase/products";
import { checkRateLimit } from "@/lib/validation/security";
import { hasGiftSession, normalizeToken } from "@/lib/auth/gift-session";

/**
 * Returns gift content only to a caller that already proved knowledge of a code for this token:
 *  - "create" session (buyer): the studio view, without secrets or contact details.
 *  - "open" session (recipient): the finished card only.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-ip";
    const rateCheck = checkRateLimit(`gift-lookup:${ip}`, 40, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 1 phút." },
        { status: 429 }
      );
    }

    const params = await context.params;
    const token = normalizeToken(params.token);
    if (!token) {
      return NextResponse.json({ error: "Mã token không hợp lệ" }, { status: 400 });
    }

    const scope = hasGiftSession(req, "create", token)
      ? "create"
      : hasGiftSession(req, "open", token)
        ? "open"
        : null;

    if (!scope) {
      return NextResponse.json(
        { error: "Cần nhập mã xác thực trước khi xem. Vui lòng quay lại cổng /gift." },
        { status: 401 }
      );
    }

    const order = await getGiftProductByToken(token);
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm với mã định danh này" }, { status: 404 });
    }

    const product = toPublicView(order);
    if (scope === "open") {
      return NextResponse.json({
        success: true,
        scope,
        product: { token: product.token, status: product.status, giftData: product.giftData },
      });
    }

    return NextResponse.json({ success: true, scope, product });
  } catch (err: any) {
    console.error("[API Get Gift By Token Error]:", err);
    return NextResponse.json(
      { error: "Lỗi truy vấn sản phẩm" },
      { status: 500 }
    );
  }
}
