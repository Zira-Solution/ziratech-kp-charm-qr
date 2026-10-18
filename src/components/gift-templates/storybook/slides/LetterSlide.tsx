"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import {
  parseAddressing,
  formatSalutation,
  getDefaultLetterContent,
  getDefaultLetterSubtitle,
} from "@/components/gift-templates/addressing";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

export default function LetterSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const pronouns = parseAddressing(gift.addressing);
  const letter = gift.letter;
  const content = letter?.content || getDefaultLetterContent(pronouns);
  const subtitle = letter?.subtitle || getDefaultLetterSubtitle(pronouns);
  const signature = letter?.signature || gift.sender;

  const salutationText = formatSalutation(gift.recipientName, pronouns.recipient);
  const bodyText = content;
  const sigText = signature ? `— ${signature}` : "";
  const totalLength = salutationText.length + bodyText.length + sigText.length;

  const [typedCount, setTypedCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const landscapeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTypedCount(0);
    const intervalMs = Math.max(16, Math.min(36, Math.floor(3500 / Math.max(totalLength, 1))));
    const timer = setInterval(() => {
      setTypedCount((prev) => {
        if (prev >= totalLength) {
          clearInterval(timer);
          return totalLength;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [totalLength]);

  // Auto-scroll down smoothly as text grows
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    if (landscapeScrollRef.current) {
      landscapeScrollRef.current.scrollTop = landscapeScrollRef.current.scrollHeight;
    }
  }, [typedCount]);

  const salutationChars = Math.min(typedCount, salutationText.length);
  const displaySalutation = salutationText.slice(0, salutationChars);

  const bodyChars = Math.max(0, Math.min(typedCount - salutationText.length, bodyText.length));
  const displayBody = bodyText.slice(0, bodyChars);

  const sigChars = Math.max(0, typedCount - salutationText.length - bodyText.length);
  const displaySignature = sigText.slice(0, sigChars);

  const isFinished = typedCount >= totalLength;

  const cursorStage =
    typedCount < salutationText.length
      ? "salutation"
      : typedCount < salutationText.length + bodyText.length
      ? "body"
      : !isFinished
      ? "signature"
      : "none";

  if (isLandscape) {
    return (
      <div
        className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-center p-6 lg:p-10 pb-8 lg:pb-12 text-[#2e1d1b]"
        style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between">
          <StorybookHeader ctx={ctx} slides={slides} />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-8 py-2">
            {/* Left: Vintage Reading Desk Scene */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <img
                src="/thamkhao/tree.png"
                alt="Cây trang trí"
                className="absolute -bottom-10 -left-10 w-40 h-auto object-contain opacity-85 pointer-events-none"
              />

              <div className="relative w-72 lg:w-80 h-72 lg:h-80 flex items-center justify-center">
                {/* Vintage stamp ticket */}
                <img
                  src="/thamkhao/element_page_2.png"
                  alt="Tem cổ điển"
                  className="absolute -top-6 -right-2 w-20 h-auto object-contain transform rotate-6 drop-shadow-md z-1"
                />

                {/* Kraft envelope */}
                <img
                  src="/thamkhao/envelope.png"
                  alt="Bao thư"
                  className="w-full h-auto object-contain opacity-90 drop-shadow-xl transform -rotate-2"
                />

                {/* Paper plane */}
                <img
                  src="/thamkhao/paper_plane.png"
                  alt="Máy bay giấy"
                  className="absolute bottom-6 left-2 w-14 h-auto object-contain drop-shadow-md transform -rotate-12"
                />

                {/* Fountain pen */}
                <img
                  src="/thamkhao/pen.png"
                  alt="Bút máy"
                  className="absolute -bottom-6 -right-6 w-16 lg:w-20 h-36 lg:h-44 object-contain drop-shadow-2xl transform rotate-12 z-20"
                />
              </div>
            </div>

            {/* Right: Full-Screen Lined Letter Paper */}
            <div className="col-span-7 flex flex-col items-center justify-center h-full min-h-0 px-2 lg:px-6">
              {/* Header */}
              <div className="text-center mb-3 shrink-0">
                <h2 className="font-serif font-black text-3xl lg:text-4xl text-[#1c3f50] tracking-wider uppercase drop-shadow-2xs">
                  {letter?.title || "LỜI NHẮN"}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-handwriting text-2xl lg:text-3xl text-[#8c4b3e] font-bold italic">
                    {subtitle}
                  </span>
                  <img src="/thamkhao/heart_2.png" alt="Trái tim" className="w-6 h-6 object-contain inline-block" />
                  <img src="/thamkhao/music_notes.png" alt="Nốt nhạc" className="w-5 h-5 object-contain inline-block" />
                </div>
              </div>

              {/* Lined Note Paper (Rendered via pure CSS for 100% text-to-line alignment) */}
              <div
                onClick={() => setTypedCount(totalLength)}
                className="relative w-full max-w-xl max-h-[70vh] flex flex-col p-6 lg:p-8 pt-9 rounded-2xl shadow-xl transform rotate-[0.5deg] bg-[#fffefb] border border-[#ebdccd] overflow-hidden cursor-pointer"
                title={!isFinished ? "Chạm để hiện toàn bộ lời nhắn" : undefined}
              >
                {/* Black bulldog clip */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-9 h-9">
                  <img
                    src="/thamkhao/binder_clip.png"
                    alt="Kẹp giấy"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>

                {/* Ruled letter body container */}
                <div
                  ref={landscapeScrollRef}
                  className="overflow-y-auto pr-2 min-h-0 flex-1 scroll-smooth"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, transparent 0px, transparent 37px, #ebdccd 37px, #ebdccd 38px)",
                    backgroundAttachment: "local",
                    lineHeight: "38px",
                  }}
                >
                  <div className="leading-[38px] font-handwriting font-bold text-xl lg:text-2xl text-[#1c3f50] min-h-[38px]">
                    {displaySalutation}
                    {cursorStage === "salutation" && (
                      <span className="inline-block w-0.5 h-5 ml-0.5 bg-[#1c3f50] animate-pulse align-middle" />
                    )}
                  </div>

                  {displayBody.length > 0 && (
                    <p className="leading-[38px] font-handwriting text-lg lg:text-xl text-[#2e1d1b] whitespace-pre-line m-0">
                      {displayBody}
                      {cursorStage === "body" && (
                        <span className="inline-block w-0.5 h-5 ml-0.5 bg-[#c13d28] animate-pulse align-middle" />
                      )}
                    </p>
                  )}

                  {displaySignature.length > 0 && (
                    <div className="leading-[38px] mt-2 text-right">
                      <p className="font-handwriting font-bold text-xl lg:text-2xl text-[#c13d28] m-0 inline-block">
                        {displaySignature}
                        {cursorStage === "signature" && (
                          <span className="inline-block w-0.5 h-5 ml-0.5 bg-[#c13d28] animate-pulse align-middle" />
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center mt-3 pt-1">
                    <img
                      src="/thamkhao/heart.png"
                      alt="Yêu thương"
                      className={`w-7 h-7 object-contain opacity-90 hover:scale-125 transition-all duration-500 ${
                        isFinished ? "opacity-90 scale-100" : "opacity-0 scale-75"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile / Portrait view (Exact match to khung_02.png)
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 pb-6 select-none overflow-hidden bg-cover bg-center text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      <StorybookHeader ctx={ctx} slides={slides} />

      {/* Main Header */}
      <div className="relative z-10 text-center mt-0.5 sm:mt-1 flex flex-col items-center shrink-0">
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1c3f50] tracking-wider uppercase drop-shadow-2xs">
          {letter?.title || "LỜI NHẮN"}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="font-handwriting text-lg sm:text-xl text-[#8c4b3e] font-bold italic">
            {subtitle}
          </span>
          <img src="/thamkhao/heart_2.png" alt="Trái tim" className="w-4.5 h-4.5 object-contain inline-block" />
          <img src="/thamkhao/music_notes.png" alt="Nốt nhạc" className="w-4 h-4 object-contain inline-block" />
        </div>
      </div>

      {/* Desk Scene: Envelope + Lined Letter Paper + Vintage decor (matching khung_02.png) */}
      <div className="relative z-10 my-auto w-full max-w-[330px] sm:max-w-[360px] mx-auto flex flex-col items-center justify-center py-1 min-h-0 flex-1">
        <div className="relative w-full flex items-center justify-center">
          {/* Vintage stamp postcard decor (top-right behind envelope) */}
          <img
            src="/thamkhao/element_page_2.png"
            alt="Tem cổ điển"
            className="absolute -top-6 sm:-top-8 -right-1 sm:-right-2 w-14 sm:w-16 h-auto object-contain pointer-events-none opacity-90 z-0 transform rotate-8 drop-shadow-md"
          />

          {/* Kraft Envelope positioned to frame the paper comfortably from behind (tilted like khung_02) */}
          <img
            src="/thamkhao/envelope.png"
            alt="Bao thư"
            className="absolute -top-8 sm:-top-11 left-1/2 -translate-x-1/2 w-[112%] sm:w-[116%] h-auto max-h-[120%] object-contain opacity-95 pointer-events-none transform -rotate-5 drop-shadow-xl z-0"
          />

          {/* Letter Paper Container: substantial stationery note with min height for realistic stationery */}
          <div
            onClick={() => setTypedCount(totalLength)}
            className="relative w-[88%] sm:w-[90%] min-h-[290px] sm:min-h-[330px] max-h-[50vh] flex flex-col p-4 sm:p-5 pt-7 rounded-2xl shadow-[0_12px_28px_rgba(45,26,16,0.16)] transform rotate-[0.5deg] bg-[#fffdf9] border border-[#ead8c6] z-10 overflow-hidden cursor-pointer"
            title={!isFinished ? "Chạm để hiện toàn bộ lời nhắn" : undefined}
          >
            {/* Binder clip at top-right (matching khung_02.png) */}
            <div className="absolute -top-3.5 right-6 sm:right-8 z-20 w-8 h-8">
              <img
                src="/thamkhao/binder_clip.png"
                alt="Kẹp giấy"
                className="w-full h-full object-contain drop-shadow-md transform rotate-3"
              />
            </div>

            {/* Ruled lines scroll container */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto pr-1 min-h-0 flex-1 scroll-smooth"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, #ead8c6 31px, #ead8c6 32px)",
                backgroundAttachment: "local",
                lineHeight: "32px",
              }}
            >
              {/* Salutation */}
              <div className="leading-[32px] font-handwriting font-bold text-lg sm:text-xl text-[#1c3f50] mb-0 min-h-[32px]">
                {displaySalutation}
                {cursorStage === "salutation" && (
                  <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#1c3f50] animate-pulse align-middle" />
                )}
              </div>

              {/* Letter Body on Lined Paper */}
              {displayBody.length > 0 && (
                <p className="leading-[32px] font-handwriting text-base sm:text-lg text-[#2e1d1b] whitespace-pre-line m-0">
                  {displayBody}
                  {cursorStage === "body" && (
                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#c13d28] animate-pulse align-middle" />
                  )}
                </p>
              )}

              {displaySignature.length > 0 && (
                <div className="leading-[32px] mt-1 text-right">
                  <p className="font-handwriting font-bold text-base sm:text-lg text-[#c13d28] m-0 inline-block">
                    {displaySignature}
                    {cursorStage === "signature" && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#c13d28] animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              )}

              {/* Heart Signature */}
              <div className="flex flex-col items-center justify-center mt-3 pb-1">
                <img
                  src="/thamkhao/heart.png"
                  alt="Yêu thương"
                  className={`w-6 h-6 object-contain transform transition-all duration-500 ${
                    isFinished ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  } hover:scale-125`}
                />
              </div>
            </div>
          </div>

          {/* Fountain pen along the right side (matching khung_02.png) */}
          <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-5 w-14 sm:w-16 h-36 sm:h-42 pointer-events-none z-20 transform rotate-[18deg]">
            <img
              src="/thamkhao/pen.png"
              alt="Bút máy"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
