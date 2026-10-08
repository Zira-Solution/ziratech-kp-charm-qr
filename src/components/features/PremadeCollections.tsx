"use client";

import React from "react";

interface PremadeCollectionsProps {
  onQuickBuy: (collection: any) => void;
  onCustomize: () => void;
}

export default function PremadeCollections({
  onQuickBuy,
  onCustomize,
}: PremadeCollectionsProps) {
  const collections = [
    {
      id: "col-sweet",
      title: "Set Quà 'The Sweet One'",
      tag: "Best-Seller 20/10",
      desc: "Vòng Bạc Ý S925 đính charm Trái Tim Ánh Hồng & Ngôi Sao, đính kèm thẻ QR trang quà số lãng mạn.",
      price: 55000,
      cogs: 26000,
      charityAmount: 29000,
      meals: 3,
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqJ1NwSDE_iT1PjoEQjh8ZxcbJbKj2XNzFuQm5WR3jonIBC2qEFKmEWQh1DNjclyQfYoPglMIYQCGxtGXouVkkq0YxZJFuAp6r1wJyPNhJf8MOc1GwoJQOdzTxXHuPZA1UcC6bkRZuuLfPcBjZP8j-wtBhyOXiKo_aiBxQYChuPK9FfyOuvSWWuAOvea-ebh9vXguVPUn8KBC42elhcwqQFedeVsW_gidpXE8poCqW0swcKbO2Y-CIBg",
    },
    {
      id: "col-sunshine",
      title: "Combo 'The Sunshine & Flower'",
      tag: "Rực rỡ & Tươi sáng",
      desc: "Vòng charm Hoa Hướng Dương mạ Vàng Hồng kèm đóa hoa khô handmade & thẻ QR thu âm lời chúc.",
      price: 65000,
      cogs: 30000,
      charityAmount: 35000,
      meals: 3,
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtEaJ6fF9anpUjBB-PFVDTw5j3xnyLAS82VB6VC-Su-Erf94ahzIhO1YB8brXWWXg_hHsmw5MK6ekG9enkx-WeCUAkuMBBAsv_DfIvgnXHORkzpdZEFhHRtXi6nCVN4RQQmcUoqpurCmOP4XwLSXN0wgWF4ysnkiubQPbklC90CZasFixW1IfSiejwr1gbeSFwMpnpRB6elSFR4a4i1839xw4Fx3mS5kKsRaRJ5BFiQHSQTENP-_Dqng",
    },
    {
      id: "col-campus",
      title: "Set Đôi 'FPT Youth & Coffee'",
      tag: "Sinh Viên FPTU",
      desc: "Vòng dây dù kỷ niệm phối charm Ly Trà Sữa Deadline & Kính Mắt Tri Thức, mở album 6 ảnh dìm độc quyền.",
      price: 45000,
      cogs: 20000,
      charityAmount: 25000,
      meals: 2,
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJba0dW17DjwIOLNyTXPD8wtW9eDhJn7Vcw0sZ8QAhRb1N2efEO-xH3QqtQ8UiwjtynHLTeFC4brnPDDaYcxjW_DT1T9-LFxwgHbwlAaCr6-u3hsxws7D6IBZGpdUXXiBwkyruOtEVUiat_wbnM9KGMmlHvsd__0pjJOdMHBF6Hbmnj1TUXX6BDtIMysvENCF8jXLqjNEPK7ZX3G6tL8-_XzKKRKcEhmzUHxUxsXu1avl0bVlHYSDgUQ",
    },
    {
      id: "col-pearl",
      title: "Set Quà 'Pure Affection'",
      tag: "Trang nhã & Quý phái",
      desc: "Vòng ngọc trai nước ngọt phối charm Cỏ Bốn Lá Bình An & Trái Tim, kèm hộp quà nhung thắt nơ lụa.",
      price: 69000,
      cogs: 32000,
      charityAmount: 37000,
      meals: 4,
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyWi28ev63IKKBCiHaJwAlGRlG3eZsqO4sLN6kvpbVouQD4oYKzLy_6Po95JEvujbyXMuXYZhSXJFYUWlpw0-JIB_CL4yU0_BfOG2PZaJtb4a9XPIdVkBx4wk-dhrUtKByvE0CcF374irf445sU06HGXuZLl9gjHdt06l-PF9C0ySwHl7wnsL0nuK0unMNw_Q0SHqWHvoBrsSXbQ55bN6vcS0p7doDqKpUffs_xrU9Qr6jDH-OlB9VGw",
    },
  ];

  return (
    <section id="collections" className="w-full py-16 lg:py-24 relative overflow-hidden">
      {/* Subtle liquid backdrop light */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-[#ffe4e6] to-[#fed7aa] opacity-40 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#934841] mb-1 block">
              Nếu Bạn Muốn Tiết Kiệm Thời Gian...
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#540114]">
              Bộ Sưu Tập Phối Sẵn Kèm Thẻ Quà Số 20/10
            </h2>
            <p className="text-xs sm:text-sm text-[#564243] mt-1">
              Đầy đủ vòng, charm, thẻ QR thông minh và đóng gói hộp quà nơ lụa — mức giá sinh viên 45k - 69k.
            </p>
          </div>

          <button
            onClick={onCustomize}
            className="liquid-glass-btn-secondary px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-[#540114] flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            Muốn tự tay chọn charm? Vào Bàn Xưởng{" "}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl liquid-glass-card flex flex-col justify-between group"
            >
              <div>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/40 mb-4 border border-white/60 shadow-inner">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full liquid-glass-pill text-[#540114] text-[10px] font-bold shadow-md border border-white/80">
                    {item.tag}
                  </span>
                </div>

                <span className="text-[10px] text-[#934841] font-bold uppercase tracking-wider">
                  Trọn gói vòng + Quà số
                </span>
                <h3 className="font-serif text-base font-bold text-[#540114] mt-1">{item.title}</h3>
                <p className="text-xs text-[#564243] mt-1.5 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#76322b] block font-semibold">
                    🐾 Góp ~{item.meals} bữa ăn cho các bé
                  </span>
                  <span className="font-serif text-lg font-bold text-[#540114]">
                    {new Intl.NumberFormat("vi-VN").format(item.price)}₫
                  </span>
                </div>

                <button
                  onClick={() => onQuickBuy(item)}
                  className="liquid-glass-btn-primary px-4 py-2 rounded-full text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Đặt trước
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
