"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export interface PrizeItem {
  id: number;
  name: string;
  badge: string;
  emoji: string;
  color: string;
  textColor: string;
  tagColor: string;
  description: string;
}

export const PRIZES: PrizeItem[] = [
  {
    id: 0,
    name: "Charm Bạc 925",
    badge: "Giải Nhất",
    emoji: "💍",
    color: "#721a28",
    textColor: "#ffffff",
    tagColor: "bg-rose-500/25 text-rose-200 border-rose-400/30",
    description: "Charm bạc S925 nguyên chất tinh xảo để xâu vào vòng tay kỷ vật.",
  },
  {
    id: 1,
    name: "Hoa Nhập K&P",
    badge: "Đặc Biệt",
    emoji: "🌸",
    color: "#fff5f2",
    textColor: "#540114",
    tagColor: "bg-amber-500/25 text-amber-200 border-amber-400/30",
    description: "Bó hoa tươi nhập khẩu cao cấp phối màu độc quyền từ K&P Atelier.",
  },
  {
    id: 2,
    name: "Hộp Blindbox",
    badge: "Bí Mật 20/10",
    emoji: "🎁",
    color: "#934841",
    textColor: "#ffffff",
    tagColor: "bg-purple-500/25 text-purple-200 border-purple-400/30",
    description: "Hộp quà bí ẩn chứa mẫu charm phiên bản giới hạn bất ngờ.",
  },
  {
    id: 3,
    name: "Voucher 50K",
    badge: "Ưu Đãi",
    emoji: "🎟️",
    color: "#ffe5df",
    textColor: "#540114",
    tagColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/30",
    description: "Phiếu giảm giá trực tiếp 50.000đ khi mua hoa hoặc phụ kiện tại quầy.",
  },
  {
    id: 4,
    name: "Thiệp Ép Kim",
    badge: "Kỷ Vật",
    emoji: "💌",
    color: "#540114",
    textColor: "#ffffff",
    tagColor: "bg-rose-500/25 text-rose-200 border-rose-400/30",
    description: "Set thiệp giấy mỹ thuật dập kim thủ công kèm phong bì niêm sáp sang trọng.",
  },
  {
    id: 5,
    name: "Charm May Mắn",
    badge: "Bản Giới Hạn",
    emoji: "✨",
    color: "#fff5f2",
    textColor: "#540114",
    tagColor: "bg-amber-500/25 text-amber-200 border-amber-400/30",
    description: "Mẫu charm may mắn đính đá pha lê lấp lánh dành riêng cho ngày 20/10.",
  },
  {
    id: 6,
    name: "Cốc Sứ Kỷ Niệm",
    badge: "Quà Tặng",
    emoji: "☕",
    color: "#b84f45",
    textColor: "#ffffff",
    tagColor: "bg-sky-500/25 text-sky-200 border-sky-400/30",
    description: "Ly gốm sứ tráng men cao cấp in biểu tượng K&P Atelier xinh xắn.",
  },
  {
    id: 7,
    name: "Ruy Băng Lụa",
    badge: "Phụ Kiện",
    emoji: "🎀",
    color: "#fae8e5",
    textColor: "#540114",
    tagColor: "bg-pink-500/25 text-pink-200 border-pink-400/30",
    description: "Set ruy băng nhung lụa & sticker nghệ thuật gói hộp quà kỷ niệm.",
  },
];

export default function LuckyWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<PrizeItem | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<PrizeItem | null>(null);
  const [spinCount, setSpinCount] = useState(0);

  // Countdown timer to 20/10/2026 08:00 AM (UTC+7)
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 15, minutes: 20, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  const wheelRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    const target = new Date("2026-10-20T08:00:00+07:00").getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Pick random prize (0 - 7)
    const targetIndex = Math.floor(Math.random() * PRIZES.length);

    // Calculate rotation to land exactly at pointer (12 o'clock = 0 deg)
    const extraRotations = 5 + Math.floor(Math.random() * 2); // 5 to 6 full spins
    const targetRemainder = (360 - targetIndex * 45) % 360;
    const currentRemainder = rotation % 360;
    const forwardDiff = (targetRemainder - currentRemainder + 360) % 360;
    const nextRotation = rotation + extraRotations * 360 + forwardDiff;

    setRotation(nextRotation);

    // After animation ends (4.5s)
    setTimeout(() => {
      setIsSpinning(false);
      const prize = PRIZES[targetIndex];
      setWonPrize(prize);
      setSpinCount((prev) => prev + 1);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ffd700", "#fea095", "#ffffff", "#721a28", "#f4c2c2"],
        });
      } catch {
        // Safe fallback
      }
    }, 4500);
  };

  const scrollToPreorder = () => {
    setWonPrize(null);
    const el = document.getElementById("preorder");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper to generate SVG segment paths
  const segmentAngle = 360 / PRIZES.length; // 45 deg
  const radius = 178;
  const center = 200;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24 scroll-mt-28" id="lucky-wheel">
      {/* Container Card */}
      <div className="relative overflow-hidden rounded-[38px] bg-linear-to-br from-[#4e0b17] via-[#3d0812] to-[#25030a] text-white p-6 sm:p-10 lg:p-14 border border-amber-300/30 shadow-liquid-card">
        {/* Ambient Glows */}
        <div aria-hidden="true" className="absolute -right-20 -top-20 w-110 h-110 rounded-full bg-[#fea095]/15 blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 rounded-full bg-rose-500/10 blur-[130px] pointer-events-none" />

        {/* Top Header Badge & Titles */}
        <div className="relative z-10 max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/12 backdrop-blur-xl border border-amber-300/35 text-amber-200 text-xs font-semibold shadow-xs mb-4">
            <span className="material-symbols-outlined text-[15px] text-amber-300">casino</span>
            <span>Chương Trình Đặc Biệt Ngày 20/10</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl text-white font-bold tracking-tight leading-tight">
            Vòng Quay May Mắn <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-rose-200 to-amber-300">K&amp;P Atelier</span>
          </h2>

          <p className="font-body text-sm sm:text-base text-rose-100/90 mt-4 leading-relaxed max-w-2xl mx-auto">
            Diễn ra <span className="text-amber-200 font-semibold">trong chuỗi ngày hội 16/10 – 20/10 (Cao điểm ngày 20/10)</span> tại gian hàng K&amp;P Atelier ĐH FPT.
            Mỗi đơn hàng hoặc trải nghiệm tự làm vòng đều nhận được <strong className="text-white">01 lượt quay trúng thưởng 100%</strong> mang về kỷ vật ấm áp!
          </p>

          {/* Event Status Pill */}
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md text-xs text-rose-200">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              Mở quay trực tiếp:
            </span>
            <span>Thứ Ba, 20/10/2026 (11:00 – 15:00)</span>
            <span className="opacity-40">•</span>
            <span>Sảnh lầu 2, ĐH FPT</span>
          </div>
        </div>

        {/* Main Grid: Wheel Left, Controls & Prizes Right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Wheel Showcase (Col 6) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            {/* Countdown Clock Box */}
            <div className="w-full max-w-sm mb-6 p-3.5 rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 shadow-inner text-center">
              <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-amber-200/90 mb-2 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>Đếm ngược giờ mở quay tại gian hàng</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Ngày", val: isClient ? timeLeft.days : 5 },
                  { label: "Giờ", val: isClient ? timeLeft.hours : 15 },
                  { label: "Phút", val: isClient ? timeLeft.minutes : 20 },
                  { label: "Giây", val: isClient ? timeLeft.seconds : 0 },
                ].map((item, idx) => (
                  <div key={idx} className="bg-black/35 rounded-xl py-1.5 px-1 border border-white/10">
                    <div className="font-headline text-lg sm:text-xl font-bold text-amber-200 leading-none">
                      {String(item.val).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-rose-200/75 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wheel Container */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center select-none">
              
              {/* Golden Outer Decorative Halo */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-300/40 bg-radial from-amber-400/10 via-transparent to-transparent shadow-[0_0_50px_rgba(217,155,38,0.25)] pointer-events-none" />

              {/* Top Pointer (Kim Chỉ Vòng Quay) */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center drop-shadow-xl pointer-events-none">
                <svg width="38" height="48" viewBox="0 0 38 48" fill="none" className="transition-transform duration-100">
                  <path
                    d="M19 48 L4 12 C4 4 34 4 34 12 Z"
                    fill="url(#needleGrad)"
                    stroke="#ffd700"
                    strokeWidth="1.5"
                  />
                  <circle cx="19" cy="12" r="5" fill="#721a28" stroke="#ffd700" strokeWidth="1.2" />
                  <circle cx="17.5" cy="10.5" r="1.5" fill="#ffffff" opacity="0.9" />
                  <defs>
                    <linearGradient id="needleGrad" x1="19" y1="0" x2="19" y2="48" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffe27a" />
                      <stop offset="0.6" stopColor="#d99b26" />
                      <stop offset="1" stopColor="#8f5c09" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* The Spinning SVG Wheel */}
              <svg
                ref={wheelRef}
                viewBox="0 0 400 400"
                className="w-full h-full drop-shadow-2xl transition-transform duration-[4500ms]"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionTimingFunction: "cubic-bezier(0.15, 0.95, 0.3, 1)",
                }}
              >
                <defs>
                  {/* Outer Rim Gradient */}
                  <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff3b0" />
                    <stop offset="40%" stopColor="#d99b26" />
                    <stop offset="70%" stopColor="#8f5c09" />
                    <stop offset="100%" stopColor="#f7d070" />
                  </linearGradient>

                  {/* Hub Gradient */}
                  <radialGradient id="hubRadial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#540114" />
                    <stop offset="85%" stopColor="#30020b" />
                    <stop offset="100%" stopColor="#1a0106" />
                  </radialGradient>
                </defs>

                {/* Outer Golden Border Circle */}
                <circle cx={center} cy={center} r={194} fill="url(#goldRim)" />
                <circle cx={center} cy={center} r={185} fill="#2a050d" />

                {/* 8 Slices */}
                {PRIZES.map((prize, idx) => {
                  const startDeg = idx * segmentAngle - segmentAngle / 2;
                  const endDeg = idx * segmentAngle + segmentAngle / 2;
                  const startRad = (startDeg * Math.PI) / 180;
                  const endRad = (endDeg * Math.PI) / 180;

                  const x1 = (center + radius * Math.sin(startRad)).toFixed(2);
                  const y1 = (center - radius * Math.cos(startRad)).toFixed(2);
                  const x2 = (center + radius * Math.sin(endRad)).toFixed(2);
                  const y2 = (center - radius * Math.cos(endRad)).toFixed(2);

                  const pathD = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
                  const isFlipped = idx >= 3 && idx <= 5;

                  return (
                    <g key={prize.id}>
                      {/* Segment wedge */}
                      <path
                        d={pathD}
                        fill={prize.color}
                        stroke="#ffd700"
                        strokeWidth="1.2"
                        strokeOpacity="0.4"
                      />

                      {/* Content rotated along slice axis */}
                      <g transform={`rotate(${idx * segmentAngle} ${center} ${center})`}>
                        {isFlipped ? (
                          <g transform={`rotate(180 ${center} ${center - 110})`}>
                            {/* Emoji icon flipped to face upright */}
                            <text
                              x={center}
                              y={center - 86}
                              textAnchor="middle"
                              fontSize="20"
                              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
                            >
                              {prize.emoji}
                            </text>

                            {/* Title */}
                            <text
                              x={center}
                              y={center - 110}
                              textAnchor="middle"
                              fill={prize.textColor}
                              fontSize="11.5"
                              fontWeight="700"
                              fontFamily="sans-serif"
                              style={{
                                letterSpacing: "-0.01em",
                                filter: prize.textColor === "#ffffff" ? "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" : "none",
                              }}
                            >
                              {prize.name}
                            </text>

                            {/* Badge */}
                            <text
                              x={center}
                              y={center - 126}
                              textAnchor="middle"
                              fill={prize.textColor}
                              fontSize="8.5"
                              fontWeight="600"
                              opacity="0.85"
                              fontFamily="sans-serif"
                            >
                              {prize.badge}
                            </text>
                          </g>
                        ) : (
                          <g>
                            {/* Emoji icon */}
                            <text
                              x={center}
                              y={center - 136}
                              textAnchor="middle"
                              fontSize="20"
                              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
                            >
                              {prize.emoji}
                            </text>

                            {/* Title */}
                            <text
                              x={center}
                              y={center - 110}
                              textAnchor="middle"
                              fill={prize.textColor}
                              fontSize="11.5"
                              fontWeight="700"
                              fontFamily="sans-serif"
                              style={{
                                letterSpacing: "-0.01em",
                                filter: prize.textColor === "#ffffff" ? "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" : "none",
                              }}
                            >
                              {prize.name}
                            </text>

                            {/* Badge */}
                            <text
                              x={center}
                              y={center - 94}
                              textAnchor="middle"
                              fill={prize.textColor}
                              fontSize="8.5"
                              fontWeight="600"
                              opacity="0.85"
                              fontFamily="sans-serif"
                            >
                              {prize.badge}
                            </text>
                          </g>
                        )}
                      </g>
                    </g>
                  );
                })}

                {/* 24 Golden Studs Around Wheel Perimeter */}
                {Array.from({ length: 24 }).map((_, sIdx) => {
                  const studAngle = (sIdx * 15 * Math.PI) / 180;
                  const sx = center + 189 * Math.sin(studAngle);
                  const sy = center - 189 * Math.cos(studAngle);
                  return (
                    <circle
                      key={sIdx}
                      cx={sx}
                      cy={sy}
                      r="2.8"
                      fill="#fff1a8"
                      stroke="#8f5c09"
                      strokeWidth="0.8"
                    />
                  );
                })}

                {/* Center Hub */}
                <circle cx={center} cy={center} r={50} fill="url(#goldRim)" />
                <circle cx={center} cy={center} r={44} fill="url(#hubRadial)" stroke="#ffd700" strokeWidth="1.5" />
                
                {/* Center Text */}
                <text
                  x={center}
                  y={center - 5}
                  textAnchor="middle"
                  fill="#ffd700"
                  fontSize="15"
                  fontWeight="800"
                  fontFamily="serif"
                  style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.8))" }}
                >
                  20/10
                </text>
                <text
                  x={center}
                  y={center + 11}
                  textAnchor="middle"
                  fill="#fdeae7"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="1.8"
                >
                  ATELIER
                </text>
                <text
                  x={center}
                  y={center + 24}
                  textAnchor="middle"
                  fill="#ffd700"
                  fontSize="8"
                  opacity="0.9"
                >
                  ✦ ✦ ✦
                </text>
              </svg>
            </div>

            {/* Spin CTA Button */}
            <div className="mt-7 flex flex-col items-center">
              <button
                type="button"
                onClick={handleDemoSpin}
                disabled={isSpinning}
                className={`group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-headline text-base font-bold shadow-pill transition-all duration-300 ${
                  isSpinning
                    ? "bg-amber-300/40 text-white/70 cursor-not-allowed"
                    : "bg-linear-to-r from-amber-300 via-amber-200 to-amber-400 text-[#420a13] hover:scale-105 hover:shadow-[0_10px_30px_rgba(217,155,38,0.4)] active:scale-95 cursor-pointer"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isSpinning ? "animate-spin" : "group-hover:rotate-45 transition-transform"}`}>
                  {isSpinning ? "progress_activity" : "auto_awesome"}
                </span>
                <span>{isSpinning ? "Đang quay tìm kỷ vật..." : "Quay Thử Vận May (Demo)"}</span>
              </button>

              <p className="mt-2 text-xs text-rose-200/80 italic text-center">
                * Đây là bản quay thử giới thiệu trước sự kiện. Lượt quay thật sẽ diễn ra tại quầy ngày 20/10.
              </p>
            </div>

          </div>

          {/* Right Column: Prizes Showcase & Participation Rules (Col 6) */}
          <div className="lg:col-span-6 flex flex-col space-y-6">

            {/* Participation Rules Card */}
            <div className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-amber-300 font-sans text-xs uppercase font-bold tracking-wider">
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>Cách thức nhận lượt quay ngày 20/10</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
                  <div className="text-xl mb-1">🛍️</div>
                  <div className="font-headline text-sm font-bold text-white">1. Đặt Trước</div>
                  <p className="font-sans text-[11px] text-rose-200/80 mt-1 leading-snug">
                    Mỗi đơn pre-order hoa hoặc vòng đều kèm 01 phiếu quay thưởng.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
                  <div className="text-xl mb-1">🧵</div>
                  <div className="font-headline text-sm font-bold text-white">2. Ghé Quầy</div>
                  <p className="font-sans text-[11px] text-rose-200/80 mt-1 leading-snug">
                    Tham gia workshop làm vòng tại sảnh lầu 2 ĐH FPT ngày 20/10.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
                  <div className="text-xl mb-1">🎁</div>
                  <div className="font-headline text-sm font-bold text-white">3. 100% Trúng</div>
                  <p className="font-sans text-[11px] text-rose-200/80 mt-1 leading-snug">
                    Tất cả các lượt quay đều trúng kỷ vật ý nghĩa, không có ô rỗng.
                  </p>
                </div>
              </div>
            </div>

            {/* 8 Curated Prizes Grid */}
            <div className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-300 font-sans text-xs uppercase font-bold tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">card_giftcard</span>
                  <span>Danh sách 8 phần quà hấp dẫn</span>
                </div>
                <span className="text-[11px] text-rose-200/70 font-sans">Bấm xem chi tiết</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRIZES.map((prize) => {
                  const isHighlighted = selectedPrize?.id === prize.id || wonPrize?.id === prize.id;
                  return (
                    <button
                      key={prize.id}
                      type="button"
                      onClick={() => setSelectedPrize(prize)}
                      className={`text-left p-3 rounded-2xl border transition-all text-white cursor-pointer ${
                        isHighlighted
                          ? "bg-amber-300/25 border-amber-300 shadow-[0_0_15px_rgba(217,155,38,0.3)] scale-[1.02]"
                          : "bg-black/20 border-white/10 hover:bg-white/15 hover:border-white/25"
                      }`}
                    >
                      <div className="text-2xl mb-1">{prize.emoji}</div>
                      <div className="font-headline text-xs font-bold truncate">{prize.name}</div>
                      <div className={`mt-1 inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${prize.tagColor}`}>
                        {prize.badge}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Prize Detail Banner (If Clicked) */}
              {selectedPrize && (
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-400/15 border border-amber-300/30 flex items-start gap-3 transition-all">
                  <span className="text-2xl">{selectedPrize.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-sm font-bold text-amber-200">{selectedPrize.name}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${selectedPrize.tagColor}`}>
                        {selectedPrize.badge}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-rose-100/90 mt-1 leading-relaxed">
                      {selectedPrize.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPrize(null)}
                    className="text-rose-200 hover:text-white p-1 cursor-pointer"
                    aria-label="Đóng chi tiết"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action: Preorder to Secure a Spin */}
            <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-500/20 via-rose-500/15 to-transparent border border-amber-300/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <div className="font-headline text-sm sm:text-base font-bold text-amber-200">
                  Muốn chắc chắn có 01 lượt quay ngày 20/10?
                </div>
                <div className="font-sans text-xs text-rose-200/90 mt-0.5">
                  Đặt trước hoa hoặc combo quà ngay để nhận phiếu quay ưu tiên!
                </div>
              </div>
              <button
                type="button"
                onClick={scrollToPreorder}
                className="shrink-0 px-5 py-2.5 rounded-full bg-white text-[#540114] font-sans text-xs font-bold hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
              >
                Đặt Trước Ngay
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Won Prize Celebration Modal (Demo) */}
      {wonPrize && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setWonPrize(null)}
        >
          <div
            className="relative w-full max-w-md rounded-[32px] bg-linear-to-b from-[#5c0f1d] via-[#450a14] to-[#2b050d] p-6 sm:p-8 text-white border border-amber-300/40 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setWonPrize(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Celebration Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold mb-3">
              <span>🎉 Kết Quả Quay Thử Demo ({spinCount})</span>
            </div>

            <div className="text-5xl my-3">{wonPrize.emoji}</div>

            <h3 className="font-headline text-2xl font-bold text-amber-200">
              {wonPrize.name}
            </h3>

            <div className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-white/10 border-white/20 text-rose-200">
              {wonPrize.badge}
            </div>

            <p className="font-sans text-xs sm:text-sm text-rose-100/90 mt-3 leading-relaxed">
              {wonPrize.description}
            </p>

            {/* Announcement Callout */}
            <div className="mt-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-300/30 text-left">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-xs mb-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Hẹn gặp bạn vào ngày 20/10 tại ĐH FPT!</span>
              </div>
              <p className="font-sans text-xs text-rose-100/90 leading-snug">
                Đây là lượt quay thử nghiệm. Vào đúng ngày 20/10, bạn hãy mang mã đơn đặt trước hoặc ghé sảnh lầu 2 ĐH FPT để quay trực tiếp và rinh quà thật mang về nhé!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={scrollToPreorder}
                className="flex-1 py-3 px-4 rounded-full bg-linear-to-r from-amber-300 to-amber-400 text-[#420a13] font-headline text-xs font-bold hover:brightness-110 transition-all shadow-md cursor-pointer"
              >
                Đặt Trước Quà Nhận Lượt Quay
              </button>
              <button
                type="button"
                onClick={() => setWonPrize(null)}
                className="py-3 px-5 rounded-full bg-white/15 hover:bg-white/25 text-white font-sans text-xs font-semibold transition-colors cursor-pointer"
              >
                Quay Thử Lại
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
