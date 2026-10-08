"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GiftTemplateId, RecipientGiftData, DEFAULT_GIFT_DATA } from "./types";
import VintageScrapbookTemplate from "./VintageScrapbookTemplate";
import RetroNostalgiaTemplate from "./RetroNostalgiaTemplate";
import StorybookSunsetTemplate from "./StorybookSunsetTemplate";

interface GiftTemplateViewerProps {
  initialTemplate?: GiftTemplateId;
  giftData?: Partial<RecipientGiftData>;
  onBackToLock?: () => void;
}

export default function GiftTemplateViewer({
  initialTemplate = "vintage-scrapbook",
  giftData,
  onBackToLock,
}: GiftTemplateViewerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<GiftTemplateId>(initialTemplate);
  const [viewMode, setViewMode] = useState<"story" | "sheet" | "scroll">("sheet");
  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);

  const fullData: RecipientGiftData = {
    ...DEFAULT_GIFT_DATA,
    ...giftData,
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => Math.min(7, prev + 1));
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => Math.max(1, prev - 1));
  };

  const handleGoToSlide = (slide: number) => {
    if (slide >= 1 && slide <= 7) {
      setActiveSlide(slide);
      if (viewMode === "sheet") {
        setViewMode("story");
      }
    }
  };

  // Keyboard navigation for story mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "story") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        handlePrevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  const handleSaveKeepsake = () => {
    setShowSavedModal(true);
  };

  // Dynamic ambient background colors depending on selected template
  const getAmbientBg = () => {
    switch (selectedTemplate) {
      case "vintage-scrapbook":
        return "bg-gradient-to-br from-[#f8f1e7] via-[#f4e8dc] to-[#eee0d4]";
      case "retro-nostalgia":
        return "bg-gradient-to-br from-[#f3e9db] via-[#eddcc8] to-[#e4cfb6]";
      case "storybook-sunset":
        return "bg-gradient-to-br from-[#edf2f7] via-[#e2eaf2] to-[#d8e3ed]";
      default:
        return "bg-[#f8f1e7]";
    }
  };

  return (
    <div className={`min-h-screen w-full ${getAmbientBg()} text-[#221a18] flex flex-col items-center justify-between py-3 px-2 sm:px-4 transition-colors duration-500`}>
      {/* Top Floating Control Bar */}
      <header className="w-full max-w-4xl liquid-glass rounded-full px-4 py-2.5 mb-4 border border-white/80 shadow-lg flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left Links */}
        <div className="flex items-center gap-2">
          {onBackToLock && (
            <button
              onClick={onBackToLock}
              className="p-2 rounded-full liquid-glass-pill hover:bg-white text-[#540114] flex items-center transition-colors shadow-xs cursor-pointer border border-white/80"
              title="Khóa lại"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>
          )}

          <Link
            href="/"
            className="p-2 rounded-full liquid-glass-pill hover:bg-white text-[#540114] flex items-center transition-colors shadow-xs cursor-pointer border border-white/80"
            title="Về Trang Chủ"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
          </Link>

          <span className="text-xs font-serif font-bold text-[#721a28] px-1">
            K&amp;P Atelier · Quà Số 20/10
          </span>
        </div>

        {/* Center: 3 Template Pickers (User's Uploaded Samples) */}
        <div className="flex items-center gap-1 liquid-glass-pill p-1 rounded-full border border-white/80 shadow-xs">
          <button
            onClick={() => setSelectedTemplate("vintage-scrapbook")}
            className={`px-3 py-1.5 rounded-full text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTemplate === "vintage-scrapbook"
                ? "liquid-glass-btn-primary text-white shadow-md"
                : "text-[#54433d] hover:text-[#822923]"
            }`}
          >
            <span>🌸</span>
            <span>Sổ Hoa Khô</span>
          </button>

          <button
            onClick={() => setSelectedTemplate("retro-nostalgia")}
            className={`px-3 py-1.5 rounded-full text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTemplate === "retro-nostalgia"
                ? "liquid-glass-btn-primary text-white shadow-md"
                : "text-[#54433d] hover:text-[#c13d28]"
            }`}
          >
            <span>🎞️</span>
            <span>Retro 90s</span>
          </button>

          <button
            onClick={() => setSelectedTemplate("storybook-sunset")}
            className={`px-3 py-1.5 rounded-full text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTemplate === "storybook-sunset"
                ? "liquid-glass-btn-primary text-white shadow-md"
                : "text-[#54433d] hover:text-[#2b4c6f]"
            }`}
          >
            <span>🌅</span>
            <span>Anime Sunset</span>
          </button>
        </div>

        {/* Right: View Modes (Sheet 100% Giống Mẫu vs Story vs Scroll) */}
        <div className="flex items-center gap-1 liquid-glass-pill p-1 rounded-full border border-white/80 shadow-xs">
          <button
            onClick={() => setViewMode("sheet")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "sheet"
                ? "bg-white text-[#540114] shadow-xs font-bold"
                : "text-[#6c5952] hover:text-[#221a18]"
            }`}
            title="Xem toàn cảnh 7 trang giống 100% bản thảo ảnh chụp"
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span className="hidden sm:inline">Bản Thảo Canva</span>
          </button>

          <button
            onClick={() => setViewMode("story")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "story"
                ? "bg-white text-[#540114] shadow-xs font-bold"
                : "text-[#6c5952] hover:text-[#221a18]"
            }`}
            title="Lướt xem từng trang dạng Story tương tác"
          >
            <span className="material-symbols-outlined text-[15px]">style</span>
            <span className="hidden sm:inline">Lướt Story</span>
          </button>

          <button
            onClick={() => setViewMode("scroll")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "scroll"
                ? "bg-white text-[#540114] shadow-xs font-bold"
                : "text-[#6c5952] hover:text-[#221a18]"
            }`}
            title="Cuộn đọc liền mạch 7 trang"
          >
            <span className="material-symbols-outlined text-[15px]">view_stream</span>
            <span className="hidden sm:inline">Cuộn Dọc</span>
          </button>

          {viewMode === "story" && (
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="p-1 rounded-full text-[#6c5952] hover:text-[#221a18] transition-colors ml-1"
              title={isPhoneFrame ? "Toàn khung hình" : "Khung điện thoại"}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPhoneFrame ? "fullscreen" : "stay_current_portrait"}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center justify-center my-auto">
        {viewMode === "sheet" ? (
          // ================= SHEET OVERVIEW (100% MATCH TO CANVA IMAGE) =================
          <div className="w-full">
            {selectedTemplate === "vintage-scrapbook" && (
              <VintageScrapbookTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="sheet"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}

            {selectedTemplate === "retro-nostalgia" && (
              <RetroNostalgiaTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="sheet"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}

            {selectedTemplate === "storybook-sunset" && (
              <StorybookSunsetTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="sheet"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}
          </div>
        ) : viewMode === "scroll" ? (
          // ================= CONTINUOUS SCROLL =================
          <div className="w-full">
            {selectedTemplate === "vintage-scrapbook" && (
              <VintageScrapbookTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="scroll"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}

            {selectedTemplate === "retro-nostalgia" && (
              <RetroNostalgiaTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="scroll"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}

            {selectedTemplate === "storybook-sunset" && (
              <StorybookSunsetTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="scroll"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}
          </div>
        ) : (
          // ================= STORY INTERACTIVE MODE =================
          <div
            className={`transition-all duration-300 w-full overflow-hidden ${
              isPhoneFrame
                ? "max-w-[390px] min-h-[760px] rounded-[36px] shadow-[0_20px_50px_rgba(70,40,30,0.18)] border-4 border-white/80 relative"
                : "max-w-md min-h-[720px] rounded-2xl shadow-xl border border-white/60 relative"
            }`}
          >
            {selectedTemplate === "vintage-scrapbook" && (
              <VintageScrapbookTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="story"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}

            {selectedTemplate === "retro-nostalgia" && (
              <RetroNostalgiaTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="story"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}

            {selectedTemplate === "storybook-sunset" && (
              <StorybookSunsetTemplate
                data={fullData}
                activeSlide={activeSlide}
                viewMode="story"
                onGoToSlide={handleGoToSlide}
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onSaveKeepsake={handleSaveKeepsake}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Footer Note */}
      <footer className="text-center text-xs text-[#705e57] pt-4 pb-2 flex items-center justify-center gap-2">
        <span>🐾 Kỷ vật số K&amp;P Atelier 20/10 • Góp bữa ăn cho các bé Sân Nhà Nhiều Chó</span>
      </footer>

      {/* Saved Keepsake Celebration Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass text-[#221a18] p-6 rounded-3xl max-w-sm w-full shadow-2xl border-2 border-white/90 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full liquid-glass-pill text-[#540114] flex items-center justify-center mx-auto shadow-sm border border-white/80">
              <span className="material-symbols-outlined text-[36px]">download_done</span>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#540114]">
                Đã Lưu Kỷ Niệm Thành Công!
              </h3>
              <p className="text-xs text-[#564243] mt-1.5 leading-relaxed">
                Trang kỷ vật 20/10 cùng lời nhắn giọng nói và album ảnh của bạn đã được đóng gói sẵn để xem lại bất cứ lúc nào, ngay cả khi offline.
              </p>
            </div>

            <div className="p-3.5 liquid-glass-pill rounded-2xl text-[11px] text-[#76322b] text-left space-y-1 border border-white/70">
              <p>👤 <strong>Người nhận:</strong> {fullData.recipientName}</p>
              <p>🎁 <strong>Mẫu thiệp:</strong> {selectedTemplate === "vintage-scrapbook" ? "Sổ Kỷ Niệm Hoa Khô & Washi Tape" : selectedTemplate === "retro-nostalgia" ? "Hoài Niệm Retro 90s" : "Thanh Xuân Anime"}</p>
              <p>🐾 <strong>Ý nghĩa:</strong> Đã góp bữa ăn no cho các bé tại Sân Nhà Nhiều Chó</p>
            </div>

            <button
              onClick={() => setShowSavedModal(false)}
              className="w-full py-3 rounded-full liquid-glass-btn-primary text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              Đóng &amp; Tiếp Tục Xem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
