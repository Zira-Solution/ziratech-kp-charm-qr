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
                /* 6-Photo Layout: 3 columns x 2 rows (Flexible for 5-6 photos, centered if 5) */
                userPhotos.length === 5 ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3 lg:gap-4 w-full max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[76vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1">
                    <div className="flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-4 w-full">
                      {userPhotos.slice(0, 3).map((item: PhotoItem, idx: number) => (
                        <button
                          type="button"
                          data-no-swipe
                          key={idx}
                          onClick={() => setActiveModalPhoto(item)}
                          className={`bg-white p-2 pb-3 sm:p-2.5 sm:pb-3.5 rounded-xl shadow-lg hover:shadow-2xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % rotations.length]} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group text-left focus:outline-none w-[130px] sm:w-[150px] lg:w-[175px] shrink-0`}
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
                    <div className="flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-4 w-full">
                      {userPhotos.slice(3, 5).map((item: PhotoItem, idx: number) => (
                        <button
                          type="button"
                          data-no-swipe
                          key={idx + 3}
                          onClick={() => setActiveModalPhoto(item)}
                          className={`bg-white p-2 pb-3 sm:p-2.5 sm:pb-3.5 rounded-xl shadow-lg hover:shadow-2xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[(idx + 3) % rotations.length]} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group text-left focus:outline-none w-[130px] sm:w-[150px] lg:w-[175px] shrink-0`}
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
                  </div>
                ) : (
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
                )
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
        /* Mobile / Portrait view (Balanced polaroid collage tailored for 1-6 photos) */
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

          {/* Polaroid Collage Container (Organic, centered, no giant voids) */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full max-w-sm mx-auto px-1">
            {/* Floating Stars */}
            <img
              src="/thamkhao/star.png"
              alt="Ngôi sao"
              className="absolute -top-3 -right-1 w-6 h-6 object-contain pointer-events-none opacity-80 animate-pulse z-20"
            />
            <img
              src="/thamkhao/star.png"
              alt="Ngôi sao"
              className="absolute -bottom-2 -left-1 w-5 h-5 object-contain pointer-events-none opacity-75 animate-pulse z-20"
            />

            <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3.5 w-full">
              {(() => {
                const count = Math.min(userPhotos.length, 6);
                const active = userPhotos.slice(0, 6);

                // Row partitioning per count:
                let rows: { item: PhotoItem; idx: number; sizeClass: string }[][];
                if (count <= 1) {
                  rows = [[{ item: active[0], idx: 0, sizeClass: "w-52 sm:w-60 max-w-[70vw] p-2.5 pb-4 sm:p-3 sm:pb-5 rounded-2xl" }]];
                } else if (count === 2) {
                  rows = [[
                    { item: active[0], idx: 0, sizeClass: "w-[130px] sm:w-[145px] max-w-[42vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                    { item: active[1], idx: 1, sizeClass: "w-[130px] sm:w-[145px] max-w-[42vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                  ]];
                } else if (count === 3) {
                  rows = [
                    [{ item: active[0], idx: 0, sizeClass: "w-[130px] sm:w-[145px] max-w-[42vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" }],
                    [
                      { item: active[1], idx: 1, sizeClass: "w-[120px] sm:w-[135px] max-w-[40vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                      { item: active[2], idx: 2, sizeClass: "w-[120px] sm:w-[135px] max-w-[40vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                    ],
                  ];
                } else if (count === 4) {
                  rows = [
                    [
                      { item: active[0], idx: 0, sizeClass: "w-[120px] sm:w-[135px] max-w-[40vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                      { item: active[1], idx: 1, sizeClass: "w-[120px] sm:w-[135px] max-w-[40vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                    ],
                    [
                      { item: active[2], idx: 2, sizeClass: "w-[120px] sm:w-[135px] max-w-[40vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                      { item: active[3], idx: 3, sizeClass: "w-[120px] sm:w-[135px] max-w-[40vw] p-2 pb-3.5 sm:p-2.5 sm:pb-4 rounded-xl" },
                    ],
                  ];
                } else if (count === 5) {
                  rows = [
                    [
                      { item: active[0], idx: 0, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                      { item: active[1], idx: 1, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                      { item: active[2], idx: 2, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                    ],
                    [
                      { item: active[3], idx: 3, sizeClass: "w-[102px] sm:w-[114px] max-w-[34vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                      { item: active[4], idx: 4, sizeClass: "w-[102px] sm:w-[114px] max-w-[34vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                    ],
                  ];
                } else {
                  rows = [
                    [
                      { item: active[0], idx: 0, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                      { item: active[1], idx: 1, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                      { item: active[2], idx: 2, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                    ],
                    [
                      { item: active[3], idx: 3, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                      { item: active[4], idx: 4, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                      { item: active[5], idx: 5, sizeClass: "w-[96px] sm:w-[108px] max-w-[30vw] p-1.5 pb-2.5 sm:p-2 sm:pb-3.5 rounded-lg sm:rounded-xl" },
                    ],
                  ];
                }

                return rows.map((row, rIdx) => (
                  <div key={rIdx} className="flex items-center justify-center gap-2 sm:gap-2.5 w-full">
                    {row.map(({ item, idx, sizeClass }) => (
                      <button
                        type="button"
                        data-no-swipe
                        key={idx}
                        onClick={() => setActiveModalPhoto(item)}
                        className={`bg-white ${sizeClass} shadow-[0_4px_14px_rgba(46,29,27,0.12)] hover:shadow-2xl border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx % rotations.length]} hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group relative text-left focus:outline-none shrink-0`}
                      >
                        <div className="aspect-square w-full rounded-xs sm:rounded-sm overflow-hidden bg-stone-100 ring-1 ring-black/5 mb-1 sm:mb-1.5 relative pointer-events-none">
                          <img
                            src={item.url}
                            alt={item.caption || "Ảnh kỷ niệm"}
                            draggable={false}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 select-none"
                          />
                        </div>
                        {(item.caption || item.date) ? (
                          <div className="flex flex-col items-center px-0.5 pointer-events-none select-none text-center w-full">
                            {item.caption && (
                              <span className="font-handwriting text-[10px] sm:text-xs text-[#1c3f50] font-bold line-clamp-1 w-full truncate">
                                {item.caption}
                              </span>
                            )}
                            {item.date && (
                              <span className="text-[9px] sm:text-[10px] text-[#8c4b3e] font-sans font-medium line-clamp-1 w-full truncate">
                                {item.date}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-1 sm:h-1.5 w-full pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                ));
              })()}
            </div>

            <p className="font-handwriting text-xs text-[#8c4b3e]/80 font-semibold mt-2.5 text-center pointer-events-none select-none">
              Chạm vào ảnh để phóng to ✨
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
