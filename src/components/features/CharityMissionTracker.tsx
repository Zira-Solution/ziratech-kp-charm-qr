"use client";

import React from "react";

export default function CharityMissionTracker() {
  return (
    <section id="charity-mission" className="w-full py-16 lg:py-24 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tr from-[#ffdad6] to-[#fea095] opacity-40 blur-3xl pointer-events-none animate-liquid-float-slow" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-bl from-[#ffd6dc] to-[#fceae6] opacity-60 blur-3xl pointer-events-none animate-liquid-float-fast" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-[#540114] shadow-xs mb-3 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#fea095]">
              pets
            </span>
            <span>Dự Án Gây Quỹ Cộng Đồng • FPT x Sân Nhà Nhiều Chó</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#540114] leading-tight">
            Trao Yêu Thương Cho Người,<br />
            <span className="italic font-normal text-[#934841]">
              Tiếp Sức Cho Những Bé Thú Cưng Không Nơi Nương Tựa
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#564243] mt-3 leading-relaxed">
            Mỗi chiếc vòng tay hay thẻ quà số bạn đặt trước ngày 20/10 không chỉ là món quà ngọt ngào gửi gắm tâm tư, mà bạn còn góp vào những bữa ăn no và cơ hội sống cho hàng trăm chú cún, mèo tại trạm cứu trợ <strong>Sân Nhà Nhiều Chó (Thanh Oai, Hà Nội)</strong>.
          </p>
        </div>

        {/* Featured Story & Beneficiary Card - Liquid Glass */}
        <div className="rounded-3xl liquid-glass border-2 border-white/80 p-6 sm:p-8 lg:p-10 mb-10 shadow-[0_20px_50px_rgba(114,26,40,0.08)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Story text */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center text-[#540114] shadow-xs border border-white/80">
                  <span className="material-symbols-outlined text-[28px]">volunteer_activism</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#934841] uppercase font-bold tracking-wider block">
                    Đơn vị bảo trợ chính thức
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#540114]">
                    Trạm Cứu Hộ Động Vật "Sân Nhà Nhiều Chó"
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#221a18] leading-relaxed mb-4">
                Tọa lạc tại Thanh Oai, Hà Nội, <strong>Sân Nhà Nhiều Chó</strong> hiện là mái ấm của hơn 500 chú chó mèo già yếu, khuyết tật, bị bỏ rơi hoặc thoát khỏi các lò mổ. Dự án K&amp;P Atelier đã có văn bản và thỏa thuận hợp tác chính thức nhằm đồng hành trao tặng các bữa ăn no cho các bé tại trạm.
              </p>

              {/* Meal Contribution Meaning Callout */}
              <div className="p-4 rounded-2xl liquid-glass-pill w-full mb-5 flex items-start gap-3 border border-white/70">
                <span className="material-symbols-outlined text-[#540114] text-[24px] shrink-0 mt-0.5">
                  pets
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#540114]">
                    Hành Động Nhỏ — Bữa Ăn No Cho Các Bé Cơ Nhỡ
                  </h4>
                  <div className="text-[11px] text-[#76322b] bg-[#ffdad6]/80 px-2.5 py-1 rounded-md inline-block my-1.5 font-semibold">
                    🐾 Mỗi chiếc vòng trao tay = Bạn đã góp vào 2 đến 4 bữa ăn no cho các bé
                  </div>
                  <p className="text-[11px] text-[#564243] leading-relaxed">
                    Toàn bộ sự đóng góp từ dự án được quy đổi trực tiếp thành nguồn trợ cấp gạo, hạt dinh dưỡng, thuốc men và chăm sóc thú y gửi tận tay trạm cứu hộ. Chúng mình không đặt nặng con số tiền bạc, mà trân quý từng bữa ăn ấm lòng các bạn đã cùng chung tay trao gửi.
                  </p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#customizer-workspace"
                  className="liquid-glass-btn-primary inline-flex items-center justify-center px-6 py-3 rounded-full text-white text-xs sm:text-sm font-semibold shadow-md gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">pets</span>
                  Tạo vòng &amp; Góp bữa ăn ngay
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass-btn-secondary inline-flex items-center justify-center px-4 py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Tìm hiểu Sân Nhà Nhiều Chó
                </a>
              </div>
            </div>

            {/* Right Photo & Shelter Visual */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-lg border-2 border-white/80 liquid-glass p-2.5">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/40 border border-white/60">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZhlyLkSsHqXxNnuOutnEgO-juKDzXuhkp6oa8nawWKJHrK23ZWrbc2kGwmPGrSXc-CkTLYFhAU1RcjN72NUQvHQT9d9nJSGmA0bFfTqvEnfI9WG5cpc9dsVwGXg0YoymDgjxZuFC3oIqUpfBViTq3W7WrOjQCc3KM7Nc4BLJL3vYkMKaWz5EDZ2HrcPstX3JEv2zUsVPmwHWWPzpnHI4Qt-SJ-W9B5dosBvrYDNldZZEGfOQ15ExBGQ"
                    alt="Sân Nhà Nhiều Chó - Trạm cứu hộ chó mèo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 text-center">
                  <span className="text-[11px] font-bold text-[#540114] block">
                    Mỗi Đơn Quà Là Những Bữa Ăn Ấm Bụng
                  </span>
                  <span className="text-[10px] text-[#897172]">
                    Hình ảnh trao tặng gạo, hạt và hỗ trợ các bé sẽ được cập nhật công khai sau ngày 20/10/2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 REAL-TIME IMPACT METRICS CARDS - Liquid Glass Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card border-rose-300/80 bg-white/70 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#540114] text-[24px] mb-1 animate-bounce">
              restaurant
            </span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-[#540114]">
              1.250+
            </span>
            <span className="text-xs text-[#76322b] font-bold mt-1">Bữa Ăn Cho Các Bé</span>
            <span className="text-[10px] text-[#76322b] mt-0.5">Đã được các bạn chung tay góp vào</span>
          </div>

          {/* Metric 2 */}
          <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#934841] text-[24px] mb-1">
              pets
            </span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-[#540114]">
              500+
            </span>
            <span className="text-xs text-[#564243] font-semibold mt-1">Bé Cún Mèo Tại Trạm</span>
            <span className="text-[10px] text-[#897172] mt-0.5">Đang được nuôi dưỡng &amp; chữa lành</span>
          </div>

          {/* Metric 3 */}
          <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#934841] text-[24px] mb-1">
              loyalty
            </span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-[#540114]">
              184+
            </span>
            <span className="text-xs text-[#564243] font-semibold mt-1">Chiếc Vòng Đặt Trước</span>
            <span className="text-[10px] text-[#897172] mt-0.5">Mỗi món quà là một tấm lòng</span>
          </div>

          {/* Metric 4 */}
          <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#934841] text-[24px] mb-1">
              volunteer_activism
            </span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-[#540114]">
              100%
            </span>
            <span className="text-xs text-[#564243] font-semibold mt-1">Gạo, Hạt Trao Tận Trạm</span>
            <span className="text-[10px] text-[#897172] mt-0.5">Đồng hành cùng Sân Nhà Nhiều Chó</span>
          </div>
        </div>
      </div>
    </section>
  );
}
