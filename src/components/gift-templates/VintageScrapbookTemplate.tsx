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

export default function VintageScrapbookTemplate({
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
  const [musicProgress, setMusicProgress] = useState(25);
  const [voiceProgress, setVoiceProgress] = useState(40);

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

  // Card 1: Có một món quà dành cho [Tên người nhận]
  const renderCard1 = (isMini = false) => (
    <div
      key="card-1"
      className="relative w-full h-full min-h-[640px] scrapbook-card-bg text-[#2b2420] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#e8ded5] rounded-3xl shadow-sm transition-all"
    >
      {/* Watercolor Eucalyptus Branch Top-Left */}
      <div className="absolute top-1 left-1 pointer-events-none z-20">
        <svg width="60" height="60" viewBox="0 0 80 80" fill="none">
          <path d="M5,75 Q25,35 70,5" stroke="#485c49" strokeWidth="2" strokeLinecap="round" />
          <path d="M25,50 Q12,42 16,32 Q26,35 28,47" fill="#6d8a6f" opacity="0.85" />
          <path d="M38,36 Q48,22 55,28 Q50,40 40,36" fill="#7d9b7f" opacity="0.9" />
          <path d="M54,20 Q48,8 56,5 Q64,12 56,20" fill="#5c755e" opacity="0.85" />
          <path d="M68,7 Q76,2 78,8 Q74,14 68,7" fill="#8ba78e" opacity="0.95" />
        </svg>
      </div>

      {/* Red Hand-Drawn Heart Top-Right */}
      <div className="absolute top-4 right-4 pointer-events-none font-handwriting text-2xl text-[#822923] opacity-80 z-20">
        ♡
      </div>

      {/* Header */}
      <div className="text-center mt-1 z-10">
        <span className="font-handwriting text-2xl sm:text-3xl text-[#443a36] block -mb-0.5">
          Có một
        </span>
        <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#822923] tracking-[0.05em] whitespace-nowrap flex items-center justify-center gap-1.5 uppercase">
          <span>MÓN QUÀ</span>
          <span className="font-handwriting text-2xl text-[#822923] font-normal lowercase">
            ♡
          </span>
        </h1>
        <div className="flex items-center justify-center gap-1 mt-0.5 whitespace-nowrap">
          <span className="font-handwriting text-xl sm:text-2xl text-[#443a36]">dành cho</span>
          <span className="font-serif font-bold text-sm sm:text-base text-[#822923]">
            [{data.recipientName}]
          </span>
        </div>
      </div>

      {/* Polaroid Frame with Real Bracelet Photo + Washi Tape + Baby's Breath */}
      <div
        onClick={() => (isMini ? onGoToSlide(1) : onNextSlide())}
        className="cursor-pointer group relative my-2.5 max-w-[260px] mx-auto w-full transform -rotate-1 hover:rotate-0 transition-transform duration-300 z-10"
      >
        {/* Top Washi Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 washi-tape-beige z-30 transform rotate-1" />

        {/* Polaroid Card */}
        <div className="polaroid-card">
          <div className="aspect-square w-full rounded-2xs overflow-hidden bg-[#1f3729] relative group-hover:scale-[1.02] transition-transform duration-300">
            <img
              src={data.braceletImg}
              alt={data.braceletTitle}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Dried Flowers Sprig & Heart on Bottom-Right */}
        <div className="absolute -bottom-3 -right-4 pointer-events-none flex flex-col items-center z-30">
          <svg width="36" height="52" viewBox="0 0 60 90" fill="none">
            <path d="M10,85 Q30,50 45,15 M30,50 Q15,35 20,20 M35,40 Q45,25 55,20" stroke="#7d6a58" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="15" r="4.5" fill="#fcfaf2" stroke="#d5c8b5" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="4" fill="#fcfaf2" stroke="#d5c8b5" strokeWidth="1.2" />
            <circle cx="55" cy="20" r="4" fill="#fcfaf2" stroke="#d5c8b5" strokeWidth="1.2" />
          </svg>
          <span className="font-handwriting text-xl text-[#822923] -mt-1">♡</span>
        </div>
      </div>

      {/* Quote & Bottom Pill Button */}
      <div className="w-full flex flex-col items-center gap-2.5 z-10">
        <p className="font-handwriting text-xl sm:text-2xl text-[#443a36] text-center max-w-[280px] leading-snug px-1">
          Có những kỷ niệm<br />
          không cần phải thật lớn,<br />
          chỉ cần đủ đặc biệt<br />
          để chúng ta luôn nhớ mãi.
        </p>

        <button
          onClick={() => (isMini ? onGoToSlide(1) : onNextSlide())}
          className="w-full max-w-[300px] py-2.5 px-4 rounded-full bg-[#ebd1cb] hover:bg-[#e4c4bd] active:scale-95 text-[#6b2520] font-handwriting text-xl font-bold shadow-sm border border-[#dcbbb4] transition-all flex items-center justify-between"
        >
          <span>Chạm vào chiếc vòng để mở những kỷ niệm.</span>
          <span className="w-5 h-5 rounded-full border border-[#6b2520] flex items-center justify-center font-sans text-xs font-bold shrink-0">
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
      className="relative w-full h-full min-h-[640px] scrapbook-card-bg text-[#2b2420] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#e8ded5] rounded-3xl shadow-sm transition-all"
    >
      {/* Header */}
      <div className="text-center mt-1 z-10">
        <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#2d4734] tracking-[0.1em] whitespace-nowrap flex items-center justify-center gap-2 uppercase">
          <span>LỜI NHẮN</span>
          <span className="font-handwriting text-2xl text-[#822923] font-normal lowercase">
            ♡
          </span>
        </h2>
      </div>

      {/* Realistic Terracotta Envelope + Ruled Note Stationery */}
      <div className="relative w-full max-w-[290px] mx-auto my-auto z-10">
        {/* Kraft Envelope Background */}
        <div className="absolute inset-0 bg-[#d1897e] rounded-2xl transform rotate-1 shadow-md border border-[#bf756a]" />

        {/* Note Paper sticking out with ruled lines */}
        <div className="relative bg-[#fffdfa] p-4 pt-6 rounded-xl shadow-lg border border-[#e8ded5] transform -rotate-1 paper-lined">
          {/* Top washi tape */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4.5 washi-tape-beige z-20" />

          <div className="mb-1.5">
            <span className="font-handwriting text-2xl font-bold text-[#2d4734]">
              Gửi bạn... ♡
            </span>
          </div>

          <p className="font-handnote text-sm sm:text-base text-[#3d322d] whitespace-pre-line leading-[22px] min-h-[140px]">
            {data.letterContent}
          </p>

          <div className="text-right mt-2">
            <span className="font-handwriting text-xl text-[#822923] italic">
              {data.letterSignature}
            </span>
          </div>
        </div>

        {/* Pressed Dried Flower Sprig tucked on the left with washi tape */}
        <div className="absolute -bottom-2 -left-3 pointer-events-none z-20 flex flex-col items-center">
          <svg width="38" height="54" viewBox="0 0 60 90" fill="none">
            <path d="M25,85 Q20,50 15,20 M20,50 Q35,35 40,25" stroke="#7d6a58" strokeWidth="2" strokeLinecap="round" />
            <circle cx="15" cy="20" r="5" fill="#fcfaf2" stroke="#d5c8b5" strokeWidth="1.5" />
            <circle cx="40" cy="25" r="4" fill="#fcfaf2" stroke="#d5c8b5" strokeWidth="1.5" />
          </svg>
          <div className="w-7 h-2.5 washi-tape-beige -mt-2 rotate-12" />
        </div>
      </div>

      {/* Subtitle bottom */}
      <div className="text-center z-10 pb-1">
        <p className="font-handwriting text-xl sm:text-2xl text-[#443a36] flex items-center justify-center gap-1.5">
          <span>{data.letterSubtitle}</span>
          <span className="text-[#822923]">♡</span>
        </p>
      </div>
    </div>
  );

  // Card 3: Mình đã có những ngày như thế...
  const renderCard3 = (isMini = false) => (
    <div
      key="card-3"
      className="relative w-full h-full min-h-[640px] scrapbook-card-bg text-[#2b2420] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#e8ded5] rounded-3xl shadow-sm transition-all"
    >
      {/* Top Left Leaf */}
      <div className="absolute top-1 left-1 pointer-events-none z-20">
        <svg width="55" height="55" viewBox="0 0 80 80" fill="none">
          <path d="M5,75 Q25,35 70,5" stroke="#485c49" strokeWidth="2" strokeLinecap="round" />
          <path d="M25,50 Q12,42 16,32 Q26,35 28,47" fill="#6d8a6f" opacity="0.85" />
          <path d="M38,36 Q48,22 55,28 Q50,40 40,36" fill="#7d9b7f" opacity="0.9" />
        </svg>
      </div>

      {/* Header */}
      <div className="text-center mt-1 z-10">
        <span className="font-handwriting text-2xl text-[#2d4734] block -mb-0.5">
          Mình đã có
        </span>
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#2d4734] tracking-[0.05em] uppercase">
            NHỮNG NGÀY
          </h2>
          <span className="font-handwriting text-lg text-[#6b2520] bg-[#eec5bd] px-2 py-0.2 rounded-full">
            như thế...
          </span>
          <span className="font-handwriting text-2xl text-[#822923]">♡</span>
        </div>
      </div>

      {/* 3 Staggered Polaroids Layout */}
      <div className="relative w-full max-w-[290px] h-[330px] mx-auto my-auto z-10">
        {/* Polaroid 1 (Top Left: Blue Sky) */}
        <div className="absolute top-1 left-1 w-32 polaroid-card transform -rotate-6 z-10 shadow-md">
          <div className="w-12 h-3.5 washi-tape-beige absolute -top-2 left-1/2 -translate-x-1/2 z-20" />
          <div className="aspect-square rounded-2xs overflow-hidden bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
              alt="Bầu trời xanh mây trắng"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Polaroid 2 (Center: White Daisies) */}
        <div className="absolute top-8 right-1 w-32 polaroid-card transform rotate-4 z-20 shadow-md">
          <div className="w-12 h-3.5 washi-tape-beige absolute -top-2 left-1/2 -translate-x-1/2 z-30" />
          <div className="aspect-square rounded-2xs overflow-hidden bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80"
              alt="Cúc họa mi"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Polaroid 3 (Bottom Right: Sunset on Sea) */}
        <div className="absolute bottom-1 left-8 w-44 polaroid-card transform -rotate-1 z-30 shadow-lg">
          <div className="w-14 h-3.5 washi-tape-pink absolute -bottom-1.5 right-3 z-40 transform rotate-6" />
          <div className="aspect-[4/3] rounded-2xs overflow-hidden bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
              alt="Hoàng hôn trên biển"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div className="text-center z-10 pb-1">
        <p className="font-handwriting text-xl sm:text-2xl text-[#443a36] flex items-center justify-center gap-1.5">
          <span>Và thật may vì những ngày ấy có bạn.</span>
          <span className="text-[#822923]">♡</span>
        </p>
      </div>
    </div>
  );

  // Card 4: Những khoảnh khắc của chúng ta
  const renderCard4 = (isMini = false) => (
    <div
      key="card-4"
      className="relative w-full h-full min-h-[640px] scrapbook-card-bg text-[#2b2420] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#e8ded5] rounded-3xl shadow-sm transition-all"
    >
      {/* Header */}
      <div className="text-center mt-1 relative w-full z-10">
        <span className="font-handwriting text-2xl text-[#822923] block -mb-0.5">
          Những
        </span>
        <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#822923] tracking-[0.08em] whitespace-nowrap uppercase">
          KHOẢNH KHẮC
        </h2>
        <span className="font-handwriting text-xl text-[#443a36] block -mt-0.5">
          của chúng ta
        </span>

        {/* Camera Doodle Icon Top-Right */}
        <div className="absolute top-1 right-2 text-[#822923]">
          <svg width="26" height="22" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="5" width="24" height="17" rx="3" />
            <circle cx="14" cy="13.5" r="5" />
            <path d="M7,5 L9,2 L19,2 L21,5" />
          </svg>
        </div>
      </div>

      {/* 2 Polaroid Photos with Washi Tape */}
      <div className="w-full max-w-[270px] space-y-3 mx-auto my-auto relative z-10">
        {/* Photo 1: Calm beach waves */}
        <div className="polaroid-card transform -rotate-1 relative shadow-md">
          <div className="w-14 h-3.5 washi-tape-beige absolute -top-2 left-1/2 -translate-x-1/2 z-20" />
          <div className="aspect-[16/10] rounded-2xs overflow-hidden bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&auto=format&fit=crop&q=80"
              alt="Biển hoàng hôn"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Photo 2: Palm trees sunset */}
        <div className="polaroid-card transform rotate-2 relative ml-3 shadow-md">
          <div className="w-14 h-3.5 washi-tape-beige absolute -top-2 left-1/2 -translate-x-1/2 z-20" />
          <div className="aspect-[16/10] rounded-2xs overflow-hidden bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80"
              alt="Rặng dừa hoàng hôn"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Botanical branch on right edge */}
        <div className="absolute top-1/3 -right-5 pointer-events-none z-30">
          <svg width="45" height="45" viewBox="0 0 100 100" fill="none">
            <path d="M80,80 Q50,40 10,10" stroke="#536955" strokeWidth="2.5" />
            <ellipse cx="60" cy="55" rx="12" ry="7" transform="rotate(-30 60 55)" fill="#68836b" opacity="0.85" />
            <ellipse cx="40" cy="35" rx="10" ry="6" transform="rotate(-40 40 35)" fill="#7a977d" opacity="0.9" />
          </svg>
        </div>
      </div>

      {/* Subtext */}
      <div className="text-center px-2 z-10 pb-1">
        <p className="font-handwriting text-xl sm:text-2xl text-[#443a36] leading-snug">
          Và đây chỉ mới là một phần nhỏ trong những kỷ niệm của chúng ta. <span className="text-[#822923]">♡</span>
        </p>
      </div>
    </div>
  );

  // Card 5: Còn một điều mình muốn nói với bạn
  const renderCard5 = (isMini = false) => (
    <div
      key="card-5"
      className="relative w-full h-full min-h-[640px] scrapbook-card-bg text-[#2b2420] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#e8ded5] rounded-3xl shadow-sm transition-all"
    >
      {/* Header */}
      <div className="text-center mt-1 z-10">
        <span className="font-handwriting text-2xl text-[#822923] block -mb-0.5">
          Còn một điều
        </span>
        <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#822923] tracking-[0.08em] whitespace-nowrap uppercase">
          MÌNH MUỐN NÓI
        </h2>
        <span className="font-handwriting text-xl text-[#443a36] block -mt-0.5">
          với bạn
        </span>
      </div>

      {/* Badge: Nghe lại một chút nhé! */}
      <div className="inline-flex items-center px-5 py-1 mx-auto rounded-full bg-[#f3ded7] text-[#822923] font-handwriting text-xl font-bold border border-[#dfb9b1] z-10">
        Nghe lại một chút nhé!
      </div>

      {/* Audio Waveform Player Card */}
      <div className="w-full max-w-[280px] mx-auto bg-[#fffdfa] p-4 rounded-3xl shadow-md border border-[#e8ded5] my-auto space-y-3 z-10">
        {/* Waveform Bar Visualizer */}
        <div className="h-14 bg-[#faf4ec] rounded-2xl p-2 flex items-center justify-center gap-1 border border-[#e8ded5]/70">
          {[25, 45, 75, 95, 60, 35, 80, 100, 70, 40, 90, 65, 85, 50, 75, 95, 40, 60, 80, 50, 70, 90].map(
            (h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlayingMusic ? "bg-[#822923] animate-pulse" : "bg-[#c4928b]"
                }`}
                style={{ height: `${isPlayingMusic ? h : 25}%` }}
              />
            )
          )}
        </div>

        {/* Scrubber slider */}
        <div className="space-y-1">
          <div className="w-full bg-[#e8ded5] h-1.5 rounded-full overflow-hidden relative">
            <div
              className="bg-[#822923] h-full transition-all duration-300"
              style={{ width: `${isPlayingMusic ? musicProgress : 25}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#5c4a44] font-mono">
            <span>{isPlayingMusic ? "01:18" : "0:00"}</span>
            <span>-{isPlayingMusic ? "02:27" : "0:00"}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 pt-1">
          <button
            onClick={() => setMusicProgress(Math.max(0, musicProgress - 15))}
            className="text-[#822923] hover:opacity-75 transition-opacity"
          >
            <span className="material-symbols-outlined text-[24px]">fast_rewind</span>
          </button>

          <button
            onClick={toggleMusic}
            className="w-12 h-12 rounded-full bg-[#822923] hover:bg-[#9a312a] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[28px]">
              {isPlayingMusic ? "pause" : "play_arrow"}
            </span>
          </button>

          <button
            onClick={() => setMusicProgress(Math.min(100, musicProgress + 15))}
            className="text-[#822923] hover:opacity-75 transition-opacity"
          >
            <span className="material-symbols-outlined text-[24px]">fast_forward</span>
          </button>
        </div>
      </div>

      {/* Botanical branch bottom-left */}
      <div className="w-full flex justify-start z-10 pb-1">
        <svg width="45" height="45" viewBox="0 0 100 100" fill="none">
          <path d="M10,90 Q40,60 80,40" stroke="#536955" strokeWidth="2.5" />
          <ellipse cx="45" cy="60" rx="12" ry="7" transform="rotate(-30 45 60)" fill="#68836b" opacity="0.85" />
        </svg>
      </div>
    </div>
  );

  // Card 6: Và cuối cùng... là giọng nói của mình
  const renderCard6 = (isMini = false) => (
    <div
      key="card-6"
      className="relative w-full h-full min-h-[640px] scrapbook-card-bg text-[#2b2420] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#e8ded5] rounded-3xl shadow-sm transition-all"
    >
      {/* Top Left Leaf */}
      <div className="absolute top-1 left-1 pointer-events-none z-20">
        <svg width="55" height="55" viewBox="0 0 80 80" fill="none">
          <path d="M5,75 Q25,35 70,5" stroke="#485c49" strokeWidth="2" strokeLinecap="round" />
          <path d="M25,50 Q12,42 16,32 Q26,35 28,47" fill="#6d8a6f" opacity="0.85" />
        </svg>
      </div>

      {/* Header */}
      <div className="text-center mt-1 z-10">
        <span className="font-handwriting text-2xl text-[#822923] block -mb-0.5">
          Và cuối cùng...
        </span>
        <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#822923] tracking-[0.08em] whitespace-nowrap uppercase">
          là giọng nói
        </h2>
        <span className="font-handwriting text-2xl text-[#822923] block -mt-0.5">
          của mình ♡
        </span>
      </div>

      {/* Vintage Broadcast Microphone Graphic */}
      <div className="relative my-auto flex flex-col items-center z-10">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Radiating sound waves */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-20 h-20 rounded-full border border-[#822923]/30 animate-ping pointer-events-none" />
            <span className="w-16 h-16 rounded-full bg-[#f6ded9]/50" />
          </div>

          {/* Chrome vintage microphone */}
          <div className="relative z-10 w-12 h-18 bg-gradient-to-b from-[#e0e0e0] via-[#c0c0c0] to-[#808080] rounded-xl shadow-md border-2 border-[#555] flex flex-col items-center justify-center p-1">
            <div className="w-8 h-8 border border-black/40 rounded-lg bg-[#444] grid grid-cols-3 gap-0.5 p-1 mb-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/40 rounded-2xs" />
              ))}
            </div>
            <div className="w-2 h-3.5 bg-[#333] rounded-xs" />
          </div>

          {/* Sound rays doodles */}
          <div className="absolute -top-1 -right-2 text-[#822923] font-handwriting text-xl">
            \
          </div>
          <div className="absolute -top-1 -left-2 text-[#822923] font-handwriting text-xl">
            /
          </div>
        </div>

        {/* Voice player pill card */}
        <div className="w-full max-w-[270px] bg-[#fffdfa] p-3 rounded-2xl shadow-md border border-[#e8ded5] space-y-2 mt-1.5">
          <div className="space-y-1">
            <div className="w-full bg-[#e8ded5] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#822923] h-full transition-all duration-300"
                style={{ width: `${isPlayingVoice ? voiceProgress : 45}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#5c4a44] font-mono">
              <span>{isPlayingVoice ? "00:54" : "0:00"}</span>
              <span>-2:34</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => setVoiceProgress(Math.max(0, voiceProgress - 20))}
              className="text-[#822923]"
              title="Lùi 15s"
            >
              <span className="material-symbols-outlined text-[20px]">skip_previous</span>
            </button>

            <button
              onClick={toggleVoice}
              className="w-10 h-10 rounded-full bg-[#822923] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isPlayingVoice ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              onClick={() => setVoiceProgress(Math.min(100, voiceProgress + 20))}
              className="text-[#822923]"
              title="Tiến 15s"
            >
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtext */}
      <div className="text-center px-3 z-10 pb-1">
        <p className="font-handwriting text-xl sm:text-2xl text-[#443a36] leading-snug">
          Có những điều viết ra vẫn chưa đủ.<br />
          Nên lần này, mình muốn bạn nghe bằng chính giọng nói của mình. <span className="text-[#822923]">♡</span>
        </p>
      </div>
    </div>
  );

  // Card 7: Cảm ơn bạn & Twin Action Buttons
  const renderCard7 = (isMini = false) => (
    <div
      key="card-7"
      className="relative w-full h-full min-h-[640px] scrapbook-card-bg text-[#2b2420] overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none border border-[#e8ded5] rounded-3xl shadow-sm transition-all"
    >
      {/* Top Left Leaf */}
      <div className="absolute top-1 left-1 pointer-events-none z-20">
        <svg width="55" height="55" viewBox="0 0 80 80" fill="none">
          <path d="M5,75 Q25,35 70,5" stroke="#485c49" strokeWidth="2" strokeLinecap="round" />
          <path d="M25,50 Q12,42 16,32 Q26,35 28,47" fill="#6d8a6f" opacity="0.85" />
        </svg>
      </div>

      {/* Header */}
      <div className="text-center mt-1 z-10">
        <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#822923] tracking-[0.08em] whitespace-nowrap uppercase flex items-center justify-center gap-1.5">
          <span>Cảm ơn bạn</span>
          <span className="font-handwriting text-2xl text-[#822923] font-normal lowercase">
            ♡
          </span>
        </h2>
        <p className="font-handwriting text-xl text-[#443a36] mt-0.5 whitespace-nowrap">
          đã đi qua những ngày này cùng mình.
        </p>
      </div>

      {/* Sunset Ocean Landscape Polaroid with Seagulls */}
      <div className="relative my-auto w-full max-w-[270px] mx-auto polaroid-card transform rotate-1 shadow-md z-10">
        <div className="w-16 h-3.5 washi-tape-pink absolute -top-2 right-4 z-20" />
        <div className="aspect-[16/10] rounded-2xs overflow-hidden bg-slate-100 mb-2">
          <img
            src="https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&auto=format&fit=crop&q=80"
            alt="Hoàng hôn và cánh chim"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="font-handwriting text-xl text-[#443a36] text-center">
          Món quà này sẽ luôn ở đây,<br />mỗi khi bạn muốn nhớ lại. <span className="text-[#822923]">♡</span>
        </p>
      </div>

      {/* Twin Action Buttons: [ ⟳ Xem lại ] and [ ↓ Lưu lại ] */}
      <div className="w-full max-w-[290px] mx-auto grid grid-cols-2 gap-3 mt-1.5 z-10 pb-1">
        <button
          onClick={() => onGoToSlide(1)}
          className="py-2.5 px-3 rounded-full bg-[#314837] hover:bg-[#3d5a45] active:scale-95 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">replay</span>
          <span>Xem lại</span>
        </button>

        <button
          onClick={onSaveKeepsake}
          className="py-2.5 px-3 rounded-full bg-[#822923] hover:bg-[#99312b] active:scale-95 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Lưu lại</span>
        </button>
      </div>
    </div>
  );

  // SHEET OVERVIEW (EXACT REPLICA OF USER'S CANVA IMAGE)
  if (viewMode === "sheet") {
    return (
      <div className="w-full max-w-6xl mx-auto py-4 px-2 space-y-5">
        <div className="text-center mb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#822923] font-bold">
            BẢN THẢO HOÀN THIỆN • 7 TRANG KỶ NIỆM 20/10
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3a2f2b]">
            Sổ Kỷ Niệm Hoa Khô &amp; Washi Tape
          </h2>
          <p className="text-xs text-[#6e5d57] mt-1">
            Bấm vào bất kỳ trang nào để lướt xem chi tiết toàn màn hình
          </p>
        </div>

        {/* Top Row: 4 Cards */}
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

        {/* Bottom Row: 3 Cards */}
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

  // CONTINUOUS SCROLL
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

      {/* Floating Bottom Navigation Dots & Arrows */}
      <div className="py-2.5 px-4 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-[#dfd4c4] mt-2 flex items-center justify-between text-xs text-[#5c4a44]">
        <button
          onClick={onPrevSlide}
          disabled={activeSlide === 1}
          className={`flex items-center gap-1 font-handwriting text-2xl hover:text-[#822923] transition-colors ${
            activeSlide === 1 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <span>← Trang trước</span>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              onClick={() => onGoToSlide(num)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeSlide === num
                  ? "w-6 bg-[#822923]"
                  : "bg-[#c4928b]/50 hover:bg-[#822923]/60"
              }`}
              title={`Trang ${num}`}
            />
          ))}
        </div>

        <button
          onClick={onNextSlide}
          disabled={activeSlide === 7}
          className={`flex items-center gap-1 font-handwriting text-2xl hover:text-[#822923] transition-colors ${
            activeSlide === 7 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <span>Trang sau →</span>
        </button>
      </div>
    </div>
  );
}
