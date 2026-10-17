"use client";

import React from "react";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import { daysSince } from "@/components/studio/draft";
import { anniversaryText, formatDateVi } from "@/components/gift-templates/media/format";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

export default function AnniversarySlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const anniversary = gift.anniversary;
  const days = anniversary?.date ? daysSince(anniversary.date) : 0;
  const label = anniversary?.label || "Ngày kỷ niệm";
  const dateFormatted = anniversary?.date ? formatDateVi(anniversary.date) : "";

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
            {/* Left: Decorative Heart & Stars Scene */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-56 lg:w-64 h-56 lg:h-64 flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-300/25 rounded-full blur-3xl animate-pulse" />
                <img
                  src="/thamkhao/heart.png"
                  alt="Trái tim kỷ niệm"
                  className="w-full h-full object-contain drop-shadow-2xl z-10"
                />
              </div>
            </div>

            {/* Right: Anniversary Counter Card */}
            <div className="col-span-7 flex flex-col items-center justify-center text-center px-4">
              <div className="mb-4">
                <span className="font-handwriting text-2xl lg:text-3xl text-[#1c3f50] font-bold block mb-1">
                  Đánh dấu khoảnh khắc
                </span>
                <h2 className="font-serif font-black text-4xl lg:text-5xl text-[#c13d28] tracking-wider uppercase drop-shadow-2xs">
                  NGÀY KỶ NIỆM
                </h2>
              </div>

              {/* Taped Paper Counter Card */}
              <div className="relative w-full max-w-md flex items-center justify-center">
                <img
                  src="/thamkhao/paper.png"
                  alt="Giấy ghi chú"
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
                <div className="absolute inset-0 px-8 py-6 flex flex-col items-center justify-center text-center">
                  <p className="font-handwriting font-bold text-2xl lg:text-3xl text-[#c13d28]">
                    {anniversaryText(days, label)}
                  </p>
                  {dateFormatted && (
                    <p className="font-mono text-sm lg:text-base text-[#8c4b3e] font-semibold mt-2">
                      <time dateTime={anniversary?.date}>{dateFormatted}</time>
                    </p>
                  )}
                  <p className="font-handwriting text-base text-[#2e1d1b] mt-3">
                    Mỗi ngày trôi qua đều là một kỷ niệm đẹp đáng nhớ. ❤️
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 select-none overflow-hidden">
          <StorybookHeader ctx={ctx} slides={slides} />

          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0">
            <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold block -mb-1">
              Đánh dấu khoảnh khắc
            </span>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#c13d28] tracking-wider uppercase">
                NGÀY KỶ NIỆM
              </h2>
              <span className="material-symbols-outlined text-2xl text-[#c13d28]">favorite</span>
            </div>
          </div>

          <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center flex-1 justify-center min-h-0 py-2">
            <div className="relative w-28 h-28 mb-3 flex items-center justify-center">
              <img
                src="/thamkhao/heart.png"
                alt="Trái tim"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            <div className="relative w-full max-w-xs mx-auto flex items-center justify-center">
              <img
                src="/thamkhao/paper.png"
                alt="Giấy ghi chú"
                className="w-full h-auto object-contain drop-shadow-lg"
              />
              <div className="absolute inset-0 px-6 py-5 flex flex-col items-center justify-center text-center">
                <p className="font-handwriting font-bold text-xl sm:text-2xl text-[#c13d28]">
                  {anniversaryText(days, label)}
                </p>
                {dateFormatted && (
                  <p className="font-mono text-xs text-[#8c4b3e] font-semibold mt-1">
                    <time dateTime={anniversary?.date}>{dateFormatted}</time>
                  </p>
                )}
                <p className="font-handwriting text-xs sm:text-sm text-[#2e1d1b] mt-2">
                  Mỗi ngày trôi qua đều là một kỷ niệm đẹp. ❤️
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
