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
            src="/thamkhao/heart.png"
            alt="Hoa văn trang trí"
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-[125%] h-auto max-w-[320px] pointer-events-none drop-shadow-xs select-none"
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
        <div className="relative w-34 sm:w-40 h-48 sm:h-56 shrink-0 transform -rotate-1 select-none">
          <img
            src="/thamkhao/signpost.png"
            alt="Biển chỉ dẫn"
            className="w-full h-full object-contain drop-shadow-lg"
          />

          {/* Plank 1: Những kỷ niệm -> Slide 3 */}
          <button
            type="button"
            onClick={() => goToSlide(3)}
            className="absolute top-[9%] left-[10%] w-[82%] h-[18%] flex items-center justify-center font-serif font-bold text-[10px] sm:text-[11px] text-[#3a2012] hover:text-[#c13d28] hover:translate-x-1 active:scale-95 transition-all cursor-pointer drop-shadow-2xs"
            title="Xem Những kỷ niệm"
          >
            Những kỷ niệm
          </button>

          {/* Plank 2: Lời nhắn -> Slide 2 */}
          <button
            type="button"
            onClick={() => goToSlide(2)}
            className="absolute top-[31%] left-[12%] w-[80%] h-[18%] flex items-center justify-center font-serif font-bold text-[10px] sm:text-[11px] text-[#3a2012] hover:text-[#c13d28] hover:translate-x-1 active:scale-95 transition-all cursor-pointer drop-shadow-2xs"
            title="Xem Lời nhắn"
          >
            Lời nhắn
          </button>

          {/* Plank 3: Khoảnh khắc -> Slide 4 */}
          <button
            type="button"
            onClick={() => goToSlide(4)}
            className="absolute top-[53%] left-[14%] w-[78%] h-[18%] flex items-center justify-center font-serif font-bold text-[10px] sm:text-[11px] text-[#3a2012] hover:text-[#c13d28] hover:translate-x-1 active:scale-95 transition-all cursor-pointer drop-shadow-2xs"
            title="Xem Khoảnh khắc"
          >
            Khoảnh khắc
          </button>

          {/* Plank 4: Và nhiều hơn... -> Slide 5 */}
          <button
            type="button"
            onClick={() => goToSlide(5)}
            className="absolute top-[74%] left-[12%] w-[80%] h-[18%] flex items-center justify-center font-serif font-bold text-[10px] sm:text-[11px] text-[#3a2012] hover:text-[#c13d28] hover:translate-x-1 active:scale-95 transition-all cursor-pointer drop-shadow-2xs"
            title="Xem Và nhiều hơn..."
          >
            Và nhiều hơn...
          </button>
        </div>

        {/* 3D Gift Box on the Right */}
        <div
          onClick={nextSlide}
          className="relative w-32 sm:w-38 mb-1 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-2xl flex flex-col items-center"
          title="Chạm để mở món quà!"
        >
          <img
            src="/thamkhao/gift_box.png"
            alt="Hộp quà tặng"
            className="w-full h-auto object-contain transform group-hover:-translate-y-1 transition-transform"
          />
          <span className="absolute -top-3 right-1 px-2 py-0.5 bg-[#fffdfa]/95 text-[#c13d28] font-handwriting font-bold text-[11px] rounded-full shadow-md border border-[#ebdccd] group-hover:scale-110 transition-transform">
            Mở quà ✨
          </span>
        </div>
      </div>

      {/* Bottom CTA Button: Chạm để mở món quà → */}
      <div className="relative z-20 w-full flex justify-center pb-2">
        <button
          type="button"
          onClick={nextSlide}
          className="w-full max-w-[280px] sm:max-w-xs py-3 px-6 rounded-full bg-[#fffbf5]/95 hover:bg-white text-[#3d2417] font-serif font-bold text-xs sm:text-sm shadow-xl border border-[#d8c8b4] transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>
            Chạm để mở món <strong className="text-[#c13d28]">quà</strong>
          </span>
          <span className="text-[#c13d28] group-hover:translate-x-1.5 transition-transform text-base">
            →
          </span>
        </button>
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

          {/* Letter Note Container using original trang thư 2.png */}
          <div
            className="relative p-5 sm:p-6 pt-9 rounded-xl shadow-xl transform rotate-0.5 bg-cover bg-center border border-[#ebdccd]"
            style={{
              backgroundImage: "url('/thamkhao/letter_paper.png')",
              backgroundColor: "#fffdfa",
              backgroundSize: "100% 100%",
            }}
          >
            {/* Bulldog Clip at Top Center */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8">
              <img
                src="/thamkhao/binder_clip.png"
                alt="Binder clip"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            {/* Salutation */}
            <div className="mb-2">
              <span className="font-handwriting font-bold text-lg sm:text-xl text-[#1c3f50]">
                Gửi {data.recipientName || "bạn"},
              </span>
            </div>

            {/* Letter Body on Lined Paper */}
            <p className="font-handwriting text-base sm:text-lg text-[#2e1d1b] leading-relaxed whitespace-pre-line min-h-[140px]">
              {data.letterContent ||
                "Có vài điều mình luôn muốn nói nhưng chưa có dịp...\nHôm nay, mình muốn gửi tất cả vào món quà này."}
            </p>

            {/* Heart Signature */}
            <div className="flex justify-center mt-3">
              <img
                src="/thamkhao/heart.png"
                alt="Love"
                className="w-6 h-6 object-contain transform hover:scale-125 transition-transform"
              />
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

      {/* Main Header */}
      <div className="relative z-10 text-center mt-1 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-handwriting font-bold text-3xl sm:text-4xl text-[#1c3f50]">
            Video
          </h2>
          <span className="material-symbols-outlined text-2xl text-[#c13d28]">videocam</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <span className="font-handwriting text-xl sm:text-2xl text-[#c13d28] font-bold">
            dành cho bạn
          </span>
          <img src="/thamkhao/heart.png" alt="Heart" className="w-5 h-5 object-contain" />
        </div>
      </div>

      {/* Video Player Card */}
      <div className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Screen / Card */}
        <div
          onClick={toggleVideo}
          className="relative w-full aspect-16/10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black cursor-pointer group"
        >
          <img
            src="/thamkhao/anime_sunset_couple_wide.png"
            alt="Sunset anime couple"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

          {/* Central Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center text-[#c13d28] transform group-hover:scale-115 transition-transform">
              <span className="material-symbols-outlined text-[32px] ml-1">
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

        {/* Taped Caption Note using original giấy.png */}
        <div className="relative mt-2 w-full max-w-xs mx-auto flex items-center justify-center">
          <img
            src="/thamkhao/paper.png"
            alt="Giấy ghi chú"
            className="w-full h-auto object-contain drop-shadow-md"
          />
          <div className="absolute inset-0 px-6 py-4 flex items-center justify-center text-center">
            <p className="font-handwriting text-xs sm:text-sm text-[#2e1d1b] font-medium leading-relaxed">
              Một video đặc biệt gửi riêng cho bạn, với thật nhiều lời muốn nói và những kỷ niệm đẹp... ❤️
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
        <div className="bg-[#d8c8b4] border border-[#6b4737] px-4 py-1.5 rounded-lg shadow-sm text-[#6b4737] font-serif text-xs font-bold mb-3 transform -rotate-1">
          Nghe lại một chút nhé...
        </div>

        {/* Vintage Radio Player Box */}
        <div className="w-full bg-[#fcf8f2] p-5 sm:p-6 rounded-3xl shadow-2xl border-4 border-[#ebdccd] flex flex-col items-center">
          {/* LCD Waveform Screen */}
          <div className="w-full bg-[#1c1a19] rounded-2xl p-4 flex flex-col justify-between shadow-inner h-24 mb-4">
            <div className="flex items-center justify-between text-[#d8c8b4] font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {isPlayingMusic ? "PLAYING CASSETTE" : "PAUSED"}
              </span>
              <span>STEREO • HI-FI</span>
            </div>

            {/* Bouncing Equalizer Bars */}
            <div className="flex items-center justify-center gap-1.5 h-10">
              {[12, 24, 18, 32, 28, 14, 30, 22, 34, 26, 16, 28, 20, 32, 18].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlayingMusic ? "bg-white" : "bg-white/40"
                  }`}
                  style={{
                    height: isPlayingMusic ? `${Math.max(6, (h * (i % 2 === 0 ? 1.2 : 0.8)) % 36)}px` : "6px",
                  }}
                />
              ))}
            </div>

            <div className="flex justify-between font-mono text-[10px] text-stone-400">
              <span>0:00</span>
              <span>-2:34</span>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setMusicProgress(0)}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-[#1c1a19] flex items-center justify-center transition-all cursor-pointer"
              aria-label="Bài trước"
            >
              <span className="material-symbols-outlined text-[20px]">skip_previous</span>
            </button>

            {/* Big Red Play Button */}
            <button
              type="button"
              onClick={toggleMusic}
              className="w-16 h-16 rounded-full bg-[#c13d28] hover:bg-[#a83232] active:scale-95 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer"
              aria-label={isPlayingMusic ? "Tạm dừng" : "Phát nhạc"}
            >
              <span className="material-symbols-outlined text-[36px] ml-0.5">
                {isPlayingMusic ? "pause" : "play_arrow"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMusicProgress(0)}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-[#1c1a19] flex items-center justify-center transition-all cursor-pointer"
              aria-label="Bài kế tiếp"
            >
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>
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

        {/* Audio Player Card with Voice Note Controls inside original giấy.png */}
        <div className="relative w-full max-w-[310px] sm:max-w-xs mx-auto flex items-center justify-center">
          <img
            src="/thamkhao/paper.png"
            alt="Giấy ghi chú"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
          <div className="absolute inset-0 px-5 pt-8 pb-3 flex flex-col justify-between">
            {/* Progress bar */}
            <div className="w-full flex items-center justify-between text-stone-600 font-mono text-[9px] sm:text-[10px]">
              <span>0:00</span>
              <div className="flex-1 mx-2 h-1 bg-[#d8c8b4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c13d28] transition-all duration-300"
                  style={{ width: isPlayingVoice ? "60%" : "0%" }}
                />
              </div>
              <span>-2:34</span>
            </div>

            {/* Controls: Rewind 15s | Play | Forward 15s */}
            <div className="flex items-center justify-center gap-4 my-1">
              <button
                type="button"
                onClick={() => setVoiceProgress((p) => Math.max(0, p - 15))}
                className="w-8 h-8 rounded-full bg-[#e8ded5]/80 hover:bg-[#d8c8b4] text-[#1c1a19] flex items-center justify-center transition-all cursor-pointer"
                title="Lùi 15 giây"
              >
                <span className="material-symbols-outlined text-[16px]">replay_15</span>
              </button>

              <button
                type="button"
                onClick={toggleVoice}
                className="w-11 h-11 rounded-full bg-[#c13d28] hover:bg-[#a83232] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer"
                aria-label={isPlayingVoice ? "Dừng ghi âm" : "Nghe ghi âm"}
              >
                <span className="material-symbols-outlined text-[26px] ml-0.5">
                  {isPlayingVoice ? "pause" : "play_arrow"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVoiceProgress((p) => Math.min(100, p + 15))}
                className="w-8 h-8 rounded-full bg-[#e8ded5]/80 hover:bg-[#d8c8b4] text-[#1c1a19] flex items-center justify-center transition-all cursor-pointer"
                title="Tiến 15 giây"
              >
                <span className="material-symbols-outlined text-[16px]">forward_15</span>
              </button>
            </div>

            {/* Note Quote */}
            <div className="text-center pt-0.5">
              <p className="font-handwriting text-xs text-[#2e1d1b] leading-tight font-medium">
                Có những điều viết ra vẫn chưa đủ. Nên lần này, mình muốn bạn nghe bằng chính giọng nói của mình. ❤️
              </p>
            </div>
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
      <div className="relative z-10 text-center mt-2 flex flex-col items-center">
        <div className="inline-flex items-center justify-center gap-2">
          <h2 className="font-handwriting font-black text-3xl sm:text-4xl text-[#1c3f50] drop-shadow-md">
            Cảm ơn bạn
          </h2>
          <span className="text-[#c13d28] text-2xl sm:text-3xl animate-pulse">❤️</span>
        </div>
        <p className="font-handwriting text-lg sm:text-xl text-[#3d2417] font-bold mt-0.5 drop-shadow-sm">
          đã đi qua những ngày này cùng mình.
        </p>
      </div>

      {/* Middle Note: Taped Paper Card using original giấy.png */}
      <div className="relative z-10 my-auto w-full max-w-xs mx-auto flex items-center justify-center">
        <img
          src="/thamkhao/paper.png"
          alt="Giấy ghi chú"
          className="w-full h-auto object-contain drop-shadow-2xl"
        />
        <div className="absolute inset-0 px-6 pt-5 pb-3 flex items-center justify-center text-center">
          <p className="font-handwriting text-sm sm:text-base text-[#2e1d1b] font-semibold leading-relaxed">
            Món quà này sẽ luôn ở đây, mỗi khi bạn muốn nhớ lại.
          </p>
        </div>
      </div>

      {/* Bottom Two Action Buttons: Xem Lại & Lưu Lại */}
      <div className="relative z-20 w-full max-w-xs mx-auto grid grid-cols-2 gap-3 pb-2">
        <button
          type="button"
          onClick={() => goToSlide(1)}
          className="py-3 px-4 rounded-full bg-[#1c3f50]/95 hover:bg-[#163341] active:scale-95 text-white font-serif font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer border border-white/20"
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          <span>Xem lại</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="py-3 px-4 rounded-full bg-[#c13d28]/95 hover:bg-[#a83232] active:scale-95 text-white font-serif font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer border border-white/20"
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
