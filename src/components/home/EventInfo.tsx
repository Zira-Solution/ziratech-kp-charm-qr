"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EVENT, EVENT_SCHEDULE } from "@/config/event";

export default function EventInfo() {
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(3); // Default to 20/10 (day index 3)

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "K&P Atelier — Chuỗi Ngày Hội Quà Tặng 20/10 Tại ĐH FPT"
  )}&dates=20261016T020000Z%2F20261020T080000Z&details=${encodeURIComponent(
    "Chuỗi sự kiện K&P Atelier tại ĐH FPT từ 16/10 đến 20/10 (Sảnh lầu 1 & Sảnh lầu 2): Nhận hoa tươi, workshop xỏ vòng charm, và tham gia vòng quay may mắn gây quỹ Sân Nhà Nhiều Chó."
  )}&location=${encodeURIComponent("Sảnh lầu 2, Đại học FPT Hà Nội")}`;

  const copyLocation = () => {
    navigator.clipboard?.writeText("Sảnh lầu 2, Đại học FPT Hà Nội");
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2500);
  };

  const boothExperiences = [
    {
      icon: "local_florist",
      title: "Trạm Hoa & Thiệp Số Phygital",
      desc: "Nhận hoa tươi nguyên form chuẩn tuyển chọn kèm phong thư thiệp số quét QR nghe nhạc, xem ảnh và nghe giọng nói.",
      tag: "Hoa Tươi & QR",
    },
    {
      icon: "handyman",
      title: "Bàn Workshop Xỏ Charm Tự Tay",
      desc: "Hàng trăm hạt charm thủy tinh lấp lánh, hoa tulip pha lê và đá phong thủy để bạn tự tay kết nên món quà độc bản.",
      tag: "Trải Nghiệm DIY",
    },
    {
      icon: "casino",
      title: "Vòng Quay May Mắn 100% Trúng",
      desc: "Ghé gian hàng là có quà — 100% cơ hội rinh charm may mắn đính kèm, quà lưu niệm thủ công và voucher giảm giá.",
      tag: "100% Trúng Quà",
    },
    {
      icon: "pets",
      title: "Góp Yêu Thương Về Sân Nhà Nhiều Chó",
      desc: "Toàn bộ 100% lợi nhuận từ các sản phẩm được chuyển thẳng ủng hộ quỹ cứu trợ và thức ăn cho các bé cưng cơ nhỡ.",
      tag: "Gây Quỹ Ý Nghĩa",
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
            <span>CHUỖI NGÀY HỘI 16/10 – 20/10/2026 • ĐẠI HỌC FPT</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl text-[#721a28] tracking-tight font-bold">
            Chuỗi Hoạt Động K&amp;P Atelier (16/10 – 20/10)
          </h2>

          <p className="font-body text-sm sm:text-base text-stone-600 leading-relaxed mt-4 max-w-2xl mx-auto">
            Không chỉ gói gọn trong một ngày, gian hàng K&amp;P Atelier phục vụ sinh viên FPTU xuyên suốt <strong>4 ngày hội</strong> (16/10, 17/10, 19/10 và cao điểm 20/10) với các hoạt động workshop tự xỏ vòng, nhận đơn hoa tươi sớm và ngày hội trao quà chính thức.
          </p>
        </div>

        {/* 4-Day Schedule Grid */}
        <div className="relative z-10 mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="font-sans text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#721a28]">schedule</span>
              <span>LỊCH TRÌNH 4 ĐỢT HOẠT ĐỘNG TẠI TRƯỜNG</span>
            </span>
            <span className="text-xs text-[#721a28] font-semibold">
              ✦ Cao điểm ngày hội chính: Thứ Ba 20/10
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EVENT_SCHEDULE.map((item, idx) => {
              const isSelected = selectedDayIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`relative rounded-3xl p-5 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group ${
                    item.highlight
                      ? "bg-linear-to-b from-rose-50/90 via-white/95 to-amber-50/60 border-rose-300 shadow-[0_12px_30px_rgba(114,26,40,0.12)] hover:-translate-y-1.5 ring-2 ring-rose-400/30"
                      : "bg-white/80 border-stone-200/80 hover:border-rose-200 shadow-sm hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  {/* Top Highlight Badge for Main Day */}
                  {item.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white text-[10px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-amber-300">star</span>
                      <span>NGÀY HỘI CHÍNH 20/10</span>
                    </div>
                  )}

                  <div>
                    {/* Date and Weekday */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans text-xs font-bold text-stone-500">
                        {item.day}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.highlight
                            ? "bg-rose-100 text-[#721a28]"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {item.date}
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.highlight
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-stone-100 text-[#721a28]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">alarm</span>
                      </div>
                      <span className="font-headline text-lg sm:text-xl font-bold text-[#721a28]">
                        {item.hours}
                      </span>
                    </div>

                    {/* Venue Location */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-2">
                      <span className="material-symbols-outlined text-[16px] text-rose-600">location_on</span>
                      <span>{item.venue}</span>
                    </div>

                    {/* Activity Desc */}
                    <p className="font-body text-xs text-stone-600 leading-relaxed">
                      {item.status}
                    </p>
                  </div>

                  {/* Indicator bottom */}
                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-stone-500">
                      {item.highlight ? "✦ Phát hoa & quà" : "✦ Workshop & Đặt trước"}
                    </span>
                    <span className="material-symbols-outlined text-stone-400 group-hover:text-[#721a28] group-hover:translate-x-1 transition-all text-[16px]">
                      arrow_forward
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Booth Activities Spotlight */}
        <div className="relative z-10 pt-8 border-t border-rose-100/80 mb-8">
          <div className="text-center mb-6">
            <h4 className="font-headline text-lg sm:text-xl font-bold text-[#721a28] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[20px]">sparkles</span>
              <span>Trải Nghiệm Tại Các Buổi Hoạt Động Của Gian Hàng</span>
              <span className="material-symbols-outlined text-rose-500 text-[20px]">sparkles</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {boothExperiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white hover:border-rose-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                      <span className="material-symbols-outlined text-[18px]">{exp.icon}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                      {exp.tag}
                    </span>
                  </div>
                  <h5 className="font-headline text-sm font-bold text-stone-800 mb-1">{exp.title}</h5>
                  <p className="font-body text-xs text-stone-500 leading-relaxed">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          {/* Add to Google Calendar */}
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-full bg-[#721a28] hover:bg-[#5a1420] text-white font-sans text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            <span>Thêm Lịch Nhắc (16/10 – 20/10)</span>
          </a>

          {/* Directions / Map Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowDirectionsModal(true)}
            className="px-5 py-3 rounded-full bg-white/90 hover:bg-white text-stone-800 font-sans text-xs sm:text-sm font-bold shadow-sm hover:shadow-md border border-stone-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-600">map</span>
            <span>Chỉ Đường Đến Sảnh Lầu 1 &amp; Lầu 2</span>
          </button>

          {/* Preorder Scroll */}
          <Link
            href="#preorder"
            className="px-5 py-3 rounded-full bg-rose-50 hover:bg-rose-100 text-[#721a28] font-sans text-xs sm:text-sm font-bold border border-rose-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Đặt Hoa &amp; Vòng Giữ Chỗ</span>
          </Link>
        </div>
      </div>

      {/* Directions Modal */}
      {showDirectionsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDirectionsModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-100 flex flex-col gap-4 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">location_on</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-[#721a28]">
                    Vị Trí Gian Hàng K&amp;P Atelier
                  </h3>
                  <p className="font-sans text-xs text-stone-500">Đại học FPT Hà Nội</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Directions Step List */}
            <div className="space-y-3 font-body text-xs sm:text-sm text-stone-600 py-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="w-6 h-6 rounded-full bg-[#721a28] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  16/10
                </span>
                <div>
                  <strong className="text-stone-800 block mb-0.5">Thứ Sáu, 16/10: Sảnh Lầu 1 (09:00 – 15:00)</strong>
                  Gian hàng đặt tại khu vực sảnh trệt tầng 1, thuận tiện đón tiếp sinh viên ra vào toà nhà.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  17, 19, 20
                </span>
                <div>
                  <strong className="text-[#721a28] block mb-0.5">Thứ Bảy (17/10), Thứ Hai (19/10) &amp; Thứ Ba (20/10): Sảnh Lầu 2</strong>
                  Đi cầu thang bộ trung tâm hoặc thang máy lên tầng 2. Không gian rộng rãi, thoáng mát dành cho bàn workshop tự tay làm vòng charm và nhận hoa tươi.
                </div>
              </div>
            </div>

            {/* Copy Address Row & Footer */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={copyLocation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{copiedLocation ? "Đã sao chép địa chỉ!" : "Sao chép địa chỉ"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="py-2.5 px-6 rounded-xl bg-[#721a28] text-white font-sans text-xs font-bold hover:bg-[#5a1420] transition-colors cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
