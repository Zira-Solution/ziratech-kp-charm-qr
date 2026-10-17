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

export default function VideoSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const videoUrl = gift.video;

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
            {/* Left: 16:9 Cinema Screen Player */}
            <div className="col-span-7 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-xl aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black">
                {videoUrl ? (
                  <VideoEmbed link={videoUrl} className="h-full w-full" />
                ) : (
                  <div
                    onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                    className="relative h-full w-full cursor-pointer group"
                  >
                    <img
                      src="/thamkhao/anime_sunset_couple_wide.png"
                      alt="Xem video"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/95 shadow-xl flex items-center justify-center text-[#c13d28] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[36px] ml-1">
                          {isPlayingPreview ? "pause" : "play_arrow"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Header & Taped Note */}
            <div className="col-span-5 flex flex-col items-center justify-center text-center px-4">
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="font-handwriting font-bold text-4xl lg:text-5xl text-[#1c3f50]">
                    Video
                  </h2>
                  <span className="material-symbols-outlined text-3xl text-[#c13d28]">videocam</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-handwriting text-2xl lg:text-3xl text-[#c13d28] font-bold">
                    dành cho bạn
                  </span>
                  <img src="/thamkhao/heart.png" alt="Trái tim" className="w-6 h-6 object-contain" />
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
                    Một video đặc biệt gửi riêng cho bạn, với thật nhiều lời muốn nói và những kỷ niệm đẹp... ❤️
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view (Exact match to khung_04.png) */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 select-none overflow-hidden">
          <StorybookHeader ctx={ctx} slides={slides} />

          {/* Main Header */}
          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0">
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-handwriting font-bold text-3xl sm:text-4xl text-[#1c3f50]">
                Video
              </h2>
              <span className="material-symbols-outlined text-2xl text-[#c13d28]">videocam</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="font-handwriting text-xl sm:text-2xl text-[#c13d28] font-bold">
                dành cho bạn
              </span>
              <img src="/thamkhao/heart.png" alt="Trái tim" className="w-5 h-5 object-contain" />
            </div>
          </div>

          {/* Video Player Card */}
          <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center flex-1 justify-center min-h-0 py-2">
            <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black">
              {videoUrl ? (
                <VideoEmbed link={videoUrl} className="h-full w-full" />
              ) : (
                <div
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  className="relative h-full w-full cursor-pointer group"
                >
                  <img
                    src="/thamkhao/anime_sunset_couple_wide.png"
                    alt="Xem video"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center text-[#c13d28] transform group-hover:scale-115 transition-transform">
                      <span className="material-symbols-outlined text-[32px] ml-1">
                        {isPlayingPreview ? "pause" : "play_arrow"}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2 text-white font-mono text-[11px]">
                    <span>0:00</span>
                    <div className="flex-1 h-1 bg-white/40 rounded-full relative overflow-hidden">
                      <div
                        className="h-full bg-[#c13d28] transition-all duration-300"
                        style={{ width: isPlayingPreview ? "45%" : "0%" }}
                      />
                    </div>
                    <span>4:12</span>
                    <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                  </div>
                </div>
              )}
            </div>

            {/* Taped Caption Note */}
            <div className="relative mt-3 w-full max-w-xs mx-auto flex items-center justify-center">
              <img
                src="/thamkhao/paper.png"
                alt="Giấy ghi chú"
                className="w-full h-auto object-contain drop-shadow-md"
              />
              <div className="absolute inset-0 px-6 py-4 flex items-center justify-center text-center">
                <p className="font-handwriting text-xs sm:text-sm text-[#2e1d1b] font-medium leading-relaxed">
                  Một video đặc biệt gửi riêng cho bạn, với thật nhiều lời muốn nói và những kỷ niệm đẹp... ❤️
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
