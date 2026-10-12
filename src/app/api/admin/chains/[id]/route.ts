import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { deleteChain, updateChain } from "@/lib/supabase/chains";
import { parseChainFields } from "@/lib/validation/chains";

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAdminUser())) return fail("Unauthorized", 401);

    const { id } = await context.params;
    if (!/^[a-z0-9-]{1,60}$/.test(id)) return fail("Mã dây vòng không hợp lệ");

    const body = await req.json();
    const parsed = parseChainFields(body, { partial: true });
    if (parsed.error) return fail(parsed.error);

    const patch = { ...parsed.values, ...(typeof body.active === "boolean" ? { active: body.active } : {}) };
    if (Object.keys(patch).length === 0) return fail("Không có thay đổi nào");

    const chain = await updateChain(id, patch);
    if (!chain) return fail("Không tìm thấy dây vòng", 404);
    return NextResponse.json({ success: true, chain });
  } catch (err) {
    if (err instanceof Error && err.message === "CHAINS_TABLE_MISSING") {
      return fail("Chưa tạo bảng dây vòng trong database. Hãy chạy đoạn SQL hướng dẫn rồi thử lại.", 409);
    }
    console.error("[API Update Chain Error]:", err);
    return fail("Không thể cập nhật dây vòng lúc này", 500);
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAdminUser())) return fail("Unauthorized", 401);

    const { id } = await context.params;
    if (!/^[a-z0-9-]{1,60}$/.test(id)) return fail("Mã dây vòng không hợp lệ");

    const found = await deleteChain(id);
    if (!found) return fail("Không tìm thấy dây vòng", 404);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    if (err instanceof Error && err.message === "CHAINS_TABLE_MISSING") {
      return fail("Chưa tạo bảng dây vòng trong database. Hãy chạy đoạn SQL hướng dẫn rồi thử lại.", 409);
    }
    console.error("[API Delete Chain Error]:", err);
    return fail("Không thể xóa dây vòng lúc này", 500);
  }
}
