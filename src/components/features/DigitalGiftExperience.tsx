"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { musicPlayerSynth } from "../gift-templates/audio-helper";
import PhygitalSparkleCanvas from "./PhygitalSparkleCanvas";

export default function DigitalGiftExperience() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiTone, setAiTone] = useState<"romantic" | "friend" | "teacher">("romantic");
  const [enteredPin, setEnteredPin] = useState<string>("2010");
  const [isScanningLaser, setIsScanningLaser] = useState(false);
  const [hasUnboxed, setHasUnboxed] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);

  // 3D Mouse Parallax for the Real Product Showcase
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering3D, setIsHovering3D] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovering3D(false);
    setMousePos({ x: 0, y: 0 });
  };

  // 3D rotations based on mouse tracking
  const rotateX = isHovering3D ? -mousePos.y * 14 : 2;
  const rotateY = isHovering3D ? mousePos.x * 16 : -4;
  const glareX = 50 + mousePos.x * 60;
  const glareY = 50 + mousePos.y * 60;

  const isPinUnlocked = enteredPin === "2010";

  const toggleSound = () => {
    if (isPlayingAudio) {
      musicPlayerSynth.stop();
      setIsPlayingAudio(false);
    } else {
      musicPlayerSynth.play();
      setIsPlayingAudio(true);
    }
  };

  // Trigger 3D Laser Scan & Confetti Celebration
  const triggerLaserScanAndUnbox = () => {
    setIsScanningLaser(true);
    setBurstTrigger((prev) => prev + 1);

    setTimeout(() => {
      setIsScanningLaser(false);
      setHasUnboxed(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#721a28", "#ffd700", "#fea095", "#ff69b4", "#ffffff"],
      });
      if (!isPlayingAudio) {
        musicPlayerSynth.play();
        setIsPlayingAudio(true);
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      musicPlayerSynth.stop();
    };
  }, []);

  const aiMessages = {
    romantic:
      "Gửi người con gái luôn mang nụ cười rạng rỡ nhất. Chiếc vòng nhỏ này sẽ thay anh đồng hành cùng em qua mọi giờ học, và nhắc em nhớ rằng em luôn là điều dịu dàng nhất của mùa thu FPT.",
    friend:
      "Gửi bạn thân cùng chạy deadline! Cảm ơn vì đã luôn bao dung và chia nửa ly trà sữa những ngày ôn thi thâu đêm. Chúc bạn 20/10 mãi xinh đẹp, rạng rỡ và qua môn 10 điểm!",
    teacher:
      "Kính gửi Cô, nhân ngày 20/10, chúng em xin gửi trọn lòng tri ân sâu sắc nhất. Cảm ơn Cô vì những bài giảng tâm huyết và sự tận tụy đã luôn soi đường cho chúng em.",
  };

  return (
    <section
      id="digital-gift"
      className="scroll-mt-24 w-full py-16 sm:py-24 relative overflow-hidden bg-linear-to-b from-rose-cream via-blush-light to-surface-container border-y border-white/80"
    >
      {/* Ambient Atmospheric Glowing Orbs */}
      <div className="absolute top-10 left-8 w-144 h-144 bg-linear-to-tr from-rose-petal/60 to-secondary-container/40 rounded-full blur-[110px] pointer-events-none animate-liquid-float-slow" />
      <div className="absolute bottom-10 right-8 w-160 h-160 bg-linear-to-bl from-amber-200/50 to-rose-petal/60 rounded-full blur-[120px] pointer-events-none animate-liquid-float-fast" />

      <div className="max-w-330 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================= */}
        {/* SECTION HEADER: Editorial Luxury Atelier Title */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-primary text-xs font-semibold shadow-xs mb-4 transform hover:scale-105 transition-all border border-white/95">
            <span className="material-symbols-outlined text-base text-amber-500 animate-pulse">auto_awesome</span>
            <span className="tracking-widest uppercase font-serif text-[11px]">Linh Hồn Công Nghệ Phygital 20/10 • K&amp;P Atelier</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tight leading-[1.2]">
            Chiếc Vòng Trên Tay.<br />
            <span className="bg-linear-to-r from-primary-container via-rust to-secondary bg-clip-text text-transparent italic font-normal">
              Cả Bầu Trời Kỷ Niệm Trên Màn Hình.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-on-surface-variant mt-4 leading-relaxed max-w-2xl font-serif">
            Không chỉ là một món trang sức đơn thuần. Mỗi hộp quà chứa đựng <strong>chiếc vòng charm bạc thủ công thật</strong> đặt trên khay nhung đỏ Bordeaux, đi kèm <strong>thẻ VIP mạ vàng ép kim khắc mã QR bí mật</strong>. Khi người nhận mở camera điện thoại quét thẻ, trang kỷ niệm số độc bản sẽ bung mở ngay lập tức — <strong>hoàn toàn không cần cài đặt ứng dụng</strong>.
          </p>

          {/* 3 Core Experience Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 w-full max-w-3xl">
            <div className="p-3.5 rounded-2xl liquid-glass border border-white/90 shadow-xs flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                01
              </span>
              <div className="text-left">
                <span className="text-xs font-serif font-bold text-primary block">Trao Hộp Nhung Thật</span>
                <span className="text-[11px] text-on-surface-variant">Vòng charm Bạc Ý S925</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass border border-white/90 shadow-xs flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-secondary text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                02
              </span>
              <div className="text-left">
                <span className="text-xs font-serif font-bold text-secondary block">Quét Camera Thẻ QR</span>
                <span className="text-[11px] text-on-surface-variant">Mở ngay lập tức trên web</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass border border-white/90 shadow-xs flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-primary-container text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                03
              </span>
              <div className="text-left">
                <span className="text-xs font-serif font-bold text-primary-container block">Lưu Giữ Trọn Đời</span>
                <span className="text-[11px] text-on-surface-variant">Tải file HTML offline vĩnh viễn</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN SHOWCASE: 5 COMPACT HORIZONTAL CARDS CIRCLING 3D BRACELET */}
        {/* Tâm điểm: Chiếc Vòng 3D Lọc Nền */}
        {/* Vòng quanh: 5 Trải Nghiệm Kỷ Niệm (Card dài ngang, nhỏ gọn) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center relative">

          {/* ========================================================= */}
          {/* CỘT TRÁI (4 COLS): CARD 01 & CARD 02 (DÀI, NHỎ GỌN) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-3.5 order-2 lg:order-1">
            
            {/* FEATURE 01: Polaroid 3D Album */}
            <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass border border-white/90 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-primary-container to-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[19px]">photo_library</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-primary truncate">
                      01. Album Ảnh Polaroid 3D
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold liquid-glass-pill text-primary-container border border-white/80 shrink-0">
                      Tối đa 6 ảnh
                    </span>
                  </div>
                  <p className="text-[11.5px] sm:text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Khung Polaroid vintage dán washi tape. Chạm lật mặt sau 3D xem lời nhắn viết tay riêng tư.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-semibold text-secondary">
                    <span className="material-symbols-outlined text-[13px]">3d_rotation</span>
                    <span>Lật xoay 3D hai mặt • Nén ảnh &lt; 2MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURE 02: Voice Note Whisper */}
            <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass border border-white/90 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-rust to-secondary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[19px]">mic</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-primary truncate">
                      02. Voice Note Lời Thì Thầm
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold liquid-glass-pill text-primary-container border border-white/80 shrink-0">
                      Tối đa 02:00
                    </span>
                  </div>
                  <p className="text-[11.5px] sm:text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Thu âm lời nhắn chân thành. Cột sóng âm 15 vạch chuyển động theo từng nhịp thở xúc động.
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10.5px] sm:text-[11px] font-semibold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">graphic_eq</span>
                      Sóng âm nhịp điệu
                    </span>
                    <button
                      type="button"
                      onClick={toggleSound}
                      className="px-2.5 py-1 rounded-lg liquid-glass-btn-primary text-white text-[11px] font-serif font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isPlayingAudio ? "pause" : "play_arrow"}
                      </span>
                      <span>{isPlayingAudio ? "Tạm Dừng" : "Bấm Nghe Thử"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* CỘT GIỮA (4 COLS): TÂM ĐIỂM CHIẾC VÒNG 3D LỌC NỀN */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center order-1 lg:order-2">
            
            {/* THE CENTRAL 3D FLOATING BRACELET STAGE */}
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering3D(true)}
              onMouseLeave={handleMouseLeave}
              className="relative w-full rounded-3xl liquid-glass border-2 border-white/95 p-4 sm:p-5 shadow-[0_16px_45px_rgba(84,1,20,0.15)] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden min-h-72.5 sm:min-h-77.5"
              title="Rê chuột để nghiêng góc 3D của chiếc vòng"
            >
              {/* Three.js Real 3D Sparkle Particle Field Surrounding the Bracelet */}
              <PhygitalSparkleCanvas
                mouseX={mousePos.x}
                mouseY={mousePos.y}
                isHovered={isHovering3D}
                burstTrigger={burstTrigger}
              />

              {/* Radiant Luminous Ambient Glow Behind the Bracelet */}
              <div className="absolute inset-4 rounded-full bg-linear-to-tr from-amber-400/20 via-rust/20 to-rose-400/20 blur-2xl pointer-events-none animate-pulse" />

              {/* Orbital Ring Guidelines */}
              <div className="absolute inset-6 rounded-full border border-dashed border-secondary/20 pointer-events-none animate-spin-slow" />

              {/* Top Badge */}
              <div className="relative z-10 mb-1 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full liquid-glass-pill border border-white/95 shadow-xs text-primary text-[10.5px] font-serif font-bold">
                <span className="material-symbols-outlined text-sm text-amber-500 animate-spin-slow">3d_rotation</span>
                <span>Vòng Bạc Ý S925 Thật • 3D Lọc Nền</span>
              </div>

              {/* The 3D Floating Bracelet Image Container */}
              <div
                className="relative z-10 transition-transform duration-200 ease-out flex items-center justify-center my-auto py-1"
                style={{
                  transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
              >
                {/* Dynamic Specular Sheen Over Bracelet */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-full z-20 opacity-35 mix-blend-overlay"
                  style={{
                    background: `radial-gradient(circle 240px at ${glareX}% ${glareY}%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)`,
                  }}
                />

                {/* Laser Scan Animation Line */}
                {isScanningLaser && (
                  <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-400/70 to-transparent animate-laser-scan pointer-events-none z-30 rounded-full" />
                )}

                {/* Transformed Transparent PNG */}
                <img
                  src="/images/charm_bracelet_3d_transparent.png"
                  alt="Chiếc vòng charm Bạc Ý S925 3D lọc nền độc bản K&P Atelier"
                  className="w-50 sm:w-55 aspect-square object-contain filter drop-shadow-[0_16px_30px_rgba(84,1,20,0.28)] animate-liquid-float-slow select-none pointer-events-none"
                />
              </div>

              {/* Floating Shadow Under the Bracelet */}
              <div className="w-36 h-3 bg-primary/15 rounded-full blur-md mx-auto -mt-1 mb-2 pointer-events-none" />

              {/* Action Button: Laser Scan & Confetti */}
              <button
                type="button"
                onClick={triggerLaserScanAndUnbox}
                className="relative z-10 px-3.5 py-1.5 rounded-full liquid-glass-btn-primary text-white text-[11px] font-serif font-bold flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-amber-300">qr_code_scanner</span>
                <span>{hasUnboxed ? "Đã Chiếu Laser 3D ✨" : "Bấm Quét Laser Thử Nghiệm"}</span>
              </button>
            </div>

          </div>

          {/* ========================================================= */}
          {/* CỘT PHẢI (4 COLS): CARD 03 & CARD 04 (DÀI, NHỎ GỌN) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-3.5 order-3">
            
            {/* FEATURE 03: Vinyl Record & Autumn Melodies */}
            <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass border border-white/90 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-ocean-depth to-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[19px]">album</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-primary truncate">
                      03. Đĩa Than Vinyl &amp; Giai Điệu
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold liquid-glass-pill text-primary-container border border-white/80 shrink-0">
                      MP3 Tự Động
                    </span>
                  </div>
                  <p className="text-[11.5px] sm:text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Đĩa than xoay tròn du dương khi mở thiệp. Tích hợp nhạc nền êm dịu và tải trực tiếp MP3.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-semibold text-secondary">
                    <span className="material-symbols-outlined text-[13px]">music_note</span>
                    <span>Phát tự động khi mở • Tải file MP3 về máy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURE 04: AI Floral Letter Assistant */}
            <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass border border-white/90 shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-primary to-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-primary truncate">
                      04. Thư Hoa Khô &amp; Trợ Lý AI
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold liquid-glass-pill text-primary-container border border-white/80 shrink-0">
                      3 Văn Phong
                    </span>
                  </div>
                  <p className="text-[11.5px] sm:text-xs text-on-surface-variant mt-1 leading-relaxed">
                    AI gợi ý lời chúc chân thành chuẩn gu trên nền giấy hoa khô vintage trang nhã.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-primary font-medium">Văn phong:</span>
                    {(["romantic", "friend", "teacher"] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setAiTone(tone)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-serif font-bold transition-all cursor-pointer ${
                          aiTone === tone
                            ? "bg-primary text-white shadow-xs"
                            : "liquid-glass-pill text-primary border border-white/80 hover:bg-white"
                        }`}
                      >
                        {tone === "romantic" ? "Người Yêu" : tone === "friend" ? "Bạn Thân" : "Thầy Cô"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* CARD 05: DOCKED RIGHT BELOW THE CENTRAL BRACELET (DÀI, NHỎ GỌN) */}
        {/* ========================================================= */}
        <div className="max-w-lg mx-auto mt-4 sm:mt-5">
          <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass border border-white/90 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-primary-container to-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[19px]">lock</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-primary truncate">
                    05. Mã PIN 4 Số &amp; File HTML Trọn Đời
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold liquid-glass-pill text-primary-container border border-white/80 shrink-0">
                    Bảo Mật Cao
                  </span>
                </div>
                <p className="text-[11.5px] sm:text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Cài mã PIN 4 số chống xem lén. Xuất toàn bộ thiệp thành file HTML lưu vĩnh viễn offline.
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">download_done</span>
                    Lưu offline vĩnh viễn
                  </span>
                  <Link
                    href="/g/KP-2010-DEMO"
                    className="text-[11px] font-serif font-bold text-primary hover:underline flex items-center gap-0.5"
                  >
                    <span>Xem thiệp mẫu</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
