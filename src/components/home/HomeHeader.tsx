"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  badge?: string;
  desc?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "#catalog",
    id: "catalog",
    label: "Bộ sưu tập",
    shortLabel: "Bộ sưu tập",
    icon: "diamond",
    desc: "Vòng charm thủ công & combo hoa tươi 20/10",
  },
  {
    href: "#workshop",
    id: "workshop",
    label: "Workshop",
    shortLabel: "Workshop",
    icon: "palette",
    desc: "Trải nghiệm tự tay kết vòng charm kỷ niệm",
  },
  {
    href: "#preorder",
    id: "preorder",
    label: "Đặt trước hoa",
    shortLabel: "Đặt trước",
    icon: "local_florist",
    desc: "Đặt sớm giữ trọn mẫu hoa độc quyền",
  },
  {
    href: "#keepsake",
    id: "keepsake",
    label: "Thiệp số 20/10",
    shortLabel: "Thiệp số",
    icon: "auto_stories",
    desc: "Thiệp số kỷ niệm đa phương tiện & bảo mật",
  },
  {
    href: "#shelter",
    id: "shelter",
    label: "Quỹ cứu trợ",
    shortLabel: "Cứu trợ",
    icon: "pets",
    desc: "100% lợi nhuận ủng hộ Sân Nhà Nhiều Chó",
  },
];

export default function HomeHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic scroll listener for frosted-glass elevation & active section spy
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);

      // Section spy
      const sections = ["hero", "catalog", "workshop", "preorder", "shelter", "keepsake"];
      const scrollPos = window.scrollY + 220;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "py-2.5 sm:py-3 px-4 sm:px-8 lg:px-12 bg-white/85 backdrop-blur-2xl border-b border-rose-200/60 shadow-[0_4px_25px_rgba(114,26,40,0.06)]"
            : "py-3.5 sm:py-4 px-4 sm:px-8 lg:px-12 bg-white/70 backdrop-blur-xl border-b border-rose-200/40 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 sm:gap-3 xl:gap-4 relative z-10">
          {/* Brand Logo */}
          <a
            href="#hero"
            className="flex items-center group shrink-0"
            aria-label="Về đầu trang K&P"
          >
            <img
              src="/images/logo_kp.png"
              alt="K&P Logo"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0"
            aria-label="Điều hướng chính"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative font-sans text-xs xl:text-[13px] font-medium px-2.5 xl:px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-primary font-semibold bg-white/90 shadow-xs border border-rose-100/80 backdrop-blur-md"
                      : "text-on-surface-variant hover:text-primary hover:bg-white/60 transition-colors"
                  }`}
                >
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="inline xl:hidden">{item.shortLabel}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Charity Donation Action Button */}
            <a
              href="#shelter"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-linear-to-r from-rose-50 via-white to-amber-50/80 border border-rose-200/90 text-[#721a28] font-sans text-xs font-semibold shadow-xs hover:shadow-md hover:border-rose-300 hover:scale-[1.03] transition-all whitespace-nowrap group"
              title="100% lợi nhuận ủng hộ trạm cứu hộ Sân Nhà Nhiều Chó"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-rose-500 group-hover:scale-110 transition-transform">
                pets
              </span>
              <span>Ủng hộ trạm cứu hộ</span>
            </a>

            {/* Primary Star CTA: Create Gift Card */}
            <Link
              href="/gift"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-full bg-linear-to-r from-[#721a28] via-[#8c2233] to-[#5e131f] text-white font-sans text-xs font-bold shadow-[0_4px_14px_rgba(114,26,40,0.26)] border border-white/25 hover:shadow-[0_6px_20px_rgba(114,26,40,0.36)] hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap"
              title="Dành cho người tặng: Thiết kế thiệp quà số với lời nhắn, ảnh polaroid & nhạc"
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-amber-200">
                auto_awesome
              </span>
              <span>Tạo thiệp quà</span>
            </Link>

            {/* Mobile / Tablet Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/70 hover:bg-white text-primary border border-white/90 shadow-xs transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu điều hướng"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Full Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex flex-col justify-start pt-20 px-4 pb-6 bg-black/30 backdrop-blur-md animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl rounded-3xl p-5 overflow-y-auto max-h-[85vh] flex flex-col gap-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-100/60">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/logo_icon_kp.png"
                  alt="Team K&P Logo"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">K&amp;P Atelier</h3>
                  <p className="font-sans text-[10px] text-secondary-dark uppercase font-semibold">
                    Quà Kỷ Niệm 20/10
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 text-primary hover:bg-rose-100 transition-colors"
                aria-label="Đóng menu"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="flex flex-col gap-1.5" aria-label="Menu điều hướng di động">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/70 border border-transparent hover:border-rose-100/60 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#721a28] group-hover:bg-[#721a28] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-sm text-primary">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-100 text-[#721a28] border border-rose-200/60">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.desc && (
                      <span className="font-sans text-xs text-on-surface-variant truncate">
                        {item.desc}
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-stone-400 text-[18px] group-hover:translate-x-0.5 transition-transform">
                    chevron_right
                  </span>
                </a>
              ))}
            </nav>

            {/* Quick Action Cards in Mobile Menu */}
            <div className="pt-2 border-t border-rose-100/60 flex flex-col gap-2">
              <Link
                href="/gift"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-xs font-bold shadow-md hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-200">
                  auto_awesome
                </span>
                <span>Tự tay tạo thiệp quà số ngay</span>
              </Link>

              <a
                href="#keepsake"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-rose-200/80 bg-white hover:bg-rose-50/50 text-primary font-sans text-xs font-semibold shadow-2xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-dark">
                  redeem
                </span>
                <span>Nhập mã thẻ để mở thiệp 3D</span>
              </a>

              {/* Charity Mission Banner */}
              <a
                href="#shelter"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50/80 border border-rose-100 text-left transition-all hover:bg-rose-100/70"
              >
                <div className="w-8 h-8 rounded-full bg-rose-200/70 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">pets</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-xs font-bold text-primary">
                    100% Lợi Nhuận Gây Quỹ
                  </span>
                  <span className="font-sans text-[11px] text-on-surface-variant">
                    Ủng hộ trạm cứu hộ động vật Sân Nhà Nhiều Chó
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

