"use client";

import React from "react";

interface HeaderProps {
  cartCount: number;
  onOpenPreorder: () => void;
  onOpenLookup?: () => void;
}

export default function Header({
  cartCount = 3,
  onOpenPreorder,
}: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 transition-all">
      {/* Top Banner with Liquid Sheen */}
      <div className="bg-[#721a28]/90 backdrop-blur-md text-white py-1.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 tracking-wide border-b border-white/20 shadow-xs relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none animate-liquid-shimmer" />
        <span className="material-symbols-outlined text-[15px] text-[#fea095]">favorite</span>
        <span>💌 20/10 Đang Đến Gần — Đặt trước 18/10 để nhận thiệp viết tay &amp; giao hàng kịp ngày đặc biệt!</span>
        <span className="material-symbols-outlined text-[15px] text-[#fea095]">local_shipping</span>
      </div>

      {/* Main Navbar with Liquid Glass */}
      <div className="liquid-glass border-b border-white/70 shadow-[0_8px_32px_0_rgba(114,26,40,0.06)]">
        <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-1 rounded-2xl liquid-glass-pill shadow-xs">
              <img
                alt="Chérie Charm Studio Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtyN1p30L0Lvw7XYnqEC2_xpUaetdJLZWJW1NRBGmTRNvcIiCWTShB7ePAbWSj2a9D_MS9N5yhApAQ022Cz4ZFQBe3g5MZiofZbjveNQKJ3ghtvuMTB2chpAGJYThlfHKAN49StTiKOy9zc7efqagCyp95miBhDyhQkjO2yevMVq_vyg1hJfi40q806dQJK1AiG18wPI54kVWk3gFuDkDaIU2VGgXPDOC9gceKZQHLIzM-LeJKSsacxA"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl text-[#540114] leading-tight font-bold tracking-tight">
                K&amp;P
              </span>
              <span className="text-[10px] text-[#934841] tracking-widest uppercase font-bold">
                Tiệm Vòng 20/10
              </span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-48 lg:w-60">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#897172] text-[18px]">
                search
              </span>
              <input
                className="liquid-glass-input w-full pl-9 pr-3 py-1.5 rounded-full text-xs text-[#221a18] placeholder:text-[#897172] focus:outline-none"
                placeholder="Tìm charm hoa, đá..."
                type="text"
              />
            </div>

            {/* Tạo vòng ngay CTA */}
            <a
              className="liquid-glass-btn-primary inline-flex items-center justify-center px-4 py-2 rounded-full text-white text-xs sm:text-sm font-semibold shadow-md"
              href="#customizer-workspace"
            >
              <span className="material-symbols-outlined text-[18px] mr-1">magic_button</span>
              Tạo vòng ngay
            </a>

            {/* Cart Bag button */}
            <button
              aria-label="Giỏ quà"
              onClick={onOpenPreorder}
              className="liquid-glass-btn-secondary relative p-2.5 rounded-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-[#540114]">shopping_bag</span>
              <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-[#721a28] to-[#934841] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white/60">
                {cartCount > 0 ? cartCount : 3}
              </span>
            </button>

            {/* Profile Avatar icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#540114] to-[#8e2436] flex items-center justify-center shrink-0 text-white shadow-xs border border-white/40">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

