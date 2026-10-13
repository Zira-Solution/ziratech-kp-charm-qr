"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  cartCount?: number;
  onOpenPreorder?: () => void;
  onOpenLookup?: () => void;
}

export default function Header({}: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 transition-all">
      {/* Top Banner with Liquid Sheen */}
      <div className="bg-primary/90 backdrop-blur-xl text-white py-2 px-4 text-center text-xs font-serif flex items-center justify-center gap-2 tracking-wide border-b border-white/20 shadow-xs relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none animate-liquid-shimmer" />
        <span className="material-symbols-outlined text-[15px] text-secondary-container">auto_awesome</span>
        <span className="font-medium">K&amp;P Atelier — Cổng Mở Thiệp Kỷ Niệm Số &amp; Trải Nghiệm Quà Tặng Phygital 20/10</span>
        <span className="material-symbols-outlined text-[15px] text-secondary-container">favorite</span>
      </div>

      {/* Main Navbar with Liquid Glass Floating Frame */}
      <div className="liquid-glass border-b border-white/80 shadow-[0_12px_36px_0_rgba(114,26,40,0.08)]">
        <div className="h-20 max-w-320 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="p-1.5 rounded-2xl liquid-glass-pill shadow-xs border border-white/90">
              <img
                alt="K&P Atelier Logo"
                className="h-8 w-auto object-contain drop-shadow-xs"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtyN1p30L0Lvw7XYnqEC2_xpUaetdJLZWJW1NRBGmTRNvcIiCWTShB7ePAbWSj2a9D_MS9N5yhApAQ022Cz4ZFQBe3g5MZiofZbjveNQKJ3ghtvuMTB2chpAGJYThlfHKAN49StTiKOy9zc7efqagCyp95miBhDyhQkjO2yevMVq_vyg1hJfi40q806dQJK1AiG18wPI54kVWk3gFuDkDaIU2VGgXPDOC9gceKZQHLIzM-LeJKSsacxA"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl text-primary leading-tight font-bold tracking-tight">
                K&amp;P Atelier
              </span>
              <span className="text-[10px] text-secondary tracking-widest uppercase font-semibold">
                Charm &amp; Quà Số 20/10
              </span>
            </div>
          </Link>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Link to Digital Gift Experience */}
            <a
              href="#digital-gift"
              className="hidden md:inline-flex liquid-glass-pill items-center justify-center px-3.5 py-2 rounded-full text-xs font-semibold text-primary border border-white/80 hover:bg-white transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] mr-1 text-secondary">auto_awesome</span>
              <span>Trải Nghiệm Thiệp Số</span>
            </a>

            {/* Link to Showroom */}
            <a
              href="#showroom"
              className="hidden sm:inline-flex liquid-glass-pill items-center justify-center px-3.5 py-2 rounded-full text-xs font-semibold text-primary border border-white/80 hover:bg-white transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] mr-1 text-secondary">palette</span>
              <span>Ý Nghĩa Vòng Charm</span>
            </a>

            {/* Mở Quà CTA (Dành cho người nhận quà) */}
            <Link
              href="/#hero"
              className="inline-flex liquid-glass-pill items-center justify-center px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full text-xs font-bold text-primary border border-white/90 hover:bg-white shadow-xs hover:scale-[1.02] transition-all cursor-pointer"
              title="Dành cho người nhận: Nhập mã thiệp và OTP xem thiệp để mở thiệp 3D"
            >
              <span className="material-symbols-outlined text-base mr-1 text-primary-container">card_giftcard</span>
              <span>Mở Quà 20/10</span>
            </Link>

            {/* Tự tạo thiệp CTA (Dành cho người mua quà) */}
            <Link
              href="/gift"
              className="inline-flex liquid-glass-btn-primary items-center justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:scale-[1.03] transition-all cursor-pointer"
              title="Dành cho người mua: Tự tay thiết kế thiệp quà số với OTP tạo thiệp nhận qua email"
            >
              <span className="material-symbols-outlined text-base mr-1 text-amber-300">brush</span>
              <span>Tạo Thiệp Quà</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

