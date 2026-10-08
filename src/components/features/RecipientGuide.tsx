"use client";

import React from "react";

interface RecipientGuideProps {
  onSelectCombo: (preset: any) => void;
}

export default function RecipientGuide({ onSelectCombo }: RecipientGuideProps) {
  const presets = [
    {
      id: "na-ng",
      title: "Tặng Nàng (Người Yêu / Crush)",
      tag: "Lãng mạn & Ngọt ngào",
      icon: "favorite",
      price: 59000,
      charityAmount: 31000,
      desc: "Vòng Bạc Ý hoặc Vàng Hồng đính charm Trái Tim Ánh Hồng & Ngôi Sao May Mắn, kèm thẻ QR phát bài hát kỷ niệm.",
      chainName: "Vàng Hồng 14K Ấm Áp",
      charms: ["Trái Tim Ánh Hồng", "Ngôi Sao Tri Kỷ"],
      defaultMsg: "Gửi người con gái anh thương nhất. Chúc em 20/10 thật rực rỡ và luôn nở nụ cười xinh đẹp bên anh! ❤️",
    },
    {
      id: "me",
      title: "Tặng Mẹ Kính Yêu",
      tag: "Hiếu thảo & Dịu dàng",
      icon: "spa",
      price: 65000,
      charityAmount: 33000,
      desc: "Vòng ngọc trai nước ngọt mini kết hợp charm Cỏ Bốn Lá Bình An, kèm thẻ QR thu âm giọng nói chúc Mẹ khỏe mạnh.",
      chainName: "Ngọc Trai Nước Ngọt Mini",
      charms: ["Cỏ Bốn Lá Bình An", "Hướng Dương Rạng Rỡ"],
      defaultMsg: "Con cảm ơn Mẹ vì tất cả sự hy sinh thầm lặng. Chúc Mẹ của con ngày 20/10 luôn an yên và nhiều sức khỏe! 🌷",
    },
    {
      id: "co-giao",
      title: "Tặng Cô Giáo Mến Thương",
      tag: "Trang trọng & Tri ân",
      icon: "school",
      price: 55000,
      charityAmount: 28000,
      desc: "Vòng Bạc Ý S925 đính charm Trang Sách Tri Thức & đóa hoa hướng dương, gửi gắm lòng biết ơn sâu sắc.",
      chainName: "Bạc Ý S925 Thanh Mảnh",
      charms: ["Trang Sách Tri Ân", "Hướng Dương Rạng Rỡ"],
      defaultMsg: "Kính chúc Cô ngày 20/10 ngập tràn niềm vui. Cảm ơn Cô vì những bài học tận tụy đã soi sáng cho chúng em! 🎓",
    },
    {
      id: "ban",
      title: "Tặng Bạn Thân / Tri Kỷ (BFF)",
      tag: "Gắn kết & Vui vẻ",
      icon: "diversity_1",
      price: 49000,
      charityAmount: 27000,
      desc: "Vòng dây dù kỷ niệm phối charm Ly Trà Sữa Deadline & Chữ cái, đính kèm album 6 ảnh dìm hài hước trên web quà số.",
      chainName: "Dây Dù Kỷ Niệm Bền Bỉ",
      charms: ["Ly Trà Sữa Deadline", "Ngôi Sao Tri Kỷ"],
      defaultMsg: "Cảm ơn vì đã luôn cùng tao gánh deadline và ăn vặt sau giờ tan trường. 20/10 thật vui vẻ nha bạn thân! 🫶",
    },
  ];

  return (
    <section id="recipient-guide" className="w-full py-16 lg:py-24 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[#934841] text-xs font-bold uppercase tracking-widest mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
            Gợi Ý Chọn Quà 20/10
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#540114]">
            Bạn Đang Tìm Quà Gửi Trao Ai?
          </h2>
          <p className="text-xs sm:text-sm text-[#564243] mt-2">
            Chọn nhóm người nhận để xem bộ phối vòng chuẩn gu sinh viên, áp dụng ngay vào bàn xưởng chỉ trong 1 chạm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-6 rounded-3xl liquid-glass-card flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl liquid-glass-pill text-[#540114] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xs border border-white/80">
                  <span className="material-symbols-outlined text-[26px]">{preset.icon}</span>
                </div>
                <span className="text-[10px] text-[#934841] font-bold uppercase tracking-wider block">
                  {preset.tag}
                </span>
                <h3 className="font-serif text-base font-bold text-[#540114] mt-1">
                  {preset.title}
                </h3>
                <p className="text-xs text-[#564243] mt-2 leading-relaxed">{preset.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#897172] block">Combo trọn gói</span>
                  <span className="font-serif text-base font-bold text-[#540114]">
                    {new Intl.NumberFormat("vi-VN").format(preset.price)}₫
                  </span>
                </div>
                <button
                  onClick={() => onSelectCombo(preset)}
                  className="liquid-glass-btn-primary px-3.5 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Áp dụng <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
