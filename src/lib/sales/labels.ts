// Vietnamese labels for stall_sales categories (pure, shared by the landing page and the admin).
export const CATEGORY_LABELS: Record<string, string> = {
  bracelet: "Vòng tay",
  keychain: "Móc khoá",
  keychain_phone: "Móc khoá điện thoại",
  bear_mini: "Gấu mini",
  bear: "Gấu bông",
  diy: "DIY",
  card: "Thiệp",
  flower: "Bông",
  blindbox: "Blindbox",
  combo: "Combo nhiều món",
  unclassified: "Chưa phân loại",
};

export const categoryLabel = (category: string): string => CATEGORY_LABELS[category] ?? category;
