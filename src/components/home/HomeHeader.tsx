"use client";

import React from "react";
import Link from "next/link";

const NAV = [
  { href: "#event", label: "Ngày & giờ", active: true },
  { href: "#catalog", label: "Bộ sưu tập" },
  { href: "#workshop", label: "Workshop" },
  { href: "#keepsake", label: "Mã quà tặng" },
  { href: "#preorder", label: "Đặt trước hoa" },
  { href: "#shelter", label: "Nhật ký cứu trợ" },
];

export default function HomeHeader() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl rounded-full px-4 sm:px-6 py-3 z-50 bg-white/60 backdrop-blur-2xl border border-white/80 shadow-glass-nav transition-all duration-300">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-3">
        {/* Brand */}
        <a className="flex items-center gap-3 group min-w-0" href="#hero">
          <div className="w-10 h-10 shrink-0 rounded-full bg-linear-to-br from-[#721a28] to-[#8c2233] text-white flex items-center justify-center font-headline text-lg font-bold shadow-pill border border-white/30 group-hover:scale-105 transition-transform">
            K&amp;P
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline text-lg text-primary tracking-tight font-bold leading-tight">K&amp;P Atelier</span>
            <span className="hidden sm:block font-sans text-[11px] text-secondary-dark tracking-wider uppercase font-semibold truncate">
              Xưởng quà tặng sinh viên FPTU
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-2" aria-label="Điều hướng chính">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                item.active
                  ? "text-primary font-sans text-sm font-semibold px-4 py-1.5 rounded-full bg-white/70 shadow-xs border border-white/80 backdrop-blur-md transition-all"
                  : "text-on-surface-variant font-sans text-sm font-medium hover:text-primary px-3 py-1.5 rounded-full hover:bg-white/60 hover:backdrop-blur-md transition-all"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="#keepsake"
            className="hidden md:flex items-center gap-1.5 text-primary font-sans text-xs font-semibold px-4 py-2 rounded-full border border-white/70 bg-white/50 backdrop-blur-md hover:bg-white/80 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary-dark">redeem</span>
            <span>Nhập mã quà tặng</span>
          </a>
          <a
            href="#shelter-donate"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-secondary/40 text-secondary-dark hover:border-secondary font-sans text-xs font-semibold bg-white/40 backdrop-blur-md hover:bg-white/70 transition-all"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary-dark">volunteer_activism</span>
            <span>Ủng hộ cứu trợ</span>
          </a>
          <Link
            href="/gift"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-xs font-bold shadow-pill border border-white/25 hover:from-[#5e131f] hover:to-[#721a28] active:scale-[0.98] transition-all"
            title="Dành cho người mua: soạn thiệp quà số bằng mã thiệp trên thẻ"
          >
            <span className="material-symbols-outlined text-[17px]">brush</span>
            <span>Tạo thiệp quà</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
