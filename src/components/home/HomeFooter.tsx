"use client";

import React from "react";
import Link from "next/link";

export function ClosingBanner() {
  return (
    <section className="bg-[#0b132b] text-white py-16 sm:py-20 px-6 text-center border-t border-slate-800">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-sky-400/25 text-sky-200 text-xs font-semibold shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-sky-300">
            favorite
          </span>
          <span>LAN TỎA YÊU THƯƠNG MÙA 20/10</span>
        </div>

        <h3 className="font-headline text-2xl sm:text-3xl lg:text-4xl italic text-white font-medium tracking-tight leading-snug max-w-3xl">
          &ldquo;Cùng K&amp;P Atelier mang lại một ngày 20/10 ngọt ngào và ấm áp.&rdquo;
        </h3>

        <p className="font-body text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Cảm ơn bạn đã lắng nghe câu chuyện của xưởng thủ công sinh viên FPT University và những người bạn bốn chân tại trạm cứu hộ.
        </p>
      </div>
    </section>
  );
}

export default function HomeFooter() {
  const navLinks = [
    { label: "Câu chuyện xưởng K&P", href: "#hero" },
    { label: "Bộ sưu tập quà 20/10", href: "#catalog" },
    { label: "Bàn workshop thủ công", href: "#workshop" },
    { label: "Mã QR & thiệp số email", href: "#keepsake" },
    { label: "Quỹ Sân Nhà Nhiều Chó", href: "#shelter" },
  ];

  const serviceLinks = [
    { label: "Studio tạo thiệp quà số", href: "/gift", isRoute: true },
    { label: "Đặt trước hoa tươi 20/10", href: "#preorder" },
    { label: "Trải nghiệm workshop tự làm", href: "#workshop" },
    { label: "Minh bạch quỹ thiện nguyện", href: "#shelter-donate" },
  ];

  return (
    <footer className="w-full bg-[#070b14] text-white pt-14 pb-16 px-6 sm:px-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* ======================================================== */}
          {/* COL 1: ATELIER BRAND (6 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/95 border border-white/30 flex items-center justify-center p-1.5 shadow-sm">
                <img
                  src="/images/logo_icon_kp.png"
                  alt="Team K&P Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-headline text-2xl text-white font-bold tracking-tight block">
                  Team K&amp;P
                </span>
                <span className="font-sans text-[10px] text-sky-300/80 uppercase tracking-widest block font-semibold">
                  K&amp;P Atelier • Handcrafted &amp; Phygital Gifts
                </span>
              </div>
            </div>

            <p className="font-body text-xs sm:text-sm text-slate-300/75 leading-relaxed max-w-md">
              Dự án quà tặng thủ công kết hợp công nghệ số 20/10 bởi sinh viên FPT University, đồng hành cùng trạm cứu hộ động vật Sân Nhà Nhiều Chó.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300/80 font-sans">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-sky-400 shrink-0">
                  pin_drop
                </span>
                <span>Sảnh liên tầng lầu 1 &amp; lầu 3, FPT University TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-sky-400 shrink-0">
                  schedule
                </span>
                <span>Chuỗi ngày hội: 17/10 – 20/10/2026 (11:00 – 15:00)</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COL 2: KHÁM PHÁ (3 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 flex flex-col space-y-3.5">
            <span className="font-sans text-xs text-sky-200/90 uppercase tracking-wider font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Khám phá
            </span>
            <ul className="space-y-2.5">
              {navLinks.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.href}
                    className="text-xs text-slate-300/75 hover:text-sky-200 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 font-sans"
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ======================================================== */}
          {/* COL 3: DỊCH VỤ & HỖ TRỢ (3 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 flex flex-col space-y-3.5">
            <span className="font-sans text-xs text-sky-200/90 uppercase tracking-wider font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Dịch vụ &amp; Hỗ trợ
            </span>
            <ul className="space-y-2.5">
              {serviceLinks.map((item, i) => (
                <li key={i}>
                  {item.isRoute ? (
                    <Link
                      href={item.href}
                      className="text-xs text-slate-300/75 hover:text-sky-200 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 font-sans"
                    >
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="text-xs text-slate-300/75 hover:text-sky-200 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 font-sans"
                    >
                      <span>{item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <div className="pt-2 text-[11px] text-slate-400 font-sans leading-relaxed">
              Mọi thắc mắc về đơn đặt trước hoặc workshop vui lòng ghé quầy trực tiếp tại Sảnh liên tầng lầu 1 hoặc lầu 3.
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* BOTTOM COPYRIGHT & META BAR */}
        {/* ======================================================== */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="text-center sm:text-left leading-relaxed">
            © 2026 K&amp;P Atelier — Dự án gây quỹ 20/10 bởi sinh viên FPT University TP. Hồ Chí Minh đồng hành cùng Sân Nhà Nhiều Chó.
          </p>
          <p className="text-xs text-slate-500 font-sans">
            Sảnh liên tầng lầu 1 &amp; lầu 3, FPT University TP. Hồ Chí Minh
          </p>
        </div>

      </div>
    </footer>
  );
}
