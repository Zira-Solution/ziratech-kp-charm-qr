"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import VideoEmbed from "@/components/gift-templates/media/VideoEmbed";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

type AspectRatio = "16:9" | "1:1" | "9:16";

export default function VideoSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = gift.video;

  // Auto-detect default aspect ratio if URL is a Short/TikTok/Reels
  const isVertical = Boolean(
    videoUrl &&
      (videoUrl.includes("/shorts") ||
        videoUrl.includes("tiktok.com") ||
        videoUrl.includes("/reel/") ||
        videoUrl.includes("/reels/"))
  );
  const [aspect, setAspect] = useState<AspectRatio>(isVertical ? "9:16" : "16:9");

  const handleOpenModal = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#c13d28", "#f4a261", "#e76f51", "#2a9d8f", "#e9c46a"],
      });
    } catch {}
    setIsModalOpen(true);
    setIsPlaying(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsPlaying(false);
  };

  // Dynamic modal card widths
  const aspectModalWidth = {
    "16:9": "w-full max-w-[480px]",
    "1:1": "w-[330px] sm:w-[380px]",
    "9:16": "w-[260px] sm:w-[310px]",
  }[aspect];

  // Dynamic inner screen ratios
  const aspectScreenRatio = {
    "16:9": "aspect-video w-full",
    "1:1": "aspect-square w-full",
    "9:16": "aspect-[9/16] w-full max-h-[62vh]",
  }[aspect];

  return (
    <div
      className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-center text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {isLandscape ? (
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 lg:p-10">
          <StorybookHeader ctx={ctx} slides={slides} />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-8 py-2">
            {/* Left: Surprise Gift Box */}
            <div className="col-span-6 flex flex-col items-center justify-center text-center">
              <div
                onClick={handleOpenModal}
                className="relative group cursor-pointer flex flex-col items-center"
              >
                {/* Floating sparkles and hearts */}
                <span className="absolute -top-3 -left-4 text-amber-400 text-base animate-pulse">✦</span>
                <span className="absolute -top-2 -right-4 text-[#c13d28] text-2xl font-sans rotate-12">♡</span>
                <span className="absolute bottom-6 -right-6 text-amber-400 text-sm">✦</span>

                {/* Watercolor Gift Box Image */}
                <div className="relative transform transition-all duration-300 group-hover:scale-108 active:scale-95">
                  <img
                    src="/thamkhao/gift_box.png"
                    alt="Hộp quà bất ngờ"
                    className="w-48 h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl"
                  />
                  {/* Subtle ground shadow */}
                  <div className="w-36 h-4 bg-amber-950/15 rounded-full blur-xs mx-auto -mt-3" />
                </div>

                {/* Open video button */}
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-linear-to-r from-[#c13d28] to-[#d95338] text-white text-sm font-bold shadow-[0_6px_20px_rgba(193,61,40,0.35)] hover:shadow-[0_8px_25px_rgba(193,61,40,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
                    play_circle
                  </span>
                  <span>Chạm để xem video</span>
                  <span className="text-amber-200">✨</span>
                </button>
              </div>
            </div>

            {/* Right: Header & Taped Note */}
            <div className="col-span-6 flex flex-col items-center justify-center text-center px-4">
              <div className="relative mb-6">
                <div className="flex items-center justify-center gap-2 transform -rotate-[5deg]">
                  <h2 className="font-handwriting font-bold text-5xl lg:text-6xl text-[#16384c]">
                    Video
                  </h2>
                  <span className="text-[#c13d28] text-3xl font-sans inline-block transform rotate-12">
                    ♡
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1 transform -rotate-[3deg]">
                  <span className="font-handwriting text-3xl lg:text-4xl text-[#c13d28] font-bold italic">
                    dành cho bạn
                  </span>
                  <span className="text-[#c13d28] text-2xl font-sans inline-block transform -rotate-6">
                    ♡
                  </span>
                </div>
              </div>

              {/* Taped Paper Note */}
              <div className="relative w-full max-w-sm flex items-center justify-center">
                {/* Washi tape at top-left corner */}
                <div className="absolute -top-2.5 -left-2 z-20 w-9 h-4 bg-amber-100/75 border border-amber-200/60 shadow-xs transform -rotate-12 pointer-events-none backdrop-blur-xs" />
                <img
                  src="/thamkhao/paper.png"
                  alt="Giấy ghi chú"
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
                <div className="absolute inset-0 px-8 py-6 flex items-center justify-center text-center">
                  <p className="font-handwriting text-base lg:text-lg text-[#2e1d1b] font-medium leading-relaxed">
                    Một video đặc biệt gửi riêng cho bạn, với thật nhiều lời muốn nói và những kỷ niệm đẹp...{" "}
                    <span className="text-[#c13d28] font-sans">♡</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view */
        <div className="relative flex h-full w-full flex-col justify-between p-3.5 sm:p-4 select-none overflow-hidden">
          <StorybookHeader ctx={ctx} slides={slides} />

          {/* Main Header with Large Tilted Typography and Playful Doodles */}
          <div className="relative z-10 text-center flex flex-col items-center shrink-0">
            {/* Sparkle top left */}
            <span className="absolute -top-1 left-7 text-amber-400 text-sm pointer-events-none select-none">✦</span>
            {/* Sparkle top right */}
            <span className="absolute top-1 right-9 text-amber-400 text-xs pointer-events-none select-none">✦</span>

            <div className="relative inline-flex items-center justify-center">
              {/* Hand-drawn Camcorder Doodle Icon on the left */}
              <div className="absolute -left-10 sm:-left-12 -top-1 transform -rotate-12 pointer-events-none select-none">
                <svg
                  viewBox="0 0 32 32"
                  className="w-8 h-8 sm:w-9 sm:h-9 text-[#c13d28] fill-none stroke-current"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="8" width="18" height="15" rx="3.5" />
                  <polygon points="21,13 29,8 29,23 21,18" />
                  <circle cx="10" cy="15.5" r="2.5" />
                </svg>
              </div>

              {/* Tilted Large "Video" */}
              <div className="flex items-center gap-2 transform -rotate-[6deg]">
                <h2 className="font-handwriting font-bold text-5xl sm:text-6xl text-[#16384c] tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  Video
                </h2>
                {/* Outlined Heart Doodle next to Video */}
                <span className="text-[#c13d28] text-2xl sm:text-3xl font-sans inline-block transform rotate-12 drop-shadow-xs">
                  ♡
                </span>
              </div>
            </div>

            {/* "dành cho bạn" slightly tilted with heart doodle */}
            <div className="flex items-center justify-center gap-2 -mt-1 transform -rotate-[3deg]">
              <span className="font-handwriting text-2xl sm:text-3xl text-[#c13d28] font-bold italic drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                dành cho bạn
              </span>
              <span className="text-[#c13d28] text-2xl font-sans inline-block transform -rotate-6">
                ♡
              </span>
            </div>
          </div>

          {/* Center: Surprise Gift Box with Open Video Button */}
          <div className="relative z-10 w-full mx-auto flex flex-col items-center justify-center flex-1 min-h-0 py-2">
            <div
              onClick={handleOpenModal}
              className="relative group cursor-pointer flex flex-col items-center"
            >
              {/* Floating doodles */}
              <span className="absolute -top-2 -left-5 text-amber-400 text-sm animate-pulse pointer-events-none">✦</span>
              <span className="absolute -top-3 -right-4 text-[#c13d28] text-2xl font-sans rotate-12 pointer-events-none">♡</span>
              <span className="absolute bottom-9 -right-6 text-amber-400 text-xs pointer-events-none">✦</span>

              {/* Watercolor Gift Box Image */}
              <div className="relative transform transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-1 active:scale-95">
                <img
                  src="/thamkhao/gift_box.png"
                  alt="Hộp quà video bất ngờ"
                  className="w-40 h-40 sm:w-44 sm:h-44 object-contain drop-shadow-xl"
                />
                {/* Ground shadow */}
                <div className="w-28 h-3.5 bg-amber-950/15 rounded-full blur-xs mx-auto -mt-2.5" />
              </div>

              {/* Click button */}
              <button
                type="button"
                onClick={handleOpenModal}
                className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-[#c13d28] to-[#d95338] text-white text-xs sm:text-sm font-bold shadow-[0_6px_20px_rgba(193,61,40,0.35)] hover:shadow-[0_8px_25px_rgba(193,61,40,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[19px] group-hover:rotate-12 transition-transform">
                  play_circle
                </span>
                <span>Chạm để xem video</span>
                <span className="text-amber-200">✨</span>
              </button>
            </div>
          </div>

          {/* Taped Caption Note */}
          <div className="relative w-full max-w-[285px] sm:max-w-xs mx-auto flex items-center justify-center shrink-0 mb-1">
            {/* Outlined heart doodle on bottom-left outside */}
            <span className="absolute -left-6 bottom-1 text-[#c13d28] text-2xl font-sans pointer-events-none select-none transform rotate-12">
              ♡
            </span>
            {/* Sparkle on bottom right */}
            <span className="absolute -right-5 -bottom-1 text-amber-400 text-xs pointer-events-none select-none">
              ✦
            </span>

            {/* Washi tape at top-left corner */}
            <div className="absolute -top-2.5 -left-2 z-20 w-8 h-4 bg-amber-100/75 border border-amber-200/60 shadow-xs transform -rotate-12 pointer-events-none backdrop-blur-xs" />

            <img
              src="/thamkhao/paper.png"
              alt="Giấy ghi chú"
              className="w-full h-auto object-contain drop-shadow-md"
            />
            <div className="absolute inset-0 px-6 py-2.5 flex items-center justify-center text-center">
              <p className="font-handwriting text-xs sm:text-sm text-[#2e1d1b] font-medium leading-relaxed">
                Một video đặc biệt gửi riêng cho bạn, với thật nhiều lời muốn nói và những kỷ niệm đẹp...{" "}
                <span className="text-[#c13d28] inline-block font-sans ml-0.5 text-sm">♡</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Popup Modal (Lightbox) */}
      {isModalOpen && (
        <div
          data-no-swipe
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 select-auto"
        >
          {/* Modal Card */}
          <div
            className={`relative rounded-3xl bg-white/95 p-3 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/80 animate-in zoom-in-95 duration-200 flex flex-col items-center ${aspectModalWidth}`}
          >
            {/* Close Button '✕' at top right */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute -top-3.5 -right-3.5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#c13d28] shadow-2xl border border-stone-200 hover:bg-[#c13d28] hover:text-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
              title="Đóng video"
              aria-label="Đóng video"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>

            {/* Modal Header: Title + Flexible Aspect Ratio Switchers */}
            <div className="w-full flex items-center justify-between pb-2 mb-1 border-b border-stone-100 px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-handwriting font-bold text-lg text-[#16384c]">
                  Video kỷ niệm
                </span>
                <span className="text-[#c13d28] text-sm">♡</span>
              </div>

              {/* Aspect Ratio Switcher Pills */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-full">
                {(["16:9", "1:1", "9:16"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspect(r)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold transition-all cursor-pointer ${
                      aspect === r
                        ? "bg-[#16384c] text-white shadow-xs"
                        : "text-stone-600 hover:bg-white/80"
                    }`}
                    title={`Khung hình ${r}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player Display */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center ${aspectScreenRatio}`}
            >
              {isPlaying && videoUrl ? (
                <div className="relative h-full w-full">
                  <VideoEmbed link={videoUrl} aspectRatio={aspect} className="h-full w-full" />
                </div>
              ) : (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="relative h-full w-full cursor-pointer group"
                >
                  <img
                    src="/thamkhao/sunset_couple_clean.jpg"
                    alt="Xem video kỷ niệm"
                    className="w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-115 active:scale-95 transition-transform">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#c13d28] translate-x-0.5">
                        <polygon points="6,4 19,12 6,20" />
                      </svg>
                    </div>
                  </div>
                  {/* YouTube Player Control Bar */}
                  <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center gap-2 text-white font-mono text-[11px]">
                    <span className="font-sans text-xs font-semibold">0:00</span>
                    <div className="flex-1 h-1.5 bg-white/35 rounded-full relative overflow-visible">
                      <div className="h-full bg-[#e53935] rounded-full" style={{ width: "35%" }} />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md"
                        style={{ left: "35%", transform: "translate(-50%, -50%)" }}
                      />
                    </div>
                    <span className="font-sans text-xs font-semibold">4:12</span>
                    <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
