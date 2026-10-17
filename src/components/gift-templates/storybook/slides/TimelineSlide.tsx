"use client";

import React from "react";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import { formatDateVi, sortTimeline } from "@/components/gift-templates/media/format";
import type { TimelineItem } from "@/components/gift-templates/types";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

export default function TimelineSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const items = sortTimeline(gift.timeline || []);

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
            {/* Left: Directional Signpost Illustration */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-56 lg:w-64 h-64 lg:h-72 flex items-center justify-center">
                <img
                  src="/thamkhao/signpost.png"
                  alt="Mốc thời gian"
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
            </div>

            {/* Right: Milestone Timeline List */}
            <div className="col-span-7 flex flex-col items-center justify-center h-full min-h-0 px-4">
              <div className="text-center mb-3 shrink-0">
                <span className="font-handwriting text-2xl lg:text-3xl text-[#1c3f50] font-bold block mb-1">
                  Chặng đường đã qua
                </span>
                <h2 className="font-serif font-black text-4xl lg:text-5xl text-[#c13d28] tracking-wider uppercase drop-shadow-2xs">
                  MỐC THỜI GIAN
                </h2>
              </div>

              <div className="w-full max-w-lg max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                {items.map((item: TimelineItem, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/90 border border-[#ebdccd] shadow-md flex items-start gap-3"
                  >
                    <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-[#c13d28]" />
                    <div className="min-w-0 flex-1">
                      <time className="font-mono text-xs font-bold text-[#8c4b3e]">
                        {formatDateVi(item.date)}
                      </time>
                      <h3 className="font-serif font-bold text-base text-[#1c3f50] mt-0.5">
                        {item.title}
                      </h3>
                      {item.text && (
                        <p className="font-handwriting text-base text-[#2e1d1b] mt-1 leading-relaxed">
                          {item.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
              Chặng đường đã qua
            </span>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#c13d28] tracking-wider uppercase">
                MỐC THỜI GIAN
              </h2>
              <span className="material-symbols-outlined text-2xl text-[#c13d28]">timeline</span>
            </div>
          </div>

          <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex-1 overflow-y-auto py-2 min-h-0 space-y-2.5">
            {items.map((item: TimelineItem, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/90 border border-[#ebdccd] shadow-sm flex items-start gap-2.5"
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#c13d28]" />
                <div className="min-w-0 flex-1">
                  <time className="font-mono text-[11px] font-bold text-[#8c4b3e]">
                    {formatDateVi(item.date)}
                  </time>
                  <h3 className="font-serif font-bold text-sm text-[#1c3f50] mt-0.5">
                    {item.title}
                  </h3>
                  {item.text && (
                    <p className="font-handwriting text-sm text-[#2e1d1b] mt-0.5 leading-relaxed">
                      {item.text}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
