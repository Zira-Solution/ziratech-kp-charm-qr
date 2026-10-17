"use client";

import React from "react";
import confetti from "canvas-confetti";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

export default function OpenSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const recipient = gift.recipientName || "bạn";

  // Navigation targets from the wooden signpost boards
  const findSlide = (id: string) => {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx !== -1) ctx.go(idx);
    else ctx.next();
  };

  if (isLandscape) {
    return (
      <div
        className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-[center_top_8%] p-6 lg:p-10 text-[#2e1d1b]"
        style={{ backgroundImage: "url('/thamkhao/bg_1.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-amber-950/15 via-transparent to-amber-50/20 pointer-events-none" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between">
          <StorybookHeader ctx={ctx} slides={slides} isArtCanvas />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-8 py-2">
            {/* Left: Directional Wooden Signpost with lush greenery */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <img
                src="/thamkhao/tree.png"
                alt="Cây trang trí"
                className="absolute -bottom-6 -left-8 w-36 h-auto object-contain opacity-85 pointer-events-none"
              />

              <div className="relative h-72 sm:h-80 lg:h-96 w-auto aspect-[1122/1402] shrink-0 select-none">
                <img
                  src="/thamkhao/signpost.png"
                  alt="Biển chỉ dẫn"
                  className="w-full h-full block select-none pointer-events-none drop-shadow-xl"
                />

                {/* Plank 1: Những kỷ niệm -> photos */}
                <button
                  type="button"
                  onClick={() => findSlide("photos")}
                  className="absolute top-[14.3%] left-[23.2%] w-[58.8%] h-[14.2%] flex items-center justify-center font-sans font-bold text-xs lg:text-sm text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
                  title="Xem Những kỷ niệm"
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-3.5deg)" }}>
                    Những kỷ niệm
                  </span>
                </button>

                {/* Plank 2: Lời nhắn -> letter */}
                <button
                  type="button"
                  onClick={() => findSlide("letter")}
                  className="absolute top-[32.1%] left-[25.0%] w-[53.5%] h-[13.5%] flex items-center justify-center font-sans font-bold text-xs lg:text-sm text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
                  title="Xem Lời nhắn"
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-3.3deg)" }}>
                    Lời nhắn
                  </span>
                </button>

                {/* Plank 3: Khoảnh khắc -> video */}
                <button
                  type="button"
                  onClick={() => findSlide("video")}
                  className="absolute top-[49.9%] left-[25.8%] w-[56.1%] h-[14.3%] flex items-center justify-center font-sans font-bold text-xs lg:text-sm text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
                  title="Xem Khoảnh khắc"
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-5.5deg)" }}>
                    Khoảnh khắc
                  </span>
                </button>

                {/* Plank 4: Và nhiều hơn... -> music/voice */}
                <button
                  type="button"
                  onClick={() => findSlide("music")}
                  className="absolute top-[71.3%] left-[25.8%] w-[56.1%] h-[13.6%] flex items-center justify-center font-sans font-bold text-xs lg:text-sm text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
                  title="Xem Và nhiều hơn..."
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-6.0deg)" }}>
                    Và nhiều hơn...
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Storybook Showcase Card housing Typography, 3D Gift Box & Grand CTA Button */}
            <div className="col-span-7 flex flex-col items-center justify-center text-center px-2 lg:px-6">
              <div className="relative w-full max-w-lg lg:max-w-xl mx-auto rounded-3xl bg-[#fffdfa]/88 backdrop-blur-md border border-[#ebdccd] shadow-[0_20px_50px_rgba(46,29,27,0.15)] p-6 lg:p-8 flex flex-col items-center text-center">
                {/* Luminous sunlit aura behind card */}
                <div className="absolute -inset-2 rounded-3xl bg-radial from-white/90 via-[#fff8ed]/50 to-transparent blur-lg pointer-events-none -z-1" />

                <div className="relative inline-block px-8 py-2">
                  <img
                    src="/thamkhao/header_decor_clean.png"
                    alt="Hoa văn trang trí"
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-[130%] h-auto max-w-[380px] pointer-events-none drop-shadow-xs select-none"
                  />

                  <span className="block font-handwriting text-3xl lg:text-4xl text-[#1c3f50] font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] relative z-10">
                    Có một
                  </span>
                  <h1 className="font-serif font-black text-5xl lg:text-6xl text-[#c13d28] tracking-tight -mt-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] relative z-10">
                    món quà
                  </h1>
                  <span className="block font-handwriting text-2xl lg:text-3xl text-[#1c3f50] font-bold italic mt-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] relative z-10">
                    dành cho {recipient}
                  </span>
                </div>

                {/* 3D Gift Box */}
                <div
                  onClick={ctx.next}
                  className="relative my-3 w-40 lg:w-48 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-2xl flex flex-col items-center"
                  title="Chạm để mở món quà!"
                >
                  <img
                    src="/thamkhao/gift_box.png"
                    alt="Hộp quà tặng"
                    className="w-full h-auto object-contain transform group-hover:-translate-y-1 transition-transform"
                  />
                  <span className="absolute -top-3 right-1 px-3 py-1 bg-[#fffdfa] text-[#c13d28] font-handwriting font-bold text-sm rounded-full shadow-md border border-[#ebdccd] group-hover:scale-110 transition-transform">
                    Mở quà ✨
                  </span>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={ctx.next}
                  className="py-3 px-8 rounded-full bg-white hover:bg-[#fff9f2] text-[#3d2417] font-serif font-bold text-sm lg:text-base shadow-lg hover:shadow-xl border border-[#d8c8b4] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>
                    Chạm để mở món <strong className="text-[#c13d28]">quà</strong>
                  </span>
                  <span className="text-[#c13d28] group-hover:translate-x-1.5 transition-transform text-lg">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile / Portrait view (Exact match to khung_01.png)
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 select-none overflow-hidden bg-cover bg-center text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/bg_1.jpg')" }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-white/30 via-transparent to-amber-950/20 pointer-events-none" />

      <StorybookHeader ctx={ctx} slides={slides} isArtCanvas />

      {/* Header Typography with Original Decorative Arc */}
      <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0">
        <div className="relative inline-block px-8 py-2">
          {/* Luminous sunlit aura behind typography so text is crystal clear */}
          <div className="absolute -inset-3 rounded-3xl bg-radial from-white/95 via-white/70 to-transparent blur-md pointer-events-none -z-1" />

          <img
            src="/thamkhao/header_decor_clean.png"
            alt="Hoa văn trang trí"
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-[130%] h-auto max-w-[340px] pointer-events-none drop-shadow-xs select-none"
          />

          <span className="block font-handwriting text-3xl sm:text-4xl text-[#1c3f50] font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] relative z-10">
            Có một
          </span>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-[#c13d28] tracking-tight -mt-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] relative z-10">
            món quà
          </h1>
          <span className="block font-handwriting text-xl sm:text-2xl text-[#1c3f50] font-bold italic mt-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] relative z-10">
            dành cho {recipient}
          </span>
        </div>
      </div>

      {/* Middle & Lower Elements: Signpost (Left) & 3D Gift Box (Right) */}
      <div className="relative z-10 w-full flex-1 flex items-end justify-between px-1 pb-2 min-h-0">
        {/* Directional Wooden Signpost on the Left */}
        <div className="relative h-52 sm:h-64 w-auto aspect-[1122/1402] shrink-0 select-none">
          <img
            src="/thamkhao/signpost.png"
            alt="Biển chỉ dẫn"
            className="w-full h-full block select-none pointer-events-none drop-shadow-lg"
          />

          {/* Plank 1: Những kỷ niệm -> photos */}
          <button
            type="button"
            onClick={() => findSlide("photos")}
            className="absolute top-[14.0%] left-[26%] w-[60%] h-[14.2%] flex items-center justify-center font-sans font-bold text-[10px] sm:text-xs text-[#382315] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]"
            title="Xem Những kỷ niệm"
          >
            <span className="inline-block transform" style={{ transform: "rotate(-3.5deg)" }}>
              Những kỷ niệm
            </span>
          </button>

          {/* Plank 2: Lời nhắn -> letter */}
          <button
            type="button"
            onClick={() => findSlide("letter")}
            className="absolute top-[32.0%] left-[27%] w-[56%] h-[13.5%] flex items-center justify-center font-sans font-bold text-[10px] sm:text-xs text-[#382315] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]"
            title="Xem Lời nhắn"
          >
            <span className="inline-block transform" style={{ transform: "rotate(-3.3deg)" }}>
              Lời nhắn
            </span>
          </button>

          {/* Plank 3: Khoảnh khắc -> video */}
          <button
            type="button"
            onClick={() => findSlide("video")}
            className="absolute top-[49.8%] left-[29%] w-[56%] h-[14.3%] flex items-center justify-center font-sans font-bold text-[10px] sm:text-xs text-[#382315] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]"
            title="Xem Khoảnh khắc"
          >
            <span className="inline-block transform" style={{ transform: "rotate(-5.5deg)" }}>
              Khoảnh khắc
            </span>
          </button>

          {/* Plank 4: Và nhiều hơn... -> music/voice */}
          <button
            type="button"
            onClick={() => findSlide("music")}
            className="absolute top-[71.0%] left-[29%] w-[56%] h-[13.6%] flex items-center justify-center font-sans font-bold text-[10px] sm:text-xs text-[#382315] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]"
            title="Xem Và nhiều hơn..."
          >
            <span className="inline-block transform" style={{ transform: "rotate(-6.0deg)" }}>
              Và nhiều hơn...
            </span>
          </button>
        </div>

        {/* 3D Gift Box on the Right */}
        <div
          onClick={() => {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.75, x: 0.75 },
              colors: ["#c13d28", "#e38b29", "#ffd166", "#f4a261"],
            });
            ctx.next();
          }}
          className="relative w-32 sm:w-38 mb-2 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-2xl flex flex-col items-center"
          title="Chạm để mở món quà!"
        >
          <img
            src="/thamkhao/gift_box.png"
            alt="Hộp quà tặng"
            className="w-full h-auto object-contain transform group-hover:-translate-y-1 transition-transform"
          />
          <span className="absolute -top-3 right-0 sm:right-1 px-2.5 py-0.5 bg-[#fffdfa]/95 text-[#c13d28] font-handwriting font-bold text-[11px] sm:text-xs rounded-full shadow-md border border-[#ebdccd] group-hover:scale-110 transition-transform flex items-center gap-1">
            <span>Mở quà</span>
            <span>✨</span>
          </span>
        </div>
      </div>
    </div>
  );
}
