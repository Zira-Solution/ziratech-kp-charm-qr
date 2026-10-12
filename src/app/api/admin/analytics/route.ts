import { NextRequest, NextResponse } from "next/server";
import { listAllGiftProducts } from "@/lib/supabase/products";
import { getAuthenticatedUser } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("kp_admin_token")?.value;
    const user = getAuthenticatedUser(req.headers, cookieToken);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    if (!user.permissions.canViewAnalytics) {
      return NextResponse.json(
        {
          error: `Từ chối truy cập (403): Vai trò "${user.roleTitle}" không có quyền xem thống kê tài chính & doanh thu.`,
        },
        { status: 403 }
      );
    }

    const products = await listAllGiftProducts();

    let totalRevenue = 0;
    let cashRevenue = 0;
    let transferRevenue = 0;
    let pendingCount = 0;
    let completedCount = 0;
    const charmCounts: Record<string, { name: string; count: number; icon: string }> = {};

    for (const p of products) {
      const price = Number(p.totalPrice) || 0;
      totalRevenue += price;

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

      if (Array.isArray(p.charms)) {
        for (const c of p.charms) {
          if (!charmCounts[c.id]) {
            charmCounts[c.id] = { name: c.name, count: 0, icon: c.icon };
          }
          charmCounts[c.id].count++;
        }
      }
    }

    const topCharms = Object.entries(charmCounts)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: products.length,
        totalRevenue,
        cashRevenue,
        transferRevenue,
        pendingCount,
        completedCount,
        topCharms,
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
