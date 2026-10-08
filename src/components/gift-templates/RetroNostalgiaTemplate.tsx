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

export default function RetroNostalgiaTemplate({
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
  const [musicProgress, setMusicProgress] = useState(30);
  const [voiceProgress, setVoiceProgress] = useState(45);

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

  // Card 1: Có một món quà dành cho [Tên người nhận].
  const renderCard1 = (isMini = false) => (
    <div
      key="card-1"
      className="relative w-full h-full min-h-[640px] retro-card-bg text-[#1c1a19] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border-2 border-[#1c3f50]/40 rounded-3xl shadow-sm transition-all"
    >
      {/* Retro Star Sparkles */}
      <div className="absolute top-2 right-3 text-[#d99b26] text-xl font-bold pointer-events-none z-10">✦</div>
      <div className="absolute top-8 left-2 text-[#c13d28] text-sm font-bold pointer-events-none z-10">✦</div>

      {/* Header with 3D Drop Shadow Typography */}
      <div className="text-center mt-1 w-full flex flex-col items-center z-10">
        <span className="font-serif italic text-xl text-[#1c3f50] font-bold">
          Có một
        </span>

        <h1 className="font-retro text-3xl sm:text-4xl uppercase tracking-wider whitespace-nowrap retro-3d-title-red my-0.5">
          MÓN QUÀ
        </h1>

        {/* Retro Stripes Bar */}
        <div className="flex items-center gap-1.5 my-1">
          <div className="w-7 h-1 bg-[#1c3f50] rounded-full" />
          <div className="w-7 h-1 bg-[#d99b26] rounded-full" />
          <div className="w-7 h-1 bg-[#c13d28] rounded-full" />
        </div>

        <div className="flex items-center justify-center gap-1 mt-0.5 text-sm sm:text-base text-[#1c3f50] whitespace-nowrap">
          <span className="font-serif italic font-bold">dành cho</span>
          <span className="font-retro font-bold text-[#c13d28]">
            [{data.recipientName}].
          </span>
        </div>
      </div>

      {/* Bracelet Photo in Retro Frame with Stamp Lines */}
      <div
        onClick={() => (isMini ? onGoToSlide(1) : onNextSlide())}
        className="cursor-pointer group relative my-2 max-w-[250px] mx-auto w-full z-10"
      >
        <div className="bg-[#fffdfa] p-2.5 pb-4 rounded-md shadow-xl border-2 border-[#1c3f50] relative group-hover:scale-[1.02] transition-transform duration-300">
          <div className="aspect-square w-full rounded-xs overflow-hidden bg-[#24342f] relative border border-[#d8c8b4]">
            <img
              src={data.braceletImg}
              alt={data.braceletTitle}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-1.5 text-center border-t border-[#1c3f50]/20 pt-1">
            <span className="font-mono text-[9px] tracking-widest text-[#1c3f50] uppercase font-bold">
              K&amp;P ATELIER • NO. 2010
            </span>
          </div>
        </div>

        {/* Stamp Lines */}
        <div className="absolute -right-2 -bottom-2 flex flex-col gap-0.5 text-[#1c3f50] opacity-80 pointer-events-none">
          <div className="w-8 h-0.5 bg-[#1c3f50]" />
          <div className="w-8 h-0.5 bg-[#1c3f50]" />
          <div className="w-8 h-0.5 bg-[#1c3f50]" />
        </div>
      </div>

      {/* Quote & Button */}
      <div className="w-full flex flex-col items-center gap-2.5 z-10 pb-1">
        <p className="font-serif italic text-xs sm:text-sm text-[#3d322d] text-center max-w-xs leading-relaxed px-2 font-medium">
          Có những kỷ niệm không cần phải thật lớn, chỉ cần đủ đặc biệt để chúng ta muốn nhớ mãi.
        </p>

        <button
          onClick={() => (isMini ? onGoToSlide(1) : onNextSlide())}
          className="w-full max-w-[290px] py-2.5 px-4 rounded-full bg-[#e8a391] hover:bg-[#df927e] active:scale-95 text-[#1c1a19] font-serif font-bold text-xs sm:text-sm shadow-md border-2 border-[#1c1a19] transition-all flex items-center justify-center gap-2 group"
        >
          <span>Chạm vào chiếc vòng để mở những kỷ niệm.</span>
          <span className="w-5 h-5 rounded-full border border-[#1c1a19] flex items-center justify-center group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </div>
    </div>
  );

  // Card 2: Lời nhắn
  const renderCard2 = (isMini = false) => (
    <div
      key="card-2"
      className="relative w-full h-full min-h-[640px] retro-card-bg text-[#1c1a19] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border-2 border-[#1c3f50]/40 rounded-3xl shadow-sm transition-all"
    >
      <div className="text-center mt-1 flex flex-col items-center z-10">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-5 h-1 bg-[#1c3f50]" />
          <span className="text-[#d99b26] text-xs">✦</span>
          <div className="w-5 h-1 bg-[#c13d28]" />
        </div>

        <h2 className="font-retro text-3xl sm:text-4xl uppercase tracking-wider whitespace-nowrap retro-3d-title-red">
          LỜI NHẮN
        </h2>
      </div>

      <div className="relative w-full max-w-[290px] mx-auto my-auto z-10">
        <div className="absolute inset-0 bg-[#c54b38] rounded-xl transform rotate-2 shadow-lg border border-[#a83827]" />

        <div className="relative bg-[#fffdfa] p-4 pt-5 rounded-lg shadow-xl border border-[#d8c8b4] transform -rotate-1">
          <div className="w-14 h-4.5 washi-tape-green absolute -top-2 right-4 transform rotate-3" />

          <div className="mb-1.5">
            <span className="font-handwriting text-2xl font-bold text-[#1c3f50]">
              Gửi bạn
            </span>
          </div>

          <div className="w-full h-px bg-[#d8c8b4] my-1.5" />

          <p className="font-serif text-xs sm:text-sm text-[#2b2420] whitespace-pre-line leading-relaxed min-h-[140px]">
            {data.letterContent}
          </p>

          <div className="text-right mt-2 border-t border-[#d8c8b4]/60 pt-1.5">
            <span className="font-serif italic text-xs text-[#c13d28] font-bold">
              {data.letterSignature}
            </span>
          </div>
        </div>

        <div className="absolute -bottom-4 -left-3 pointer-events-none text-[#2e5a44]">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
            <path d="M20,90 Q45,55 70,20" stroke="#2e5a44" strokeWidth="3" />
            <circle cx="68" cy="25" r="6" fill="#d99b26" />
            <circle cx="48" cy="50" r="5" fill="#c13d28" />
          </svg>
        </div>
      </div>

      <div className="text-center z-10 pb-1">
        <p className="font-serif italic text-xs sm:text-sm text-[#3d322d]">
          Vẫn còn vài điều mình muốn kể bạn nghe...
        </p>
      </div>
    </div>
  );

  // Card 3: Mình đã có những ngày như thế
  const renderCard3 = (isMini = false) => (
    <div
      key="card-3"
      className="relative w-full h-full min-h-[640px] retro-card-bg text-[#1c1a19] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border-2 border-[#1c3f50]/40 rounded-3xl shadow-sm transition-all"
    >
      <div className="text-center mt-1 flex flex-col items-center z-10">
        <span className="font-serif italic text-base text-[#2e5a44] font-bold">
          Mình đã có
        </span>
        <h2 className="font-retro text-2xl sm:text-3xl uppercase tracking-wider whitespace-nowrap retro-3d-title-green">
          NHỮNG NGÀY
        </h2>
        <span className="font-serif italic text-xs text-[#1c1a19] bg-[#d99b26]/30 px-2.5 py-0.2 rounded-sm mt-0.5 border border-[#d99b26]/50">
          như thế
        </span>
      </div>

      <div className="relative w-full max-w-[290px] h-[330px] mx-auto my-auto z-10">
        {/* Film Strip Left Frame */}
        <div className="absolute top-1 left-1 w-32 bg-[#1a1817] p-1.5 pb-2 rounded-sm shadow-xl border border-black transform -rotate-4">
          <div className="flex justify-between px-1 py-0.5 mb-1 opacity-70">
            <div className="w-1.5 h-1.5 bg-white rounded-2xs" />
            <div className="w-1.5 h-1.5 bg-white rounded-2xs" />
            <div className="w-1.5 h-1.5 bg-white rounded-2xs" />
          </div>
          <div className="aspect-[4/3] rounded-xs overflow-hidden bg-slate-800">
            <img
              src={data.memoryPhotos[0]?.url}
              alt={data.memoryPhotos[0]?.caption}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Polaroid Center */}
        <div className="absolute top-6 right-1 w-34 bg-[#fffdfa] p-2 pb-3.5 rounded-xs shadow-xl border border-[#d8c8b4] transform rotate-3 z-10">
          <div className="w-10 h-3 washi-tape-pink absolute -top-1.5 left-1/2 -translate-x-1/2" />
          <div className="aspect-square rounded-2xs overflow-hidden bg-slate-100 mb-1">
            <img
              src={data.memoryPhotos[1]?.url}
              alt={data.memoryPhotos[1]?.caption}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Photo 3 Bottom Left */}
        <div className="absolute bottom-1 left-8 w-44 bg-[#fffdfa] p-2 pb-2.5 rounded-xs shadow-2xl border border-[#d8c8b4] transform -rotate-1 z-20">
          <div className="w-10 h-3 washi-tape-green absolute -top-1.5 left-1/2 -translate-x-1/2" />
          <div className="aspect-[16/10] rounded-2xs overflow-hidden bg-slate-100">
            <img
              src={data.memoryPhotos[2]?.url}
              alt={data.memoryPhotos[2]?.caption}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="text-center z-10 pb-1">
        <p className="font-serif italic text-xs sm:text-sm text-[#1c1a19] font-medium">
          Và thật may vì những ngày ấy có bạn.
        </p>
      </div>
    </div>
  );

  // Card 4: Những khoảnh khắc của chúng ta
  const renderCard4 = (isMini = false) => (
    <div
      key="card-4"
      className="relative w-full h-full min-h-[640px] retro-card-bg text-[#1c1a19] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border-2 border-[#1c3f50]/40 rounded-3xl shadow-sm transition-all"
    >
      <div className="text-center mt-1 flex flex-col items-center z-10">
        <span className="font-serif italic text-base text-[#1c3f50] font-bold">
          Những
        </span>
        <h2 className="font-retro text-2xl sm:text-3xl uppercase tracking-wider whitespace-nowrap retro-3d-title-blue">
          KHOẢNH KHẮC
        </h2>
        <span className="font-serif italic text-xs text-[#c13d28] font-bold mt-0.5">
          của chúng ta
        </span>
      </div>

      <div className="w-full max-w-[280px] space-y-3 mx-auto my-auto z-10">
        <div className="bg-[#fffdfa] p-2 pb-2.5 rounded-xs shadow-lg border border-[#d8c8b4] transform -rotate-2 relative">
          <div className="w-14 h-3.5 washi-tape-pink absolute -top-1.5 left-1/2 -translate-x-1/2 z-10" />
          <div className="aspect-[16/9] rounded-2xs overflow-hidden bg-slate-100">
            <img
              src={data.momentPhotos[0]?.url}
              alt={data.momentPhotos[0]?.caption}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="bg-[#fffdfa] p-2 pb-2.5 rounded-xs shadow-lg border border-[#d8c8b4] transform rotate-2 relative ml-3">
          <div className="w-14 h-3.5 washi-tape-green absolute -top-1.5 left-1/2 -translate-x-1/2 z-10" />
          <div className="aspect-[16/9] rounded-2xs overflow-hidden bg-slate-100">
            <img
              src={data.momentPhotos[1]?.url}
              alt={data.momentPhotos[1]?.caption}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="text-center px-2 z-10 pb-1">
        <p className="font-serif italic text-xs text-[#3d322d] leading-relaxed font-medium">
          Và đây chỉ mới là một phần nhỏ trong những kỷ niệm của chúng ta.
        </p>
      </div>
    </div>
  );

  // Card 5: Còn một điều mình muốn nói với bạn (Cassette Player)
  const renderCard5 = (isMini = false) => (
    <div
      key="card-5"
      className="relative w-full h-full min-h-[640px] retro-card-bg text-[#1c1a19] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border-2 border-[#1c3f50]/40 rounded-3xl shadow-sm transition-all"
    >
      <div className="text-center mt-1 flex flex-col items-center z-10">
        <span className="font-serif italic text-base text-[#1c3f50] font-bold">
          Còn một điều
        </span>
        <h2 className="font-retro text-2xl sm:text-3xl uppercase tracking-wider whitespace-nowrap retro-3d-title-red">
          MÌNH MUỐN NÓI
        </h2>
        <span className="font-serif italic text-xs text-[#1c3f50] font-bold">
          với bạn
        </span>
      </div>

      <div className="inline-flex items-center px-4 py-0.5 mx-auto rounded-sm bg-[#d99b26] text-[#1c1a19] font-serif font-bold text-xs border border-[#1c1a19] z-10">
        Nghe lại một chút nhé!
      </div>

      <div className="w-full max-w-[280px] mx-auto bg-[#fffdfa] p-4 rounded-lg shadow-xl border-2 border-[#1c1a19] my-auto space-y-3 z-10">
        <div className="h-12 bg-[#1c1a19] rounded-md p-1.5 flex items-center justify-center gap-1 border border-[#d8c8b4]">
          {[30, 70, 95, 40, 85, 100, 60, 45, 90, 65, 80, 50, 75, 90, 35, 60, 80, 45, 95, 70].map(
            (h, i) => (
              <div
                key={i}
                className={`w-1 rounded-xs transition-all duration-300 ${
                  isPlayingMusic ? "bg-[#e8a391] animate-pulse" : "bg-[#555]"
                }`}
                style={{ height: `${isPlayingMusic ? h : 20}%` }}
              />
            )
          )}
        </div>

        <div className="space-y-1">
          <div className="w-full bg-[#d8c8b4] h-1.5 rounded-full overflow-hidden relative">
            <div
              className="bg-[#c13d28] h-full transition-all duration-300"
              style={{ width: `${isPlayingMusic ? musicProgress : 25}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#1c1a19] font-mono">
            <span>{isPlayingMusic ? "01:15" : "0:00"}</span>
            <span>-{data.song.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 pt-0.5">
          <button
            onClick={() => setMusicProgress(Math.max(0, musicProgress - 15))}
            className="w-7 h-7 rounded-full border border-[#1c1a19] flex items-center justify-center text-[#1c1a19] hover:bg-[#d99b26]/30"
          >
            <span className="material-symbols-outlined text-[16px]">fast_rewind</span>
          </button>

          <button
            onClick={toggleMusic}
            className="w-10 h-10 rounded-full bg-[#c13d28] hover:bg-[#a6301f] text-white flex items-center justify-center shadow-md border-2 border-[#1c1a19] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isPlayingMusic ? "pause" : "play_arrow"}
            </span>
          </button>

          <button
            onClick={() => setMusicProgress(Math.min(100, musicProgress + 15))}
            className="w-7 h-7 rounded-full border border-[#1c1a19] flex items-center justify-center text-[#1c1a19] hover:bg-[#d99b26]/30"
          >
            <span className="material-symbols-outlined text-[16px]">fast_forward</span>
          </button>
        </div>
      </div>

      <div className="text-center z-10 pb-1">
        <span className="text-[#c13d28] text-lg">✦</span>
      </div>
    </div>
  );

  // Card 6: Và cuối cùng... là giọng nói của mình
  const renderCard6 = (isMini = false) => (
    <div
      key="card-6"
      className="relative w-full h-full min-h-[640px] retro-card-bg text-[#1c1a19] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border-2 border-[#1c3f50]/40 rounded-3xl shadow-sm transition-all"
    >
      <div className="text-center mt-1 flex flex-col items-center z-10">
        <span className="font-serif italic text-base text-[#1c3f50] font-bold">
          Và cuối cùng...
        </span>
        <h2 className="font-retro text-2xl sm:text-3xl uppercase tracking-wider whitespace-nowrap retro-3d-title-red">
          là giọng nói
        </h2>
        <span className="font-retro text-xl uppercase tracking-wider text-[#1c3f50] whitespace-nowrap">
          của mình
        </span>
      </div>

      <div className="relative my-auto flex flex-col items-center z-10">
        <div className="relative w-20 h-20 rounded-full bg-[#3a6351] border-2 border-[#1c1a19] flex items-center justify-center mb-2 shadow-lg">
          <span className="material-symbols-outlined text-[42px] text-[#f5ede2]">
            settings_voice
          </span>
          <div className="absolute -top-2 text-[#d99b26] text-lg">✦</div>
        </div>

        <div className="w-full max-w-[270px] bg-[#fffdfa] p-3 rounded-lg shadow-xl border-2 border-[#1c1a19] space-y-2">
          <div className="space-y-1">
            <div className="w-full bg-[#d8c8b4] h-1.5 rounded-full overflow-hidden relative">
              <div
                className="bg-[#c13d28] h-full transition-all duration-300"
                style={{ width: `${isPlayingVoice ? voiceProgress : 45}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#1c1a19] font-mono">
              <span>{isPlayingVoice ? "01:05" : "0:00"}</span>
              <span>-{data.voiceNote.duration}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => setVoiceProgress(Math.max(0, voiceProgress - 20))}
              className="text-[#1c1a19]"
            >
              <span className="material-symbols-outlined text-[18px]">skip_previous</span>
            </button>

            <button
              onClick={toggleVoice}
              className="w-10 h-10 rounded-full bg-[#c13d28] text-white flex items-center justify-center shadow-md border border-[#1c1a19] active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isPlayingVoice ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              onClick={() => setVoiceProgress(Math.min(100, voiceProgress + 20))}
              className="text-[#1c1a19]"
            >
              <span className="material-symbols-outlined text-[18px]">skip_next</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center px-3 z-10 pb-1">
        <p className="font-serif italic text-xs text-[#3d322d] leading-relaxed">
          {data.voiceNote.noteText}
        </p>
      </div>
    </div>
  );

  // Card 7: Cảm ơn bạn (Arched Window Sunset)
  const renderCard7 = (isMini = false) => (
    <div
      key="card-7"
      className="relative w-full h-full min-h-[640px] retro-card-bg text-[#1c1a19] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border-2 border-[#1c3f50]/40 rounded-3xl shadow-sm transition-all"
    >
      <div className="text-center mt-1 flex flex-col items-center z-10">
        <h2 className="font-retro text-2xl sm:text-3xl uppercase tracking-wider whitespace-nowrap retro-3d-title-red">
          Cảm ơn bạn
        </h2>
        <p className="font-serif italic text-xs text-[#1c1a19] mt-0.5 font-medium whitespace-nowrap">
          đã đi qua những ngày này cùng mình
        </p>
      </div>

      <div className="relative my-auto w-full max-w-[260px] mx-auto bg-[#fffdfa] p-2.5 pb-3 rounded-xl shadow-2xl border-2 border-[#1c1a19] transform -rotate-1 z-10">
        <div className="w-full aspect-[4/3] rounded-t-full overflow-hidden bg-slate-100 mb-1.5 border border-[#d8c8b4]">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
            alt="Hoàng hôn kỷ niệm"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="font-serif italic text-[11px] text-[#1c1a19] text-center font-medium">
          {data.finalMessage}
        </p>
      </div>

      <div className="w-full max-w-[280px] mx-auto grid grid-cols-2 gap-2.5 mt-1.5 z-10 pb-1">
        <button
          onClick={() => onGoToSlide(1)}
          className="py-2.5 px-3 rounded-lg bg-[#2c4c3b] hover:bg-[#38634c] text-white font-serif font-bold text-xs flex items-center justify-center gap-1 shadow-md border-2 border-[#1c1a19] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">replay</span>
          <span>Xem lại</span>
        </button>

        <button
          onClick={onSaveKeepsake}
          className="py-2.5 px-3 rounded-lg bg-[#c13d28] hover:bg-[#aa321e] text-white font-serif font-bold text-xs flex items-center justify-center gap-1 shadow-md border-2 border-[#1c1a19] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Lưu lại</span>
        </button>
      </div>
    </div>
  );

  // SHEET OVERVIEW (IMAGE 2 REPLICA)
  if (viewMode === "sheet") {
    return (
      <div className="w-full max-w-6xl mx-auto py-4 px-2 space-y-5">
        <div className="text-center mb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#c13d28] font-bold">
            BẢN THẢO HOÀN THIỆN • 7 TRANG KỶ NIỆM 20/10
          </span>
          <h2 className="font-retro text-2xl sm:text-3xl font-bold text-[#1c3f50]">
            Hoài Niệm Retro 90s Poster
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

      <div className="py-2.5 px-4 bg-[#fffdfa] rounded-full shadow-md border-2 border-[#1c1a19] mt-2 flex items-center justify-between text-xs text-[#1c1a19]">
        <button
          onClick={onPrevSlide}
          disabled={activeSlide === 1}
          className={`flex items-center gap-1 font-serif font-bold hover:text-[#c13d28] transition-colors ${
            activeSlide === 1 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <span>← Trước</span>
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              onClick={() => onGoToSlide(num)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeSlide === num
                  ? "w-6 bg-[#c13d28]"
                  : "bg-[#1c3f50]/40 hover:bg-[#c13d28]/60"
              }`}
              title={`Trang ${num}`}
            />
          ))}
        </div>

        <button
          onClick={onNextSlide}
          disabled={activeSlide === 7}
          className={`flex items-center gap-1 font-serif font-bold hover:text-[#c13d28] transition-colors ${
            activeSlide === 7 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <span>Tiếp →</span>
        </button>
      </div>
    </div>
  );
}
