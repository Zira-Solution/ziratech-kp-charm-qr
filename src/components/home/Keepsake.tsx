"use client";

import React from "react";

export default function Keepsake() {
  const steps = [
    {
      num: "01",
      icon: "mark_email_read",
      title: "Nhận mã QR qua Email",
      desc: "Mã QR & mã thiệp số được gửi bảo mật về email",
    },
    {
      num: "02",
      icon: "lock_open",
      title: "Nhập mã PIN 4 số",
      desc: "Chỉ người nhận mới có chìa khóa mở thiệp riêng tư",
    },
    {
      num: "03",
      icon: "favorite",
      title: "Chạm vào thế giới kỷ niệm",
      desc: "Trang thiệp số đa phương tiện 1:1 mở ra trọn vẹn",
    },
  ];

  const features = [
    {
      icon: "history_edu",
      badge: "Bảo Mật Riêng Tư",
      title: "Bức Thư Tay & Tâm Tình",
      desc: "Những dòng tâm sự chân thành được gửi gắm qua từng trang thư với phông chữ mỹ thuật thanh nhã, chất giấy hoài niệm và dấu niêm phong bảo mật.",
      tags: ["Mã PIN 4 số", "Chất giấy hoài niệm", "Dấu niêm phong"],
    },
    {
      icon: "graphic_eq",
      badge: "Phát Tự Động",
      title: "Giai Điệu Kỷ Niệm",
      desc: "Bài hát ý nghĩa của hai người tự động ngân vang ngay khi mở thiệp. Hỗ trợ nhạc nền mộc mạc tuyển chọn hoặc liên kết YouTube, Spotify yêu thích.",
      tags: ["Nhạc nền tự động", "YouTube & Spotify", "Âm thanh Hi-Fi"],
    },
    {
      icon: "mic",
      badge: "Thu Âm Trực Tiếp",
      title: "Lời Nhắn Thoại (Voice)",
      desc: "Thu âm trực tiếp lời chúc thì thầm bằng chất giọng thân thương để người ấy có thể lắng nghe bất kỳ khi nào nhớ bạn.",
      tags: ["Thu âm trực tiếp", "Lưu trữ giọng nói", "Lắng nghe mọi lúc"],
    },
    {
      icon: "photo_library",
      badge: "Tối Đa 6 Ảnh",
      title: "Album Ảnh Polaroid",
      desc: "Những chuyến đi, nụ cười rạng rỡ và khoảnh khắc thanh xuân được lưu lại trong khung ảnh Polaroid hoài niệm, chạm lướt mượt mà.",
      tags: ["Khung ảnh Polaroid", "Chạm lướt xem ảnh", "Lưu giữ vĩnh viễn"],
    },
  ];

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="keepsake">
      {/* Ambient soft glow background */}
      <div className="absolute top-1/4 -left-36 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-36 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-rose-200/80 text-[#721a28] font-sans text-xs font-bold mb-4 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">
              auto_awesome
            </span>
            <span>CÔNG NGHỆ QUÀ TẶNG SỐ 20/10</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight font-bold leading-tight">
            Nhận Mã QR Qua Email — Chạm Vào Thế Giới Kỷ Niệm
          </h2>

          <p className="font-body text-base sm:text-lg text-on-surface-variant leading-relaxed mt-4 max-w-2xl mx-auto">
            Không cần cài đặt ứng dụng. Mã QR và mã thiệp số đa phương tiện 1:1 được gửi trực tiếp về email của bạn, nơi cất giữ trọn vẹn những tâm tư, âm thanh và khoảnh khắc đẹp nhất.
          </p>
        </div>

        {/* 3-Step Simple Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-rose-100/80 shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#721a28] to-[#8c2233] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-xs">
                {s.num}
              </div>
              <div className="min-w-0">
                <h3 className="font-headline text-sm font-bold text-primary truncate">
                  {s.title}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant truncate">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 2 Exclusive Sample Templates for Customers */}
        <div className="mb-14" id="keepsake-templates">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#721a28] text-xs font-bold mb-2">
              <span className="material-symbols-outlined text-[15px]">style</span>
              <span>BỘ SƯU TẬP THIỆP MẪU 20/10</span>
            </div>
            <h3 className="font-headline text-2xl sm:text-3xl text-primary font-bold">
              2 Phong Cách Thiệp Quà Số Cho Bạn Lựa Chọn
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-xl mx-auto">
              Chạm vào để trải nghiệm thực tế từng mẫu thiệp mẫu trước khi bạn tự tay viết thư và gửi trao.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Template 1: Storybook Hoàng Hôn */}
            <div className="rounded-[32px] p-6 sm:p-7 bg-white/95 backdrop-blur-xl border border-rose-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-5 border border-stone-200/60 shadow-inner group-hover:scale-[1.01] transition-transform">
                  <img
                    src="/thamkhao/sunset_couple_clean.jpg"
                    alt="Storybook Hoàng Hôn"
                    className="w-full h-full object-cover object-[center_35%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-[#721a28] font-sans text-xs font-bold shadow-xs backdrop-blur-md">
                    🌅 Mẫu 1 · 7 Trang Nghệ Thuật
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-serif font-bold text-lg leading-tight drop-shadow-md">Storybook Hoàng Hôn</p>
                    <p className="text-xs text-white/90 font-medium">Phong cách vintage mộc mạc, sâu lắng</p>
                  </div>
                </div>

                <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  Trọn vẹn 7 trang câu chuyện: mở hộp quà bí mật, bức thư tay giấy kẻ dòng với nét chữ tự gõ, album ảnh polaroid, video kỷ niệm, băng cassette xoay phát nhạc và lời nhắn giọng nói. Hỗ trợ tải trọn bộ file HTML xem offline vĩnh viễn.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {["7 Trang nghệ thuật", "Thư tay gõ chữ", "Băng cassette", "Album ảnh", "File HTML offline"].map((t, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-rose-50 border border-rose-100 text-[#721a28] text-[11px] font-medium">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-4 border-t border-rose-100/80">
                <a
                  href="/thamkhao?device=phone"
                  className="flex-1 py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-[#721a28] font-sans text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Xem thiệp mẫu</span>
                </a>
                <a
                  href="/gift"
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#721a28] hover:bg-[#5e131f] text-white font-sans text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">draw</span>
                  <span>Tự tạo mẫu này</span>
                </a>
              </div>
            </div>

            {/* Template 2: Hộp Quà Messenger */}
            <div className="rounded-[32px] p-6 sm:p-7 bg-white/95 backdrop-blur-xl border border-rose-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-5 border border-stone-200/60 shadow-inner group-hover:scale-[1.01] transition-transform">
                  <img
                    src="/images/default_lockscreen_girl.jpg"
                    alt="Hộp Quà Messenger"
                    className="w-full h-full object-cover object-[center_20%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-[#e11d48] font-sans text-xs font-bold shadow-xs backdrop-blur-md">
                    💬 Mẫu 2 · Khóa iPhone &amp; Chat
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-serif font-bold text-lg leading-tight drop-shadow-md">Hộp Quà Messenger</p>
                    <p className="text-xs text-white/90 font-medium">Bất ngờ ngọt ngào, hiện đại &amp; chân thành</p>
                  </div>
                </div>

                <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  Mô phỏng chân thực màn hình khóa iPhone 20/10 với mã PIN bảo mật, tin nhắn Messenger gõ từng bong bóng chat tâm tình, cuộn phim kỷ niệm trượt chậm hoài niệm, thư tay phong bì bí mật và tin nhắn thoại voice note.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {["Màn hình khóa iPhone", "Mã PIN bảo mật", "Tin nhắn Messenger", "Cuộn phim kỷ niệm", "Voice note"].map((t, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-pink-50 border border-pink-100 text-[#e11d48] text-[11px] font-medium">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-4 border-t border-rose-100/80">
                <a
                  href="/messenger"
                  className="flex-1 py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-[#e11d48] font-sans text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Xem thiệp mẫu</span>
                </a>
                <a
                  href="/gift"
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-sans text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">draw</span>
                  <span>Tự tạo mẫu này</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Clean Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[32px] p-6 sm:p-7 bg-linear-to-b from-white/95 to-[#fffbf9]/90 backdrop-blur-xl border border-rose-100/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Top Icon & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200/60 text-[#721a28] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-rose-100/70 transition-all duration-300">
                    <span className="material-symbols-outlined text-[26px]">
                      {item.icon}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100/60 text-[#721a28] font-sans text-[11px] font-bold">
                    {item.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-headline text-xl font-bold text-primary mb-2.5 leading-snug">
                  {item.title}
                </h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Feature Tags */}
              <div className="pt-5 mt-6 border-t border-rose-100/70 flex flex-wrap gap-1.5">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100/70 text-stone-600 text-[11px] font-medium font-sans"
                  >
                    <span className="material-symbols-outlined text-[12px] text-[#721a28]">
                      check
                    </span>
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
