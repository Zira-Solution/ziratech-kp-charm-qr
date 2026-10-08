"use client";

import React, { useState, useEffect } from "react";
import { RecipientGiftData } from "./types";
import { musicPlayerSynth } from "./audio-helper";

interface TemplateProps {
  data: RecipientGiftData;
  activeSlide: number;
  viewMode?: "story" | "sheet" | "scroll";
  onGoToSlide: (slide: number) => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onSaveKeepsake: () => void;
}

export default function StorybookSunsetTemplate({
  data,
  activeSlide,
  viewMode = "story",
  onGoToSlide,
  onNextSlide,
  onPrevSlide,
  onSaveKeepsake,
}: TemplateProps) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(35);
  const [voiceProgress, setVoiceProgress] = useState(50);

  const toggleMusic = () => {
    if (isPlayingMusic) {
      musicPlayerSynth.stop();
      setIsPlayingMusic(false);
    } else {
      if (isPlayingVoice) {
        setIsPlayingVoice(false);
      }
      musicPlayerSynth.play();
      setIsPlayingMusic(true);
    }
  };

  const toggleVoice = () => {
    if (isPlayingVoice) {
      musicPlayerSynth.stop();
      setIsPlayingVoice(false);
    } else {
      if (isPlayingMusic) {
        setIsPlayingMusic(false);
      }
      musicPlayerSynth.play();
      setIsPlayingVoice(true);
    }
  };

  useEffect(() => {
    return () => {
      musicPlayerSynth.stop();
    };
  }, []);

  // Card 1: 01 / 07 Có một món quà dành cho bạn ✈
  const renderCard1 = (isMini = false) => (
    <div
      key="card-1"
      className="relative w-full h-full min-h-[640px] anime-card-bg text-[#2c2623] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#ebdccd] rounded-3xl shadow-sm transition-all"
    >
      {/* Top Header: 01 / 07 & Menu */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ebdccd]/80 z-10">
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-wider">
          01 / 07
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#8c4b3e]">menu</span>
      </div>

      {/* Header */}
      <div className="text-center mt-1 z-10">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#8c4b3e] whitespace-nowrap flex items-center justify-center gap-1.5">
          <span>Có một</span>
          <span className="text-[#a83232]">món quà</span>
        </h1>
        <p className="font-serif italic text-xs sm:text-sm text-[#4a3b32] mt-0.5 flex items-center justify-center gap-1 whitespace-nowrap">
          <span>dành cho bạn</span>
          <span className="text-[#8c4b3e]">✈</span>
        </p>
      </div>

      {/* Anime Seaside Scene with Gift Box & Signpost Planks */}
      <div
        onClick={() => (isMini ? onGoToSlide(1) : onNextSlide())}
        className="cursor-pointer group relative my-2.5 w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-[#e5d2c1] bg-[#f0e4d7] z-10"
      >
        <div className="aspect-[4/3] w-full relative">
          <img
            src={data.coverIllustrationUrl || "/images/anime_sunset_gift_box.jpg"}
            alt="Anime Sunset Bay"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          {/* Signpost Planks Left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 text-[10px] font-medium text-white/95">
            <span className="bg-[#6b4737]/85 px-2 py-0.5 rounded-r-md backdrop-blur-xs shadow-sm">
              • Những kỷ niệm
            </span>
            <span className="bg-[#6b4737]/85 px-2 py-0.5 rounded-r-md backdrop-blur-xs shadow-sm">
              • Lời nhắn
            </span>
            <span className="bg-[#6b4737]/85 px-2 py-0.5 rounded-r-md backdrop-blur-xs shadow-sm">
              • Khoảnh khắc
            </span>
            <span className="bg-[#6b4737]/85 px-2 py-0.5 rounded-r-md backdrop-blur-xs shadow-sm">
              • Và nhiều hơn...
            </span>
          </div>

          {/* Elegant Gift Box Graphic Bottom Right */}
          <div className="absolute bottom-2.5 right-3 w-16 h-16 rounded-xl bg-white/95 p-1.5 shadow-xl border-2 border-[#8c4b3e] flex items-center justify-center animate-bounce">
            <span className="material-symbols-outlined text-[34px] text-[#8c4b3e]">
              featured_seasonal_and_gifts
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full flex justify-center z-10 pb-1">
        <button
          onClick={() => (isMini ? onGoToSlide(1) : onNextSlide())}
          className="w-full max-w-[280px] py-3 px-5 rounded-full bg-white hover:bg-[#faeee5] active:scale-95 text-[#8c4b3e] font-serif font-bold text-xs sm:text-sm shadow-md border border-[#e5d2c1] transition-all flex items-center justify-center gap-2 group"
        >
          <span>Chạm để mở món quà</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );

  // Card 2: 02 / 07 Lời nhắn
  const renderCard2 = (isMini = false) => (
    <div
      key="card-2"
      className="relative w-full h-full min-h-[640px] anime-card-bg text-[#2c2623] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#ebdccd] rounded-3xl shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ebdccd]/80 z-10">
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-wider">
          02 / 07
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#8c4b3e]">menu</span>
      </div>

      <div className="text-center mt-1 z-10">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2c2623] tracking-wide whitespace-nowrap">
          LỜI NHẮN
        </h2>
        <p className="font-serif italic text-xs sm:text-sm text-[#8c4b3e] flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span>Gửi đến bạn...</span>
          <span>♡</span>
          <span>♫</span>
        </p>
      </div>

      {/* Note with Binder Clip and Fountain Pen */}
      <div className="relative w-full max-w-[290px] mx-auto my-auto z-10">
        <div className="absolute inset-0 bg-[#d8bda7] rounded-xl transform rotate-1 shadow-md border border-[#c4a68f]" />

        <div className="relative bg-[#fffefc] p-4 pt-7 rounded-lg shadow-xl border border-[#ebdccd]">
          {/* Black Binder Clip */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
            <div className="w-7 h-4.5 bg-[#222] rounded-xs shadow-md border border-gray-600" />
            <div className="w-4.5 h-3 border-2 border-gray-400 rounded-t-xs -mt-1" />
          </div>

          <div className="mb-1.5">
            <span className="font-serif italic font-bold text-sm sm:text-base text-[#8c4b3e]">
              Gửi bạn,
            </span>
          </div>

          <p className="font-serif text-xs sm:text-sm text-[#38312d] whitespace-pre-line leading-relaxed min-h-[140px]">
            {data.letterContent}
          </p>

          <div className="text-center mt-1.5 text-[#8c4b3e] text-base font-serif">
            ♡
          </div>
        </div>

        {/* Fountain Pen Graphic */}
        <div className="absolute -bottom-2 -right-3 text-[#2c3e50] transform rotate-45 pointer-events-none drop-shadow-md">
          <span className="material-symbols-outlined text-[30px]">edit</span>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 z-10 pb-1 text-[#8c4b3e]">
        <span>←</span>
        <span className="text-xs">● ○ ○ ○ ○</span>
        <span>→</span>
      </div>
    </div>
  );

  // Card 3: 03 / 07 Mình đã có những ngày như thế... (4-grid polaroids)
  const renderCard3 = (isMini = false) => (
    <div
      key="card-3"
      className="relative w-full h-full min-h-[640px] anime-card-bg text-[#2c2623] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#ebdccd] rounded-3xl shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ebdccd]/80 z-10">
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-wider">
          03 / 07
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#8c4b3e]">menu</span>
      </div>

      <div className="text-center mt-1 z-10">
        <span className="font-serif italic text-xs text-[#8c4b3e] block -mb-0.5">
          Mình đã có
        </span>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#a83232] tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span>NHỮNG NGÀY</span>
          <span className="material-symbols-outlined text-[18px] text-[#4a3b32]">photo_camera</span>
        </h2>
        <span className="font-serif italic text-xs text-[#4a3b32]">
          như thế...
        </span>
      </div>

      {/* 4 Photo Grid with Handwritten Labels */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-[280px] mx-auto my-auto z-10">
        {data.memoryPhotos.map((photo, i) => (
          <div
            key={i}
            className="bg-white p-1.5 pb-2 rounded-lg shadow-md border border-[#ebdccd] flex flex-col items-center"
          >
            <div className="aspect-square w-full rounded-xs overflow-hidden bg-slate-100 mb-1">
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif italic text-[9px] text-[#4a3b32] text-center line-clamp-1">
              {photo.caption}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center z-10 pb-1">
        <p className="font-serif italic text-xs text-[#8c4b3e]">
          Và thật nhiều điều nhỏ... ♡
        </p>
      </div>
    </div>
  );

  // Card 4: 04 / 07 Video dành cho bạn
  const renderCard4 = (isMini = false) => (
    <div
      key="card-4"
      className="relative w-full h-full min-h-[640px] anime-card-bg text-[#2c2623] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#ebdccd] rounded-3xl shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ebdccd]/80 z-10">
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-wider">
          04 / 07
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#8c4b3e]">menu</span>
      </div>

      <div className="text-center mt-1 z-10">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#a83232] tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span>Video</span>
          <span className="text-lg">♡</span>
        </h2>
        <p className="font-serif italic text-xs text-[#4a3b32] flex items-center justify-center gap-1 whitespace-nowrap">
          <span>dành cho bạn</span>
          <span className="material-symbols-outlined text-[15px] text-[#a83232]">videocam</span>
        </p>
      </div>

      {/* Embedded Video Mockup with Player Controls */}
      <div className="relative w-full max-w-[280px] mx-auto rounded-xl overflow-hidden shadow-xl border border-[#ebdccd] bg-black my-auto z-10">
        <div className="aspect-[16/10] w-full relative">
          <img
            src="/images/anime_sunset_couple.jpg"
            alt="Video hoàng hôn anime"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="w-12 h-12 rounded-full bg-[#a83232]/90 hover:bg-[#a83232] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[28px]">
                {isVideoPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-3">
            <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-1">
              <div
                className="bg-[#a83232] h-full"
                style={{ width: isVideoPlaying ? "65%" : "25%" }}
              />
            </div>
            <div className="flex justify-between items-center text-[8px] text-white/90 font-mono">
              <span>{isVideoPlaying ? "02:40" : "0:00"}</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px]">volume_up</span>
                <span className="material-symbols-outlined text-[13px]">fullscreen</span>
                <span>4:12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center px-3 z-10 pb-1">
        <p className="font-serif italic text-xs text-[#4a3b32] leading-relaxed">
          Một video đặc biệt gửi riêng cho bạn, với thật nhiều lời muốn nói và những kỷ niệm đẹp... <span className="text-[#a83232]">♡</span>
        </p>
      </div>
    </div>
  );

  // Card 5: 05 / 07 Còn một điều mình muốn nói với bạn
  const renderCard5 = (isMini = false) => (
    <div
      key="card-5"
      className="relative w-full h-full min-h-[640px] anime-card-bg text-[#2c2623] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#ebdccd] rounded-3xl shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ebdccd]/80 z-10">
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-wider">
          05 / 07
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#8c4b3e]">menu</span>
      </div>

      <div className="text-center mt-1 z-10">
        <span className="font-serif italic text-xs text-[#8c4b3e] block -mb-0.5">
          Còn một điều
        </span>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#a83232] tracking-wide whitespace-nowrap">
          MÌNH MUỐN NÓI
        </h2>
        <p className="font-serif italic text-xs text-[#4a3b32] flex items-center justify-center gap-1 whitespace-nowrap">
          <span>với bạn</span>
          <span>♫</span>
        </p>
      </div>

      <div className="inline-flex items-center px-3.5 py-0.5 mx-auto rounded-full bg-[#f3ded7] text-[#a83232] font-serif text-xs border border-[#e5c4bc] z-10">
        Nghe lại một chút nhé...
      </div>

      <div className="w-full max-w-[280px] mx-auto bg-white p-4 rounded-2xl shadow-lg border border-[#ebdccd] my-auto space-y-3 z-10">
        <div className="h-14 bg-[#1f1a18] rounded-xl p-2.5 flex items-center justify-center gap-1">
          {[25, 60, 90, 45, 80, 100, 65, 35, 85, 70, 95, 55, 75, 90, 40, 65, 80, 50].map(
            (h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlayingMusic ? "bg-[#e5a295] animate-pulse" : "bg-[#554b46]"
                }`}
                style={{ height: `${isPlayingMusic ? h : 20}%` }}
              />
            )
          )}
        </div>

        <div className="space-y-1">
          <div className="w-full bg-[#ebdccd] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#a83232] h-full transition-all"
              style={{ width: `${isPlayingMusic ? musicProgress : 20}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#4a3b32] font-mono">
            <span>{isPlayingMusic ? "01:20" : "0:00"}</span>
            <span>-{data.song.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setMusicProgress(Math.max(0, musicProgress - 15))}
            className="text-[#8c4b3e]"
          >
            <span className="material-symbols-outlined text-[20px]">skip_previous</span>
          </button>

          <button
            onClick={toggleMusic}
            className="w-11 h-11 rounded-full bg-[#a83232] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isPlayingMusic ? "pause" : "play_arrow"}
            </span>
          </button>

          <button
            onClick={() => setMusicProgress(Math.min(100, musicProgress + 15))}
            className="text-[#8c4b3e]"
          >
            <span className="material-symbols-outlined text-[20px]">skip_next</span>
          </button>
        </div>
      </div>

      <div className="h-1 z-10" />
    </div>
  );

  // Card 6: 06 / 07 Và cuối cùng... là giọng nói của mình
  const renderCard6 = (isMini = false) => (
    <div
      key="card-6"
      className="relative w-full h-full min-h-[640px] anime-card-bg text-[#2c2623] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#ebdccd] rounded-3xl shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ebdccd]/80 z-10">
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-wider">
          06 / 07
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#8c4b3e]">menu</span>
      </div>

      <div className="text-center mt-1 z-10">
        <span className="font-serif italic text-xs text-[#8c4b3e] block -mb-0.5">
          Và cuối cùng...
        </span>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#a83232] tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span>LÀ GIỌNG NÓI</span>
          <span className="material-symbols-outlined text-[18px]">mic</span>
        </h2>
        <p className="font-serif italic text-xs text-[#4a3b32] flex items-center justify-center gap-1 whitespace-nowrap">
          <span>của mình</span>
          <span>♫</span>
        </p>
      </div>

      <div className="relative my-auto flex flex-col items-center z-10">
        <div className="w-18 h-18 rounded-full bg-[#f3ded7] flex items-center justify-center mb-2 shadow-md border border-[#ebdccd]">
          <span className="material-symbols-outlined text-[38px] text-[#a83232]">
            mic
          </span>
        </div>

        <div className="w-full max-w-[270px] bg-white p-3.5 rounded-xl shadow-md border border-[#ebdccd] space-y-2.5">
          <div className="space-y-1">
            <div className="w-full bg-[#ebdccd] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#a83232] h-full transition-all"
                style={{ width: `${isPlayingVoice ? voiceProgress : 40}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#4a3b32] font-mono">
              <span>{isPlayingVoice ? "01:10" : "0:00"}</span>
              <span>-{data.voiceNote.duration}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setVoiceProgress(Math.max(0, voiceProgress - 15))}
              className="w-7 h-7 rounded-full bg-[#fbf5ed] text-[#4a3b32] text-[9px] font-bold flex items-center justify-center border border-[#ebdccd]"
              title="Lùi 15s"
            >
              -15
            </button>

            <button
              onClick={toggleVoice}
              className="w-11 h-11 rounded-full bg-[#a83232] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isPlayingVoice ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              onClick={() => setVoiceProgress(Math.min(100, voiceProgress + 15))}
              className="w-7 h-7 rounded-full bg-[#fbf5ed] text-[#4a3b32] text-[9px] font-bold flex items-center justify-center border border-[#ebdccd]"
              title="Tiến 15s"
            >
              +15
            </button>
          </div>
        </div>
      </div>

      <div className="text-center px-3 z-10 pb-1">
        <p className="font-serif italic text-xs text-[#38312d] leading-relaxed">
          {data.voiceNote.noteText} <span className="text-[#a83232]">♡</span>
        </p>
      </div>
    </div>
  );

  // Card 7: 07 / 07 Cảm ơn bạn & Dual Buttons
  const renderCard7 = (isMini = false) => (
    <div
      key="card-7"
      className="relative w-full h-full min-h-[640px] anime-card-bg text-[#2c2623] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#ebdccd] rounded-3xl shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-[#ebdccd]/80 z-10">
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-wider">
          07 / 07
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#8c4b3e]">menu</span>
      </div>

      <div className="text-center mt-1 z-10">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2c2623] tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span>Cảm ơn bạn</span>
          <span className="text-[#a83232]">♡</span>
        </h2>
        <p className="font-serif italic text-xs text-[#4a3b32] mt-0.5 whitespace-nowrap">
          đã đi qua những ngày này cùng mình.
        </p>
      </div>

      <div className="relative my-auto w-full max-w-[270px] mx-auto rounded-xl overflow-hidden shadow-xl border border-[#ebdccd] bg-white p-2 z-10">
        <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-1.5">
          <img
            src="/images/anime_sunset_couple.jpg"
            alt="Đôi bạn ngắm hoàng hôn"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="font-serif italic text-[10px] text-[#4a3b32] text-center">
          {data.finalMessage}
        </p>
      </div>

      <div className="w-full max-w-[280px] mx-auto grid grid-cols-2 gap-2.5 mt-1.5 z-10 pb-1">
        <button
          onClick={() => onGoToSlide(1)}
          className="py-2.5 px-3 rounded-xl bg-[#2b4c6f] hover:bg-[#385e87] text-white font-medium text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">replay</span>
          <span>Xem lại</span>
        </button>

        <button
          onClick={onSaveKeepsake}
          className="py-2.5 px-3 rounded-xl bg-[#a83232] hover:bg-[#be3939] text-white font-medium text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Lưu lại</span>
        </button>
      </div>
    </div>
  );

  // SHEET OVERVIEW (IMAGE 3 REPLICA)
  if (viewMode === "sheet") {
    return (
      <div className="w-full max-w-6xl mx-auto py-4 px-2 space-y-5">
        <div className="text-center mb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#a83232] font-bold">
            BẢN THẢO HOÀN THIỆN • 7 TRANG KỶ NIỆM 20/10
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2c2623]">
            Thanh Xuân Sunset Anime &amp; Video
          </h2>
          <p className="text-xs text-[#6e5d57] mt-1">
            Bấm vào bất kỳ trang nào để lướt xem chi tiết toàn màn hình
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div onClick={() => onGoToSlide(1)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
            {renderCard1(true)}
          </div>
          <div onClick={() => onGoToSlide(2)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
            {renderCard2(true)}
          </div>
          <div onClick={() => onGoToSlide(3)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
            {renderCard3(true)}
          </div>
          <div onClick={() => onGoToSlide(4)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
            {renderCard4(true)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto gap-4">
          <div onClick={() => onGoToSlide(5)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
            {renderCard5(true)}
          </div>
          <div onClick={() => onGoToSlide(6)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
            {renderCard6(true)}
          </div>
          <div onClick={() => onGoToSlide(7)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
            {renderCard7(true)}
          </div>
        </div>
      </div>
    );
  }

  // SCROLL MODE
  if (viewMode === "scroll") {
    return (
      <div className="w-full max-w-md mx-auto py-4 space-y-6">
        {renderCard1()}
        {renderCard2()}
        {renderCard3()}
        {renderCard4()}
        {renderCard5()}
        {renderCard6()}
        {renderCard7()}
      </div>
    );
  }

  // STORY MODE
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex-1">
        {activeSlide === 1 && renderCard1()}
        {activeSlide === 2 && renderCard2()}
        {activeSlide === 3 && renderCard3()}
        {activeSlide === 4 && renderCard4()}
        {activeSlide === 5 && renderCard5()}
        {activeSlide === 6 && renderCard6()}
        {activeSlide === 7 && renderCard7()}
      </div>

      <div className="py-2.5 px-4 bg-white rounded-full shadow-md border border-[#ebdccd] mt-2 flex items-center justify-between text-xs">
        <button
          onClick={onPrevSlide}
          disabled={activeSlide === 1}
          className={`w-8 h-8 rounded-full border border-[#ebdccd] bg-white flex items-center justify-center text-[#4a3b32] hover:bg-[#faeee5] transition-colors ${
            activeSlide === 1 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          ←
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              onClick={() => onGoToSlide(num)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeSlide === num
                  ? "w-5 bg-[#a83232]"
                  : "bg-[#d8c5b4] hover:bg-[#a83232]/50"
              }`}
              title={`Trang ${num}`}
            />
          ))}
        </div>

        <button
          onClick={onNextSlide}
          disabled={activeSlide === 7}
          className={`w-8 h-8 rounded-full border border-[#ebdccd] bg-white flex items-center justify-center text-[#4a3b32] hover:bg-[#faeee5] transition-colors ${
            activeSlide === 7 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          →
        </button>
      </div>
    </div>
  );
}
