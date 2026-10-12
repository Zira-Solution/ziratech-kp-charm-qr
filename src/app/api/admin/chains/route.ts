import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { createChain, listChains } from "@/lib/supabase/chains";
import { parseChainFields } from "@/lib/validation/chains";

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function GET() {
  try {
    if (!(await getAdminUser())) return fail("Unauthorized", 401);
    const { chains, editable } = await listChains();
    return NextResponse.json({ success: true, chains, editable });
  } catch (err) {
    console.error("[API List Chains Error]:", err);
    return fail("Không tải được danh sách dây vòng", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await getAdminUser())) return fail("Unauthorized", 401);

    const parsed = parseChainFields(await req.json(), { partial: false });
    if (parsed.error) return fail(parsed.error);

    const chain = await createChain({
      name: parsed.values!.name!,
      price: parsed.values!.price!,
      description: parsed.values!.description,
    });
    return NextResponse.json({ success: true, chain });
  } catch (err) {
    if (err instanceof Error && err.message === "CHAINS_TABLE_MISSING") {
      return fail("Chưa tạo bảng dây vòng trong database. Hãy chạy đoạn SQL hướng dẫn rồi thử lại.", 409);
    }
    if (err instanceof Error && err.message === "CHAINS_LIMIT") {
      return fail("Đã đạt số dây vòng tối đa. Hãy ẩn bớt dây không dùng.", 409);
    }
    console.error("[API Create Chain Error]:", err);
    return fail("Không thể thêm dây vòng lúc này", 500);
  }
}
