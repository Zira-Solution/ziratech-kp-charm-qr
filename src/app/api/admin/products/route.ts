import { NextRequest, NextResponse } from "next/server";
import { listAllGiftProducts } from "@/lib/supabase/products";
import { getAuthenticatedUser } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("kp_admin_token")?.value;
    const user = getAuthenticatedUser(req.headers, cookieToken);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Vui lòng đăng nhập để truy cập danh sách đơn hàng" },
        { status: 401 }
      );
    }

    if (!user.permissions.canViewOrders) {
      return NextResponse.json(
        { error: `Từ chối truy cập (403): Vai trò "${user.roleTitle}" không có quyền xem đơn hàng.` },
        { status: 403 }
      );
    }

    const products = await listAllGiftProducts();
    return NextResponse.json({
      success: true,
      products,
      userRole: user.role,
      userRoleTitle: user.roleTitle,
    });
  } catch (err: any) {
    console.error("[API List Products Error]:", err);
    return NextResponse.json(
      { error: "Không thể lấy danh sách sản phẩm" },
      { status: 500 }
    );
  }
}
