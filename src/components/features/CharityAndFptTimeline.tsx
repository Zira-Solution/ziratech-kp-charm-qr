"use client";

import React from "react";

export default function CharityAndFptTimeline() {
  const steps = [
    {
      num: "01",
      title: "Trao Hộp Quà Phygital",
      desc: "Người thương nhận chiếc hộp nhung đỏ thắt nơ lụa và thẻ VIP QR mạ vàng.",
      icon: "redeem",
    },
    {
      num: "02",
      title: "Chế Tác Thủ Công",
      desc: "Vòng charm được xâu chuỗi tỉ mỉ, in thẻ VIP ép kim mã QR độc bản.",
      icon: "precision_manufacturing",
    },
    {
      num: "03",
      title: "Điểm Hẹn Tại FPT",
      desc: "Gian hàng trải nghiệm tại sảnh lầu 2 — ĐH FPT (11:00 – 15:00 ngày 20/10).",
      icon: "school",
    },
    {
      num: "04",
      title: "Quét QR & Mở Thiệp",
      desc: "Quét camera mở thiệp 7 trang cảm xúc, nghe nhạc & voice note.",
      icon: "qr_code_scanner",
    },
  ];

  return (
    <section id="charity-and-timeline" className="scroll-mt-24 w-full py-16 sm:py-20 relative overflow-hidden bg-linear-to-b from-rose-cream to-surface-container border-t border-white/80">
      {/* Ambient background accents */}
      <div className="absolute -top-24 right-10 w-96 h-96 rounded-full bg-linear-to-tr from-secondary-fixed to-secondary-container opacity-35 blur-3xl pointer-events-none" />

      <div className="max-w-330 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Charity Mission (Sân Nhà Nhiều Chó) - 6 cols */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-4xl liquid-glass border-2 border-white/95 shadow-md flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass-pill text-primary text-xs font-semibold shadow-xs mb-4 border border-white/95">
                <span className="material-symbols-outlined text-[15px] text-amber-500">pets</span>
                <span className="font-serif uppercase text-[11px]">Dự Án Gây Quỹ Cộng Đồng 20/10</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary leading-tight">
                Trao Quà Cho Người Thương,<br />
                <span className="italic font-normal text-secondary">
                  Góp Bữa Ăn Cho Bé Cưng Không Nơi Nương Tựa
                </span>
              </h3>

              <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-3 leading-relaxed">
                Mỗi món quà được trao gửi trong mùa 20/10 đều mang theo sứ mệnh yêu thương, chung tay đóng góp bữa ăn và thuốc men gửi trực tiếp đến trạm cứu trợ <strong>Sân Nhà Nhiều Chó (Thanh Oai, Hà Nội)</strong> — nơi đang cưu mang hơn 500 chú chó mèo già yếu, khuyết tật hoặc thoát khỏi lò mổ.
              </p>

              {/* Highlight Stats Pill */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-white/90">
                  <span className="text-[10px] font-sans text-warm-neutral uppercase font-bold block">
                    Đơn vị bảo trợ
                  </span>
                  <strong className="font-serif text-sm text-primary block mt-0.5">
                    Sân Nhà Nhiều Chó
                  </strong>
                  <span className="text-[11px] text-secondary">500+ bé cún mèo</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-white/90">
                  <span className="text-[10px] font-sans text-warm-neutral uppercase font-bold block">
                    Mỗi món quà tương đương
                  </span>
                  <strong className="font-serif text-sm text-emerald-800 block mt-0.5">
                    3 Bữa Ăn No Ấm Bụng
                  </strong>
                  <span className="text-[11px] text-emerald-700 font-sans font-medium">Góp phần nuôi dưỡng</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/70 flex items-center justify-between text-xs font-sans text-warm-neutral">
              <span>✨ Minh bạch sao kê cùng Đoàn Thanh Niên FPT</span>
              <span className="font-bold text-primary-container">#ViDongVat</span>
            </div>
          </div>

          {/* RIGHT: Campus Fulfillment Timeline - 6 cols */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-4xl liquid-glass border-2 border-white/95 shadow-md flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass-pill text-primary text-xs font-semibold shadow-xs mb-4 border border-white/95">
                <span className="material-symbols-outlined text-[15px] text-secondary">school</span>
                <span className="font-serif uppercase text-[11px]">Độc Quyền Tại Đại Học FPT</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary leading-tight">
                Lịch Trình &amp; Điểm Hẹn Nhận Quà
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-3 leading-relaxed">
                Được vận hành bởi đội ngũ sinh viên FPTU, đảm bảo quà tặng được đóng gói tinh tế và trao tận tay bạn đúng hẹn ngày 20/10.
              </p>

              {/* 4 Steps timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                {steps.map((s) => (
                  <div key={s.num} className="p-3.5 rounded-2xl bg-white/80 border border-white/90 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center">
                        {s.num}
                      </span>
                      <strong className="font-serif text-xs text-primary">{s.title}</strong>
                    </div>
                    <p className="text-[11px] font-sans text-on-surface-variant pl-8 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/70 flex items-center justify-between text-xs font-sans text-warm-neutral">
              <span>📍 Booth chính: Sảnh lầu 2 — FPTU</span>
              <span className="font-bold text-primary-container">Duy nhất 20/10 (11:00 – 15:00)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
