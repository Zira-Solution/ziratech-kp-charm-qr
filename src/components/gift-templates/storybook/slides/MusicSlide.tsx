"use client";

import React, { useEffect, useState } from "react";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import { useMusicPlayer } from "@/components/gift-templates/media/useMusicPlayer";
import { toMusicEmbed } from "@/lib/media/embed";
import { formatClock } from "@/components/studio/recorder";
import { parseAddressing } from "@/components/gift-templates/addressing";
import StorybookHeader from "./StorybookHeader";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

// Symmetrical multi-peak audio waveform signature (matching khung_05)
const BASE_WAVEFORM = [
  4, 8, 14, 22, 32, 40, 46, 42, 36, 26, 18, 26, 36, 44, 48, 44, 34, 24, 16, 26, 38, 44, 36, 24, 14, 8, 4,
];

const TOTAL_SECONDS = 154; // 2:34

export default function MusicSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const pronouns = parseAddressing(gift.addressing);
  const song = gift.song;
  const isUploaded = song?.source === "upload" && Boolean(song.audioUrl);
  const isPreset = !song || song.source === "preset";
  const presetId = isPreset ? (song?.source === "preset" ? song.presetId : "lofi") : undefined;
  const audioUrl = isUploaded ? song?.audioUrl : undefined;

  const { playing, toggle } = useMusicPlayer(presetId, audioUrl);
  const [eqTick, setEqTick] = useState(0);
  const [progress, setProgress] = useState(25);

  // Equalizer animation effect while playing
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setEqTick((t) => (t + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  // Smooth progress simulation while playing
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.4));
    }, 400);
    return () => clearInterval(timer);
  }, [playing]);

  const currentSec = Math.floor((progress / 100) * TOTAL_SECONDS);
  const remainingSec = Math.max(0, TOTAL_SECONDS - currentSec);

  const embed = song && song.source === "link" ? toMusicEmbed(song.link) : null;
  const songTitle = song?.title || "Giai điệu kỷ niệm";

  return (
    <div
      className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-center text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {isLandscape ? (
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 lg:p-10">
          {/* Potted plant anchored to bottom-left corner of the desk (matching khung_05) */}
          <img
            src="/thamkhao/tree.png"
            alt="Cây cảnh để bàn"
            className="absolute -bottom-6 -left-6 lg:-left-2 w-32 lg:w-44 h-auto object-contain opacity-85 pointer-events-none z-10"
          />

          <StorybookHeader ctx={ctx} slides={slides} />

          <div className="grid h-full min-h-0 flex-1 grid-cols-12 items-center gap-8 py-2">
            {/* Left: Vintage Radio Cassette Console */}
            <div className="col-span-7 flex flex-col items-center justify-center pl-6 lg:pl-10">
              <div className="w-full max-w-lg bg-[#fffefb] p-6 lg:p-7 rounded-3xl shadow-2xl border-4 border-[#ebdccd] flex flex-col items-center">
                {/* LCD Waveform Screen */}
                <div className="w-full bg-[#1c2229] border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-inner h-36 mb-4">
                  <div className="flex items-center justify-between text-[#d8c8b4] font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          playing ? "bg-red-500 animate-ping" : "bg-stone-500"
                        }`}
                      />
                      {playing ? "CASSETTE PLAYING" : "STANDBY"}
                    </span>
                    <span className="text-stone-400">STEREO • HI-FI</span>
                  </div>

                  {/* Symmetrical Waveform Display with Center Axis */}
                  <div className="relative flex items-center justify-center gap-1 sm:gap-1.5 h-16 w-full">
                    {/* Faint horizontal center baseline */}
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[1px] bg-white/15 pointer-events-none" />

                    {BASE_WAVEFORM.map((h, i) => {
                      const dynamicH = playing
                        ? Math.max(4, Math.min(52, h + Math.sin(eqTick * 0.45 + i * 0.55) * (h * 0.35 + 4)))
                        : h;
                      return (
                        <div
                          key={i}
                          className={`w-1 sm:w-1.5 rounded-full transition-all duration-100 z-1 ${
                            playing ? "bg-amber-100 shadow-xs" : "bg-white/40"
                          }`}
                          style={{ height: `${dynamicH}px` }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between font-mono text-[11px] text-stone-400">
                    <span className="truncate max-w-[240px] text-amber-200/90 font-medium">
                      {songTitle}
                    </span>
                    <span>{playing ? "PLAYING" : "PAUSED"}</span>
                  </div>
                </div>

                {/* Player Controls or External Embed */}
                {embed ? (
                  <div className="w-full">
                    <iframe
                      src={embed.src}
                      height={embed.height}
                      title={songTitle}
                      loading="lazy"
                      allow="encrypted-media; autoplay"
                      className="w-full rounded-xl border-0"
                    />
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    {/* Seek / Progress bar */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Thanh thời gian bài hát"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                        setProgress(pct);
                      }}
                      className="relative w-full py-1.5 cursor-pointer group"
                    >
                      <div className="w-full h-1.5 bg-[#ded3c5] rounded-full relative overflow-visible">
                        <div
                          className="h-full bg-[#ba4230] rounded-full transition-all duration-150"
                          style={{ width: `${progress}%` }}
                        />
                        {/* Scrubber thumb knob */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#ba4230] rounded-full shadow-xs transition-transform group-hover:scale-125"
                          style={{ left: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="w-full flex items-center justify-between text-[#172b3a] font-sans text-xs font-semibold mt-1 mb-3">
                      <span>{formatClock(currentSec)}</span>
                      <span>{"-" + formatClock(remainingSec)}</span>
                    </div>

                    {/* Retro Control Buttons */}
                    <div className="flex items-center justify-center gap-7">
                      <button
                        type="button"
                        onClick={() => setProgress(0)}
                        className="p-2 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Về đầu bài"
                        aria-label="Bài trước"
                      >
                        <span className="material-symbols-outlined text-[30px]">skip_previous</span>
                      </button>

                      {/* Big Red Play Button */}
                      <button
                        type="button"
                        onClick={toggle}
                        aria-pressed={playing}
                        aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
                        className="w-16 h-16 rounded-full bg-[#ba4230] hover:bg-[#a63727] active:scale-95 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                      >
                        <span className="material-symbols-outlined text-[38px] ml-1">
                          {playing ? "pause" : "play_arrow"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProgress((p) => Math.min(100, p + 15))}
                        className="p-2 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Tiến 15 giây"
                        aria-label="Bài kế tiếp"
                      >
                        <span className="material-symbols-outlined text-[30px]">skip_next</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Header & Wooden Sign (Clear, spacious, zero obstruction) */}
            <div className="col-span-5 flex flex-col items-center justify-center text-center px-4 relative">
              {/* Floating music notes on upper right */}
              <img
                src="/thamkhao/music_notes.png"
                alt="Nốt nhạc"
                className="absolute -top-10 right-4 w-12 h-auto object-contain opacity-75 pointer-events-none"
              />

              <div className="mb-4">
                <span className="font-handwriting text-2xl lg:text-3xl text-[#172b3a] font-bold block mb-1 transform -rotate-1">
                  Còn một điều
                </span>
                <h2 className="font-serif font-black text-4xl lg:text-5xl xl:text-6xl text-[#ba4230] tracking-wider uppercase drop-shadow-2xs leading-tight my-1">
                  {pronouns.senderUpper} MUỐN NÓI
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-handwriting text-2xl lg:text-3xl text-[#172b3a] font-bold">
                    với {pronouns.recipient}
                  </span>
                  <img src="/thamkhao/music_notes.png" alt="Nốt nhạc" className="w-5 h-5 object-contain inline-block" />
                </div>
              </div>

              {/* Wooden Signboard (High contrast & warm craftsmanship) */}
              <div className="bg-[#d7c4ac] border border-[#9a7d60] px-6 py-2.5 rounded-xl shadow-md text-[#4a2e1d] font-serif text-sm lg:text-base font-bold tracking-wide transform -rotate-1.5 mt-3">
                Nghe lại một chút nhé...
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view (Exact match to khung_05.png) */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 select-none overflow-hidden">
          {/* Potted plant on bottom-left, away from buttons and text */}
          <img
            src="/thamkhao/tree.png"
            alt="Cây cảnh"
            className="absolute bottom-10 -left-6 w-24 sm:w-28 h-auto object-contain pointer-events-none opacity-85 z-10"
          />

          {/* Floating music notes on right */}
          <img
            src="/thamkhao/music_notes.png"
            alt="Nốt nhạc"
            className="absolute top-36 -right-2 w-10 sm:w-12 h-auto object-contain pointer-events-none opacity-85 z-10"
          />

          <StorybookHeader ctx={ctx} slides={slides} />

          {/* Main Header */}
          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0">
            <span className="font-handwriting text-lg sm:text-xl text-[#172b3a] font-bold block -mb-0.5 transform -rotate-1">
              Còn một điều
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#ba4230] tracking-wider uppercase drop-shadow-2xs">
              {pronouns.senderUpper} MUỐN NÓI
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="font-handwriting text-lg sm:text-xl text-[#172b3a] font-bold">
                với {pronouns.recipient}
              </span>
              <img src="/thamkhao/music_notes.png" alt="Nốt nhạc" className="w-4 h-4 object-contain inline-block" />
            </div>
          </div>

          {/* Cassette Radio Chassis */}
          <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center flex-1 justify-center min-h-0 py-2">
            {/* Wooden Signboard */}
            <div className="bg-[#d7c4ac] border border-[#9a7d60] px-4 py-1.5 rounded-lg shadow-sm text-[#4a2e1d] font-serif text-xs font-bold mb-2.5 transform -rotate-1">
              Nghe lại một chút nhé...
            </div>

            <div className="w-full bg-[#fffefb] p-4 sm:p-5 rounded-3xl shadow-2xl border-4 border-[#ebdccd] flex flex-col items-center">
              {/* LCD Screen */}
              <div className="w-full bg-[#1c2229] border border-stone-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-inner h-28 mb-3">
                <div className="flex items-center justify-between text-[#d8c8b4] font-mono text-[10px]">
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        playing ? "bg-red-500 animate-ping" : "bg-stone-500"
                      }`}
                    />
                    {playing ? "CASSETTE PLAYING" : "STANDBY"}
                  </span>
                  <span className="text-stone-400">STEREO • HI-FI</span>
                </div>

                {/* Symmetrical Waveform Display with Center Axis */}
                <div className="relative flex items-center justify-center gap-1 h-12 w-full">
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[1px] bg-white/15 pointer-events-none" />

                  {BASE_WAVEFORM.map((h, i) => {
                    const dynamicH = playing
                      ? Math.max(4, Math.min(42, (h * 0.8) + Math.sin(eqTick * 0.45 + i * 0.55) * (h * 0.25 + 3)))
                      : h * 0.8;
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-100 z-1 ${
                          playing ? "bg-amber-100 shadow-xs" : "bg-white/40"
                        }`}
                        style={{ height: `${dynamicH}px` }}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between font-mono text-[10px] text-stone-400">
                  <span className="truncate max-w-[180px] text-amber-200/90 font-medium">
                    {songTitle}
                  </span>
                  <span>{playing ? "PLAYING" : "PAUSED"}</span>
                </div>
              </div>

              {/* Controls */}
              {embed ? (
                <div className="w-full">
                  <iframe
                    src={embed.src}
                    height={embed.height}
                    title={songTitle}
                    loading="lazy"
                    allow="encrypted-media; autoplay"
                    className="w-full rounded-xl border-0"
                  />
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {/* Seek bar */}
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label="Thanh thời gian bài hát"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                      setProgress(pct);
                    }}
                    className="relative w-full py-1 cursor-pointer group"
                  >
                    <div className="w-full h-1.5 bg-[#ded3c5] rounded-full relative overflow-visible">
                      <div
                        className="h-full bg-[#ba4230] rounded-full transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                      {/* Scrubber thumb knob */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#ba4230] rounded-full shadow-xs transition-transform group-hover:scale-125"
                        style={{ left: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="w-full flex items-center justify-between text-[#172b3a] font-sans text-[11px] font-semibold mt-0.5 mb-2.5">
                    <span>{formatClock(currentSec)}</span>
                    <span>{"-" + formatClock(remainingSec)}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => setProgress(0)}
                      className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Về đầu bài"
                      aria-label="Bài trước"
                    >
                      <span className="material-symbols-outlined text-[24px]">skip_previous</span>
                    </button>

                    {/* Big Red Play Button */}
                    <button
                      type="button"
                      onClick={toggle}
                      aria-pressed={playing}
                      aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
                      className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#ba4230] hover:bg-[#a63727] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-[32px] ml-1">
                        {playing ? "pause" : "play_arrow"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProgress((p) => Math.min(100, p + 15))}
                      className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Tiến 15 giây"
                      aria-label="Bài kế tiếp"
                    >
                      <span className="material-symbols-outlined text-[24px]">skip_next</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
