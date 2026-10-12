import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { setOrderDeleted } from "@/lib/supabase/products";
import { normalizeToken } from "@/lib/auth/gift-session";

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

/** Soft-deletes ({"deleted": true}) or restores ({"deleted": false}) an order. The row is never removed. */
export async function PATCH(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    if (!(await getAdminUser())) return fail("Unauthorized", 401);

    const token = normalizeToken((await context.params).token);
    if (!token) return fail("Mã đơn không hợp lệ");

    const body = await req.json();
    if (typeof body.deleted !== "boolean") return fail("Thiếu trạng thái xóa");

    const found = await setOrderDeleted(token, body.deleted);
    if (!found) return fail("Không tìm thấy đơn hàng", 404);

    return NextResponse.json({ success: true, token, deleted: body.deleted });
  } catch (err) {
    if (err instanceof Error && err.message === "SOFT_DELETE_UNAVAILABLE") {
      return fail("Chưa bật tính năng xóa mềm trong database. Hãy chạy lại file supabase/schema.sql rồi thử lại.", 409);
    }
    console.error("[API Order Delete Error]:", err);
    return fail("Không thể cập nhật đơn hàng lúc này", 500);
  }
}
