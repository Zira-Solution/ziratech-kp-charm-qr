// Bracelet chains. Only the bracelet is sold through the system; charms are bought separately at the counter.

export interface Chain {
  id: string;
  name: string;
  price: number;
  color: string;
  desc: string;
}

// Starting set of chains. They are copied into the `chains` table, where staff add and edit them
// from the admin; this list is also the read-only fallback until that table exists.
export const DEFAULT_CHAINS: Chain[] = [
  {
    id: "silver",
    name: "Bạc Ý S925 Thanh Mảnh",
    price: 45000,
    color: "#DCC0C0",
    desc: "Sáng bóng, tinh xảo, thanh lịch",
  },
  {
    id: "rose",
    name: "Vàng Hồng 14K Ấm Áp",
    price: 49000,
    color: "#FEA095",
    desc: "Ngọt ngào, tôn da phái đẹp",
  },
  {
    id: "pearl",
    name: "Ngọc Trai Nước Ngọt Mini",
    price: 55000,
    color: "#FAF0ED",
    desc: "Dịu dàng, quý phái, tự nhiên",
  },
  {
    id: "cord",
    name: "Dây Dù Kỷ Niệm Bền Bỉ",
    price: 35000,
    color: "#897172",
    desc: "Trẻ trung, cá tính sinh viên",
  },
];

/** Upper bound for the money staff can enter for charms bought at the counter (VND). */
export const MAX_CHARM_AMOUNT = 10_000_000;
