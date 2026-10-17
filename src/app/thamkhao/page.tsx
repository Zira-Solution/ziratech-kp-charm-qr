"use client";

import React, { useState } from "react";
import Link from "next/link";
import StorybookSunsetTemplate from "@/components/gift-templates/StorybookSunsetTemplate";

export default function ThamKhaoPage() {
  const [activeSlide, setActiveSlide] = useState(1);
  const [isPhoneMode, setIsPhoneMode] = useState(true);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f9ece6] via-[#f7e3da] to-[#ecd0c5] flex flex-col items-center justify-between py-4 px-2 sm:px-6 relative text-[#2e1d1b]">
      {/* Top Floating Bar */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between gap-3 p-3 rounded-full bg-white/80 backdrop-blur-xl border border-white/90 shadow-md mb-4 z-30">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-[#6b4737] font-sans text-xs font-bold transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Trang chủ</span>
        </Link>

        {/* Quick Slide Selector */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveSlide(s)}
              className={`w-7 h-7 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSlide === s
                  ? "bg-[#c13d28] text-white shadow-sm scale-105"
                  : "bg-white/80 hover:bg-white text-[#6b4737] border border-[#ebdccd]"
              }`}
            >
              0{s}
            </button>
          ))}
        </div>

        {/* Device toggle on desktop */}
        <button
          type="button"
          onClick={() => setIsPhoneMode(!isPhoneMode)}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-[#6b4737] font-sans text-xs font-bold transition-all"
          title="Chuyển chế độ khung điện thoại"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isPhoneMode ? "smartphone" : "crop_free"}
          </span>
          <span>{isPhoneMode ? "Khung ĐT" : "Toàn màn hình"}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center relative z-20">
        <div
          className={`w-full transition-all duration-300 ${
            isPhoneMode
              ? "max-w-[380px] p-2 sm:p-2.5 bg-stone-900 rounded-[44px] shadow-[0_25px_70px_rgba(107,71,55,0.35)] border-4 border-stone-800"
              : "max-w-md"
          }`}
        >
          {/* Phone Dynamic Island / Speaker notch */}
          {isPhoneMode && (
            <div className="hidden sm:flex justify-center pb-2 pt-1">
              <div className="w-24 h-4 bg-black rounded-full" />
            </div>
          )}

          <StorybookSunsetTemplate
            activeSlide={activeSlide}
            onGoToSlide={(s) => setActiveSlide(s)}
            onNextSlide={() => setActiveSlide((prev) => Math.min(7, prev + 1))}
            onPrevSlide={() => setActiveSlide((prev) => Math.max(1, prev - 1))}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center py-2 text-xs text-[#8c4b3e] font-sans z-10 opacity-80">
        Bản dựng 1:1 theo mẫu thiết kế 7 khung hình trong thư mục <strong>thamkhao</strong> • K&amp;P Atelier
      </footer>
    </div>
  );
}
