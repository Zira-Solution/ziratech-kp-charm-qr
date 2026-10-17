"use client";

import React, { useState } from "react";
import { EVENT, EVENT_SCHEDULE } from "@/config/event";

export default function EventInfo() {
  const [activeDayIdx, setActiveDayIdx] = useState(2); // Default to 20/10 (Index 2)

  const highlights = [
    {
      icon: "local_florist",
      title: "Nhận hoa tươi đặt trước",
      desc: "Hoa tươi nguyên form tuyển chọn kỹ càng, kèm mã QR thiệp số gửi qua email.",
    },
    {
      icon: "handyman",
      title: "Workshop xỏ charm tự tay",
      desc: "Hàng trăm hạt charm thủy tinh lấp lánh, hoa pha lê và đá phong thủy độc bản.",
    },
    {
      icon: "redeem",
      title: "Kỷ vật ấm áp mang về",
      desc: "100% người ghé quầy nhận quà tri ân và kỷ vật thủ công lưu niệm 20/10.",
    },
    {
      icon: "pets",
      title: "Góp yêu thương về trạm",
      desc: "100% lợi nhuận dự án được chuyển thẳng về trạm cứu trợ Sân Nhà Nhiều Chó.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24 relative" id="event">
      {/* Outer Glow Wrapper */}
      <div className="relative rounded-[40px] p-6 sm:p-10 lg:p-12 overflow-hidden bg-linear-to-b from-white/90 via-white/80 to-rose-50/50 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_rgba(114,26,40,0.08)]">
        {/* Soft Ambient Light Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-[#721a28] font-sans text-xs font-bold mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="material-symbols-outlined text-[16px] text-rose-600">calendar_month</span>
            <span>CHUỖI NGÀY HỘI 17/10 – 20/10/2026 • ĐẠI HỌC FPT TP.HCM</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl text-[#721a28] tracking-tight font-bold">
            Chuỗi Hoạt Động &amp; Gian Hàng K&amp;P Atelier
          </h2>

          <p className="font-body text-sm sm:text-base text-stone-600 leading-relaxed mt-4 max-w-2xl mx-auto">
            Không chỉ gói gọn trong một ngày, gian hàng phục vụ sinh viên FPTU xuyên suốt <strong>3 buổi ngày hội</strong> tại Sảnh liên tầng lầu 1 &amp; lầu 3 với workshop xỏ charm thủ công, trạm hoa tươi và trao gửi quà tặng số ý nghĩa.
          </p>
        </div>

        {/* ======================================================== */}
        {/* CUTE ILLUSTRATED TIMELINE BANNER (Exact Style from User) */}
        {/* ======================================================== */}
        <div className="relative z-10 max-w-3xl mx-auto mb-10 rounded-[32px] p-6 sm:p-7 bg-[#ffd8de] border-2 border-[#fbbacf] shadow-[0_10px_30px_rgba(244,63,94,0.14)] overflow-hidden">
          {/* Top-Right Decorative Swirl Doodle */}
          <div className="absolute top-2 right-8 select-none pointer-events-none text-stone-800 opacity-75">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4C8 4 6 7 6 10c0 4 5 7 10 7s4-3 4-6-3-6-8-6c-3 0-5 2-5 5" />
            </svg>
          </div>
          {/* Bottom-Left Pink Corner with Yellow Dot */}
          <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-[#ff758f] pointer-events-none flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-[#fef08a] translate-x-3 -translate-y-3 shadow-2xs" />
          </div>
          {/* Bottom-Right Playful Orange Doodle */}
          <div className="absolute -bottom-3 -right-2 w-14 h-12 bg-[#fb923c] rounded-t-full pointer-events-none opacity-90" />

          {/* Stepper Content */}
          <div className="relative z-10 flex items-center justify-between max-w-2xl mx-auto px-2 sm:px-6">
            {/* Step 1: 17 / 10 */}
            <button
              type="button"
              onClick={() => setActiveDayIdx(0)}
              className={`flex flex-col items-center text-center transition-all cursor-pointer p-2 rounded-2xl ${
                activeDayIdx === 0 ? "scale-105 bg-white/50 ring-2 ring-[#0284c7]/40 shadow-xs" : "hover:scale-105"
              }`}
            >
              <span className="font-handwriting font-bold text-2xl sm:text-4xl text-[#0284c7] tracking-wider leading-none">
                17 / 10
              </span>
              <span className="font-sans font-bold text-xs sm:text-[15px] text-[#262626] mt-2 leading-tight">
                Sảnh liên<br />tầng lầu 1
              </span>
            </button>

            {/* Connecting Line 1 */}
            <div className="flex-1 mx-2 sm:mx-6 h-1 bg-[#0284c7] rounded-full" />

            {/* Step 2: 19 / 10 */}
            <button
              type="button"
              onClick={() => setActiveDayIdx(1)}
              className={`flex flex-col items-center text-center transition-all cursor-pointer p-2 rounded-2xl ${
                activeDayIdx === 1 ? "scale-105 bg-white/50 ring-2 ring-[#0284c7]/40 shadow-xs" : "hover:scale-105"
              }`}
            >
              <span className="font-handwriting font-bold text-2xl sm:text-4xl text-[#0284c7] tracking-wider leading-none">
                19 / 10
              </span>
              <span className="font-sans font-bold text-xs sm:text-[15px] text-[#262626] mt-2 leading-tight">
                Sảnh liên<br />tầng lầu 1
              </span>
            </button>

            {/* Connecting Line 2 */}
            <div className="flex-1 mx-2 sm:mx-6 h-1 bg-[#0284c7] rounded-full" />

            {/* Step 3: 20 / 10 */}
            <button
              type="button"
              onClick={() => setActiveDayIdx(2)}
              className={`flex flex-col items-center text-center transition-all cursor-pointer p-2 rounded-2xl ${
                activeDayIdx === 2 ? "scale-105 bg-white/50 ring-2 ring-[#0284c7]/40 shadow-xs" : "hover:scale-105"
              }`}
            >
              <span className="font-handwriting font-bold text-2xl sm:text-4xl text-[#0284c7] tracking-wider leading-none">
                20 / 10
              </span>
              <span className="font-sans font-bold text-xs sm:text-[15px] text-[#262626] mt-2 leading-tight">
                Sảnh liên<br />tầng lầu 3
              </span>
            </button>
          </div>
        </div>


        {/* Asymmetric 2-Column Luxury Showcase */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT: GRAND 20/10 SHOWCASE CARD (5 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 rounded-[36px] p-6 sm:p-8 bg-linear-to-b from-white/95 via-rose-50/70 to-[#fff4f0]/85 backdrop-blur-2xl border border-rose-200/90 shadow-liquid-card flex flex-col justify-between relative overflow-hidden group">
            {/* Ambient accent */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-rose-300/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Highlight Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white text-xs font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[14px] text-amber-300">star</span>
                  <span>TÂM ĐIỂM NGÀY HỘI 20/10</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-rose-800 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                  11:00 – 15:00
                </span>
              </div>

              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-primary mb-2 leading-tight">
                Ngày Hội Trao Quà Chính Thức
              </h3>

              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 mb-6 font-sans">
                <span className="material-symbols-outlined text-[17px] text-[#721a28]">location_on</span>
                <span>Sảnh liên tầng lầu 3, Đại học FPT TP. Hồ Chí Minh</span>
              </div>

              {/* 4 Feature Highlights */}
              <div className="space-y-3.5 pt-2">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-rose-100/70 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/80 text-[#721a28] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-headline text-xs sm:text-sm font-bold text-stone-800 mb-0.5">
                        {item.title}
                      </h4>
                      <p className="font-body text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-6 pt-4 border-t border-rose-200/60 flex items-center gap-2 text-xs text-[#721a28] font-medium font-sans">
              <span className="material-symbols-outlined text-[17px] text-rose-600 shrink-0">info</span>
              <span>Ghé quầy từ 11:00 – 15:00 để nhận trọn vẹn quà tặng &amp; trải nghiệm tốt nhất.</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT: 3-DAY TIMELINE STEPPER (7 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="font-sans text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#721a28]">timeline</span>
                <span>LỊCH TRÌNH 3 BUỔI TẠI TRƯỜNG (11:00 – 15:00)</span>
              </span>
              <span className="text-xs text-stone-500 font-sans hidden sm:inline">
                Nhấp để xem chi tiết từng đợt
              </span>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-between">
              {EVENT_SCHEDULE.map((item, idx) => {
                const isSelected = activeDayIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveDayIdx(idx)}
                    className={`p-4 sm:p-5 rounded-3xl backdrop-blur-xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                      item.highlight
                        ? isSelected
                          ? "bg-linear-to-r from-rose-50/95 via-white/95 to-amber-50/80 border-rose-300 ring-2 ring-rose-400/40 shadow-md"
                          : "bg-white/80 border-rose-200 shadow-xs hover:border-rose-300"
                        : isSelected
                          ? "bg-white/95 border-rose-200/90 shadow-sm ring-1 ring-rose-300/30"
                          : "bg-white/65 border-stone-200/70 hover:bg-white/85 shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    {/* Left: Date & Day Badge */}
                    <div className="flex items-center gap-3.5 shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-sans shrink-0 transition-transform ${
                          item.highlight
                            ? "bg-linear-to-br from-[#721a28] to-[#8c2233] text-white shadow-xs"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                          {item.day.replace("Thứ ", "T")}
                        </span>
                        <span className="font-headline font-bold text-sm leading-none mt-0.5">
                          {item.date.slice(0, 5)}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline text-base font-bold text-stone-800">
                            {item.day}, {item.date}
                          </h4>
                          {item.highlight && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#721a28] text-[10px] font-bold uppercase tracking-wider">
                              Ngày chính
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-stone-500 mt-0.5">
                          {item.venue} • {item.hours}
                        </p>
                      </div>
                    </div>

                    {/* Right: Activity Summary */}
                    <div className="sm:text-right">
                      <span className="font-sans text-xs sm:text-sm font-semibold text-[#721a28] block">
                        {item.status}
                      </span>
                      <span className="text-[11px] text-stone-400 font-sans mt-0.5 inline-flex items-center gap-1 sm:justify-end">
                        <span className="material-symbols-outlined text-[13px]">
                          {item.highlight ? "celebration" : "storefront"}
                        </span>
                        <span>{item.highlight ? "Phát quà & Vòng quay" : "Workshop & Đặt trước"}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Helper Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs font-sans text-amber-900 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-600">notifications_active</span>
                <span>Địa điểm mở quầy: <strong>Sảnh liên tầng lầu 1 (17/10 &amp; 19/10) • Sảnh liên tầng lầu 3 (20/10), ĐH FPT TP.HCM</strong></span>
              </span>
              <a href="#preorder" className="font-bold text-[#721a28] hover:underline shrink-0 ml-2">
                Đặt giữ hoa ngay →
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
