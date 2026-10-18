"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { RecipientGiftData, DEFAULT_GIFT_DATA } from "./types";
import { musicPlayerSynth } from "./audio-helper";

interface TemplateProps {
  data?: Partial<RecipientGiftData>;
  activeSlide?: number;
  viewMode?: "story" | "sheet" | "scroll";
  onGoToSlide?: (slide: number) => void;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
  onSaveKeepsake?: () => void;
}

const SLIDE_TITLES = [
  { id: 1, title: "Mở món quà", label: "Có một món quà", icon: "featured_seasonal_and_gifts" },
  { id: 2, title: "Bức thư tay", label: "Lời nhắn gửi bạn", icon: "mail" },
  { id: 3, title: "Những ngày như thế", label: "Album kỷ niệm", icon: "photo_library" },
  { id: 4, title: "Video dành cho bạn", label: "Thước phim kỷ niệm", icon: "movie" },
  { id: 5, title: "Giai điệu kỷ niệm", label: "Băng cassette âm nhạc", icon: "graphic_eq" },
  { id: 6, title: "Giọng nói của mình", label: "Lời nhắn giọng nói", icon: "mic" },
  { id: 7, title: "Lời cảm ơn", label: "Lưu giữ kỷ niệm", icon: "favorite" },
];

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
      <path d="M 4.5 13 A 8 8 0 1 0 7.8 5.6" />
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
      <path d="M 19.5 13 A 8 8 0 1 1 16.2 5.6" />
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


export default function StorybookSunsetTemplate({
  data: propData,
  activeSlide: propActiveSlide,
  viewMode = "story",
  onGoToSlide: propOnGoToSlide,
  onNextSlide: propOnNextSlide,
  onPrevSlide: propOnPrevSlide,
  onSaveKeepsake: propOnSaveKeepsake,
}: TemplateProps) {
  // Merge with default gift data
  const data: RecipientGiftData = {
    ...DEFAULT_GIFT_DATA,
    ...propData,
  };

  // Internal state for independent preview (/thamkhao) or template viewer
  const [internalSlide, setInternalSlide] = useState(propActiveSlide || 1);
  const currentSlide = propActiveSlide !== undefined ? propActiveSlide : internalSlide;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Audio timer refs
  const musicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Slide 2 Letter Typewriter Effect
  const letterSalutation = `Gửi ${data.recipientName || "bạn"},`;
  const letterBody =
    data.letterContent ||
    "Có vài điều mình luôn muốn nói nhưng chưa có dịp...\nHôm nay, mình muốn gửi tất cả vào món quà này.";
  const letterSig = data.senderName ? `— ${data.senderName}` : "";
  const letterTotalLength = letterSalutation.length + letterBody.length + letterSig.length;
  const [letterTypedCount, setLetterTypedCount] = useState(0);
  const letterScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSlide === 2) {
      setLetterTypedCount(0);
      const intervalMs = Math.max(16, Math.min(36, Math.floor(3500 / Math.max(letterTotalLength, 1))));
      const timer = setInterval(() => {
        setLetterTypedCount((prev) => {
          if (prev >= letterTotalLength) {
            clearInterval(timer);
            return letterTotalLength;
          }
          return prev + 1;
        });
      }, intervalMs);
      return () => clearInterval(timer);
    }
  }, [currentSlide, letterTotalLength]);

  useEffect(() => {
    if (letterScrollRef.current) {
      letterScrollRef.current.scrollTop = letterScrollRef.current.scrollHeight;
    }
  }, [letterTypedCount]);

  const letterSalutationChars = Math.min(letterTypedCount, letterSalutation.length);
  const displayLetterSalutation = letterSalutation.slice(0, letterSalutationChars);
  const letterBodyChars = Math.max(0, Math.min(letterTypedCount - letterSalutation.length, letterBody.length));
  const displayLetterBody = letterBody.slice(0, letterBodyChars);
  const letterSigChars = Math.max(0, letterTypedCount - letterSalutation.length - letterBody.length);
  const displayLetterSig = letterSig.slice(0, letterSigChars);
  const isLetterFinished = letterTypedCount >= letterTotalLength;

  const letterCursorStage =
    letterTypedCount < letterSalutation.length
      ? "salutation"
      : letterTypedCount < letterSalutation.length + letterBody.length
      ? "body"
      : !isLetterFinished
      ? "signature"
      : "none";

  const goToSlide = (slide: number) => {
    if (slide >= 1 && slide <= 7) {
      if (propOnGoToSlide) propOnGoToSlide(slide);
      setInternalSlide(slide);
      setMenuOpen(false);
    }
  };

  const nextSlide = () => {
    if (propOnNextSlide) {
      propOnNextSlide();
    } else {
      setInternalSlide((prev) => Math.min(7, prev + 1));
    }
  };

  const prevSlide = () => {
    if (propOnPrevSlide) {
      propOnPrevSlide();
    } else {
      setInternalSlide((prev) => Math.max(1, prev - 1));
    }
  };

  const handleSave = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c13d28", "#f4a261", "#e76f51", "#2a9d8f", "#e9c46a"],
    });
    if (propOnSaveKeepsake) {
      propOnSaveKeepsake();
    } else {
      alert("Đã lưu thiệp kỷ niệm thành công! Bạn có thể xem lại bất kỳ lúc nào.");
    }
  };

  // Music toggle with synth
  const toggleMusic = () => {
    if (isPlayingMusic) {
      musicPlayerSynth.stop();
      setIsPlayingMusic(false);
      if (musicTimerRef.current) clearInterval(musicTimerRef.current);
    } else {
      if (isPlayingVoice) {
        musicPlayerSynth.stop();
        setIsPlayingVoice(false);
        if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      }
      musicPlayerSynth.play("lofi");
      setIsPlayingMusic(true);
      musicTimerRef.current = setInterval(() => {
        setMusicProgress((p) => (p >= 100 ? 0 : p + 1));
      }, 1000);
    }
  };

  // Voice toggle
  const toggleVoice = () => {
    if (isPlayingVoice) {
      musicPlayerSynth.stop();
      setIsPlayingVoice(false);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    } else {
      if (isPlayingMusic) {
        musicPlayerSynth.stop();
        setIsPlayingMusic(false);
        if (musicTimerRef.current) clearInterval(musicTimerRef.current);
      }
      musicPlayerSynth.play("piano");
      setIsPlayingVoice(true);
      voiceTimerRef.current = setInterval(() => {
        setVoiceProgress((p) => (p >= 100 ? 0 : p + 1.5));
      }, 1000);
    }
  };

  // Video toggle
  const toggleVideo = () => {
    setIsPlayingVideo(!isPlayingVideo);
    if (!isPlayingVideo && !isPlayingMusic) {
      musicPlayerSynth.play("piano");
      setIsPlayingMusic(true);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      musicPlayerSynth.stop();
      if (musicTimerRef.current) clearInterval(musicTimerRef.current);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, []);

  // Sync internal slide if prop changes
  useEffect(() => {
    if (propActiveSlide !== undefined) {
      setInternalSlide(propActiveSlide);
    }
  }, [propActiveSlide]);

  // Standard Header across all frames
  const renderTopBar = (slideNum: string, isArtCanvas = false) => (
    <div className="flex items-center justify-between pb-2 z-20 shrink-0">
      {isArtCanvas ? (
        <div className="w-16 h-6" />
      ) : (
        <span className="font-mono text-xs font-bold text-[#8c4b3e] tracking-widest bg-white/70 px-2.5 py-1 rounded-full shadow-2xs border border-[#ebdccd]">
          {slideNum} / 07
        </span>
      )}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
          isArtCanvas
            ? "bg-transparent hover:bg-black/10 text-[#8c4b3e]"
            : "bg-white/75 hover:bg-white text-[#8c4b3e] shadow-2xs border border-[#ebdccd]"
        }`}
        aria-label="Mở menu danh mục"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>
    </div>
  );

  // Standard Bottom Pagination Controls across frames
  const renderBottomNav = (currentIdx: number) => (
    <div className="flex items-center justify-between w-full max-w-xs mx-auto pt-3 z-20 shrink-0">
      <button
        type="button"
        onClick={prevSlide}
        disabled={currentIdx <= 1}
        className="w-10 h-10 rounded-full bg-white/90 hover:bg-white active:scale-95 text-[#8c4b3e] shadow-md border border-[#ebdccd] flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        aria-label="Trang trước"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>

      {/* Pagination Dots */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-xs border border-[#ebdccd]">
        {[1, 2, 3, 4, 5, 6, 7].map((dot) => (
          <button
            key={dot}
            type="button"
            onClick={() => goToSlide(dot)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              dot === currentIdx
                ? "w-3 h-3 bg-[#c13d28] scale-110 shadow-xs"
                : "w-2 h-2 bg-[#d8c8b4] hover:bg-[#8c4b3e]/60"
            }`}
            aria-label={`Chuyển đến trang ${dot}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={nextSlide}
        disabled={currentIdx >= 7}
        className="w-10 h-10 rounded-full bg-white/90 hover:bg-white active:scale-95 text-[#8c4b3e] shadow-md border border-[#ebdccd] flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        aria-label="Trang kế tiếp"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>
    </div>
  );

  // -------------------------------------------------------------
  // FRAME 1: 01 / 07 Có một món quà dành cho bạn
  // -------------------------------------------------------------
  const renderSlide1 = () => (
    <div
      className="relative w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/thamkhao/bg_1.jpg')" }}
    >
      {/* Subtle warm ambient lighting */}
      <div className="absolute inset-0 bg-linear-to-b from-white/30 via-transparent to-amber-950/20 pointer-events-none" />

      {renderTopBar("01", true)}

      {/* Header Typography with Original Decorative Arc from trái tim.png */}
      <div className="relative z-10 text-center mt-2 flex flex-col items-center">
        <div className="relative inline-block px-8 py-2">
          {/* Decorative arc with birds, stars, dashed loop and heart from trái tim.png */}
          <img
            src="/thamkhao/header_decor_clean.png"
            alt="Hoa văn trang trí"
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-[130%] h-auto max-w-[340px] pointer-events-none drop-shadow-xs select-none"
          />

          <span className="block font-handwriting text-3xl sm:text-4xl text-[#1c3f50] font-bold drop-shadow-xs relative z-10">
            Có một
          </span>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-[#c13d28] tracking-tight -mt-1 drop-shadow-xs relative z-10">
            món quà
          </h1>
          <span className="block font-handwriting text-xl sm:text-2xl text-[#1c3f50] font-bold italic mt-0.5 drop-shadow-xs relative z-10">
            dành cho bạn
          </span>
        </div>
      </div>

      {/* Middle & Lower Elements: Signpost (Left) & 3D Gift Box (Right) */}
      <div className="relative z-10 w-full flex-1 flex items-end justify-between px-1 pb-3">
        {/* Directional Wooden Signpost on the Left */}
        <div className="relative h-52 sm:h-64 w-auto aspect-[1122/1402] shrink-0 select-none">
          <img
            src="/thamkhao/signpost.png"
            alt="Biển chỉ dẫn"
            className="w-full h-full block select-none pointer-events-none drop-shadow-lg"
          />

          {/* Plank 1: Những kỷ niệm -> Slide 3 */}
          <button
            type="button"
            onClick={() => goToSlide(3)}
            className="absolute top-[14.3%] left-[23.2%] w-[58.8%] h-[14.2%] flex items-center justify-center font-sans font-bold text-[10.5px] sm:text-xs text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
            title="Xem Những kỷ niệm"
          >
            <span className="inline-block transform" style={{ transform: "rotate(-3.5deg)" }}>
              Những kỷ niệm
            </span>
          </button>

          {/* Plank 2: Lời nhắn -> Slide 2 */}
          <button
            type="button"
            onClick={() => goToSlide(2)}
            className="absolute top-[32.1%] left-[25.0%] w-[53.5%] h-[13.5%] flex items-center justify-center font-sans font-bold text-[10.5px] sm:text-xs text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
            title="Xem Lời nhắn"
          >
            <span className="inline-block transform" style={{ transform: "rotate(-3.3deg)" }}>
              Lời nhắn
            </span>
          </button>

          {/* Plank 3: Khoảnh khắc -> Slide 4 */}
          <button
            type="button"
            onClick={() => goToSlide(4)}
            className="absolute top-[49.9%] left-[25.8%] w-[56.1%] h-[14.3%] flex items-center justify-center font-sans font-bold text-[10.5px] sm:text-xs text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
            title="Xem Khoảnh khắc"
          >
            <span className="inline-block transform" style={{ transform: "rotate(-5.5deg)" }}>
              Khoảnh khắc
            </span>
          </button>

          {/* Plank 4: Và nhiều hơn... -> Slide 5 */}
          <button
            type="button"
            onClick={() => goToSlide(5)}
            className="absolute top-[71.3%] left-[25.8%] w-[56.1%] h-[13.6%] flex items-center justify-center font-sans font-bold text-[10.5px] sm:text-xs text-[#2b180d] hover:text-[#c13d28] hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap leading-none select-none"
            title="Xem Và nhiều hơn..."
          >
            <span className="inline-block transform" style={{ transform: "rotate(-6.0deg)" }}>
              Và nhiều hơn...
            </span>
          </button>
        </div>

        {/* 3D Gift Box on the Right */}
        <div
          onClick={() => {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.75, x: 0.75 },
              colors: ["#c13d28", "#e38b29", "#ffd166", "#f4a261"],
            });
            nextSlide();
          }}
          className="relative w-32 sm:w-38 mb-2 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-2xl flex flex-col items-center"
          title="Chạm để mở món quà!"
        >
          <img
            src="/thamkhao/gift_box.png"
            alt="Hộp quà tặng"
            className="w-full h-auto object-contain transform group-hover:-translate-y-1 transition-transform"
          />
          <span className="absolute -top-3 right-0 sm:right-1 px-2.5 py-0.5 bg-[#fffdfa]/95 text-[#c13d28] font-handwriting font-bold text-[11px] sm:text-xs rounded-full shadow-md border border-[#ebdccd] group-hover:scale-110 transition-transform flex items-center gap-1">
            <span>Mở quà</span>
            <span>✨</span>
          </span>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // FRAME 2: 02 / 07 Lời nhắn gửi đến bạn
  // -------------------------------------------------------------
  const renderSlide2 = () => (
    <div
      className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {renderTopBar("02")}

      {/* Main Header */}
      <div className="relative z-10 text-center mt-1 flex flex-col items-center">
        <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#1c3f50] tracking-wider uppercase drop-shadow-2xs">
          LỜI NHẮN
        </h2>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="font-handwriting text-xl sm:text-2xl text-[#8c4b3e] font-bold italic">
            Gửi đến bạn...
          </span>
          <img src="/thamkhao/heart_2.png" alt="Heart" className="w-6 h-6 object-contain inline-block" />
          <img src="/thamkhao/music_notes.png" alt="Music" className="w-4 h-4 object-contain inline-block" />
        </div>
      </div>

      {/* Lined Letter Paper pinned to Envelope */}
      <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center justify-center py-4">
        {/* Envelope background */}
        <div className="relative w-full">
          {/* Vintage stamp card from element_page_2.png */}
          <img
            src="/thamkhao/element_page_2.png"
            alt="Stamp element"
            className="absolute -top-10 -right-2 w-16 h-auto object-contain pointer-events-none opacity-85 z-0 transform rotate-6"
          />

          <img
            src="/thamkhao/envelope.png"
            alt="Bao thư"
            className="absolute -top-6 -left-4 w-[108%] h-auto object-contain opacity-85 pointer-events-none transform -rotate-1 z-1"
          />

          {/* Letter Note Container (Pure CSS lined paper) */}
          <div
            onClick={() => setLetterTypedCount(letterTotalLength)}
            className="relative w-full p-4 sm:p-5 pt-7 rounded-xl shadow-xl transform rotate-[0.5deg] bg-[#fffefb] border border-[#ebdccd] z-10 max-h-[52vh] flex flex-col overflow-hidden cursor-pointer"
            title={!isLetterFinished ? "Chạm để hiện toàn bộ lời nhắn" : undefined}
          >
            {/* Bulldog Clip at Top Center */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 w-8 h-8">
              <img
                src="/thamkhao/binder_clip.png"
                alt="Binder clip"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <div
              ref={letterScrollRef}
              className="overflow-y-auto pr-1 min-h-0 flex-1 scroll-smooth"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, #ebdccd 31px, #ebdccd 32px)",
                backgroundAttachment: "local",
                lineHeight: "32px",
              }}
            >
              {/* Salutation */}
              <div className="leading-[32px] font-handwriting font-bold text-lg sm:text-xl text-[#1c3f50] mb-0 min-h-[32px]">
                {displayLetterSalutation}
                {letterCursorStage === "salutation" && (
                  <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#1c3f50] animate-pulse align-middle" />
                )}
              </div>

              {/* Letter Body on Lined Paper */}
              {displayLetterBody.length > 0 && (
                <p className="leading-[32px] font-handwriting text-base sm:text-lg text-[#2e1d1b] whitespace-pre-line m-0">
                  {displayLetterBody}
                  {letterCursorStage === "body" && (
                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#c13d28] animate-pulse align-middle" />
                  )}
                </p>
              )}

              {displayLetterSig.length > 0 && (
                <div className="leading-[32px] mt-1 text-right">
                  <p className="font-handwriting font-bold text-base sm:text-lg text-[#c13d28] m-0 inline-block">
                    {displayLetterSig}
                    {letterCursorStage === "signature" && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 bg-[#c13d28] animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              )}

              {/* Heart Signature & Replay */}
              <div className="flex flex-col items-center justify-center mt-2 pb-1">
                <img
                  src="/thamkhao/heart.png"
                  alt="Love"
                  className={`w-6 h-6 object-contain transform transition-all duration-500 ${
                    isLetterFinished ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  } hover:scale-125`}
                />
              </div>
            </div>
          </div>

          {/* Fountain Pen on bottom right */}
          <div className="absolute -bottom-6 -right-3 w-12 sm:w-16 h-28 sm:h-32 pointer-events-none z-20 transform rotate-12">
            <img
              src="/thamkhao/pen.png"
              alt="Fountain pen"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {renderBottomNav(2)}
    </div>
  );

  // -------------------------------------------------------------
  // FRAME 3: 03 / 07 Những ngày như thế... (4-Polaroid Grid)
  // -------------------------------------------------------------
  const defaultPhotos = [
    {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      caption: "Những buổi chiều đi dạo...",
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
      caption: "Những chuyến đi...",
    },
    {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
      caption: "Những lần cà phê...",
    },
    {
      url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
      caption: "Và thật nhiều điều nhỏ...",
    },
  ];

  const photos =
    data.memoryPhotos && data.memoryPhotos.length >= 4
      ? data.memoryPhotos.slice(0, 4)
      : defaultPhotos;

  const renderSlide3 = () => (
    <div
      className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {renderTopBar("03")}

      {/* Main Header */}
      <div className="relative z-10 text-center mt-1 flex flex-col items-center">
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
      <div className="relative z-10 my-auto grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm mx-auto">
        {/* Floating Stars Accents */}
        <img
          src="/thamkhao/star.png"
          alt="Star"
          className="absolute -top-5 -right-3 w-6 h-6 object-contain pointer-events-none opacity-80 animate-pulse z-20"
        />
        <img
          src="/thamkhao/star.png"
          alt="Star"
          className="absolute -bottom-4 -left-3 w-5 h-5 object-contain pointer-events-none opacity-75 animate-pulse z-20"
        />

        {photos.map((item, idx) => {
          const rotations = ["-rotate-2", "rotate-2", "rotate-1", "-rotate-1"];
          return (
            <div
              key={idx}
              onClick={() => setSelectedPhotoModal(item.url)}
              className={`bg-white p-2 pb-3 rounded-lg shadow-lg border border-[#ebdccd] flex flex-col items-center transform ${rotations[idx]} hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer group relative`}
            >
              <div className="aspect-square w-full rounded-xs overflow-hidden bg-stone-100 mb-1.5 relative">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="font-handwriting text-sm text-[#1c3f50] font-bold text-center line-clamp-1 px-1">
                {item.caption}
              </span>
            </div>
          );
        })}
      </div>

      {renderBottomNav(3)}
    </div>
  );

  // -------------------------------------------------------------
  // FRAME 4: 04 / 07 Video dành cho bạn
  // -------------------------------------------------------------
  const renderSlide4 = () => (
    <div
      className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {renderTopBar("04")}

      {/* Main Header with Large Tilted Typography and Playful Doodles */}
      <div className="relative z-10 text-center mt-0.5 sm:mt-1 flex flex-col items-center shrink-0">
        <span className="absolute -top-1 left-8 text-amber-400 text-sm pointer-events-none select-none">✦</span>
        <span className="absolute top-2 right-10 text-amber-400 text-xs pointer-events-none select-none">✦</span>

        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -left-10 sm:-left-12 -top-1 transform -rotate-12 pointer-events-none select-none">
            <svg
              viewBox="0 0 32 32"
              className="w-8 h-8 sm:w-9 sm:h-9 text-[#c13d28] fill-none stroke-current"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="8" width="18" height="15" rx="3.5" />
              <polygon points="21,13 29,8 29,23 21,18" />
              <circle cx="10" cy="15.5" r="2.5" />
            </svg>
          </div>

          <div className="flex items-center gap-2 transform -rotate-[5deg]">
            <h2 className="font-handwriting font-bold text-5xl sm:text-6xl text-[#183b4e] tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Video
            </h2>
            <span className="text-[#c13d28] text-2xl sm:text-3xl font-sans inline-block transform rotate-12 drop-shadow-xs">
              ♡
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 -mt-1 transform -rotate-[3deg]">
          <span className="font-handwriting text-2xl sm:text-3xl text-[#c13d28] font-bold italic drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            dành cho bạn
          </span>
          <span className="text-[#c13d28] text-2xl font-sans inline-block transform -rotate-6">
            ♡
          </span>
        </div>
      </div>

      {/* Video Player Card */}
      <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center">
        {/* White Polaroid frame */}
        <div className="relative w-full rounded-2xl bg-white p-2 sm:p-2.5 shadow-2xl border border-[#ebdccd] transition-all duration-300 transform rotate-[0.5deg]">
          <div
            onClick={toggleVideo}
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-black cursor-pointer group flex items-center justify-center"
          >
            <img
              src="/thamkhao/anime_sunset_couple_wide.png"
              alt="Sunset anime couple"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

            {/* Central Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center text-[#c13d28] transform group-hover:scale-115 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[32px] sm:text-[36px] ml-1">
                  {isPlayingVideo ? "pause" : "play_arrow"}
                </span>
              </div>
            </div>

            {/* Video Control Bar at Bottom */}
            <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2 text-white font-mono text-[11px]">
              <span>0:00</span>
              <div className="flex-1 h-1 bg-white/40 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-[#c13d28] transition-all duration-300"
                  style={{ width: isPlayingVideo ? "45%" : "0%" }}
                />
              </div>
              <span>4:12</span>
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            </div>
          </div>
        </div>

        {/* Taped Caption Note */}
        <div className="relative mt-2.5 w-full max-w-[290px] sm:max-w-xs mx-auto flex items-center justify-center">
          <span className="absolute -left-6 bottom-1 text-[#c13d28] text-2xl font-sans pointer-events-none select-none transform rotate-12">
            ♡
          </span>
          <span className="absolute -right-5 -bottom-1 text-amber-400 text-xs pointer-events-none select-none">
            ✦
          </span>

          <div className="absolute -top-2.5 -left-2 z-20 w-8 h-4 bg-amber-100/75 border border-amber-200/60 shadow-xs transform -rotate-12 pointer-events-none backdrop-blur-xs" />

          <img
            src="/thamkhao/paper.png"
            alt="Giấy ghi chú"
            className="w-full h-auto object-contain drop-shadow-md"
          />
          <div className="absolute inset-0 px-6 py-3 flex items-center justify-center text-center">
            <p className="font-handwriting text-xs sm:text-sm text-[#2e1d1b] font-medium leading-relaxed">
              Một video đặc biệt gửi riêng cho bạn, với thật nhiều lời muốn nói và những kỷ niệm đẹp...{" "}
              <span className="text-[#c13d28] inline-block font-sans ml-0.5 text-sm">♡</span>
            </p>
          </div>
        </div>
      </div>

      {renderBottomNav(4)}
    </div>
  );

  // -------------------------------------------------------------
  // FRAME 5: 05 / 07 Còn một điều mình muốn nói (Radio Cassette)
  // -------------------------------------------------------------
  const renderSlide5 = () => (
    <div
      className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {/* Decorative Potted Plant on left edge */}
      <img
        src="/thamkhao/tree.png"
        alt="Plant decor"
        className="absolute -bottom-4 -left-8 w-28 h-44 object-contain pointer-events-none opacity-85 z-10"
      />

      {renderTopBar("05")}

      {/* Main Header */}
      <div className="relative z-10 text-center mt-1 flex flex-col items-center">
        <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold block -mb-1">
          Còn một điều
        </span>
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#c13d28] tracking-wider uppercase">
          MÌNH MUỐN NÓI
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold">
            với bạn
          </span>
          <img src="/thamkhao/music_notes.png" alt="Notes" className="w-4 h-4 object-contain" />
        </div>
      </div>

      {/* Cassette Radio Chassis */}
      <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Wooden Signboard */}
        <div className="bg-[#d7c4ac] border border-[#9a7d60] px-4 py-1.5 rounded-lg shadow-sm text-[#4a2e1d] font-serif text-xs font-bold mb-2.5 transform -rotate-1">
          Nghe lại một chút nhé...
        </div>

        {/* Vintage Radio Player Box */}
        <div className="w-full bg-[#fffefb] p-4 sm:p-5 rounded-3xl shadow-2xl border-4 border-[#ebdccd] flex flex-col items-center">
          {/* LCD Waveform Screen */}
          <div className="w-full bg-[#1c2229] border border-stone-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-inner h-28 mb-3">
            <div className="flex items-center justify-between text-[#d8c8b4] font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlayingMusic ? "bg-red-500 animate-ping" : "bg-stone-500"
                  }`}
                />
                {isPlayingMusic ? "PLAYING CASSETTE" : "STANDBY"}
              </span>
              <span className="text-stone-400">STEREO • HI-FI</span>
            </div>

            {/* Symmetrical Waveform Display with Center Axis */}
            <div className="relative flex items-center justify-center gap-1 h-12 w-full">
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[1px] bg-white/15 pointer-events-none" />

              {[4, 8, 14, 22, 32, 40, 46, 42, 36, 26, 18, 26, 36, 44, 48, 44, 34, 24, 16, 26, 38, 44, 36, 24, 14, 8, 4].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 z-1 ${
                    isPlayingMusic ? "bg-amber-100 shadow-xs" : "bg-white/40"
                  }`}
                  style={{
                    height: isPlayingMusic
                      ? `${Math.max(4, Math.min(42, (h * 0.8) + (i % 2 === 0 ? 6 : -4)))}px`
                      : `${h * 0.8}px`,
                  }}
                />
              ))}
            </div>

            <div className="flex justify-between font-mono text-[10px] text-stone-400">
              <span className="truncate max-w-[180px] text-amber-200/90 font-medium">
                {data.song?.title || "Giai điệu kỷ niệm"}
              </span>
              <span>{isPlayingMusic ? "PLAYING" : "PAUSED"}</span>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="w-full flex flex-col items-center">
            {/* Seek bar */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Thanh thời gian bài hát"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={musicProgress}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setMusicProgress(pct);
              }}
              className="relative w-full py-1 cursor-pointer group"
            >
              <div className="w-full h-1.5 bg-[#ded3c5] rounded-full relative overflow-visible">
                <div
                  className="h-full bg-[#ba4230] rounded-full transition-all duration-150"
                  style={{ width: `${musicProgress}%` }}
                />
                {/* Scrubber thumb knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#ba4230] rounded-full shadow-xs transition-transform group-hover:scale-125"
                  style={{ left: `${musicProgress}%` }}
                />
              </div>
            </div>

            {/* Timestamps */}
            <div className="w-full flex items-center justify-between text-[#172b3a] font-sans text-[11px] font-semibold mt-0.5 mb-2.5">
              <span>0:00</span>
              <span>-2:34</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setMusicProgress(0)}
                className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                aria-label="Bài trước"
              >
                <span className="material-symbols-outlined text-[24px]">skip_previous</span>
              </button>

              {/* Big Red Play Button */}
              <button
                type="button"
                onClick={toggleMusic}
                className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#ba4230] hover:bg-[#a63727] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label={isPlayingMusic ? "Tạm dừng" : "Phát nhạc"}
              >
                <span className="material-symbols-outlined text-[32px] ml-1">
                  {isPlayingMusic ? "pause" : "play_arrow"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMusicProgress((p) => Math.min(100, p + 15))}
                className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                aria-label="Bài kế tiếp"
              >
                <span className="material-symbols-outlined text-[24px]">skip_next</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderBottomNav(5)}
    </div>
  );

  // -------------------------------------------------------------
  // FRAME 6: 06 / 07 Và cuối cùng... Là giọng nói của mình
  // -------------------------------------------------------------
  const renderSlide6 = () => (
    <div
      className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/thamkhao/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#fffbf5]/60 pointer-events-none" />

      {renderTopBar("06")}

      {/* Main Header */}
      <div className="relative z-10 text-center mt-1 flex flex-col items-center">
        <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold block -mb-1">
          Và cuối cùng...
        </span>
        <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#c13d28] tracking-wider uppercase">
          LÀ GIỌNG NÓI
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-handwriting text-lg sm:text-xl text-[#1c3f50] font-bold">
            của mình
          </span>
          <img src="/thamkhao/microphone.png" alt="Mic" className="w-5 h-5 object-contain inline-block" />
        </div>
      </div>

      {/* Decorative Potted Peace Lily on left edge */}
      <img
        src="/thamkhao/tree_2.png"
        alt="Plant decor"
        className="absolute bottom-20 -left-6 w-20 sm:w-24 h-auto object-contain pointer-events-none opacity-85 z-10"
      />

      {/* Decorative Music notes on right */}
      <img
        src="/thamkhao/music_notes.png"
        alt="Music notes"
        className="absolute top-44 -right-2 w-10 sm:w-12 h-auto object-contain pointer-events-none opacity-85 z-10"
      />

      {/* Center Studio Microphone & Player Card */}
      <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Glowing Vintage Studio Microphone */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-1 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-2xl animate-pulse" />
          <img
            src="/thamkhao/microphone.png"
            alt="Studio Microphone"
            className="w-full h-full object-contain drop-shadow-xl z-10 transform hover:scale-105 transition-transform"
          />
        </div>

        {/* Audio Player Card with Voice Note Controls (Pure CSS stationery) */}
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
            aria-valuemax={100}
            aria-valuenow={voiceProgress}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              setVoiceProgress(pct);
            }}
            className="relative w-full py-1.5 cursor-pointer group"
          >
            <div className="w-full h-1.5 bg-[#ded3c5] rounded-full relative overflow-visible">
              <div
                className="h-full bg-[#ba4230] rounded-full transition-all duration-150"
                style={{ width: `${voiceProgress}%` }}
              />
              {/* Scrubber thumb knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#ba4230] rounded-full shadow-xs transition-transform group-hover:scale-125"
                style={{ left: `${voiceProgress}%` }}
              />
            </div>
          </div>

          {/* Timestamps */}
          <div className="w-full flex items-center justify-between text-[#172b3a] font-sans text-[11px] sm:text-xs font-semibold mt-1">
            <span>0:00</span>
            <span>-2:34</span>
          </div>

          {/* Controls: Rewind 15s | Play | Forward 15s */}
          <div className="flex items-center justify-center gap-6 my-3.5">
            <button
              type="button"
              onClick={() => setVoiceProgress((p) => Math.max(0, p - 15))}
              className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Lùi 15 giây"
              aria-label="Lùi 15 giây"
            >
              <Replay15Icon className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            <button
              type="button"
              onClick={toggleVoice}
              className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#ba4230] hover:bg-[#a63727] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              aria-label={isPlayingVoice ? "Dừng ghi âm" : "Nghe ghi âm"}
            >
              <span className="material-symbols-outlined text-[30px] ml-1">
                {isPlayingVoice ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVoiceProgress((p) => Math.min(100, p + 15))}
              className="p-1.5 rounded-full text-[#172b3a] hover:text-[#ba4230] hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Tiến 15 giây"
              aria-label="Tiến 15 giây"
            >
              <Forward15Icon className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Note Quote with outlined heart */}
          <div className="text-center pt-1 max-w-xs mx-auto">
            <p className="font-handwriting text-xs sm:text-sm text-[#172b3a] leading-snug font-semibold">
              {data.voiceNote?.noteText ||
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

      {renderBottomNav(6)}
    </div>
  );

  // -------------------------------------------------------------
  // FRAME 7: 07 / 07 Cảm ơn bạn đã đi qua những ngày này
  // -------------------------------------------------------------
  const renderSlide7 = () => (
    <div
      className="relative w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden rounded-3xl bg-cover bg-center"
      style={{ backgroundImage: "url('/thamkhao/sunset_couple_clean.jpg')" }}
    >
      {/* Subtle top sunset lighting overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-amber-950/40 pointer-events-none" />

      {renderTopBar("07", true)}

      {/* Header: Cảm ơn bạn ❤️ đã đi qua những ngày này cùng mình */}
      <div className="relative z-10 text-center mt-2 flex flex-col items-center px-2">
        <div className="inline-flex items-center justify-center gap-2">
          <h2 className="font-handwriting font-black text-3xl sm:text-4xl text-[#1c3f50] drop-shadow-md">
            Cảm ơn bạn
          </h2>
          <span className="text-[#c13d28] text-2xl sm:text-3xl animate-pulse">❤️</span>
        </div>
        <p className="font-handwriting text-base sm:text-lg text-[#3d2417] font-bold mt-0.5 drop-shadow-xs">
          đã đi qua những ngày này cùng mình.
        </p>

        {/* Message card floating softly in the pastel sky */}
        <div className="mt-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/85 shadow-sm max-w-[280px] sm:max-w-xs text-center">
          <p className="font-handwriting text-sm sm:text-base text-[#2e1d1b] font-semibold leading-snug">
            Món quà này sẽ luôn ở đây, mỗi khi bạn muốn nhớ lại.
          </p>
        </div>
      </div>

      {/* Scenic middle spacer: couple and sunset are completely unobstructed */}
      <div className="flex-1 min-h-0 pointer-events-none" />

      {/* Bottom Two Action Buttons: Xem Lại & Lưu Lại */}
      <div className="relative z-20 w-full max-w-xs mx-auto grid grid-cols-2 gap-3 pb-2 px-2">
        <button
          type="button"
          onClick={() => goToSlide(1)}
          className="py-3 px-4 rounded-full bg-[#1c3f50]/95 hover:bg-[#163341] active:scale-95 text-white font-serif font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer border border-white/20 backdrop-blur-xs"
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          <span>Xem lại</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="py-3 px-4 rounded-full bg-[#c13d28]/95 hover:bg-[#a83232] active:scale-95 text-white font-serif font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer border border-white/20 backdrop-blur-xs"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Lưu lại</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-md mx-auto my-auto flex flex-col items-center">
      {/* 7-Slide Container */}
      <div className="w-full aspect-[9/16] rounded-3xl shadow-2xl border-4 border-white/90 overflow-hidden relative bg-white">
        {currentSlide === 1 && renderSlide1()}
        {currentSlide === 2 && renderSlide2()}
        {currentSlide === 3 && renderSlide3()}
        {currentSlide === 4 && renderSlide4()}
        {currentSlide === 5 && renderSlide5()}
        {currentSlide === 6 && renderSlide6()}
        {currentSlide === 7 && renderSlide7()}
      </div>

      {/* Curtain Drawer Menu (When Hamburger Icon is clicked) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#fffdfa] rounded-3xl p-5 shadow-2xl border-2 border-[#ebdccd] flex flex-col gap-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdccd]">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#1c3f50]">Mục Lục Thiệp</span>
                <span className="text-xs text-[#c13d28] font-bold">7 Phần</span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Chapters list */}
            <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
              {SLIDE_TITLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToSlide(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    item.id === currentSlide
                      ? "bg-[#c13d28] text-white shadow-sm"
                      : "hover:bg-stone-100 text-[#2e1d1b]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-xs">{item.title}</span>
                      <span className={`text-[10px] ${item.id === currentSlide ? "text-white/80" : "text-stone-500"}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs opacity-75">0{item.id}</span>
                </button>
              ))}
            </div>

            {/* Quick Music Toggle in Menu */}
            <div className="pt-2 border-t border-[#ebdccd] flex items-center justify-between">
              <span className="text-xs font-serif text-[#1c3f50] font-bold">Nhạc nền lofi</span>
              <button
                type="button"
                onClick={toggleMusic}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  isPlayingMusic ? "bg-[#c13d28] text-white" : "bg-stone-200 text-stone-700"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPlayingMusic ? "volume_up" : "volume_off"}
                </span>
                <span>{isPlayingMusic ? "Đang bật" : "Đang tắt"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div className="relative max-w-lg w-full bg-white p-3 rounded-2xl shadow-2xl">
            <img src={selectedPhotoModal} alt="Zoomed" className="w-full h-auto rounded-xl object-contain max-h-[75vh]" />
            <button
              type="button"
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
