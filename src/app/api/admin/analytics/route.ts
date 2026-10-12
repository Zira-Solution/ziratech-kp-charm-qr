import { NextResponse } from "next/server";
import { listAllGiftProducts } from "@/lib/supabase/products";
import { getAdminUser } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Vui lòng đăng nhập" },
        { status: 401 }
      );
    }


    const products = await listAllGiftProducts();

    let totalRevenue = 0;
    let chainRevenue = 0;
    let cashRevenue = 0;
    let transferRevenue = 0;
    let pendingCount = 0;
    let completedCount = 0;

    for (const p of products) {
      const price = Number(p.totalPrice) || 0;
      totalRevenue += price;
      chainRevenue += Math.min(Number(p.chainPrice) || 0, price);

      if (p.paymentMethod === "cash") {
        cashRevenue += price;
      } else {
        transferRevenue += price;
      }

      if (p.status === "completed") {
        completedCount++;
      } else {
        pendingCount++;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: products.length,
        totalRevenue,
        chainRevenue,
        charmRevenue: totalRevenue - chainRevenue,
        cashRevenue,
        transferRevenue,
        pendingCount,
        completedCount,
      },
    });
  } catch (err: any) {
    console.error("[API Analytics Error]:", err);
    return NextResponse.json(
      { error: "Lỗi tải dữ liệu thống kê" },
      { status: 500 }
    );
  }
}
