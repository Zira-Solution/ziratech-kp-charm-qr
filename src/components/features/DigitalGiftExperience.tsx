"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { musicPlayerSynth } from "../gift-templates/audio-helper";

type TabId = "polaroid" | "voice" | "music" | "ai" | "security";
type ThemeId = "scrapbook" | "retro" | "anime";

export default function DigitalGiftExperience() {
  const [activeTab, setActiveTab] = useState<TabId>("polaroid");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("scrapbook");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiTone, setAiTone] = useState<"romantic" | "friend" | "teacher">("romantic");
  const [enteredPin, setEnteredPin] = useState<string>("2010");
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const isPinUnlocked = enteredPin === "2010";

  const handleKeypadPress = (val: string) => {
    if (val === "C") {
      setEnteredPin("");
    } else if (val === "back") {
      setEnteredPin((prev) => prev.slice(0, -1));
    } else if (enteredPin.length < 4) {
      setEnteredPin((prev) => prev + val);
    }
  };

  const toggleSound = () => {
    if (isPlayingAudio) {
      musicPlayerSynth.stop();
      setIsPlayingAudio(false);
    } else {
      musicPlayerSynth.play();
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    return () => {
      musicPlayerSynth.stop();
    };
  }, []);

  const aiMessages = {
    romantic:
      "Gửi cô gái luôn mang nụ cười rạng rỡ nhất. Chiếc vòng nhỏ này sẽ thay anh đồng hành cùng em qua mọi giờ học, và nhắc em nhớ rằng em luôn là điều dịu dàng nhất của mùa thu FPT.",
    friend:
      "Gửi bạn thân cùng chạy deadline! Cảm ơn vì đã luôn bao dung và chia nửa ly trà sữa những ngày ôn thi thâu đêm. Chúc bạn 20/10 mãi xinh đẹp, rạng rỡ và qua môn 10 điểm!",
    teacher:
      "Kính gửi Cô, nhân ngày 20/10, chúng em xin gửi trọn lòng tri ân sâu sắc nhất. Cảm ơn Cô vì những bài giảng tâm huyết và sự tận tụy đã luôn soi đường cho chúng em.",
  };

  const polaroidPhotos = [
    {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      caption: "Chiều đón nắng FPT... ♡",
      tapeColor: "washi-tape-beige",
    },
    {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
      caption: "Nụ cười rạng rỡ nhất ♡",
      tapeColor: "washi-tape-pink",
    },
    {
      url: "/images/ocean_charm_bracelet.jpg",
      caption: "Chiếc vòng kỷ niệm 20/10 ✨",
      tapeColor: "washi-tape-green",
    },
  ];

  const tabs: {
    id: TabId;
    icon: string;
    title: string;
    badge: string;
    desc: string;
    color: string;
    highlight: string;
  }[] = [
    {
      id: "polaroid",
      icon: "photo_library",
      title: "Album Ảnh Kỷ Niệm Polaroid",
      badge: "Tối đa 6 ảnh",
      desc: "Lồng khung Polaroid cổ điển kèm băng dán washi tape mép rách ziczac và lời ghi chú viết tay chân thành.",
      color: "#934841",
      highlight: "Tự động nén ảnh < 2MB • Lật trang mượt mà",
    },
    {
      id: "voice",
      icon: "mic",
      title: "Ghi Âm Giọng Nói Kỷ Niệm",
      badge: "Tối đa 02:00",
      desc: "Thu âm lời thì thầm chân thành ngay trên trình duyệt điện thoại. Sóng âm 15 vạch chuyển động theo từng nhịp thở.",
      color: "#c13d28",
      highlight: "Lọc tạp âm thông minh • Chạm nghe tức thì",
    },
    {
      id: "music",
      icon: "music_note",
      title: "Bài Hát Giai Điệu Riêng Tải Về Được",
      badge: "MP3 / M4A",
      desc: "Gửi gắm bản nhạc riêng của hai người. Tự động phát khi chạm mở quà và cho phép người nhận tải về lưu giữ trọn đời.",
      color: "#2b4c6f",
      highlight: "Đĩa than xoay cổ điển • Tải bài hát về máy",
    },
    {
      id: "ai",
      icon: "auto_awesome",
      title: "Trợ Lý AI Soạn Lời Nhắn Cảm Xúc",
      badge: "3 Chế độ",
      desc: "Ngại ngùng chưa biết bắt đầu từ đâu? AI gợi ý ý tưởng và trau chuốt từng câu chữ chuẩn gu: Người yêu, Bạn bè, Thầy cô.",
      color: "#540114",
      highlight: "3 văn phong tinh tế • Giấy kẻ dòng phong bì",
    },
    {
      id: "security",
      icon: "lock",
      title: "Mã PIN 4 Số & Bản Lưu Trữ Offline",
      badge: "Bảo mật cao",
      desc: "Cài mã PIN 4 số chống xem lén. Trang kỷ niệm cho phép đóng gói file HTML tải về lưu giữ vĩnh viễn trước ngày web đóng.",
      color: "#721a28",
      highlight: "Khóa sau 5 lần sai • Xuất HTML trọn đời",
    },
  ];

  return (
    <section
      id="digital-gift"
      className="scroll-mt-24 w-full py-16 sm:py-20 bg-gradient-to-b from-[#fff8f6] via-[#fdf4f0] to-[#f9ede8] border-y border-[#edd5ce] relative overflow-hidden"
    >
      {/* Ambient Atmospheric Glows */}
      <div className="absolute top-12 left-10 w-96 h-96 bg-[#ffd8d2]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-10 w-[450px] h-[450px] bg-[#f9dbd4]/45 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================= */}
        {/* SECTION HEADER: Editorial Luxury Atelier Title */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-[#540114] text-xs font-semibold shadow-xs mb-3 transform hover:scale-105 transition-transform border border-white/80">
            <span className="material-symbols-outlined text-[16px] text-[#fea095] animate-pulse">qr_code_2</span>
            <span className="tracking-wide">Linh Hồn Công Nghệ Quà Tặng Phygital • K&amp;P Atelier</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#540114] tracking-tight leading-tight">
            Chiếc Vòng Trên Tay.<br />
            <span className="text-[#934841]">Cả Bầu Trời Kỷ Niệm Trên Màn Hình.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#564243] mt-3.5 leading-relaxed max-w-2xl">
            Khi người nhận quét mã QR khắc trên charm hoặc thẻ nhung bằng camera điện thoại, một cuốn thiệp quà tặng số bí mật sẽ bung mở ngay lập tức — <strong>không cần tải App</strong>, đong đầy âm nhạc, giọng nói và những lời nhắn chân thành.
          </p>

          {/* Quick 3-Step Micro Flow */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 w-full max-w-lg">
            <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl liquid-glass-pill border border-white/80 shadow-xs">
              <span className="w-5 h-5 rounded-full bg-[#540114] text-white text-[11px] flex items-center justify-center font-bold mb-1">1</span>
              <span className="text-xs font-bold text-[#540114]">Quét Mã QR</span>
              <span className="text-[10px] text-[#765e55]">Mở tức thì bằng camera</span>
            </div>
            <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl liquid-glass-pill border border-white/80 shadow-xs">
              <span className="w-5 h-5 rounded-full bg-[#934841] text-white text-[11px] flex items-center justify-center font-bold mb-1">2</span>
              <span className="text-xs font-bold text-[#934841]">Chạm Mở Quà</span>
              <span className="text-[10px] text-[#765e55]">Nhạc vang &amp; lật mở thiệp</span>
            </div>
            <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl liquid-glass-pill border border-white/80 shadow-xs">
              <span className="w-5 h-5 rounded-full bg-[#721a28] text-white text-[11px] flex items-center justify-center font-bold mb-1">3</span>
              <span className="text-xs font-bold text-[#721a28]">Lưu Trọn Đời</span>
              <span className="text-[10px] text-[#765e55]">Tải file HTML vĩnh viễn</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN SHOWCASE: Interactive Sensory Hub + Living Phone Stage */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

          {/* ========================================================= */}
          {/* LEFT COLUMN (7 COLS): 5 Interactive Feature Cards */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            {/* Theme Selector Pill Bar */}
            <div className="p-2.5 sm:p-3 liquid-glass rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#540114]">
                <span className="material-symbols-outlined text-[18px] text-[#934841]">palette</span>
                <span>Mẫu thiệp kỷ niệm:</span>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedTheme("scrapbook")}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedTheme === "scrapbook"
                      ? "liquid-glass-btn-primary text-white shadow-xs"
                      : "liquid-glass-pill text-[#540114] hover:bg-white/80"
                  }`}
                >
                  <span>🌸</span> Sổ Hoa Khô
                </button>
                <button
                  onClick={() => setSelectedTheme("retro")}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedTheme === "retro"
                      ? "liquid-glass-btn-primary text-white shadow-xs"
                      : "liquid-glass-pill text-[#540114] hover:bg-white/80"
                  }`}
                >
                  <span>📼</span> Retro 90s
                </button>
                <button
                  onClick={() => setSelectedTheme("anime")}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedTheme === "anime"
                      ? "liquid-glass-btn-primary text-white shadow-xs"
                      : "liquid-glass-pill text-[#540114] hover:bg-white/80"
                  }`}
                >
                  <span>🌅</span> Sunset Anime
                </button>
              </div>
            </div>

            {/* 5 Feature Interactive Cards */}
            <div className="space-y-2.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 relative border ${
                      isActive
                        ? "liquid-glass border-white/95 ring-2 ring-[#721a28]/20 shadow-[0_12px_32px_rgba(114,26,40,0.12)] -translate-y-0.5"
                        : "liquid-glass-card hover:bg-white/80 border-white/70"
                    }`}
                  >
                    {/* Active Accent Bar on Left */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full shadow-xs"
                        style={{ backgroundColor: tab.color }}
                      />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Icon Container */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-xs border ${
                          isActive
                            ? "liquid-glass-btn-primary text-white scale-105 border-white/40"
                            : "liquid-glass-pill text-[#540114] border-white/70 group-hover:scale-105"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {tab.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3
                            className={`font-serif text-sm sm:text-base font-bold transition-colors ${
                              isActive ? "text-[#540114]" : "text-[#2e1d1b] group-hover:text-[#540114]"
                            }`}
                          >
                            {tab.title}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 transition-colors ${
                              isActive
                                ? "liquid-glass-pill bg-[#ffdad6]/80 text-[#76322b] border-white/80"
                                : "liquid-glass-pill text-[#694d48] border-white/60"
                            }`}
                          >
                            {tab.badge}
                          </span>
                        </div>

                        <p className="text-xs text-[#564243] mt-1 leading-relaxed">
                          {tab.desc}
                        </p>

                        {/* Interactive Highlight Tag */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#843731]">
                          <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                          <span>{tab.highlight}</span>
                        </div>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="hidden sm:flex items-center justify-center shrink-0 self-center pl-1 text-[#bda099]">
                        <span className={`material-symbols-outlined text-[18px] transition-transform ${
                          isActive ? "text-[#540114] translate-x-1" : "group-hover:translate-x-0.5"
                        }`}>
                          chevron_right
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct CTA Button to Live Demo Page */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/g/demo-token"
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl liquid-glass-btn-primary text-white font-serif font-bold text-sm shadow-md flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#fea095]">favorite</span>
                <span>Mở Trải Nghiệm Mẫu 20/10 Demo Ngay</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>

              <div className="flex items-center gap-1.5 text-xs text-[#6e5550] px-3.5 py-2.5 liquid-glass-pill rounded-2xl border border-white/80 shrink-0">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                <span>Tặng kèm trong mọi hộp quà</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (5 COLS): High-End Living Phone Stage */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center sticky top-28">
            
            <div className="relative w-full max-w-[320px] sm:max-w-[340px]">
              
              {/* Floating Badge at Top */}
              <div className="absolute -top-3 right-0 liquid-glass-pill px-3.5 py-1.5 rounded-full shadow-lg border border-white/80 flex items-center gap-1.5 z-30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-serif font-bold text-[#540114]">Quét camera mở tức thì</span>
              </div>

              {/* Physical Card Preview Beside Bottom */}
              <div className="absolute -bottom-2.5 left-0 liquid-glass-pill px-3 py-1.5 rounded-full shadow-lg border border-white/80 flex items-center gap-1.5 z-30">
                <span className="material-symbols-outlined text-[13px] text-[#540114]">verified</span>
                <span className="text-[10px] font-serif font-bold text-[#540114]">Thẻ nhung khắc QR mạ vàng</span>
              </div>

              {/* Ultra-Modern Titanium Smartphone Chassis */}
              <div className="relative bg-[#1a1716] rounded-[44px] p-2.5 shadow-[0_20px_50px_rgba(84,1,20,0.25)] border-[3px] border-[#38312f] ring-1 ring-white/15">
                
                {/* Dynamic Island Notch Pill */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5.5 bg-black rounded-full z-40 flex items-center justify-between px-2 pointer-events-none shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-[#111] border border-white/20" />
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="material-symbols-outlined text-[11px] text-white/80">graphic_eq</span>
                  </div>
                </div>

                {/* Internal Screen Content Area */}
                <div
                  className={`w-full h-[520px] rounded-[34px] overflow-hidden flex flex-col justify-between p-3 pt-8 border border-[#e8ded5] relative transition-colors duration-500 ${
                    selectedTheme === "scrapbook"
                      ? "bg-[#faf5eb]"
                      : selectedTheme === "retro"
                      ? "bg-[#f5ede1]"
                      : "bg-[#faf4ed]"
                  }`}
                >
                  
                  {/* Background Pattern Texture */}
                  {selectedTheme === "scrapbook" && (
                    <div className="absolute inset-0 scrapbook-card-bg opacity-80 pointer-events-none" />
                  )}
                  {selectedTheme === "retro" && (
                    <div className="absolute inset-0 retro-card-bg opacity-75 pointer-events-none" />
                  )}
                  {selectedTheme === "anime" && (
                    <div className="absolute inset-0 anime-card-bg opacity-85 pointer-events-none" />
                  )}

                  {/* Top Bar inside Screen */}
                  <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-[#e8ded5]">
                    <div className="flex items-center gap-1">
                      <span className="font-serif font-bold text-xs text-[#822923]">K&amp;P Atelier</span>
                      <span className="text-[10px] text-[#822923] font-handwriting">♡ 20/10</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-[#765e55] bg-white/90 px-2 py-0.5 rounded-full border border-[#e8ded5] shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Trực Tuyến</span>
                    </div>
                  </div>

                  {/* =================================================== */}
                  {/* DYNAMIC SCREEN CONTENT ACCORDING TO ACTIVE TAB */}
                  {/* =================================================== */}
                  <div className="relative z-10 flex-1 my-auto flex flex-col justify-center py-1.5">
                    
                    {/* ------------------------------------------------- */}
                    {/* 1. POLAROID PHOTO ALBUM TAB */}
                    {/* ------------------------------------------------- */}
                    {activeTab === "polaroid" && (
                      <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center">
                          <span className="font-handwriting text-xl text-[#822923]">Những</span>
                          <h4 className="font-serif font-bold text-base text-[#822923] tracking-wider uppercase -mt-1">
                            KHOẢNH KHẮC ♡
                          </h4>
                        </div>

                        {/* Interactive Main Polaroid Frame */}
                        <div className="relative w-full max-w-[210px] mx-auto">
                          <div className="polaroid-card shadow-md transform -rotate-1 transition-all duration-300 relative">
                            {/* Washi Tape Accent */}
                            <div
                              className={`w-12 h-3.5 absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 ${
                                polaroidPhotos[activePhotoIdx].tapeColor
                              }`}
                            />

                            <div className="aspect-[4/3] rounded-2xs overflow-hidden bg-slate-100">
                              <img
                                src={polaroidPhotos[activePhotoIdx].url}
                                alt="Ảnh kỷ niệm"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <p className="font-handwriting text-xs text-[#443a36] text-center mt-1.5 font-bold">
                              {polaroidPhotos[activePhotoIdx].caption}
                            </p>
                          </div>
                        </div>

                        {/* Mini Photo Selector Dots / Thumbnails */}
                        <div className="flex justify-center items-center gap-1.5 pt-1">
                          {polaroidPhotos.map((photo, i) => (
                            <button
                              key={i}
                              onClick={() => setActivePhotoIdx(i)}
                              className={`w-6 h-6 rounded-md overflow-hidden border-2 transition-all ${
                                activePhotoIdx === i
                                  ? "border-[#822923] scale-110 shadow-xs"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img src={photo.url} alt="thumb" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>

                        <p className="font-handwriting text-[11px] text-[#564243] text-center italic">
                          "Và thật may vì những ngày ấy có bạn." ♡
                        </p>
                      </div>
                    )}

                    {/* ------------------------------------------------- */}
                    {/* 2. VOICE NOTE RECORDING TAB */}
                    {/* ------------------------------------------------- */}
                    {activeTab === "voice" && (
                      <div className="space-y-2.5 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div>
                          <span className="font-handwriting text-xl text-[#822923]">Và cuối cùng...</span>
                          <h4 className="font-serif font-bold text-base text-[#822923] tracking-wide uppercase -mt-0.5">
                            LÀ GIỌNG NÓI CỦA MÌNH
                          </h4>
                        </div>

                        {/* Pulsing Vintage Mic */}
                        <div className="relative w-18 h-18 mx-auto flex items-center justify-center">
                          <div className={`absolute inset-0 bg-[#fceae6] rounded-full transition-all ${
                            isPlayingAudio ? "animate-ping opacity-75" : "opacity-40"
                          }`} />
                          <div className="w-14 h-14 bg-[#fff3f0] rounded-full flex items-center justify-center border-2 border-[#822923] shadow-md z-10">
                            <span className="material-symbols-outlined text-[28px] text-[#822923]">
                              settings_voice
                            </span>
                          </div>
                        </div>

                        {/* Interactive Voice Player Bar */}
                        <div className="bg-white/95 p-2.5 rounded-2xl shadow-sm border border-[#e8ded5] space-y-1.5 max-w-[220px] mx-auto">
                          {/* Animated Sound Waveform */}
                          <div className="flex items-center justify-center gap-1 h-6 bg-[#fff8f6] rounded-xl px-1.5">
                            {[30, 60, 95, 45, 100, 80, 50, 90, 70, 40, 85, 30, 75, 95, 40].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-300 ${
                                  isPlayingAudio ? "bg-[#822923] animate-pulse" : "bg-[#c4928b]"
                                }`}
                                style={{ height: `${isPlayingAudio ? h : 25}%` }}
                              />
                            ))}
                          </div>

                          <div className="flex justify-between text-[9px] font-mono text-[#5c4a44]">
                            <span>{isPlayingAudio ? "00:42" : "00:00"}</span>
                            <span>-02:00</span>
                          </div>

                          <button
                            onClick={toggleSound}
                            className="w-9 h-9 rounded-full bg-[#822923] hover:bg-[#9a312a] text-white flex items-center justify-center mx-auto shadow-sm active:scale-95 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isPlayingAudio ? "pause" : "play_arrow"}
                            </span>
                          </button>
                        </div>

                        <p className="font-handwriting text-xs text-[#443a36]">
                          "Có những điều viết ra không hết... Nên mình nói bạn nghe nhé." ♡
                        </p>
                      </div>
                    )}

                    {/* ------------------------------------------------- */}
                    {/* 3. MUSIC TRACK TAB */}
                    {/* ------------------------------------------------- */}
                    {activeTab === "music" && (
                      <div className="space-y-2.5 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div>
                          <span className="font-handwriting text-xl text-[#822923]">Khúc ca kỷ niệm</span>
                          <h4 className="font-serif font-bold text-base text-[#822923] tracking-wide uppercase -mt-0.5">
                            DÀNH RIÊNG CHO BẠN ♫
                          </h4>
                        </div>

                        {/* Spinning Vinyl Record Player */}
                        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                          <div
                            className={`w-20 h-20 rounded-full bg-[#1c1a19] border-4 border-[#3a3230] shadow-lg flex items-center justify-center ${
                              isPlayingAudio ? "animate-spin" : ""
                            }`}
                            style={{ animationDuration: "5s" }}
                          >
                            <div className="w-8 h-8 rounded-full bg-[#822923] border-2 border-white flex items-center justify-center">
                              <span className="text-white text-[8px] font-serif font-bold">K&amp;P</span>
                            </div>
                          </div>
                        </div>

                        {/* Mini Music Scrubber Bar */}
                        <div className="bg-white/95 p-2.5 rounded-2xl shadow-sm border border-[#e8ded5] max-w-[220px] mx-auto space-y-1.5">
                          <div className="text-left">
                            <span className="text-xs font-serif font-bold text-[#822923] block line-clamp-1">
                              Có Chàng Trai Viết Lên Cây
                            </span>
                            <span className="text-[9px] text-[#705e57]">Giai điệu ký ức 20/10</span>
                          </div>

                          <div className="w-full bg-[#e8ded5] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#822923] h-full w-2/5" />
                          </div>

                          <div className="flex items-center justify-center gap-3 pt-0.5">
                            <button onClick={toggleSound} className="text-[#822923]">
                              <span className="material-symbols-outlined text-[16px]">fast_rewind</span>
                            </button>
                            <button
                              onClick={toggleSound}
                              className="w-7 h-7 rounded-full bg-[#822923] text-white flex items-center justify-center shadow-xs active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isPlayingAudio ? "pause" : "play_arrow"}
                              </span>
                            </button>
                            <button onClick={toggleSound} className="text-[#822923]">
                              <span className="material-symbols-outlined text-[16px]">fast_forward</span>
                            </button>
                          </div>
                        </div>

                        <p className="font-handwriting text-xs text-[#822923]">
                          Tự động ngân vang khoảnh khắc chạm mở thiệp ♡
                        </p>
                      </div>
                    )}

                    {/* ------------------------------------------------- */}
                    {/* 4. AI EMOTIONAL WRITING ASSISTANT TAB */}
                    {/* ------------------------------------------------- */}
                    {activeTab === "ai" && (
                      <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center">
                          <h4 className="font-serif font-bold text-base text-[#2d4734] tracking-wide uppercase">
                            LỜI NHẮN CẢM XÚC ♡
                          </h4>
                          <span className="text-[11px] font-handwriting text-[#822923]">
                            AI chắp bút theo từng đối tượng
                          </span>
                        </div>

                        {/* Tone Selector Buttons in Phone Screen */}
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setAiTone("romantic")}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-serif font-bold transition-all ${
                              aiTone === "romantic"
                                ? "bg-[#822923] text-white shadow-2xs"
                                : "bg-white/80 text-[#540114] border border-[#e8ded5]"
                            }`}
                          >
                            Người yêu
                          </button>
                          <button
                            onClick={() => setAiTone("friend")}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-serif font-bold transition-all ${
                              aiTone === "friend"
                                ? "bg-[#822923] text-white shadow-2xs"
                                : "bg-white/80 text-[#540114] border border-[#e8ded5]"
                            }`}
                          >
                            Bạn thân FPT
                          </button>
                          <button
                            onClick={() => setAiTone("teacher")}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-serif font-bold transition-all ${
                              aiTone === "teacher"
                                ? "bg-[#822923] text-white shadow-2xs"
                                : "bg-white/80 text-[#540114] border border-[#e8ded5]"
                            }`}
                          >
                            Thầy cô
                          </button>
                        </div>

                        {/* Stationery Ruled Letter Note */}
                        <div className="bg-[#fffdfa] p-2.5 pt-3.5 rounded-xl shadow-sm border border-[#e8ded5] paper-lined relative max-w-[230px] mx-auto transform -rotate-1">
                          <div className="w-14 h-3 washi-tape-beige absolute -top-1.5 left-1/2 -translate-x-1/2" />
                          <span className="font-handwriting text-base font-bold text-[#2d4734] block mb-0.5">
                            Gửi bạn... ♡
                          </span>
                          <p className="font-handnote text-xs text-[#3d322d] leading-[20px] min-h-[75px]">
                            {aiMessages[aiTone]}
                          </p>
                          <span className="font-handwriting text-[11px] text-[#822923] text-right block mt-0.5">
                            Gửi trọn yêu thương ♡
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ------------------------------------------------- */}
                    {/* 5. SECURITY PIN & OFFLINE EXPORT TAB */}
                    {/* ------------------------------------------------- */}
                    {activeTab === "security" && (
                      <div className="space-y-2 text-center animate-in fade-in zoom-in-95 duration-300">
                        {/* Glowing Red Heart Lock Icon */}
                        <div className="w-11 h-11 mx-auto rounded-full bg-[#fceae6] border-2 border-[#822923] flex items-center justify-center shadow-xs animate-pulse">
                          <span className="material-symbols-outlined text-[22px] text-[#822923]">
                            {isPinUnlocked ? "lock_open" : "lock"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#822923]">
                            {isPinUnlocked ? "Đã Mở Khóa Bí Mật!" : "Nhập PIN 4 Số Mở Quà"}
                          </h4>
                          <p className="text-[9px] text-[#564243] mt-0.5">
                            {isPinUnlocked
                              ? "Món quà 20/10 đã sẵn sàng xuất hiện"
                              : "Mã gợi ý mặc định: 2 - 0 - 1 - 0"}
                          </p>
                        </div>

                        {/* 4 Digit PIN Display */}
                        <div className="flex justify-center gap-1.5">
                          {[0, 1, 2, 3].map((idx) => (
                            <div
                              key={idx}
                              className={`w-6 h-8 rounded-lg bg-white border-2 shadow-2xs flex items-center justify-center font-bold text-xs ${
                                isPinUnlocked
                                  ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                                  : "border-[#822923] text-[#822923]"
                              }`}
                            >
                              {enteredPin[idx] ? (isPinUnlocked ? enteredPin[idx] : "●") : "—"}
                            </div>
                          ))}
                        </div>

                        {/* Interactive Mini Numeric Keypad on Phone */}
                        <div className="grid grid-cols-3 gap-1 max-w-[175px] mx-auto pt-0.5">
                          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "back"].map((k) => (
                            <button
                              key={k}
                              onClick={() => handleKeypadPress(k)}
                              className="h-6.5 rounded-md bg-white/95 hover:bg-white text-[11px] font-mono font-bold text-[#540114] border border-[#e8ded5] shadow-2xs active:scale-95 transition-all flex items-center justify-center"
                            >
                              {k === "back" ? (
                                <span className="material-symbols-outlined text-[13px]">backspace</span>
                              ) : (
                                k
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Offline HTML Export Note */}
                        <div className="p-1.5 bg-white/90 rounded-lg border border-[#e8ded5] max-w-[220px] mx-auto text-[8.5px] text-[#705e57] text-left flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-emerald-600 shrink-0">
                            save_alt
                          </span>
                          <span>Hỗ trợ xuất file HTML lưu vĩnh viễn trên máy &amp; điện thoại.</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom Navigation / Brand Indicator inside Phone */}
                  <div className="relative z-10 pt-1.5 border-t border-[#e8ded5] flex justify-between items-center text-[9px] text-[#765e55]">
                    <span className="font-handwriting text-xs text-[#822923]">K&amp;P Atelier</span>
                    <span className="text-[8.5px] font-mono">Bản Thảo Số 20/10</span>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
