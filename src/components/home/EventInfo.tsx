"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EVENT } from "@/config/event";

export default function EventInfo() {
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "K&P Atelier 20/10 — Gian Hàng Hoa Tươi & Vòng Charm Phygital"
  )}&dates=20261020T040000Z%2F20261020T080000Z&details=${encodeURIComponent(
    "Ghé gian hàng K&P Atelier tại Sảnh lầu 2, ĐH FPT (11:00 – 15:00) để nhận hoa, xỏ vòng charm và tham gia vòng quay may mắn gây quỹ Sân Nhà Nhiều Chó."
  )}&location=${encodeURIComponent("Sảnh lầu 2, Đại học FPT Hà Nội")}`;

  const copyLocation = () => {
    navigator.clipboard?.writeText("Sảnh lầu 2, Đại học FPT Hà Nội");
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2500);
  };

  const keyPasses = [
    {
      badge: "LỊCH HẸN DUY NHẤT",
      status: "✦ 20 Tháng 10",
      icon: "calendar_month",
      iconColor: "from-rose-500 to-rose-600 text-white",
      highlight: "Thứ Ba, 20/10/2026",
      desc: "Ngày Phụ Nữ Việt Nam — Duy nhất một ngày hội quà tặng rực rỡ tại khuôn viên trường.",
      meta: "Đang mở đặt trước hoa & vòng",
      borderColor: "border-rose-200/80 hover:border-rose-300",
      accentBg: "from-rose-500/10 via-transparent to-transparent",
    },
    {
      badge: "KHUNG GIỜ PHỤC VỤ",
      status: "✦ 11:00 – 15:00",
      icon: "schedule",
      iconColor: "from-amber-500 to-amber-600 text-white",
      highlight: "11:00 – 15:00",
      desc: "Khung giờ hoạt động chính thức đón tiếp bạn tại gian hàng trong ngày 20/10.",
      meta: "Khung giờ vàng 11h – 15h • Nhận hoa theo hẹn",
      borderColor: "border-amber-200/80 hover:border-amber-300",
      accentBg: "from-amber-500/10 via-transparent to-transparent",
    },
    {
      badge: "TỌA ĐỘ GIAN HÀNG",
      status: "✦ Sảnh Lầu 2",
      icon: "storefront",
      iconColor: "from-emerald-500 to-emerald-600 text-white",
      highlight: "Sảnh Lầu 2 — ĐH FPT",
      desc: "FPT University Hà Nội — Sảnh lầu 2 thoáng đãng, ngập tràn hoa tươi và bàn làm vòng charm.",
      meta: "Dễ tìm • Check-in nhận hoa & quà",
      borderColor: "border-emerald-200/80 hover:border-emerald-300",
      accentBg: "from-emerald-500/10 via-transparent to-transparent",
    },
  ];

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
            <span className="material-symbols-outlined text-[16px] text-rose-600">auto_awesome</span>
            <span>ĐIỂM HẸN YÊU THƯƠNG • 20/10 NÀY</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl text-[#721a28] tracking-tight font-bold">
            Ghé Thăm Gian Hàng K&amp;P Atelier Tại FPTU
          </h2>

          <p className="font-body text-sm sm:text-base text-stone-600 leading-relaxed mt-4 max-w-2xl mx-auto">
            Không chỉ là điểm nhận hoa và vòng charm, K&amp;P Atelier mang đến một góc nhỏ bình yên giữa giảng đường: nơi bạn tự tay xỏ từng hạt charm kỷ niệm, lắng nghe giai điệu yêu thương và cùng chung tay gây quỹ cho trạm cứu hộ động vật.
          </p>
        </div>

        {/* 3 Luxury Event Pass Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-10">
          {keyPasses.map((pass, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-6 sm:p-7 bg-white/80 backdrop-blur-xl border ${pass.borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(114,26,40,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden`}
            >
              {/* Subtle inner top glow */}
              <div
                className={`absolute top-0 inset-x-0 h-28 bg-linear-to-b ${pass.accentBg} pointer-events-none`}
              />

              <div>
                {/* Header Row: Label & Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-stone-500">
                    {pass.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-[#721a28] font-sans text-[11px] font-semibold border border-stone-200/60 shadow-2xs">
                    {pass.status}
                  </span>
                </div>

                {/* Icon & Big Value */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-linear-to-br ${pass.iconColor} shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{pass.icon}</span>
                  </div>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#721a28] leading-tight">
                    {pass.highlight}
                  </h3>
                </div>

                {/* Description */}
                <p className="font-body text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  {pass.desc}
                </p>
              </div>

              {/* Bottom Meta Pill */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                <span className="flex items-center gap-1 text-[#721a28]">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  {pass.meta}
                </span>
                <span className="text-stone-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* 4 Booth Activities Spotlight */}
        <div className="relative z-10 pt-8 border-t border-rose-100/80 mb-8">
          <div className="text-center mb-6">
            <h4 className="font-headline text-lg sm:text-xl font-bold text-[#721a28] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[20px]">sparkles</span>
              <span>4 Trải Nghiệm Bạn Không Thể Bỏ Lỡ Tại Gian Hàng</span>
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
            <span>Thêm Lịch Nhắc 20/10 (Google Calendar)</span>
          </a>

          {/* Directions / Map Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowDirectionsModal(true)}
            className="px-5 py-3 rounded-full bg-white/90 hover:bg-white text-stone-800 font-sans text-xs sm:text-sm font-bold shadow-sm hover:shadow-md border border-stone-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-600">map</span>
            <span>Chỉ Đường Đến Sảnh Lầu 2</span>
          </button>

          {/* Preorder Scroll */}
          <Link
            href="#preorder"
            className="px-5 py-3 rounded-full bg-rose-50 hover:bg-rose-100 text-[#721a28] font-sans text-xs sm:text-sm font-bold border border-rose-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Đặt Hoa Giữ Chỗ Ngay</span>
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
                    Lối Đi Đến Booth K&amp;P Atelier
                  </h3>
                  <p className="font-sans text-xs text-stone-500">Sảnh Lầu 2 — Toà Nhà Alpha, ĐH FPT</p>
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
                  1
                </span>
                <div>
                  <strong className="text-stone-800 block mb-0.5">Bước vào sảnh chính Toà nhà Alpha</strong>
                  Đi qua cửa chính sảnh Alpha, bạn sẽ thấy khu vực thông tầng và cầu thang bộ trung tâm.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="w-6 h-6 rounded-full bg-[#721a28] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-stone-800 block mb-0.5">Di chuyển lên Lầu 2</strong>
                  Đi thang máy hoặc thang bộ trung tâm lên tầng 2 (khu vực hành lang mở nhìn xuống sảnh trệt).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#721a28] block mb-0.5">Nhận diện Booth K&amp;P Atelier</strong>
                  Gian hàng nổi bật với tông màu hồng pastel, ngập tràn hoa tươi, bàn xỏ charm và backdrop check-in xinh xắn.
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
