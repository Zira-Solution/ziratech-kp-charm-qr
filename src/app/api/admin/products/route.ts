import { NextRequest, NextResponse } from "next/server";
import { listAllGiftProducts } from "@/lib/supabase/products";
import { getAdminUser } from "@/lib/supabase/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Vui lòng đăng nhập để truy cập danh sách đơn hàng" },
        { status: 401 }
      );
    }

    // ?trash=1 lists the soft-deleted orders instead of the active ones.
    const trash = req.nextUrl.searchParams.get("trash") === "1";
    const { orders, softDeleteReady } = await listAllGiftProducts({ trash });
    return NextResponse.json({
      success: true,
      products: orders,
      trash,
      softDeleteReady,
    });
  } catch (err: any) {
    console.error("[API List Products Error]:", err);
    return NextResponse.json(
      { error: "Không thể lấy danh sách sản phẩm" },
      { status: 500 }
    );
  }
}
