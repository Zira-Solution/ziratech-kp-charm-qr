"use client";

import React from "react";

export default function HeroSection() {
  return (
    <section id="hero" className="relative w-full overflow-hidden pb-16 lg:pb-24 pt-6">
      {/* Ambient glowing liquid backdrop orbs */}
      <div className="absolute -top-16 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-[#ffdad6] to-[#fea095] opacity-50 blur-3xl pointer-events-none animate-liquid-float-slow" />
      <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-bl from-[#ffd6dc] to-[#fceae6] opacity-65 blur-3xl pointer-events-none animate-liquid-float-fast" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Text & Narrative */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-[#540114] mb-4 shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-[#934841]">sparkles</span>
              <span className="text-xs font-semibold tracking-wider">
                Bộ Sưu Tập Quà Tặng 20/10 • Dành Cho Người Đặc Biệt
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#540114] leading-[1.15] tracking-tight">
              Một chiếc vòng.<br />
              <span className="italic font-normal text-[#934841]">
                Một câu chuyện riêng.
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-sm sm:text-base text-[#564243] mt-4 max-w-lg leading-relaxed">
              Tự chọn charm, tự sáng tạo chiếc vòng tay thủ công mang trọn vẹn kỷ niệm ngọt ngào và tâm tư yêu thương gửi trao ngày Phụ nữ Việt Nam 20/10.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mt-8">
              <a
                className="liquid-glass-btn-primary inline-flex items-center justify-center px-6 py-3.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-md"
                href="#customizer-workspace"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">magic_button</span>
                Tự tạo vòng ngay ✨
              </a>
              <a
                className="liquid-glass-btn-secondary inline-flex items-center justify-center px-5 py-3.5 rounded-full text-[#540114] text-xs sm:text-sm font-semibold shadow-xs"
                href="#collections"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">redeem</span>
                Xem mẫu sẵn có 🎁
              </a>
            </div>

            {/* Micro Trust Elements - Liquid Glass Pill Containers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 pt-4 border-t border-white/60 w-full">
              <div className="liquid-glass-pill px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#540114] text-[20px] shrink-0">qr_code_2</span>
                <span className="text-xs text-[#564243] font-medium">Thẻ QR Quà Số độc quyền</span>
              </div>
              <div className="liquid-glass-pill px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#540114] text-[20px] shrink-0">pets</span>
                <span className="text-xs text-[#564243] font-medium">Góp bữa ăn cho Sân Nhà Nhiều Chó</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Liquid Glass Showcase Frame */}
            <div className="relative w-full max-w-[540px] aspect-square rounded-[36px] overflow-hidden p-3.5 liquid-glass border-2 border-white/80 shadow-[0_25px_60px_-15px_rgba(114,26,40,0.18)]">
              <img
                className="w-full h-full object-cover rounded-[28px] shadow-inner"
                alt="A delicate sterling silver and rose gold charm bracelet resting gently on a soft dusty rose silk ribbon"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0zrYtjLb6IKZUsol6k3qVysRnkSw7XvGZjOU6y45EHG3RULb85yh5nOqg8qZ9-hGuu1U_7bG65UtV4YkcmUNNwSJgwMr3z6ZBcCMbPUyt-3eOqeI2Jue7tSxAthO7uLICvJsIFmhthGb7iM-xw0d3vjHjHS5q6x3i02kgOy5FmJuVLydLXbXs09VHfaJPRfyHgI4xoA2gAlqFWq0ys0AZ8NdEyfyJ9yn98kQ0mQbb_-tVKlY_8Lu40A"
              />

              {/* Floating Interactive Liquid Glass Charm Badges */}
              <div className="absolute top-8 left-6 liquid-glass-pill px-3.5 py-2 rounded-full shadow-lg flex items-center gap-2 transform -rotate-2 hover:rotate-0 transition-transform duration-300 border border-white/80">
                <span className="material-symbols-outlined text-[#540114] text-[18px]">favorite</span>
                <span className="text-xs font-semibold text-[#540114]">Little Heart • Trọn Tình Yêu</span>
              </div>

              <div className="absolute bottom-16 left-8 liquid-glass-pill px-3.5 py-2 rounded-full shadow-lg flex items-center gap-2 transform rotate-3 hover:rotate-0 transition-transform duration-300 border border-white/80">
                <span className="material-symbols-outlined text-[#934841] text-[18px]">sunny</span>
                <span className="text-xs font-semibold text-[#221a18]">Sunflower • Tươi Sáng &amp; Rực Rỡ</span>
              </div>

              <div className="absolute top-12 right-6 liquid-glass-pill px-3.5 py-2 rounded-full shadow-lg flex items-center gap-2 transform rotate-2 hover:rotate-0 transition-transform duration-300 border border-white/80">
                <span className="material-symbols-outlined text-[#540114] text-[18px]">star</span>
                <span className="text-xs font-semibold text-[#540114]">Dreamy Star • Ánh Sáng Của Nhau</span>
              </div>

              <div className="absolute bottom-8 right-10 liquid-glass-btn-primary text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-transform duration-300 border border-white/40">
                <span className="material-symbols-outlined text-[18px]">loyalty</span>
                <span className="text-xs font-bold tracking-wide">Best Seller 20/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

