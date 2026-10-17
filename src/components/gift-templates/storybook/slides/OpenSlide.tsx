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
    if (idx !== -1) {
      ctx.go(idx);
    } else if (id === "music") {
      const voiceIdx = slides.findIndex((s) => s.id === "voice");
      if (voiceIdx !== -1) ctx.go(voiceIdx);
      else ctx.next();
    } else {
      ctx.next();
    }
  };

  // Open gift action: trigger celebration confetti and navigate immediately to Slide 2 ("letter")
  const openGift = (e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: isLandscape ? { y: 0.65, x: 0.7 } : { y: 0.75, x: 0.75 },
        colors: ["#c13d28", "#e38b29", "#ffd166", "#f4a261"],
      });
    } catch {}

    const letterIdx = slides.findIndex((s) => s.id === "letter");
    if (letterIdx !== -1) {
      ctx.go(letterIdx);
    } else if (slides.length > 1) {
      ctx.go(1);
    } else {
      ctx.next();
    }
  };

  if (isLandscape) {
    return (
      <div
        className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-[center_top_8%] px-6 lg:px-10 pt-3 lg:pt-4 pb-8 lg:pb-10 text-[#2e1d1b]"
        style={{ backgroundImage: "url('/thamkhao/bg_1.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-amber-950/15 via-transparent to-amber-50/20 pointer-events-none" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between">
          <StorybookHeader ctx={ctx} slides={slides} isArtCanvas />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-6 lg:gap-8">
            {/* Left: Directional Wooden Signpost with lush greenery */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <img
                src="/thamkhao/tree.png"
                alt="Cây trang trí"
                className="absolute -bottom-6 -left-6 lg:-bottom-8 lg:-left-8 w-32 sm:w-40 lg:w-48 xl:w-56 h-auto object-contain opacity-85 pointer-events-none"
              />

              <div className="relative h-72 sm:h-80 lg:h-[380px] xl:h-[430px] w-auto aspect-[1122/1402] shrink-0 select-none drop-shadow-xl">
                <img
                  src="/thamkhao/signpost.png"
                  alt="Biển chỉ dẫn"
                  className="w-full h-full block select-none pointer-events-none"
                />

                {/* Plank 1: Những kỷ niệm -> photos */}
                <button
                  type="button"
                  data-no-swipe
                  onClick={() => findSlide("photos")}
                  className="absolute top-[14.3%] left-[23.2%] w-[58.8%] h-[14.2%] flex items-center justify-center font-sans font-bold text-xs sm:text-sm lg:text-base xl:text-lg text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
                  title="Xem Những kỷ niệm"
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-3.5deg)" }}>
                    Những kỷ niệm
                  </span>
                </button>

                {/* Plank 2: Lời nhắn -> letter */}
                <button
                  type="button"
                  data-no-swipe
                  onClick={() => findSlide("letter")}
                  className="absolute top-[32.1%] left-[25.0%] w-[53.5%] h-[13.5%] flex items-center justify-center font-sans font-bold text-xs sm:text-sm lg:text-base xl:text-lg text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
                  title="Xem Lời nhắn"
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-3.3deg)" }}>
                    Lời nhắn
                  </span>
                </button>

                {/* Plank 3: Khoảnh khắc -> video */}
                <button
                  type="button"
                  data-no-swipe
                  onClick={() => findSlide("video")}
                  className="absolute top-[49.9%] left-[25.8%] w-[56.1%] h-[14.3%] flex items-center justify-center font-sans font-bold text-xs sm:text-sm lg:text-base xl:text-lg text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
                  title="Xem Khoảnh khắc"
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-5.5deg)" }}>
                    Khoảnh khắc
                  </span>
                </button>

                {/* Plank 4: Và nhiều hơn... -> music/voice */}
                <button
                  type="button"
                  data-no-swipe
                  onClick={() => findSlide("music")}
                  className="absolute top-[71.3%] left-[25.8%] w-[56.1%] h-[13.6%] flex items-center justify-center font-sans font-bold text-xs sm:text-sm lg:text-base xl:text-lg text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
                  title="Xem Và nhiều hơn..."
                >
                  <span className="inline-block transform" style={{ transform: "rotate(-6.0deg)" }}>
                    Và nhiều hơn...
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Typography, 3D Gift Box & Grand CTA Button directly on the landscape scenery */}
            <div className="col-span-7 flex flex-col items-center justify-center text-center px-2 lg:px-6">
              <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto flex flex-col items-center text-center">
                {/* Header Typography & Flight Path (Self-contained aspect box to prevent trail overlap) */}
                <div className="relative h-[210px] sm:h-[230px] lg:h-[250px] xl:h-[270px] w-auto aspect-[1536/1024] flex flex-col items-center justify-center shrink-0">
                  <img
                    src="/thamkhao/header_decor_clean.png"
                    alt="Hoa văn trang trí"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-xs select-none"
                  />

                  <div className="relative z-10 flex flex-col items-center text-center -mt-2">
                    <span className="block font-handwriting text-3xl sm:text-4xl lg:text-4xl xl:text-5xl text-[#1c3f50] font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                      Có một
                    </span>
                    <h1 className="font-serif font-black text-5xl sm:text-6xl lg:text-6xl xl:text-7xl text-[#c13d28] tracking-tight -my-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                      món quà
                    </h1>
                    <span className="block font-handwriting text-2xl sm:text-3xl lg:text-3xl xl:text-4xl text-[#1c3f50] font-bold italic drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                      dành cho {recipient}
                    </span>
                  </div>
                </div>

                {/* 3D Gift Box (Spaced cleanly below flight path, with tag anchored to lid) */}
                <button
                  type="button"
                  data-no-swipe
                  onClick={openGift}
                  className="relative mt-1 lg:mt-2 h-36 sm:h-40 lg:h-44 xl:h-48 w-auto aspect-[1448/1086] cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-2xl flex flex-col items-center shrink-0 bg-transparent border-0 p-0 text-left focus:outline-none"
                  title="Chạm để mở món quà!"
                  aria-label="Mở hộp quà - Chuyển sang lời nhắn"
                >
                  <img
                    src="/thamkhao/gift_box.png"
                    alt="Hộp quà tặng"
                    draggable={false}
                    className="w-full h-full object-contain transform group-hover:-translate-y-1 transition-transform pointer-events-none select-none"
                  />
                  <span className="pointer-events-none select-none absolute top-[8%] right-[4%] px-3 py-0.5 sm:px-3.5 sm:py-1 bg-[#fffdfa]/95 text-[#c13d28] font-handwriting font-bold text-xs sm:text-sm lg:text-base rounded-full shadow-md border border-[#ebdccd] group-hover:scale-110 transition-transform flex items-center gap-1.5 whitespace-nowrap z-10">
                    <span>Mở quà</span>
                    <span>✨</span>
                  </span>
                </button>

                {/* Action Button (Spaced cleanly below gift box with prominent sizing) */}
                <button
                  type="button"
                  data-no-swipe
                  onClick={openGift}
                  className="mt-3 lg:mt-4 py-2.5 px-8 sm:py-3 sm:px-10 lg:py-3.5 lg:px-11 rounded-full bg-[#fffcf7] hover:bg-white text-[#3d2417] font-serif font-bold text-sm sm:text-base lg:text-lg xl:text-xl shadow-lg hover:shadow-2xl border border-[#d8c8b4] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 group cursor-pointer shrink-0"
                >
                  <span>
                    Chạm để mở món <strong className="text-[#c13d28]">quà</strong>
                  </span>
                  <span className="text-[#c13d28] group-hover:translate-x-1.5 transition-transform text-lg lg:text-xl">
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
      <div className="relative z-10 w-full flex-1 flex items-end justify-between px-1 pb-8 sm:pb-9 min-h-0">
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
            data-no-swipe
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
            data-no-swipe
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
            data-no-swipe
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
            data-no-swipe
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
        <button
          type="button"
          data-no-swipe
          onClick={openGift}
          className="relative w-32 sm:w-38 mb-2 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-2xl flex flex-col items-center bg-transparent border-0 p-0 text-left focus:outline-none"
          title="Chạm để mở món quà!"
          aria-label="Mở hộp quà - Chuyển sang lời nhắn"
        >
          <img
            src="/thamkhao/gift_box.png"
            alt="Hộp quà tặng"
            draggable={false}
            className="w-full h-auto object-contain transform group-hover:-translate-y-1 transition-transform pointer-events-none select-none"
          />
          <span className="pointer-events-none select-none absolute -top-3 right-0 sm:right-1 px-2.5 py-0.5 bg-[#fffdfa]/95 text-[#c13d28] font-handwriting font-bold text-[11px] sm:text-xs rounded-full shadow-md border border-[#ebdccd] group-hover:scale-110 transition-transform flex items-center gap-1">
            <span>Mở quà</span>
            <span>✨</span>
          </span>
        </button>
      </div>
    </div>
  );
}
