"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import { parseAddressing } from "@/components/gift-templates/addressing";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

interface PhotoItem {
  url: string;
  caption?: string;
  date?: string;
}

export default function PhotosSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const pronouns = parseAddressing(gift.addressing);
  const togetherLead =
    pronouns.sender !== "mình"
      ? `${pronouns.Sender} và ${pronouns.recipient} đã có`
      : "Chúng mình đã có";
  const [activeModalPhoto, setActiveModalPhoto] = useState<PhotoItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const isMultiRowSix = userPhotos.length > 4;

  return (
    <div
      className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-center text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {/* Lightbox Modal (Portal to body so parent transforms never clip it) */}
      {activeModalPhoto && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          data-no-swipe
          onClick={() => setActiveModalPhoto(null)}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            data-no-swipe
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
          >
            <img
              src={activeModalPhoto.url}
              alt={activeModalPhoto.caption || "Ảnh phóng to"}
              draggable={false}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain select-none"
            />
            {(activeModalPhoto.caption || activeModalPhoto.date) && (
              <div className="pt-2 pb-0.5 px-2 text-center">
                {activeModalPhoto.caption && (
                  <p className="font-handwriting text-base sm:text-lg text-[#1c3f50] font-bold">
                    {activeModalPhoto.caption}
                  </p>
                )}
                {activeModalPhoto.date && (
                  <p className="text-[11px] sm:text-xs text-[#8c4b3e] font-sans font-medium mt-0.5">
                    {activeModalPhoto.date}
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              data-no-swipe
              onClick={() => setActiveModalPhoto(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
              aria-label="Đóng ảnh"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {isLandscape ? (
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 lg:p-10 pb-8 lg:pb-12">
          <StorybookHeader ctx={ctx} slides={slides} />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-6 lg:gap-8 py-1">
            {/* Left: Title & Vintage Camera Motif */}
            <div className="col-span-4 flex flex-col items-center justify-center text-center px-4 relative">
              <span className="font-handwriting text-2xl lg:text-3xl text-[#1c3f50] font-bold block mb-1">
                {togetherLead}
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

            {/* Right: Adaptive Multi-Polaroid Grid */}
            <div className="col-span-8 flex items-center justify-center h-full min-h-0">
              {isMultiRowSix ? (
                /* 6-Photo Layout: 3 columns x 2 rows (Flexible for 5-6 photos) */
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4 w-full max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[76vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1 items-center justify-center">
                  {userPhotos.slice(0, 6).map((item: PhotoItem, idx: number) => (
                    <button
                      type="button"
                      data-no-swipe
                      key={idx}
                      onClick={() => setActiveModalPhoto(item)}
                      className={`bg-white p-2 pb-3 sm:p-2.5 sm:pb-3.5 rounded-xl shadow-lg hover:shadow-2xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % rotations.length]} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group text-left focus:outline-none`}
                    >
                      <div className="aspect-square w-full rounded-sm overflow-hidden bg-stone-100 mb-1.5 relative pointer-events-none">
                        <img
                          src={item.url}
                          alt={item.caption || "Kỷ niệm"}
                          draggable={false}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none"
                        />
                      </div>
                      {(item.caption || item.date) && (
                        <div className="flex flex-col items-center px-1 pointer-events-none select-none text-center">
                          {item.caption && (
                            <span className="font-handwriting text-xs sm:text-sm lg:text-base text-[#1c3f50] font-bold line-clamp-1">
                              {item.caption}
                            </span>
                          )}
                          {item.date && (
                            <span className="text-[10px] sm:text-xs text-[#8c4b3e] font-sans font-medium line-clamp-1">
                              {item.date}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                /* 4-Photo Layout: 2 columns x 2 rows (Enlarged and perfectly balanced like mobile) */
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl max-h-[76vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1 items-center justify-center">
                  {userPhotos.slice(0, 4).map((item: PhotoItem, idx: number) => (
                    <button
                      type="button"
                      data-no-swipe
                      key={idx}
                      onClick={() => setActiveModalPhoto(item)}
                      className={`bg-white p-2 pb-3 sm:p-2.5 sm:pb-3.5 lg:p-3 lg:pb-4.5 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % 4]} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group text-left focus:outline-none`}
                    >
                      <div className="aspect-square w-full rounded-md overflow-hidden bg-stone-100 mb-1.5 lg:mb-2 relative pointer-events-none">
                        <img
                          src={item.url}
                          alt={item.caption || "Kỷ niệm"}
                          draggable={false}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none"
                        />
                      </div>
                      {(item.caption || item.date) && (
                        <div className="flex flex-col items-center px-1 pointer-events-none select-none text-center">
                          {item.caption && (
                            <span className="font-handwriting text-xs sm:text-sm lg:text-base xl:text-lg text-[#1c3f50] font-bold line-clamp-1">
                              {item.caption}
                            </span>
                          )}
                          {item.date && (
                            <span className="text-[10px] sm:text-xs lg:text-sm text-[#8c4b3e] font-sans font-medium line-clamp-1">
                              {item.date}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view (Exact match to khung_03.png) */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 pb-8 sm:pb-9 select-none overflow-hidden">
          <StorybookHeader ctx={ctx} slides={slides} />

          {/* Main Header */}
          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0">
            <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold block -mb-1">
              {togetherLead}
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

          {/* Polaroid Collage Grid (Adaptive: 2x2 for <=4 photos, 3x2 for 6 photos) */}
          {isMultiRowSix ? (
            /* 6-Photo Layout on Mobile: 3 columns x 2 rows */
            <div className="relative z-10 my-auto grid grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-sm sm:max-w-md mx-auto flex-1 items-center min-h-0">
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

              {userPhotos.slice(0, 6).map((item: PhotoItem, idx: number) => (
                <button
                  type="button"
                  data-no-swipe
                  key={idx}
                  onClick={() => setActiveModalPhoto(item)}
                  className={`bg-white p-1.5 pb-2.5 sm:p-2 sm:pb-3 rounded-lg shadow-md hover:shadow-xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % rotations.length]} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group relative text-left focus:outline-none`}
                >
                  <div className="aspect-square w-full rounded-xs overflow-hidden bg-stone-100 mb-1 relative pointer-events-none">
                    <img
                      src={item.url}
                      alt={item.caption || "Ảnh kỷ niệm"}
                      draggable={false}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none"
                    />
                  </div>
                  {(item.caption || item.date) && (
                    <div className="flex flex-col items-center px-0.5 pointer-events-none select-none text-center">
                      {item.caption && (
                        <span className="font-handwriting text-[10px] sm:text-xs text-[#1c3f50] font-bold line-clamp-1">
                          {item.caption}
                        </span>
                      )}
                      {item.date && (
                        <span className="text-[9px] sm:text-[10px] text-[#8c4b3e] font-sans font-medium line-clamp-1">
                          {item.date}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            /* 4-Photo Layout on Mobile: 2 columns x 2 rows (Original 2x2 framing) */
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
                <button
                  type="button"
                  data-no-swipe
                  key={idx}
                  onClick={() => setActiveModalPhoto(item)}
                  className={`bg-white p-2.5 pb-3.5 sm:p-3 sm:pb-4 rounded-xl shadow-lg hover:shadow-xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % 4]} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group relative text-left focus:outline-none`}
                >
                  <div className="aspect-square w-full rounded-sm overflow-hidden bg-stone-100 mb-1.5 relative pointer-events-none">
                    <img
                      src={item.url}
                      alt={item.caption || "Ảnh kỷ niệm"}
                      draggable={false}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none"
                    />
                  </div>
                  {(item.caption || item.date) && (
                    <div className="flex flex-col items-center px-1 pointer-events-none select-none text-center">
                      {item.caption && (
                        <span className="font-handwriting text-xs sm:text-sm text-[#1c3f50] font-bold line-clamp-1">
                          {item.caption}
                        </span>
                      )}
                      {item.date && (
                        <span className="text-[10px] sm:text-xs text-[#8c4b3e] font-sans font-medium line-clamp-1">
                          {item.date}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
