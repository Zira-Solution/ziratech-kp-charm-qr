import { MAX_CHAIN_PRICE } from "@/lib/supabase/chains";

/** Validates the fields shared by create and update. Returns an error string or the cleaned values. */
export function parseChainFields(body: Record<string, unknown>, { partial }: { partial: boolean }) {
  const out: { name?: string; price?: number; description?: string } = {};

  if (!partial || body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return { error: "Vui lòng nhập tên dây vòng" };
    if (name.length > 80) return { error: "Tên dây vòng quá dài (tối đa 80 ký tự)" };
    out.name = name;
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isInteger(price) || price < 1 || price > MAX_CHAIN_PRICE) {
      return { error: "Giá phải là số nguyên dương (đồng)" };
    }
    out.price = price;
  }

  if (body.description !== undefined) {
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (description.length > 160) return { error: "Mô tả quá dài (tối đa 160 ký tự)" };
    out.description = description;
  }

  return { values: out };
}
