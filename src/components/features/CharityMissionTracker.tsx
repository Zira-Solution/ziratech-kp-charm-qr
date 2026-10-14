"use client";

import React, { useEffect, useState } from "react";

const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(Math.round(n))}đ`;

export default function CharityMissionTracker() {
  // Live fund total from the SePay webhook; the card stays hidden until at least one transfer arrived.
  const [fund, setFund] = useState<{ total: number; count: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/donations/summary")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && data.count > 0) setFund({ total: data.total, count: data.count });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="charity-mission" className="w-full py-16 lg:py-24 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-linear-to-tr from-secondary-fixed to-secondary-container opacity-40 blur-3xl pointer-events-none animate-liquid-float-slow" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-linear-to-bl from-rose-petal to-surface-container opacity-60 blur-3xl pointer-events-none animate-liquid-float-fast" />

      <div className="max-w-320 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-primary shadow-xs mb-3 text-xs font-semibold">
            <span className="material-symbols-outlined text-base text-secondary-container">
              pets
            </span>
            <span>Dự Án Gây Quỹ Cộng Đồng • FPT x Sân Nhà Nhiều Chó</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">
            Trao Yêu Thương Cho Người,<br />
            <span className="italic font-normal text-secondary">
              Tiếp Sức Cho Những Bé Thú Cưng Không Nơi Nương Tựa
            </span>
          </h2>

          <p className="text-sm sm:text-base text-on-surface-variant mt-3 leading-relaxed">
            Mỗi chiếc vòng tay hay thẻ quà số bạn đặt trước ngày 20/10 không chỉ là món quà ngọt ngào gửi gắm tâm tư, mà bạn còn góp vào những bữa ăn no và cơ hội sống cho hàng trăm chú cún, mèo tại trạm cứu trợ <strong>Sân Nhà Nhiều Chó (Thanh Oai, Hà Nội)</strong>.
          </p>
        </div>

        {/* Featured Story & Beneficiary Card - Liquid Glass */}
        <div className="rounded-4xl liquid-glass border-2 border-white/90 p-6 sm:p-8 lg:p-10 mb-10 shadow-[0_24px_60px_rgba(114,26,40,0.10)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Story text */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-13 h-13 rounded-2xl liquid-glass-pill flex items-center justify-center text-primary shadow-md border border-white/95">
                  <span className="material-symbols-outlined text-[28px]">volunteer_activism</span>
                </div>
                <div>
                  <span className="text-[11px] text-secondary uppercase font-bold tracking-wider block">
                    Đơn vị bảo trợ chính thức
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                    Trạm Cứu Hộ Động Vật "Sân Nhà Nhiều Chó"
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-on-surface leading-relaxed mb-4">
                Tọa lạc tại Thanh Oai, Hà Nội, <strong>Sân Nhà Nhiều Chó</strong> hiện là mái ấm của hơn 500 chú chó mèo già yếu, khuyết tật, bị bỏ rơi hoặc thoát khỏi các lò mổ. Dự án K&amp;P Atelier đã có văn bản và thỏa thuận hợp tác chính thức nhằm đồng hành trao tặng các bữa ăn no cho các bé tại trạm.
              </p>

              {/* Meal Contribution Meaning Callout */}
              <div className="p-4.5 rounded-2xl liquid-glass-pill w-full mb-5 flex items-start gap-3 border border-white/85 shadow-xs">
                <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">
                  pets
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-primary">
                    Hành Động Nhỏ — Bữa Ăn No Cho Các Bé Cơ Nhỡ
                  </h4>
                  <div className="text-[11px] text-on-secondary-fixed-variant bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/90 inline-block my-1.5 font-bold shadow-xs">
                    🐾 Mỗi chiếc vòng trao tay = Bạn đã góp vào 2 đến 4 bữa ăn no cho các bé
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Toàn bộ sự đóng góp từ dự án được quy đổi trực tiếp thành nguồn trợ cấp gạo, hạt dinh dưỡng, thuốc men và chăm sóc thú y gửi tận tay trạm cứu hộ. Chúng mình không đặt nặng con số tiền bạc, mà trân quý từng bữa ăn ấm lòng các bạn đã cùng chung tay trao gửi.
                  </p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#customizer-workspace"
                  className="liquid-glass-btn-primary inline-flex items-center justify-center px-6 py-3.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-md gap-2"
                >
                  <span className="material-symbols-outlined text-lg">pets</span>
                  Tạo vòng &amp; Góp bữa ăn ngay
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass-btn-secondary inline-flex items-center justify-center px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-colors gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Tìm hiểu Sân Nhà Nhiều Chó
                </a>
              </div>
            </div>

            {/* Right Photo & Shelter Visual */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border-2 border-white/90 liquid-glass p-3">
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-white/40 border border-white/80">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZhlyLkSsHqXxNnuOutnEgO-juKDzXuhkp6oa8nawWKJHrK23ZWrbc2kGwmPGrSXc-CkTLYFhAU1RcjN72NUQvHQT9d9nJSGmA0bFfTqvEnfI9WG5cpc9dsVwGXg0YoymDgjxZuFC3oIqUpfBViTq3W7WrOjQCc3KM7Nc4BLJL3vYkMKaWz5EDZ2HrcPstX3JEv2zUsVPmwHWWPzpnHI4Qt-SJ-W9B5dosBvrYDNldZZEGfOQ15ExBGQ"
                    alt="Sân Nhà Nhiều Chó - Trạm cứu hộ chó mèo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 text-center">
                  <span className="text-[11px] font-bold text-primary block">
                    Mỗi Đơn Quà Là Những Bữa Ăn Ấm Bụng
                  </span>
                  <span className="text-[10px] text-outline">
                    Hình ảnh trao tặng gạo, hạt và hỗ trợ các bé sẽ được cập nhật công khai sau ngày 20/10/2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {fund && (
          <div className="mb-4 p-5 rounded-3xl liquid-glass-card border border-white/85 shadow-md flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-[26px] mb-1">savings</span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-primary">{vnd(fund.total)}</span>
            <span className="text-xs text-on-secondary-fixed-variant font-bold mt-1">Quỹ đã nhận được</span>
            <span className="text-[10px] text-on-secondary-fixed-variant mt-0.5">
              Từ {fund.count} lượt ủng hộ, cập nhật trực tiếp
            </span>
          </div>
        )}

        {/* 4 REAL-TIME IMPACT METRICS CARDS - Liquid Glass Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="p-5 rounded-3xl liquid-glass-card border border-white/85 shadow-md hover:shadow-xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-[26px] mb-1 animate-bounce">
              restaurant
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
              1.250+
            </span>
            <span className="text-xs text-on-secondary-fixed-variant font-bold mt-1">Bữa Ăn Cho Các Bé</span>
            <span className="text-[10px] text-on-secondary-fixed-variant mt-0.5">Đã được các bạn chung tay góp vào</span>
          </div>

          {/* Metric 2 */}
          <div className="p-5 rounded-3xl liquid-glass-card border border-white/85 shadow-md hover:shadow-xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-secondary text-[26px] mb-1">
              pets
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
              500+
            </span>
            <span className="text-xs text-on-surface-variant font-semibold mt-1">Bé Cún Mèo Tại Trạm</span>
            <span className="text-[10px] text-outline mt-0.5">Đang được nuôi dưỡng &amp; chữa lành</span>
          </div>

          {/* Metric 3 */}
          <div className="p-5 rounded-3xl liquid-glass-card border border-white/85 shadow-md hover:shadow-xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-secondary text-[26px] mb-1">
              loyalty
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
              184+
            </span>
            <span className="text-xs text-on-surface-variant font-semibold mt-1">Chiếc Vòng Đặt Trước</span>
            <span className="text-[10px] text-outline mt-0.5">Mỗi món quà là một tấm lòng</span>
          </div>

          {/* Metric 4 */}
          <div className="p-5 rounded-3xl liquid-glass-card border border-white/85 shadow-md hover:shadow-xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-secondary text-[26px] mb-1">
              volunteer_activism
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
              100%
            </span>
            <span className="text-xs text-on-surface-variant font-semibold mt-1">Gạo, Hạt Trao Tận Trạm</span>
            <span className="text-[10px] text-outline mt-0.5">Đồng hành cùng Sân Nhà Nhiều Chó</span>
          </div>
        </div>
      </div>
    </section>
  );
}
