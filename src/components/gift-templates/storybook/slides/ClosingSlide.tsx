"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

export default function ClosingSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleReplay = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c13d28", "#f4a261", "#e76f51", "#2a9d8f", "#e9c46a"],
    });
    ctx.go(0);
  };

  const handleSaveKeepsake = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#c13d28", "#d99b26", "#fea095", "#ffffff"],
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const finalMsg =
    gift.finalMessage ||
    "Món quà này sẽ luôn ở đây,\nmỗi khi bạn muốn nhớ lại.";

  return (
    <div
      className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-center text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/sunset_couple_clean.jpg')" }}
    >
      {/* Sunset top lighting overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-white/35 via-transparent to-amber-950/40 pointer-events-none" />

      {/* Save Success Toast */}
      {savedSuccess && (
        <div
          role="status"
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white/95 px-6 py-2.5 shadow-2xl border border-rose-200 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-[#c13d28] animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Đã lưu lại thiệp kỷ niệm thành công!</span>
        </div>
      )}

      {isLandscape ? (
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 lg:p-10">
          <StorybookHeader ctx={ctx} slides={slides} isArtCanvas />

          <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-between py-2">
            {/* Header + Final Message in the Sky */}
            <div className="text-center mt-2 flex flex-col items-center shrink-0">
              <div className="inline-flex items-center justify-center gap-3">
                <h2 className="font-handwriting font-black text-4xl lg:text-5xl text-[#1c3f50] drop-shadow-md">
                  Cảm ơn bạn
                </h2>
                <span className="text-[#c13d28] text-3xl lg:text-4xl animate-pulse">❤️</span>
              </div>
              <p className="font-handwriting text-2xl lg:text-3xl text-[#3d2417] font-bold mt-1 drop-shadow-xs">
                đã đi qua những ngày này cùng mình.
              </p>

              {/* Final Message card floating in the sunset sky */}
              <div className="mt-3 px-6 py-2.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/85 shadow-sm max-w-lg text-center">
                <p className="font-handwriting text-lg lg:text-xl text-[#2e1d1b] font-semibold leading-relaxed whitespace-pre-line">
                  {finalMsg}
                </p>
                {gift.sender && (
                  <p className="font-handwriting text-base lg:text-lg text-[#c13d28] font-bold mt-1">
                    — {gift.sender}
                  </p>
                )}
              </div>
            </div>

            {/* Spacer so the couple and sea are 100% visible */}
            <div className="flex-1 min-h-0 pointer-events-none" />

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-6 pb-2 shrink-0">
              <button
                type="button"
                onClick={handleReplay}
                className="py-3 px-8 rounded-full bg-[#1c3f50] hover:bg-[#142d3a] text-white font-serif font-bold text-sm lg:text-base shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">replay</span>
                <span>Xem lại</span>
              </button>

              <button
                type="button"
                onClick={handleSaveKeepsake}
                className="py-3 px-8 rounded-full bg-[#c13d28] hover:bg-[#a83232] text-white font-serif font-bold text-sm lg:text-base shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Lưu lại</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view: Couple and sunset are 100% clear */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 select-none overflow-hidden">
          <StorybookHeader ctx={ctx} slides={slides} isArtCanvas />

          {/* Header & Final Message in the Sunset Sky */}
          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0 px-2">
            <div className="inline-flex items-center justify-center gap-2">
              <h2 className="font-handwriting font-black text-3xl sm:text-4xl text-[#1c3f50] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                Cảm ơn bạn
              </h2>
              <span className="text-[#c13d28] text-2xl sm:text-3xl animate-pulse">❤️</span>
            </div>
            <p className="font-handwriting text-base sm:text-lg text-[#3d2417] font-bold mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              đã đi qua những ngày này cùng mình.
            </p>

            {/* Keepsake Message card floating softly in the pastel sky */}
            <div className="mt-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/85 shadow-sm max-w-[280px] sm:max-w-xs text-center">
              <p className="font-handwriting text-sm sm:text-base text-[#2e1d1b] font-semibold leading-snug whitespace-pre-line">
                {finalMsg}
              </p>
              {gift.sender && (
                <p className="font-handwriting text-xs sm:text-sm text-[#c13d28] font-bold mt-1">
                  — {gift.sender}
                </p>
              )}
            </div>
          </div>

          {/* Scenic middle spacer: couple and sunset are completely unobstructed */}
          <div className="flex-1 min-h-0 pointer-events-none" />

          {/* Bottom Navigation Buttons */}
          <div className="relative z-20 w-full flex items-center justify-center gap-3 px-3 pb-2 shrink-0">
            <button
              type="button"
              onClick={handleReplay}
              className="flex-1 max-w-[140px] py-2.5 px-4 rounded-full bg-[#1c3f50]/95 hover:bg-[#142d3a] text-white font-serif font-bold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Xem lại</span>
            </button>

            <button
              type="button"
              onClick={handleSaveKeepsake}
              className="flex-1 max-w-[140px] py-2.5 px-4 rounded-full bg-[#c13d28]/95 hover:bg-[#a83232] text-white font-serif font-bold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Lưu lại</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
