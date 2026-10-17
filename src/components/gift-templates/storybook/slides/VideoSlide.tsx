"use client";

import React, { useState } from "react";
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

  // Dynamic card widths for mobile portrait
  const aspectCardWidth = {
    "16:9": "w-full max-w-[340px]",
    "1:1": "w-[240px] sm:w-[250px]",
    "9:16": "w-[185px] sm:w-[195px]",
  }[aspect];

  // Dynamic inner screen ratios
  const aspectScreenRatio = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16] max-h-[34vh]",
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
            {/* Left: Video Player Screen with Aspect Ratio switcher */}
            <div className="col-span-7 flex flex-col items-center justify-center">
              {/* Aspect Ratio Switcher */}
              <div className="flex items-center gap-2 mb-2.5 z-20">
                {(["16:9", "1:1", "9:16"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspect(r)}
                    className={`px-3 py-1 rounded-full text-xs font-sans font-bold transition-all cursor-pointer ${
                      aspect === r
                        ? "bg-[#16384c] text-white shadow-md scale-105"
                        : "bg-white/85 text-stone-700 hover:bg-white border border-[#ebdccd]"
                    }`}
                  >
                    Khung {r}
                  </button>
                ))}
              </div>

              <div className={`relative mx-auto rounded-2xl bg-white p-3 shadow-2xl border border-[#ebdccd] transition-all duration-300 ${aspectCardWidth}`}>
                <div className={`relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center ${aspectScreenRatio}`}>
                  {isPlaying && videoUrl ? (
                    <div className="relative h-full w-full">
                      <VideoEmbed link={videoUrl} aspectRatio={aspect} className="h-full w-full" />
                      <button
                        type="button"
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-full bg-black/70 hover:bg-black text-white text-[10px] font-sans transition-all cursor-pointer"
                      >
                        ✕ Đóng video
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="relative h-full w-full cursor-pointer group"
                    >
                      <img
                        src="/thamkhao/sunset_couple_clean.jpg"
                        alt="Xem video kỷ niệm"
                        className="h-full w-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform">
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
                        <span className="material-symbols-outlined text-[18px]">volume_up</span>
                        <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Header & Taped Note */}
            <div className="col-span-5 flex flex-col items-center justify-center text-center px-4">
              <div className="relative mb-4">
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
        /* Mobile / Portrait view (Exact match to khung_04.png) */
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

            {/* Flexible Aspect Ratio Switcher Pills */}
            <div className="flex items-center justify-center gap-1.5 mt-2 z-20">
              {(["16:9", "1:1", "9:16"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspect(r)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold transition-all cursor-pointer ${
                    aspect === r
                      ? "bg-[#16384c] text-white shadow-xs scale-105"
                      : "bg-white/80 text-stone-600 hover:bg-white border border-[#ebdccd]"
                  }`}
                  title={`Khung hình ${r}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Video Player Card */}
          <div className="relative z-10 w-full mx-auto flex flex-col items-center justify-center flex-1 min-h-0 py-1">
            {/* White Polaroid/Card Frame */}
            <div
              className={`relative mx-auto rounded-2xl bg-white p-2 sm:p-2.5 shadow-2xl border border-[#ebdccd] transition-all duration-300 transform rotate-[0.5deg] flex items-center justify-center ${aspectCardWidth}`}
            >
              <div
                className={`relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center ${aspectScreenRatio}`}
              >
                {isPlaying && videoUrl ? (
                  <div className="relative h-full w-full">
                    <VideoEmbed link={videoUrl} aspectRatio={aspect} className="h-full w-full" />
                    <button
                      type="button"
                      onClick={() => setIsPlaying(false)}
                      className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-full bg-black/70 hover:bg-black text-white text-[10px] font-sans transition-all cursor-pointer"
                    >
                      ✕ Đóng video
                    </button>
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
                      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-115 active:scale-95 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 fill-[#c13d28] translate-x-0.5">
                          <polygon points="6,4 19,12 6,20" />
                        </svg>
                      </div>
                    </div>
                    {/* YouTube Player Control Bar matching khung_04.png */}
                    <div className="absolute bottom-0 inset-x-0 px-2.5 py-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center gap-2 text-white font-mono text-[11px]">
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
    </div>
  );
}
