import { NextResponse } from "next/server";
import { listAllGiftProducts } from "@/lib/supabase/products";
import { getAdminUser } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Vui lòng đăng nhập để truy cập danh sách đơn hàng" },
        { status: 401 }
      );
    }


    const products = await listAllGiftProducts();
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (err: any) {
    console.error("[API List Products Error]:", err);
    return NextResponse.json(
      { error: "Không thể lấy danh sách sản phẩm" },
      { status: 500 }
    );
  }
}
