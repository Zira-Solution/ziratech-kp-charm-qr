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
        return "bg-linear-to-br from-parchment-light via-parchment-light to-surface-container-high";
      case "retro-nostalgia":
        return "bg-linear-to-br from-parchment-light via-parchment-border to-craft-border";
      case "storybook-sunset":
        return "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200";
      default:
        return "bg-parchment-light";
    }
  };

  return (
    <div className={`min-h-screen w-full ${getAmbientBg()} text-on-surface flex flex-col items-center justify-between py-3 px-2 sm:px-4 transition-colors duration-500`}>
      {/* Top Floating Control Bar */}
      <header className="w-full max-w-4xl liquid-glass rounded-2xl sm:rounded-full px-3 sm:px-4 py-2 sm:py-2.5 mb-3 sm:mb-4 border border-white/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 z-30">
        {/* Top/Left: Links & Brand */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5">
            {onBackToLock && (
              <button
                onClick={onBackToLock}
                className="p-1.5 sm:p-2 rounded-full liquid-glass-pill hover:bg-white text-primary flex items-center transition-colors shadow-xs cursor-pointer border border-white/80"
                title="Khóa lại"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">lock</span>
              </button>
            )}

            <Link
              href="/"
              className="p-1.5 sm:p-2 rounded-full liquid-glass-pill hover:bg-white text-primary flex items-center transition-colors shadow-xs cursor-pointer border border-white/80"
              title="Về Trang Chủ"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">home</span>
            </Link>

            <span className="text-xs font-serif font-bold text-primary-container px-1 truncate">
              K&amp;P Atelier · Quà 20/10
            </span>
          </div>

          {/* Mobile View Mode Buttons (Right of top row on mobile) */}
          <div className="flex sm:hidden items-center gap-1 liquid-glass-pill p-0.5 rounded-full border border-white/80 shadow-xs">
            <button
              onClick={() => setViewMode("sheet")}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === "sheet" ? "bg-white text-primary shadow-xs" : "text-warm-muted"
              }`}
              title="Bản thảo"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("story")}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === "story" ? "bg-white text-primary shadow-xs" : "text-warm-muted"
              }`}
              title="Story"
            >
              <span className="material-symbols-outlined text-base">style</span>
            </button>
            <button
              onClick={() => setViewMode("scroll")}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === "scroll" ? "bg-white text-primary shadow-xs" : "text-warm-muted"
              }`}
              title="Cuộn dọc"
            >
              <span className="material-symbols-outlined text-base">view_stream</span>
            </button>
          </div>
        </div>

        {/* Center: 3 Template Pickers (Scrollable on mobile) */}
        <div className="w-full sm:w-auto flex items-center justify-center gap-1 liquid-glass-pill p-1 rounded-full border border-white/80 shadow-xs overflow-x-auto">
          <button
            onClick={() => setSelectedTemplate("vintage-scrapbook")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-serif font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              selectedTemplate === "vintage-scrapbook"
                ? "liquid-glass-btn-primary text-white shadow-md"
                : "text-warm-neutral hover:text-crimson"
            }`}
          >
            <span>🌸</span>
            <span>Hoa Khô</span>
          </button>

          <button
            onClick={() => setSelectedTemplate("retro-nostalgia")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-serif font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              selectedTemplate === "retro-nostalgia"
                ? "liquid-glass-btn-primary text-white shadow-md"
                : "text-warm-neutral hover:text-rust"
            }`}
          >
            <span>🎞️</span>
            <span>Retro 90s</span>
          </button>

          <button
            onClick={() => setSelectedTemplate("storybook-sunset")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-serif font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              selectedTemplate === "storybook-sunset"
                ? "liquid-glass-btn-primary text-white shadow-md"
                : "text-warm-neutral hover:text-ocean-depth"
            }`}
          >
            <span>🌅</span>
            <span>Sunset</span>
          </button>
        </div>

        {/* Desktop View Mode Toggle (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-1 liquid-glass-pill p-1 rounded-full border border-white/80 shadow-xs">
          <button
            onClick={() => setViewMode("sheet")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "sheet"
                ? "bg-white text-primary shadow-xs font-bold"
                : "text-warm-muted hover:text-on-surface"
            }`}
            title="Xem toàn cảnh 7 trang giống 100% bản thảo ảnh chụp"
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span>Bản Thảo</span>
          </button>

          <button
            onClick={() => setViewMode("story")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "story"
                ? "bg-white text-primary shadow-xs font-bold"
                : "text-warm-muted hover:text-on-surface"
            }`}
            title="Lướt xem từng trang dạng Story tương tác"
          >
            <span className="material-symbols-outlined text-[15px]">style</span>
            <span>Story</span>
          </button>

          <button
            onClick={() => setViewMode("scroll")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === "scroll"
                ? "bg-white text-primary shadow-xs font-bold"
                : "text-warm-muted hover:text-on-surface"
            }`}
            title="Cuộn đọc liền mạch 7 trang"
          >
            <span className="material-symbols-outlined text-[15px]">view_stream</span>
            <span>Cuộn Dọc</span>
          </button>

          {viewMode === "story" && (
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="p-1 rounded-full text-warm-muted hover:text-on-surface transition-colors ml-1"
              title={isPhoneFrame ? "Toàn khung hình" : "Khung điện thoại"}
            >
              <span className="material-symbols-outlined text-base">
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
                ? "max-w-97.5 min-h-190 rounded-4xl shadow-[0_20px_50px_rgba(70,40,30,0.18)] border-4 border-white/80 relative"
                : "max-w-md min-h-180 rounded-2xl shadow-xl border border-white/60 relative"
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
      <footer className="text-center text-xs text-warm-neutral pt-4 pb-2 flex items-center justify-center gap-2">
        <span>🐾 Kỷ vật số K&amp;P Atelier 20/10 • Góp bữa ăn cho các bé Sân Nhà Nhiều Chó</span>
      </footer>

      {/* Saved Keepsake Celebration Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass text-on-surface p-6 rounded-3xl max-w-sm w-full shadow-2xl border-2 border-white/90 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full liquid-glass-pill text-primary flex items-center justify-center mx-auto shadow-sm border border-white/80">
              <span className="material-symbols-outlined text-4xl">download_done</span>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-primary">
                Đã Lưu Kỷ Niệm Thành Công!
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Trang kỷ vật 20/10 cùng lời nhắn giọng nói và album ảnh của bạn đã được đóng gói sẵn để xem lại bất cứ lúc nào, ngay cả khi offline.
              </p>
            </div>

            <div className="p-3.5 liquid-glass-pill rounded-2xl text-[11px] text-on-secondary-fixed-variant text-left space-y-1 border border-white/70">
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
