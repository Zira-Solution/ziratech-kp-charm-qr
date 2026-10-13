"use client";

import React, { useState } from "react";

// 4 Chains for Atelier Showcase
const CHAINS = [
  {
    id: "silver",
    name: "Bạc Ý S925 Thanh Mảnh",
    color: "#DCC0C0",
    desc: "Sáng bóng, tinh xảo, thanh lịch mùa thu",
    material: "Bạc Ý 925 Tiêu Chuẩn Quốc Tế",
  },
  {
    id: "rose",
    name: "Vàng Hồng 14K Ấm Áp",
    color: "#FEA095",
    desc: "Ngọt ngào, tôn da phái đẹp",
    material: "Mạ Vàng Hồng 14K Cao Cấp",
  },
  {
    id: "pearl",
    name: "Ngọc Trai Nước Ngọt Mini",
    color: "#FAF0ED",
    desc: "Dịu dàng, quý phái, thanh khiết",
    material: "Ngọc Trai Tự Nhiên Tuyển Chọn",
  },
  {
    id: "cord",
    name: "Dây Dù Kỷ Niệm Bền Bỉ",
    color: "#897172",
    desc: "Trẻ trung, cá tính sinh viên FPT",
    material: "Sợi Dù Thắt Nút Thủ Công",
  },
];

// 8 Symbolic Charms (Zero price, purely spiritual meaning)
const CHARMS = [
  { id: "c1", name: "Trái Tim Ánh Hồng", icon: "favorite", meaning: "Tình yêu chân thành, sự che chở dịu dàng và ấm áp nhất." },
  { id: "c2", name: "Hướng Dương Rạng Rỡ", icon: "sunny", meaning: "Năng lượng tích cực, luôn hướng về phía ánh sáng mặt trời." },
  { id: "c3", name: "Ngôi Sao Tri Kỷ", icon: "hotel_class", meaning: "Ánh sáng dẫn lối, đồng hành bền bỉ qua mọi thăng trầm." },
  { id: "c4", name: "Ly Trà Sữa Kỷ Niệm", icon: "local_cafe", meaning: "Khoảnh khắc hồn nhiên những đêm cùng bạn thân chạy deadline." },
  { id: "c5", name: "Cỏ Bốn Lá Bình An", icon: "potted_plant", meaning: "Niềm tin, hy vọng, tình yêu và may mắn trọn vẹn 4 mùa." },
  { id: "c6", name: "Trang Sách Tri Ân", icon: "auto_stories", meaning: "Tri ân công ơn dạy dỗ và người soi sáng những ước mơ tương lai." },
  { id: "c7", name: "Bàn Chân Cún Cứu Hộ", icon: "pets", meaning: "Tình thương muôn loài & thông điệp đồng hành cùng Sân Nhà Nhiều Chó." },
  { id: "c8", name: "Ký Tự Khắc Tên Nàng", icon: "draw", meaning: "Dấu ấn cá nhân độc bản, lời nhắc nhớ em là duy nhất trên đời." },
];

// 4 Storyline Design Concepts (Zero price, purely emotional value)
const PREMADE_SETS = [
  {
    id: "col-sweet",
    title: "The Sweet One (Nàng Thơ)",
    tag: "Dành Cho Người Yêu / Crush",
    desc: "Chiếc vòng Bạc Ý thanh khiết mang charm Trái Tim Ánh Hồng & Ngôi Sao Tri Kỷ. Tượng trưng cho tình cảm chân thành và sự che chở dịu dàng nhất của mùa thu.",
    recipient: "Người Yêu",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqJ1NwSDE_iT1PjoEQjh8ZxcbJbKj2XNzFuQm5WR3jonIBC2qEFKmEWQh1DNjclyQfYoPglMIYQCGxtGXouVkkq0YxZJFuAp6r1wJyPNhJf8MOc1GwoJQOdzTxXHuPZA1UcC6bkRZuuLfPcBjZP8j-wtBhyOXiKo_aiBxQYChuPK9FfyOuvSWWuAOvea-ebh9vXguVPUn8KBC42elhcwqQFedeVsW_gidpXE8poCqW0swcKbO2Y-CIBg",
  },
  {
    id: "col-sunshine",
    title: "The Sunshine (Tri Kỷ)",
    tag: "Dành Cho Bạn Thân / Tri Kỷ FPT",
    desc: "Sắc vàng hồng ấm áp tôn vinh bông Hướng Dương rạng rỡ. Món quà ghi dấu những năm tháng thanh xuân cùng nhau vượt qua deadline và chia sẻ từng buồn vui.",
    recipient: "Bạn Thân",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtEaJ6fF9anpUjBB-PFVDTw5j3xnyLAS82VB6VC-Su-Erf94ahzIhO1YB8brXWWXg_hHsmw5MK6ekG9enkx-WeCUAkuMBBAsv_DfIvgnXHORkzpdZEFhHRtXi6nCVN4RQQmcUoqpurCmOP4XwLSXN0wgWF4ysnkiubQPbklC90CZasFixW1IfSiejwr1gbeSFwMpnpRB6elSFR4a4i1839xw4Fx3mS5kKsRaRJ5BFiQHSQTENP-_Dqng",
  },
  {
    id: "col-pearl",
    title: "Pure Affection (Mẹ Kính Yêu)",
    tag: "Dành Cho Mẹ / Chị Gái",
    desc: "Sự kết hợp giữa ngọc trai nước ngọt quý phái và charm Cỏ Bốn Lá Bình An. Lời nguyện ước chân thành mong người phụ nữ quan trọng nhất đời luôn mạnh khỏe, bình an.",
    recipient: "Mẹ Kính Yêu",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyWi28ev63IKKBCiHaJwAlGRlG3eZsqO4sLN6kvpbVouQD4oYKzLy_6Po95JEvujbyXMuXYZhSXJFYUWlpw0-JIB_CL4yU0_BfOG2PZaJtb4a9XPIdVkBx4wk-dhrUtKByvE0CcF374irf445sU06HGXuZLl9gjHdt06l-PF9C0ySwHl7wnsL0nuK0unMNw_Q0SHqWHvoBrsSXbQ55bN6vcS0p7doDqKpUffs_xrU9Qr6jDH-OlB9VGw",
  },
  {
    id: "col-campus",
    title: "Tri Ân & Tôn Kính (Thầy Cô)",
    tag: "Dành Cho Cô Giáo / Người Dẫn Dắt",
    desc: "Chất liệu Bạc Ý kết hợp charm Trang Sách Tri Thức và bức thư hoa khô trang trọng. Bày tỏ lòng biết ơn sâu sắc đến người đã tận tụy nâng bước tương lai.",
    recipient: "Cô Giáo",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJba0dW17DjwIOLNyTXPD8wtW9eDhJn7Vcw0sZ8QAhRb1N2efEO-xH3QqtQ8UiwjtynHLTeFC4brnPDDaYcxjW_DT1T9-LFxwgHbwlAaCr6-u3hsxws7D6IBZGpdUXXiBwkyruOtEVUiat_wbnM9KGMmlHvsd__0pjJOdMHBF6Hbmnj1TUXX6BDtIMysvENCF8jXLqjNEPK7ZX3G6tL8-_XzKKRKcEhmzUHxUxsXu1avl0bVlHYSDgUQ",
  },
];

export default function ShowroomWorkshopHub() {
  const [activeTab, setActiveTab] = useState<"bundles" | "workshop" | "charms">("bundles");

  // Workshop State for Visual Experimentation (Pure aesthetic, no cart)
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const [selectedCharms, setSelectedCharms] = useState<typeof CHARMS>([CHARMS[0], CHARMS[2]]);

  const handleAddCharm = (charm: (typeof CHARMS)[0]) => {
    if (selectedCharms.length >= 7) {
      alert("Mỗi chiếc vòng xâu tối đa 7 charm để giữ vẻ thanh thoát nhất.");
      return;
    }
    setSelectedCharms((prev) => [...prev, charm]);
  };

  const handleRemoveCharm = (index: number) => {
    setSelectedCharms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetWorkshop = () => {
    setSelectedCharms([CHARMS[0], CHARMS[1]]);
  };

  return (
    <section id="showroom" className="scroll-mt-24 w-full py-16 sm:py-24 relative overflow-hidden">
      {/* Ambient background accents */}
      <div className="absolute top-1/3 left-10 w-96 h-96 rounded-full bg-linear-to-tr from-rose-100 to-amber-200 opacity-35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-linear-to-bl from-rose-petal to-surface-container opacity-40 blur-3xl pointer-events-none" />

      <div className="max-w-330 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER: Non-commercial, Editorial Atelier */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-primary text-xs font-semibold shadow-xs mb-3 border border-white/95">
            <span className="material-symbols-outlined text-[15px] text-amber-500">palette</span>
            <span className="tracking-wider uppercase font-serif text-[11px]">Không Gian Nghệ Thuật &amp; Ý Nghĩa Biểu Tượng</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight">
            Nghệ Thuật Chế Tác &amp; Ý Nghĩa Vòng Charm
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-2 max-w-xl leading-relaxed">
            Mỗi chiếc vòng K&amp;P Atelier đều được người thợ xâu chuỗi thủ công tỉ mỉ. Khám phá các thiết kế chủ đạo, ý nghĩa ẩn sau từng hạt charm và thử phối ngẫu hứng trên bàn xưởng.
          </p>
        </div>

        {/* 3-TAB SWITCHER */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("bundles")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "bundles"
                ? "liquid-glass-btn-primary text-white shadow-md scale-[1.02]"
                : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            <span>1. 4 Concept Thiết Kế Chủ Đạo</span>
          </button>

          <button
            onClick={() => setActiveTab("workshop")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "workshop"
                ? "liquid-glass-btn-primary text-white shadow-md scale-[1.02]"
                : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">handyman</span>
            <span>2. Bàn Thử Nghiệm Phối Vòng</span>
          </button>

          <button
            onClick={() => setActiveTab("charms")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "charms"
                ? "liquid-glass-btn-primary text-white shadow-md scale-[1.02]"
                : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">psychology_alt</span>
            <span>3. Thông Điệp 8 Hạt Charm</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: 4 ARTISAN CONCEPTS (NO PRICES, NO BUY BUTTONS) */}
        {/* ========================================================= */}
        {activeTab === "bundles" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {PREMADE_SETS.map((item) => (
              <div
                key={item.id}
                className="p-4.5 rounded-4xl liquid-glass-card border border-white/90 shadow-md hover:shadow-xl flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white/40 mb-4 border border-white/80 shadow-xs">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full liquid-glass-pill text-[10px] font-sans font-bold text-primary border border-white/95 shadow-xs">
                      {item.recipient}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                    {item.tag}
                  </span>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-primary line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-sans mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/70 flex items-center justify-between text-xs text-secondary">
                  <span className="font-serif font-semibold italic">Bộ quà kèm Thẻ Khắc QR</span>
                  <span className="material-symbols-outlined text-base">favorite</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VISUAL CHARM WORKSHOP (PURE AESTHETICS, ZERO PRICE) */}
        {/* ========================================================= */}
        {activeTab === "workshop" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start animate-in fade-in duration-300">
            {/* Left: Chain & Charms Selection (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Step 1: Chain Choice */}
              <div className="p-5 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary text-amber-300 text-xs font-bold flex items-center justify-center">1</span>
                    <h3 className="font-serif text-base font-bold text-primary">
                      Chọn Chất Liệu Dây Vòng
                    </h3>
                  </div>
                  <span className="text-xs text-secondary font-sans">4 chất liệu cao cấp</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHAINS.map((chain) => {
                    const isSelected = selectedChain.id === chain.id;
                    return (
                      <div
                        key={chain.id}
                        onClick={() => setSelectedChain(chain)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? "liquid-glass bg-white/95 border-amber-400 ring-2 ring-primary-container/20 shadow-md"
                            : "liquid-glass-card hover:bg-white/80 border-white/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-primary">{chain.name}</span>
                          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full liquid-glass-pill text-primary-container">
                            Thủ công
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-sans mt-1">{chain.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Charms Tray */}
              <div className="p-5 sm:p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-secondary text-amber-300 text-xs font-bold flex items-center justify-center">2</span>
                    <h3 className="font-serif text-base font-bold text-primary">
                      Thử Đính Các Hạt Charm Biểu Tượng
                    </h3>
                  </div>
                  <span className="text-xs font-sans text-primary-container font-semibold">
                    Đang thử phối: {selectedCharms.length} / 7 hạt
                  </span>
                </div>

                {/* Selected Tray */}
                {selectedCharms.length > 0 ? (
                  <div className="mb-4 p-3.5 rounded-2xl bg-white/85 border border-white/90 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-sans font-bold text-primary mr-1">Vòng đang có:</span>
                    {selectedCharms.map((charm, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-sans shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-300">{charm.icon}</span>
                        <span>{charm.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCharm(idx)}
                          className="ml-1 text-white/70 hover:text-white cursor-pointer font-bold"
                          title="Gỡ charm này khỏi vòng"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-xl bg-white/50 text-xs font-sans text-warm-neutral italic text-center">
                    Bấm vào các hạt charm bên dưới để gắn vào vòng thử nghiệm
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CHARMS.map((charm) => (
                    <button
                      type="button"
                      key={charm.id}
                      onClick={() => handleAddCharm(charm)}
                      className="p-3 rounded-2xl liquid-glass-card hover:bg-white text-left transition-all border border-white/80 cursor-pointer group flex flex-col justify-between min-h-20.5 active:scale-[0.97]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="material-symbols-outlined text-xl text-secondary group-hover:scale-110 transition-transform">
                          {charm.icon}
                        </span>
                        <span className="text-[10px] font-sans font-semibold text-primary-container">
                          + Thêm
                        </span>
                      </div>
                      <span className="text-xs font-serif font-bold text-primary block line-clamp-1">{charm.name}</span>
                      <span className="text-[10px] font-sans text-warm-neutral block line-clamp-1">{charm.meaning}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Live Visual Showcase (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 flex flex-col gap-4">
              <div className="p-5 sm:p-6 rounded-3xl liquid-glass border-2 border-white/95 shadow-md">
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block mb-1">
                  MẪU THIẾT KẾ ĐỘC BẢN CỦA BẠN
                </span>
                <h3 className="font-serif text-base font-bold text-primary pb-3 border-b border-white/80">
                  {selectedChain.name}
                </h3>

                <div className="py-3.5 space-y-2 text-xs font-sans text-on-surface-variant">
                  <div>
                    <span className="text-warm-neutral block mb-0.5">Chất liệu chính:</span>
                    <strong className="text-primary">{selectedChain.material}</strong>
                  </div>
                  <div>
                    <span className="text-warm-neutral block mb-0.5">Hạt charm đính kèm:</span>
                    <strong className="text-primary">{selectedCharms.length} hạt biểu tượng</strong>
                  </div>
                  <div className="pt-2 text-primary-container">
                    <span>✨ Đi kèm: Hộp nhung đỏ &amp; Thẻ VIP QR mở thiệp số</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/80">
                  <p className="text-[11px] font-sans text-warm-neutral leading-relaxed italic">
                    "Mỗi chiếc vòng là một tác phẩm mang tâm tư riêng của người gửi trao."
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetWorkshop}
                  className="w-full mt-4 py-3 rounded-2xl liquid-glass-btn-secondary text-primary font-serif font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white transition-all border border-white/90"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span>Phối Lại Từ Đầu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 8 CHARMS MEANING (PURE INSPIRATION, ZERO PRICE) */}
        {/* ========================================================= */}
        {activeTab === "charms" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {CHARMS.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl liquid-glass-card border border-white/90 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-primary">{c.name}</h4>
                    <span className="text-[10px] font-sans font-semibold text-secondary">
                      Biểu tượng ý nghĩa
                    </span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                  {c.meaning}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
