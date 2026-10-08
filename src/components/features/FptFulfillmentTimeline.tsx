"use client";

import React from "react";

export default function FptFulfillmentTimeline() {
  const steps = [
    {
      num: "01",
      title: "Đặt Trước Trên Web (Pre-order)",
      subtitle: "Hạn chót: 23:59 ngày 18/10/2026",
      desc: "Tự phối charm hoặc chọn set sẵn. Chọn hình thức thẻ QR (In thẻ cứng trao tay hoặc Gửi mã qua Email).",
      icon: "app_registration",
      tag: "Bắt buộc trước 18/10",
    },
    {
      num: "02",
      title: "Nghệ Nhân FPT Chế Tác Thủ Công",
      subtitle: "Từ ngày 18/10 đến 19/10/2026",
      desc: "Từng chiếc vòng được xâu cẩn thận, in thẻ QR kèm mã ngắn 8 ký tự, ướp cánh hoa hồng khô và đóng hộp nhung thắt nơ.",
      icon: "precision_manufacturing",
      tag: "Chăm chút tỉ mỉ",
    },
    {
      num: "03",
      title: "Nhận Quà Duy Nhất Ngày 20/10",
      subtitle: "Tại khuôn viên Đại học FPT",
      desc: "Nhận tại Bàn phát quà sảnh trung tâm (Alpha / Beta / Gamma) hoặc giao tận phòng học/lớp theo khung giờ bạn đã chọn.",
      icon: "storefront",
      tag: "Độc quyền tại trường",
    },
    {
      num: "04",
      title: "Người Ấy Quét QR & Mở Quà Số",
      subtitle: "Kỷ niệm lưu giữ trọn đời",
      desc: "Nhập mã PIN 4 số (nếu có), nghe nhạc tự phát, xem ảnh Polaroid và voice note. Có thể tải bản offline HTML lưu giữ vĩnh viễn.",
      icon: "qr_code_scanner",
      tag: "Trải nghiệm Phygital",
    },
  ];

  return (
    <section id="fpt-fulfillment" className="w-full py-16 lg:py-24 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full liquid-glass-pill text-[#540114] text-xs font-semibold mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-[#934841]">school</span>
            Quy Trình Nhận Quà Tại Đại Học FPT
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#540114]">
            Hành Trình Trao Gửi Yêu Thương Ngày 20/10
          </h2>
          <p className="text-xs sm:text-sm text-[#564243] mt-2 leading-relaxed">
            K&amp;P Atelier chỉ phục vụ độc quyền trong khuôn viên Đại học FPT để đảm bảo từng món quà đến tay người nhận đúng giờ và chu đáo nhất.
          </p>
        </div>

        {/* 4 Steps Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-3xl liquid-glass-card flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl liquid-glass-pill text-[#540114] font-serif font-bold text-lg flex items-center justify-center border border-white/80 shadow-xs group-hover:scale-105 transition-transform">
                    {step.num}
                  </div>
                  <span className="px-3 py-1 rounded-full liquid-glass-pill text-[#934841] text-[10px] font-bold border border-white/70">
                    {step.tag}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#540114] mb-1">
                  {step.title}
                </h3>
                <span className="text-[11px] font-semibold text-[#934841] block mb-2">
                  {step.subtitle}
                </span>
                <p className="text-xs text-[#564243] leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/60 flex items-center gap-2 text-xs text-[#540114] font-semibold">
                <span className="material-symbols-outlined text-[18px] text-[#934841]">
                  {step.icon}
                </span>
                <span>K&amp;P Atelier FPT</span>
              </div>
            </div>
          ))}
        </div>

        {/* Callout Notice about Shipping Scope */}
        <div className="mt-10 p-6 rounded-3xl liquid-glass border-2 border-white/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <span className="material-symbols-outlined text-[#540114] text-[26px] shrink-0 mt-0.5">
              local_shipping
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#540114]">
                Quy định phạm vi giao nhận (Fulfillment Scope)
              </h4>
              <p className="text-xs text-[#564243] mt-0.5 leading-relaxed">
                Dự án không hỗ trợ ship ngoài trường FPT và tuyệt đối không thu thập địa chỉ nhà riêng nhằm đảm bảo quyền riêng tư. Mọi đơn hàng nhận trực tiếp tại sảnh hoặc giao trong khuôn viên trường ngày 20/10/2026.
              </p>
            </div>
          </div>

          <a
            href="#customizer-workspace"
            className="liquid-glass-btn-primary px-5 py-2.5 rounded-full text-white text-xs font-semibold whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            Đặt trước trước 18/10
          </a>
        </div>
      </div>
    </section>
  );
}
