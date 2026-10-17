"use client";

import React, { useState } from "react";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

interface PhotoItem {
  url: string;
  caption?: string;
}

export default function PhotosSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const [activeModalPhoto, setActiveModalPhoto] = useState<string | null>(null);

  const userPhotos: readonly PhotoItem[] =
    gift.photos && gift.photos.length > 0
      ? gift.photos
      : [
          { url: "/thamkhao/anime_sunset_couple_wide.png", caption: "Những buổi chiều đi dạo..." },
          { url: "/thamkhao/bg_1.jpg", caption: "Những chuyến đi..." },
          { url: "/thamkhao/sunset_couple_clean.jpg", caption: "Những ngày bên nhau..." },
          { url: "/thamkhao/bg.jpg", caption: "Và thật nhiều điều nhỏ..." },
        ];

  const rotations = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1", "-rotate-2", "rotate-2"];

  return (
    <div
      className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-center text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {/* Lightbox Modal */}
      {activeModalPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModalPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white p-3 shadow-2xl">
            <img
              src={activeModalPhoto}
              alt="Ảnh phóng to"
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={() => setActiveModalPhoto(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              aria-label="Đóng ảnh"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}

      {isLandscape ? (
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 lg:p-10">
          <StorybookHeader ctx={ctx} slides={slides} />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-8 py-2">
            {/* Left: Title & Vintage Camera Motif */}
            <div className="col-span-4 flex flex-col items-center justify-center text-center px-4 relative">
              <span className="font-handwriting text-2xl lg:text-3xl text-[#1c3f50] font-bold block mb-1">
                Mình đã có
              </span>
              <div className="flex items-center justify-center gap-3">
                <h2 className="font-serif font-black text-4xl lg:text-5xl text-[#c13d28] tracking-wider uppercase drop-shadow-2xs">
                  NHỮNG NGÀY
                </h2>
              </div>
              <span className="font-handwriting text-2xl lg:text-3xl text-[#1c3f50] font-bold mt-1">
                như thế...
              </span>

              {/* Camera illustration with spark */}
              <div className="relative mt-4 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#3a2012] flex items-center justify-center text-white shadow-xl transform rotate-3">
                  <span className="material-symbols-outlined text-[36px]">photo_camera</span>
                </div>
                <img
                  src="/thamkhao/star.png"
                  alt="Ngôi sao"
                  className="absolute -top-3 -right-3 w-8 h-8 object-contain animate-pulse"
                />
              </div>

              <p className="font-handwriting text-sm text-[#8c4b3e] font-semibold mt-4">
                Chạm vào ảnh để phóng to ✨
              </p>
            </div>

            {/* Right: Spacious Multi-Polaroid Grid */}
            <div className="col-span-8 flex items-center justify-center h-full min-h-0">
              <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full max-w-2xl max-h-[75vh] overflow-y-auto p-2">
                {userPhotos.slice(0, 6).map((item: PhotoItem, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setActiveModalPhoto(item.url)}
                    className={`bg-white p-2.5 pb-4 rounded-xl shadow-xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % rotations.length]} hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer group`}
                  >
                    <div className="aspect-square w-full rounded-sm overflow-hidden bg-stone-100 mb-2 relative">
                      <img
                        src={item.url}
                        alt={item.caption || "Kỷ niệm"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {item.caption && (
                      <span className="font-handwriting text-sm lg:text-base text-[#1c3f50] font-bold text-center line-clamp-1 px-1">
                        {item.caption}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view (Exact match to khung_03.png) */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 select-none overflow-hidden">
          <StorybookHeader ctx={ctx} slides={slides} />

          {/* Main Header */}
          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0">
            <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold block -mb-1">
              Mình đã có
            </span>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#c13d28] tracking-wider uppercase">
                NHỮNG NGÀY
              </h2>
              <span className="material-symbols-outlined text-2xl text-[#8c4b3e]">photo_camera</span>
            </div>
            <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold">
              như thế...
            </span>
          </div>

          {/* 4-Polaroid Collage Grid */}
          <div className="relative z-10 my-auto grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm mx-auto flex-1 items-center min-h-0">
            {/* Floating Stars */}
            <img
              src="/thamkhao/star.png"
              alt="Ngôi sao"
              className="absolute -top-4 -right-2 w-6 h-6 object-contain pointer-events-none opacity-80 animate-pulse z-20"
            />
            <img
              src="/thamkhao/star.png"
              alt="Ngôi sao"
              className="absolute -bottom-3 -left-2 w-5 h-5 object-contain pointer-events-none opacity-75 animate-pulse z-20"
            />

            {userPhotos.slice(0, 4).map((item: PhotoItem, idx: number) => (
              <div
                key={idx}
                onClick={() => setActiveModalPhoto(item.url)}
                className={`bg-white p-2 pb-3 rounded-lg shadow-lg border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % 4]} hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer group relative`}
              >
                <div className="aspect-square w-full rounded-xs overflow-hidden bg-stone-100 mb-1.5 relative">
                  <img
                    src={item.url}
                    alt={item.caption || "Ảnh kỷ niệm"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {item.caption && (
                  <span className="font-handwriting text-sm text-[#1c3f50] font-bold text-center line-clamp-1 px-1">
                    {item.caption}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
