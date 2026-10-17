"use client";

import React from "react";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import { useVoicePlayer } from "@/components/gift-templates/media/useVoicePlayer";
import { formatClock } from "@/components/studio/recorder";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

const secondsFrom = (clock: string | undefined) => {
  if (!clock) return 60;
  const m = /^(\d{1,2}):(\d{2})$/.exec(clock);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 60;
};

function Replay15Icon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Arc covering ~310 degrees from left, bottom, right to top */}
      <path d="M 4.5 13 A 8 8 0 1 0 7.8 5.6" />
      {/* Arrowhead at top pointing counter-clockwise (left) */}
      <polyline points="10.5 4.2 7.8 5.6 10.2 7.8" />
      <text
        x="12"
        y="14.8"
        fontSize="7.2"
        fontWeight="800"
        fontFamily="sans-serif"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
      >
        15
      </text>
    </svg>
  );
}

function Forward15Icon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Arc covering ~310 degrees from right, bottom, left to top */}
      <path d="M 19.5 13 A 8 8 0 1 1 16.2 5.6" />
      {/* Arrowhead at top pointing clockwise (right) */}
      <polyline points="13.5 4.2 16.2 5.6 13.8 7.8" />
      <text
        x="12"
        y="14.8"
        fontSize="7.2"
        fontWeight="800"
        fontFamily="sans-serif"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
      >
        15
      </text>
    </svg>
  );
}

export default function VoiceSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const voice = gift.voice;
  const audioUrl = voice?.audioUrl;
  const recordedDuration = secondsFrom(voice?.duration);

  const { playing, current, total, failed, toggle, seek } = useVoicePlayer(
    audioUrl,
    recordedDuration,
    ctx.refreshVoiceUrl
  );

  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  const handleRewind = () => {
    if (total > 0) seek(Math.max(0, current - 15) / total);
  };

  const handleForward = () => {
    if (total > 0) seek(Math.min(total, current + 15) / total);
  };

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
            {/* Left: Illuminated Studio Microphone Scene */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <img
                src="/thamkhao/tree_2.png"
                alt="Cây cảnh"
                className="absolute -bottom-8 -left-4 w-32 h-auto object-contain opacity-85 pointer-events-none"
              />

              <div className="relative w-48 lg:w-56 h-48 lg:h-56 flex items-center justify-center">
                {/* Dual aura: soft cyan-sky watercolor + warm amber glow */}
                <div className="absolute inset-2 bg-sky-200/40 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-2xl animate-pulse" />
                <img
                  src="/thamkhao/microphone.png"
                  alt="Micro thu âm cổ điển"
                  className="w-full h-full object-contain drop-shadow-2xl z-10 transform hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Right: Header & Player Card */}
            <div className="col-span-7 flex flex-col items-center justify-center text-center px-4">
              <div className="mb-4">
                <span className="font-handwriting text-2xl lg:text-3xl text-[#172b3a] font-bold block mb-1">
                  Và cuối cùng...
                </span>
                <h2 className="font-serif font-black text-4xl lg:text-5xl text-[#ba4230] tracking-wider uppercase drop-shadow-2xs">
                  LÀ GIỌNG NÓI
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-handwriting text-2xl lg:text-3xl text-[#172b3a] font-bold">
                    của mình
                  </span>
                  <img src="/thamkhao/microphone.png" alt="Mic" className="w-6 h-6 object-contain inline-block" />
                </div>
              </div>

              {/* Pure CSS Stationery Player Card (matches khung_06) */}
              <div className="relative w-full max-w-md rounded-2xl bg-[#fffefc] border border-[#e8ded2] shadow-[0_12px_36px_rgba(46,29,27,0.12)] p-6 lg:p-7 flex flex-col items-center text-center transform -rotate-0.5">
                {/* Folded dog-ear corner on bottom right */}
                <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none overflow-hidden rounded-br-2xl">
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-[24px] border-r-[24px] border-t-[#ebdccd] border-r-transparent drop-shadow-2xs" />
                </div>

                {/* Progress / Seek bar with Scrubber Knob */}
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Thanh thời gian ghi âm"
                  aria-valuemin={0}
                  aria-valuemax={total || recordedDuration}
                  aria-valuenow={current}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    seek(pct);
                  }}
                  className="relative w-full py-2 cursor-pointer group"
                >
                  <div className="w-full h-1.5 bg-[#ded3c5] rounded-full relative overflow-visible">
                    <div
                      className="h-full bg-[#ba4230] rounded-full transition-all duration-150"
                      style={{ width: `${progressPercent}%` }}
                    />
                    {/* Scrubber thumb knob */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#ba4230] rounded-full shadow-xs transition-transform group-hover:scale-125"
                      style={{ left: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Timestamps */}
                <div className="w-full flex items-center justify-between text-[#172b3a] font-sans text-xs sm:text-sm font-semibold mt-1">
                  <span>{formatClock(current)}</span>
                  <span>{"-" + formatClock(Math.max(0, (total || recordedDuration) - current))}</span>
                </div>

                {/* Controls: Rewind 15s | Big Play | Forward 15s */}
                <div className="flex items-center justify-center gap-7 my-5">
                  <button
                    type="button"
                    onClick={handleRewind}
                    className="p-2 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Lùi 15 giây"
                    aria-label="Lùi 15 giây"
                  >
                    <Replay15Icon className="w-8 h-8" />
                  </button>

                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={playing ? "Tạm dừng giọng nói" : "Phát giọng nói"}
                    className="w-16 h-16 rounded-full bg-[#ba4230] hover:bg-[#a63727] active:scale-95 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-[36px] ml-1">
                      {playing ? "pause" : "play_arrow"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleForward}
                    className="p-2 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Tiến 15 giây"
                    aria-label="Tiến 15 giây"
                  >
                    <Forward15Icon className="w-8 h-8" />
                  </button>
                </div>

                {failed && (
                  <p className="text-xs font-bold text-rose-700 mb-2">
                    Không phát được ghi âm. Hãy tải lại trang.
                  </p>
                )}

                {/* Handwritten quote with outlined heart */}
                <div className="text-center pt-2 max-w-sm mx-auto">
                  <p className="font-handwriting text-base lg:text-lg text-[#172b3a] leading-relaxed font-semibold">
                    {voice?.noteText ||
                      "Có những điều viết ra vẫn chưa đủ. Nên lần này, mình muốn bạn nghe bằng chính giọng nói của mình."}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ba4230"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block w-4 h-4 lg:w-5 lg:h-5 ml-1.5 -mt-0.5 text-[#ba4230]"
                      aria-hidden="true"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view (Exact match to khung_06.png) */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 select-none overflow-hidden">
          <img
            src="/thamkhao/tree_2.png"
            alt="Cây cảnh"
            className="absolute bottom-16 -left-6 w-20 sm:w-24 h-auto object-contain pointer-events-none opacity-85 z-10"
          />

          <img
            src="/thamkhao/music_notes.png"
            alt="Nốt nhạc"
            className="absolute top-40 -right-2 w-10 sm:w-12 h-auto object-contain pointer-events-none opacity-85 z-10"
          />

          <StorybookHeader ctx={ctx} slides={slides} />

          {/* Main Header */}
          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0">
            <span className="font-handwriting text-lg sm:text-xl text-[#172b3a] font-bold block -mb-0.5 transform -rotate-1">
              Và cuối cùng...
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#ba4230] tracking-wider uppercase drop-shadow-2xs">
              LÀ GIỌNG NÓI
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="font-handwriting text-lg sm:text-xl text-[#172b3a] font-bold">
                của mình
              </span>
              <img src="/thamkhao/microphone.png" alt="Mic" className="w-5 h-5 object-contain inline-block" />
            </div>
          </div>

          {/* Center Microphone & Player Card */}
          <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center flex-1 justify-center min-h-0 py-2">
            {/* Glowing Studio Microphone */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-1 flex items-center justify-center">
              <div className="absolute inset-2 bg-sky-200/40 rounded-full blur-2xl" />
              <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-2xl animate-pulse" />
              <img
                src="/thamkhao/microphone.png"
                alt="Micro thu âm"
                className="w-full h-full object-contain drop-shadow-xl z-10 transform hover:scale-105 transition-transform"
              />
            </div>

            {/* Audio Player Card with Voice Controls */}
            <div className="relative w-full max-w-[325px] sm:max-w-xs mx-auto rounded-2xl bg-[#fffefc] border border-[#e8ded2] shadow-[0_12px_32px_rgba(46,29,27,0.12)] p-5 sm:p-6 flex flex-col items-center text-center transform -rotate-0.5">
              {/* Folded dog-ear corner on bottom right */}
              <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none overflow-hidden rounded-br-2xl">
                <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-[20px] border-r-[20px] border-t-[#ebdccd] border-r-transparent drop-shadow-2xs" />
              </div>

              {/* Progress / Seek bar with Scrubber Knob */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Thanh thời gian ghi âm"
                aria-valuemin={0}
                aria-valuemax={total || recordedDuration}
                aria-valuenow={current}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  seek(pct);
                }}
                className="relative w-full py-1.5 cursor-pointer group"
              >
                <div className="w-full h-1.5 bg-[#ded3c5] rounded-full relative overflow-visible">
                  <div
                    className="h-full bg-[#ba4230] rounded-full transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                  {/* Scrubber thumb knob */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#ba4230] rounded-full shadow-xs transition-transform group-hover:scale-125"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Timestamps */}
              <div className="w-full flex items-center justify-between text-[#172b3a] font-sans text-[11px] sm:text-xs font-semibold mt-1">
                <span>{formatClock(current)}</span>
                <span>{"-" + formatClock(Math.max(0, (total || recordedDuration) - current))}</span>
              </div>

              {/* Controls: Rewind 15s | Play | Forward 15s */}
              <div className="flex items-center justify-center gap-6 my-3.5">
                <button
                  type="button"
                  onClick={handleRewind}
                  className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Lùi 15 giây"
                  aria-label="Lùi 15 giây"
                >
                  <Replay15Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>

                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Tạm dừng giọng nói" : "Phát giọng nói"}
                  className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#ba4230] hover:bg-[#a63727] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                >
                  <span className="material-symbols-outlined text-[30px] ml-1">
                    {playing ? "pause" : "play_arrow"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleForward}
                  className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Tiến 15 giây"
                  aria-label="Tiến 15 giây"
                >
                  <Forward15Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
              </div>

              {failed && (
                <p className="text-[10px] font-bold text-rose-700 text-center mb-1">
                  Không phát được ghi âm. Hãy tải lại trang.
                </p>
              )}

              {/* Note Quote with outlined heart */}
              <div className="text-center pt-1 max-w-xs mx-auto">
                <p className="font-handwriting text-xs sm:text-sm text-[#172b3a] leading-snug font-semibold">
                  {voice?.noteText ||
                    "Có những điều viết ra vẫn chưa đủ. Nên lần này, mình muốn bạn nghe bằng chính giọng nói của mình."}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ba4230"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block w-3.5 h-3.5 ml-1.5 -mt-0.5 text-[#ba4230]"
                    aria-hidden="true"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
