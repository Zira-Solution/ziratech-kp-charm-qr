import React from "react";

interface Product {
  title: string;
  price?: string;
  priceNote?: string;
  desc: string;
  tags: Array<{ label: string; solid?: boolean; outline?: boolean }>;
  footNote: string;
  action?: { href: string; label: string };
  footRight?: string;
  img: string;
  alt: string;
}

const PRODUCTS: Product[] = [
  {
    title: "Hoa lẻ tinh khôi",
    price: "40.000 – 70.000đ",
    desc: "Đặt trước hoa tươi tuyển chọn cẩn trọng, nhận trực tiếp ngày 20/10 tại sảnh Alpha ĐH FPT kèm mã thiệp số cá nhân hóa.",
    tags: [{ label: "Đặt trước", solid: true }, { label: "Kèm thẻ QR", outline: true }],
    footNote: "Cung cấp 1 bữa ăn trạm chó",
    action: { href: "#preorder", label: "Đặt trước hoa" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_4mDGS0xffxwcJ71txa5wOeoYAvBOOf2uSojK2uCxd0_K1mApojDPFpzJJzHwG-rSs428EPPcvkFHfaVkbPQRWsmzJ4MBkWCoYKrXo4tcrbRLmHQGrRmRFVCBO9Z1ewOVplxgniYaHTZRX1fE_IdOx3Zbehs_9VULa56Ps0AbRa6Lzv9n9nxgin7RQyxw_ZBQb82VB4GdGxV9dPVBKdiGaRspudRIjX7sovyPsjqdGkOD6HQ8yIN8-w",
    alt: "Một bông hồng phấn gói giấy nâu buộc dây gai",
  },
  {
    title: "Hoa bó kết tay nghệ thuật",
    price: "40.000 – 70.000đ",
    desc: "Bó hoa trang nhã phối hoa nhập khẩu và baby breath dịu dàng, gói giấy mỹ thuật thủ công sang trọng đón chào 20/10.",
    tags: [{ label: "Đặt trước", solid: true }, { label: "Kèm thẻ QR", outline: true }],
    footNote: "Cung cấp 3 bữa ăn trạm chó",
    action: { href: "#preorder", label: "Đặt trước bó" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAC3K_So8EnaedBp3w8ybRFGrZGmfOzQ7AGm2KAfs2IW48IriCTvT46WO72wBJc_uUEFiqbAuUC_eiOWIiPX7cgWeSpGAyT9liUlSjgPl6hNItKi_zF7qCkhGpS6CAHrnCFXRXXuUDm__yueYCEPUJKdgWPegxKFFGIZXH-4Vr6wbOOCzOzCXMkjS9ZmqFknuxBPa-JwjtD1ppTYBSVsGG2knAGnxAiIki4oQnolTsf0snehIEVFmDegQ",
    alt: "Bó hoa cẩm chướng kem và hồng phấn gói giấy linen",
  },
  {
    title: "Vòng Charm hoàn thiện",
    priceNote: "Chọn tại sảnh Alpha",
    desc: "Được đan sẵn bởi đội ngũ thủ công K&P Atelier với các phối màu phong phú. Ghé gian hàng để ướm tay và gắn mã QR thiệp.",
    tags: [{ label: "Tại gian hàng" }, { label: "Kèm thẻ QR", outline: true }],
    footNote: "Đóng hộp nhung cao cấp",
    footRight: "Trực tiếp tại quầy",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5m2wDNd4OwHHnmjxnlJMk31SL8ttNLfiKEQ_kRaDY1apRpAMVq8GR8vX1eL6z3ztycvYlSfp1UZ9aCGTu6wKryXicXuYGHbRhnQGSJW5Uxt6w-nzFNkx0ZzsUf9r86-XcDM9Ct2bKmeKhWIOTetQktsDxofjZ2fBsOAEbJ4zMEk8G5cletflhsx3JXd3cBTDQ3wVWv22hs6VJIKrA6A9xVzk7LLk5bNsGQvXlWuqm_y8ybHQj3KNF9A",
    alt: "Các vòng tay hạt charm thủ công trên khay vải lanh",
  },
  {
    title: "Trải nghiệm tự làm vòng",
    priceNote: "Kèm thẻ QR",
    desc: "Trải nghiệm tự tay lựa chọn charm ý nghĩa, luồn dây cước và gắn mã kỷ vật số để trao tặng món quà có một không hai.",
    tags: [{ label: "Bàn Workshop", solid: true }, { label: "Tự tay xâu chuỗi", outline: true }],
    footNote: "Bàn hỗ trợ kỹ thuật tận tình",
    action: { href: "#workshop", label: "Xem quy trình" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDegyL7sdO63ET1PB-UiaQhsTtKYk7QHgo0sFDpgEjK_eRvH6LSHoLqBZEDwsBSXHstnGD-q2vlL-VVzd0BC87C-YuAJgXJLqOtxhrLZaNXEfO4aQgKuaCjyXKC8SmwcPa1hzvEpMLvt4RbcPimG4nLc_eJMiKmWzrAtivHWw3PcCeZDKVhYMnHJe-3PuxMFw_Jwsu_PIRvdZZaW0Nv6R7-ehz6ACtnGblSuZhVeM8tD7vDkXYL3tavdQ",
    alt: "Nguyên liệu làm vòng: dây cước, hạt thủy tinh và charm bạc",
  },
  {
    title: "Thiệp viết thư tay mộc mạc",
    priceNote: "Mua tại gian hàng",
    desc: "Chất giấy mỹ thuật ép xơ thực vật tự nhiên, độ dày 300gsm giữ mực hoàn hảo cùng phong bì ép nhũ đồng tinh xảo.",
    tags: [{ label: "Giấy mỹ thuật" }],
    footNote: "Miễn phí bút nhũ nắn nót",
    footRight: "Sảnh Alpha",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmORgE6vzg_pg9LspCZ7YSCeG5POoBnpxwviP2dz4DgSjQZV_LYnIzAzdfMEBXa5fB9SU1WO4CKOLAAZkjZekCdgma1yEua6JJ2CXTLByeCqLDUGpksWS_gzywBkdr14ysLrEOAM4NxoBEnkp7IRTW-jMARi5QjpCNgHxJZncld7ve8eOhXZKDsquoSfl3yuJmEGPIx0iGjfJtWptKJBpyIXO6CVDUL-MtnT5UxcMjFFhRqNMFBkf3zA",
    alt: "Thiệp giấy mỹ thuật viền xé cùng bút mực và sáp niêm phong",
  },
  {
    title: "Móc khóa Blindbox bất ngờ",
    priceNote: "Khui trực tiếp",
    desc: "Móc khóa nhựa acrylic và gấu bông mini siêu xinh xắn. Khám phá may mắn và gắn kèm balo ngày 20/10 cùng bạn bè.",
    tags: [{ label: "Hộp bí mật" }, { label: "Gấu bông mini", outline: true }],
    footNote: "Trợ giá sinh viên FPTU",
    footRight: "Tại gian hàng",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIxH8SHKwFIq8-67GQuYwb1-PvlhDYrji9CBOE0ZOi4QU1NxBi5C_HiMUlnRTHvaR1YiNa23Eb1qHA27UR7Oe6Lp-GPsZB4wWOwNAyQ5FdOPYqyOnXTCZWpaycAiE7mMJovzVTsr9sUaGggu5cK-duRG39N-RH_0dXfRFKPd4vGWWh3sw_Qp9TvRN1kIc7F7zpUSUUa_Nx4F24XuW9nGX98nL8UYZRNlPd07zO5SB-FnKljdhOOGdnUg",
    alt: "Móc khóa blindbox và gấu bông mini trong hộp quà pastel",
  },
];

const tagClass = (t: Product["tags"][number]) =>
  t.solid
    ? "px-3.5 py-1 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-xs font-bold shadow-xs border border-white/20"
    : t.outline
      ? "px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-secondary-dark border border-white/80 font-sans text-xs font-medium shadow-xs"
      : "px-3.5 py-1 rounded-full bg-white/75 backdrop-blur-md text-primary font-sans text-xs font-semibold border border-white/80";

export default function Catalog() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24" id="catalog">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-xl text-primary font-sans text-xs font-semibold mb-3 border border-white/80 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-secondary-dark">local_mall</span>
            <span>Danh mục thủ công 20/10</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl text-primary tracking-tight">Kỷ Vật Yêu Thương &amp; Trao Gửi</h2>
        </div>
        <p className="font-sans text-xs text-on-surface-variant max-w-md mt-4 md:mt-0 italic border-l-2 border-secondary pl-3 leading-relaxed">
          * Lưu ý: Chỉ hoa tươi được mở đặt trước trực tuyến. Các sản phẩm thủ công khác phục vụ trực tiếp tại bàn workshop &amp; sảnh Alpha.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PRODUCTS.map((p) => (
          <article
            key={p.title}
            className="bg-linear-to-br from-white/70 via-white/50 to-white/30 backdrop-blur-2xl rounded-[32px] border border-white/80 overflow-hidden shadow-liquid-card flex flex-col group hover:shadow-liquid-card-hover hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-4/3 bg-surface-container-low overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={p.alt}
                loading="lazy"
                src={p.img}
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t.label} className={tagClass(t)}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-headline text-xl text-primary font-bold">{p.title}</h3>
                {p.price ? (
                  <span className="font-sans text-sm text-secondary-dark font-bold whitespace-nowrap">{p.price}</span>
                ) : (
                  <span className="font-sans text-xs text-on-surface-variant font-semibold whitespace-nowrap">{p.priceNote}</span>
                )}
              </div>
              <p className="font-sans text-xs text-on-surface-variant mb-5 flex-1 leading-relaxed">{p.desc}</p>
              <div className="pt-4 border-t border-white/60 flex items-center justify-between gap-3">
                <span className="font-sans text-xs text-secondary-dark font-semibold">{p.footNote}</span>
                {p.action ? (
                  <a
                    className="px-4 py-2 rounded-full bg-white/70 hover:bg-primary hover:text-white text-primary font-sans text-xs font-bold border border-white/80 shadow-xs hover:shadow-pill transition-all whitespace-nowrap"
                    href={p.action.href}
                  >
                    {p.action.label}
                  </a>
                ) : (
                  <span className="font-sans text-xs text-neutral font-medium whitespace-nowrap">{p.footRight}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
