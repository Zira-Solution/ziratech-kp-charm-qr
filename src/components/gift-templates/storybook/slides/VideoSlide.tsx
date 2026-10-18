"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import VideoEmbed from "@/components/gift-templates/media/VideoEmbed";
import { parseAddressing } from "@/components/gift-templates/addressing";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

type AspectRatio = "16:9" | "1:1" | "9:16";

export default function VideoSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const pronouns = parseAddressing(gift.addressing);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = gift.video;

  // Aspect ratio is fixed by the creator's choice (or auto-detected fallback)
  const isVertical = Boolean(
    videoUrl &&
      (videoUrl.includes("/shorts") ||
        videoUrl.includes("tiktok.com") ||
        videoUrl.includes("/reel/") ||
        videoUrl.includes("/reels/"))
  );
  const aspect: AspectRatio = gift.videoAspectRatio || (isVertical ? "9:16" : "16:9");

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
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-6 lg:px-12 py-3 lg:py-5">
          <StorybookHeader ctx={ctx} slides={slides} />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-6 lg:gap-10">
            {/* Left: Surprise Gift Box */}
            <div className="col-span-6 flex flex-col items-center justify-center text-center">
              <button
                type="button"
                data-no-swipe
                onClick={handleOpenModal}
                className="relative group cursor-pointer flex flex-col items-center bg-transparent border-0 p-0 text-center focus:outline-none"
                aria-label="Mở video đặc biệt"
              >
                {/* Floating sparkles and hearts */}
                <span className="absolute -top-4 -left-6 text-amber-400 text-xl lg:text-2xl animate-pulse pointer-events-none">✦</span>
                <span className="absolute -top-4 -right-6 text-[#c13d28] text-3xl lg:text-4xl font-sans rotate-12 pointer-events-none">♡</span>
                <span className="absolute bottom-10 -right-8 text-amber-400 text-lg lg:text-xl pointer-events-none">✦</span>
                <span className="absolute bottom-6 -left-6 text-[#c13d28] text-2xl font-sans -rotate-12 pointer-events-none">♡</span>

                {/* Watercolor Gift Box Image */}
                <div className="relative transform transition-all duration-300 group-hover:scale-105 active:scale-95">
                  <img
                    src="/thamkhao/gift_box.png"
                    alt="Hộp quà bất ngờ"
                    draggable={false}
                    className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-84 xl:h-84 object-contain drop-shadow-2xl pointer-events-none select-none"
                  />
                  {/* Subtle ground shadow */}
                  <div className="w-48 sm:w-56 lg:w-64 xl:w-76 h-5 lg:h-6 bg-amber-950/15 rounded-full blur-xs mx-auto -mt-3 lg:-mt-4 pointer-events-none" />
                </div>

                {/* Open video button */}
                <div
                  className="mt-5 lg:mt-6 inline-flex items-center gap-2.5 px-7 py-3 sm:px-9 sm:py-3.5 lg:px-10 lg:py-4 rounded-full bg-linear-to-r from-[#c13d28] to-[#d95338] text-white text-base sm:text-lg lg:text-xl font-bold shadow-[0_8px_25px_rgba(193,61,40,0.35)] hover:shadow-[0_12px_35px_rgba(193,61,40,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[22px] lg:text-[26px] group-hover:rotate-12 transition-transform">
                    play_circle
                  </span>
                  <span>Chạm để xem video</span>
                  <span className="text-amber-200 text-lg">✨</span>
                </div>
              </button>
            </div>

            {/* Right: Header & Taped Note */}
            <div className="col-span-6 flex flex-col items-center justify-center text-center px-2 lg:px-4">
              <div className="relative mb-4 lg:mb-5">
                <span className="font-handwriting text-2xl lg:text-3xl text-[#172b3a] font-bold block mb-1 transform -rotate-1">
                  Còn một điều
                </span>
                <h2 className="font-serif font-black text-4xl lg:text-5xl xl:text-6xl text-[#ba4230] tracking-wider uppercase drop-shadow-2xs leading-tight my-1">
                  {pronouns.senderUpper} MUỐN NÓI
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-handwriting text-2xl lg:text-3xl text-[#172b3a] font-bold">
                    với {pronouns.recipient}
                  </span>
                  <span className="text-[#c13d28] text-2xl lg:text-3xl font-sans inline-block transform rotate-12">
                    ♡
                  </span>
                </div>
              </div>

              {/* Taped Paper Note */}
              <div className="relative w-full max-w-[420px] sm:max-w-[450px] lg:max-w-[480px] xl:max-w-[530px] flex items-center justify-center">
                {/* Washi tape at top-left corner */}
                <div className="absolute -top-2.5 -left-2.5 z-20 w-11 h-5 lg:w-14 lg:h-5.5 bg-amber-100/80 border border-amber-200/70 shadow-xs transform -rotate-12 pointer-events-none backdrop-blur-xs" />
                <img
                  src="/thamkhao/paper.png"
                  alt="Giấy ghi chú"
                  draggable={false}
                  className="w-full h-auto object-contain drop-shadow-xl select-none pointer-events-none"
                />
                {/* Text area placed strictly below the top masking tape (top-[15%]) with comfortable padding */}
                <div className="absolute inset-x-0 bottom-0 top-[15%] px-7 sm:px-9 lg:px-11 xl:px-13 pb-3 sm:pb-4 lg:pb-5 flex items-center justify-center text-center">
                  <p className="font-handwriting text-base sm:text-lg lg:text-xl xl:text-2xl text-[#2e1d1b] font-medium leading-relaxed sm:leading-relaxed lg:leading-relaxed">
                    Một video đặc biệt gửi riêng cho {pronouns.recipient}, với thật nhiều lời muốn nói và những kỷ niệm đẹp...{" "}
                    <span className="text-[#c13d28] font-sans inline-block">♡</span>
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

            <span className="font-handwriting text-lg sm:text-xl text-[#172b3a] font-bold block -mb-0.5 transform -rotate-1">
              Còn một điều
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#ba4230] tracking-wider uppercase drop-shadow-2xs">
              {pronouns.senderUpper} MUỐN NÓI
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="font-handwriting text-lg sm:text-xl text-[#172b3a] font-bold">
                với {pronouns.recipient}
              </span>
              <span className="text-[#c13d28] text-lg font-sans inline-block transform rotate-12">
                ♡
              </span>
            </div>
          </div>

          {/* Center: Surprise Gift Box with Open Video Button */}
          <div className="relative z-10 w-full mx-auto flex flex-col items-center justify-center flex-1 min-h-0 py-2">
            <button
              type="button"
              data-no-swipe
              onClick={handleOpenModal}
              className="relative group cursor-pointer flex flex-col items-center bg-transparent border-0 p-0 text-center focus:outline-none"
              aria-label="Mở video đặc biệt"
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
                  draggable={false}
                  className="w-40 h-40 sm:w-44 sm:h-44 object-contain drop-shadow-xl select-none pointer-events-none"
                />
                {/* Ground shadow */}
                <div className="w-28 h-3.5 bg-amber-950/15 rounded-full blur-xs mx-auto -mt-2.5 pointer-events-none" />
              </div>

              {/* Click button */}
              <div
                className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-[#c13d28] to-[#d95338] text-white text-xs sm:text-sm font-bold shadow-[0_6px_20px_rgba(193,61,40,0.35)] hover:shadow-[0_8px_25px_rgba(193,61,40,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[19px] group-hover:rotate-12 transition-transform">
                  play_circle
                </span>
                <span>Chạm để xem video</span>
                <span className="text-amber-200">✨</span>
              </div>
            </button>
          </div>

          {/* Taped Caption Note */}
          <div className="relative w-full max-w-[285px] sm:max-w-xs mx-auto flex items-center justify-center shrink-0 mb-8 sm:mb-9">
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
              draggable={false}
              className="w-full h-auto object-contain drop-shadow-md select-none pointer-events-none"
            />
            {/* Text area strictly below top masking tape at ~15% */}
            <div className="absolute inset-x-0 bottom-0 top-[15%] px-5 sm:px-6 pb-2 sm:pb-2.5 flex items-center justify-center text-center">
              <p className="font-handwriting text-xs sm:text-sm text-[#2e1d1b] font-medium leading-relaxed">
                Một video đặc biệt gửi riêng cho {pronouns.recipient}, với thật nhiều lời muốn nói và những kỷ niệm đẹp...{" "}
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

            {/* Modal Header: Title only, no aspect ratio switcher for viewer */}
            <div className="w-full flex items-center justify-between pb-2 mb-1 border-b border-stone-100 px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-handwriting font-bold text-lg text-[#16384c]">
                  Video kỷ niệm
                </span>
                <span className="text-[#c13d28] text-sm">♡</span>
              </div>
            </div>

            {/* Video Player Display */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center ${aspectScreenRatio}`}
            >
              {isPlaying && videoUrl ? (
                <div className="relative h-full w-full">
                  {!videoUrl.includes("youtube.com") &&
                  !videoUrl.includes("youtu.be") &&
                  !videoUrl.includes("vimeo.com") &&
                  !videoUrl.includes("drive.google.com") ? (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <VideoEmbed link={videoUrl} aspectRatio={aspect} className="h-full w-full" />
                  )}
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
