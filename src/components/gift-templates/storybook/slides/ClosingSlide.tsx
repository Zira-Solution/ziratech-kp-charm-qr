"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import type { ViewerGift } from "@/components/gift-templates/normalize";
import type { SlideDef, TemplateContext } from "@/components/gift-templates/template-contract";
import StorybookHeader from "./StorybookHeader";
import { parseAddressing, getDefaultFinalMessage } from "@/components/gift-templates/addressing";
import { exportHtmlKeepsake } from "@/components/gift-templates/exportHtmlKeepsake";

interface Props {
  gift: ViewerGift;
  ctx: TemplateContext;
  slides: readonly SlideDef[];
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(" ");
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

export default function ClosingSlide({ gift, ctx, slides }: Props) {
  const isLandscape = ctx.layout === "landscape";
  const pronouns = parseAddressing(gift.addressing);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadedHtmlName, setDownloadedHtmlName] = useState("");
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const finalMsg = gift.finalMessage || getDefaultFinalMessage(pronouns);

  const handleReplay = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c13d28", "#f4a261", "#e76f51", "#2a9d8f", "#e9c46a"],
    });
    ctx.go(0);
  };

  /**
   * Tải toàn bộ thiệp dưới dạng file HTML độc lập (offline single-file storybook)
   * Người nhận có thể mở xem trọn vẹn 7 trang từ đầu tới cuối mà không cần mạng.
   */
  const handleDownloadHtmlKeepsake = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const htmlContent = await exportHtmlKeepsake(gift);
      const filename = `thiep-ky-niem-${(gift.recipientName || "20-10").toLowerCase().replace(/\s+/g, "-")}.html`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Confetti celebration
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.5 },
        colors: ["#c13d28", "#d99b26", "#fea095", "#ffffff"],
      });

      setDownloadedHtmlName(filename);
      setSuccessMessage("Đã tải thiệp HTML trọn vẹn về máy!");
      setSavedSuccess(true);
      setDownloadModalOpen(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err) {
      console.error("Lỗi đóng gói file thiệp HTML:", err);
      alert("Không thể đóng gói file thiệp HTML. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Tải ảnh thẻ PNG nếu người dùng muốn làm hình nền điện thoại
   */
  const handleSavePngCard = async () => {
    if (isGeneratingPng) return;
    setIsGeneratingPng(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const c = canvas.getContext("2d");
      if (!c) throw new Error("Canvas context not available");

      // 1. Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = reject;
        bgImg.src = "/thamkhao/sunset_couple_clean.jpg";
      });

      // Cover 1080x1920 with couple in lower-middle view
      const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
      const x = (canvas.width - bgImg.width * scale) / 2;
      const y = (canvas.height - bgImg.height * scale) * 0.42;
      c.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);

      // 2. Soft pastel sky gradient
      const skyGrad = c.createLinearGradient(0, 0, 0, 780);
      skyGrad.addColorStop(0, "rgba(255, 255, 255, 0.48)");
      skyGrad.addColorStop(0.7, "rgba(255, 245, 235, 0.2)");
      skyGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, canvas.width, 780);

      // Bottom vignette gradient
      const botGrad = c.createLinearGradient(0, 1600, 0, 1920);
      botGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      botGrad.addColorStop(1, "rgba(28, 14, 10, 0.65)");
      c.fillStyle = botGrad;
      c.fillRect(0, 1600, canvas.width, 320);

      // 3. Header text: "Cảm ơn [người nhận] ❤️"
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "#1c3f50";
      c.font = "bold 84px 'Dancing Script', 'Merriweather', serif";
      c.shadowColor = "rgba(255, 255, 255, 0.95)";
      c.shadowBlur = 10;
      c.fillText(`Cảm ơn ${pronouns.Recipient} ❤️`, canvas.width / 2, 175);

      // Subtitle
      c.fillStyle = "#3d2417";
      c.font = "bold 42px 'Dancing Script', 'Merriweather', serif";
      c.shadowBlur = 6;
      c.fillText(`đã đi qua những ngày này cùng ${pronouns.sender}.`, canvas.width / 2, 255);
      c.shadowBlur = 0;

      // 4. White frosted card for the message
      const cardWidth = 880;
      const cardX = (canvas.width - cardWidth) / 2;
      const cardY = 330;
      const cardHeight = 350;
      const radius = 36;

      // Card shadow & fill
      c.shadowColor = "rgba(40, 20, 10, 0.16)";
      c.shadowBlur = 24;
      c.shadowOffsetY = 10;
      c.fillStyle = "rgba(255, 254, 248, 0.93)";

      c.beginPath();
      c.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
      c.fill();
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;

      // Card border
      c.strokeStyle = "rgba(236, 218, 200, 0.9)";
      c.lineWidth = 3;
      c.stroke();

      // Washi tape at top of card
      c.fillStyle = "rgba(254, 243, 199, 0.9)";
      c.strokeStyle = "rgba(251, 191, 36, 0.4)";
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(canvas.width / 2 - 80, cardY - 14, 160, 28, 6);
      c.fill();
      c.stroke();

      // Card Message Text (Wrapped lines)
      c.fillStyle = "#2e1d1b";
      c.font = "600 38px 'Dancing Script', 'Merriweather', serif";
      const lines = wrapText(c, finalMsg, cardWidth - 120);
      const lineHeight = 54;
      const textStartY = cardY + (cardHeight - (lines.length * lineHeight + (gift.sender ? 45 : 0))) / 2 + 25;

      lines.forEach((line, idx) => {
        c.fillText(line, canvas.width / 2, textStartY + idx * lineHeight);
      });

      // Sender signature
      if (gift.sender) {
        c.fillStyle = "#c13d28";
        c.font = "bold 36px 'Dancing Script', 'Merriweather', serif";
        c.fillText(`— ${gift.sender}`, canvas.width / 2, textStartY + lines.length * lineHeight + 18);
      }

      // 5. Bottom Watermark Branding
      c.fillStyle = "rgba(255, 255, 255, 0.92)";
      c.font = "600 24px 'Be Vietnam Pro', sans-serif";
      c.fillText("TEAM K&P • VÒNG TAY CHARM & THIỆP QUÀ SỐ 20/10", canvas.width / 2, 1850);

      // Convert to image url
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewModalUrl(dataUrl);

      // Trigger file download
      const filename = `thiep-ky-niem-${(gift.recipientName || "20-10").toLowerCase().replace(/\s+/g, "-")}.png`;
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Copy share link to clipboard
      if (typeof window !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }

      // Confetti celebration
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#c13d28", "#d99b26", "#fea095", "#ffffff"],
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err) {
      console.error("Lỗi tạo ảnh thiệp kỷ niệm:", err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  return (
    <div
      className="relative flex h-full w-full select-none overflow-hidden bg-cover bg-[center_42%] text-[#2e1d1b]"
      style={{ backgroundImage: "url('/thamkhao/sunset_couple_clean.jpg')" }}
    >
      {/* Sunset top lighting overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-white/35 via-transparent to-amber-950/40 pointer-events-none" />

      {/* Save Success Toast */}
      {savedSuccess && (
        <div
          role="status"
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white/95 px-6 py-2.5 shadow-2xl border border-rose-200 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-[#c13d28] animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successMessage || "Đã tải thiệp về máy & sao chép liên kết!"}</span>
        </div>
      )}

      {isLandscape ? (
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-6 lg:px-12 pt-2 lg:pt-3 pb-3 lg:pb-4">
          <StorybookHeader ctx={ctx} slides={slides} isArtCanvas />

          <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-between">
            {/* Header + Final Message in the Sky */}
            <div className="text-center flex flex-col items-center shrink-0 max-w-4xl px-2">
              <div className="inline-flex items-center justify-center gap-3">
                <h2 className="font-handwriting font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-[#1c3f50] drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
                  Cảm ơn {pronouns.recipient}
                </h2>
                <span className="text-[#c13d28] text-4xl sm:text-5xl lg:text-6xl animate-pulse">❤️</span>
              </div>
              <p className="font-handwriting text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#3d2417] font-bold -mt-0.5 lg:-mt-1 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                đã đi qua những ngày này cùng {pronouns.sender}.
              </p>

              {/* Final Message card floating in the sunset sky */}
              <div className="relative mt-2 lg:mt-3 px-8 py-3 sm:px-10 sm:py-3.5 lg:px-12 lg:py-4 rounded-2xl sm:rounded-3xl bg-[#fffef8]/90 backdrop-blur-md border border-[#ecdac8] shadow-[0_12px_36px_rgba(40,20,10,0.14)] max-w-xl lg:max-w-2xl xl:max-w-3xl text-center">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 lg:w-18 h-4 bg-amber-100/80 border border-amber-200/70 shadow-xs transform rotate-1 pointer-events-none backdrop-blur-xs" />
                <p className="font-handwriting text-lg sm:text-xl lg:text-2xl xl:text-3xl text-[#2e1d1b] font-semibold leading-relaxed whitespace-pre-line">
                  {finalMsg}
                </p>
                {gift.sender && (
                  <p className="font-handwriting text-base sm:text-lg lg:text-xl xl:text-2xl text-[#c13d28] font-bold mt-1">
                    — {gift.sender}
                  </p>
                )}
              </div>
            </div>

            {/* Spacer so the couple and sea are 100% visible */}
            <div className="flex-1 min-h-6 pointer-events-none" />

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-6 lg:gap-10 pb-10 lg:pb-12 shrink-0">
              <button
                type="button"
                onClick={handleReplay}
                className="py-2.5 px-8 sm:py-3 sm:px-10 lg:py-3.5 lg:px-12 rounded-full bg-[#1c3f50] hover:bg-[#142d3a] text-white font-serif font-bold text-base sm:text-lg lg:text-xl shadow-2xl border-2 border-white/80 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px] lg:text-[26px]">replay</span>
                <span>Xem lại</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHtmlKeepsake}
                disabled={isGenerating}
                className="py-2.5 px-8 sm:py-3 sm:px-10 lg:py-3.5 lg:px-12 rounded-full bg-[#c13d28] hover:bg-[#a83232] text-white font-serif font-bold text-base sm:text-lg lg:text-xl shadow-2xl border-2 border-white/80 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đóng gói thiệp...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px] lg:text-[26px]">download</span>
                    <span>Lưu thiệp trọn vẹn (HTML)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Portrait view: Couple and sunset are 100% clear */
        <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 pb-10 sm:pb-12 select-none overflow-hidden">
          <StorybookHeader ctx={ctx} slides={slides} isArtCanvas />

          {/* Header & Final Message in the Sunset Sky */}
          <div className="relative z-10 text-center mt-1 flex flex-col items-center shrink-0 px-2">
            <div className="inline-flex items-center justify-center gap-2">
              <h2 className="font-handwriting font-black text-3xl sm:text-4xl text-[#1c3f50] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                Cảm ơn {pronouns.recipient}
              </h2>
              <span className="text-[#c13d28] text-2xl sm:text-3xl animate-pulse">❤️</span>
            </div>
            <p className="font-handwriting text-base sm:text-lg text-[#3d2417] font-bold mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              đã đi qua những ngày này cùng {pronouns.sender}.
            </p>

            {/* Keepsake Message card floating softly in the pastel sky */}
            <div className="mt-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/85 shadow-sm max-w-[280px] sm:max-w-xs text-center">
              <p className="font-handwriting text-sm sm:text-base text-[#2e1d1b] font-semibold leading-snug whitespace-pre-line">
                {finalMsg}
              </p>
              {gift.sender && (
                <p className="font-handwriting text-xs sm:text-sm text-[#c13d28] font-bold mt-1">
                  — {gift.sender}
                </p>
              )}
            </div>
          </div>

          {/* Scenic middle spacer: couple and sunset are completely unobstructed */}
          <div className="flex-1 min-h-0 pointer-events-none" />

          {/* Bottom Navigation Buttons */}
          <div className="relative z-20 w-full flex items-center justify-center gap-3 px-3 pb-1 shrink-0">
            <button
              type="button"
              onClick={handleReplay}
              className="flex-1 max-w-[130px] py-2.5 px-4 rounded-full bg-[#1c3f50]/95 hover:bg-[#142d3a] text-white font-serif font-bold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Xem lại</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlKeepsake}
              disabled={isGenerating}
              className="flex-1 max-w-[170px] py-2.5 px-3 rounded-full bg-[#c13d28]/95 hover:bg-[#a83232] text-white font-serif font-bold text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-xs disabled:opacity-75"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Tải thiệp (HTML)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* HTML Keepsake Download Success Modal */}
      {downloadModalOpen && (
        <div
          data-no-swipe
          onClick={(e) => {
            if (e.target === e.currentTarget) setDownloadModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-5 shadow-2xl border border-white/80 flex flex-col items-center animate-in zoom-in-95 duration-200 text-center">
            <button
              type="button"
              onClick={() => setDownloadModalOpen(false)}
              className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[18px] font-bold">close</span>
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c13d28] mb-3">
              <span className="material-symbols-outlined text-[32px]">html</span>
            </div>

            <h3 className="font-serif font-bold text-lg text-[#1c3f50]">Đã Tải Thiệp Kỷ Niệm (HTML)</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed px-1">
              File <code className="bg-amber-100 px-1 py-0.5 rounded text-[#c13d28] font-bold">{downloadedHtmlName}</code> đã được lưu về thiết bị của bạn.
            </p>

            <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs text-stone-600 space-y-1.5 w-full">
              <div className="flex items-start gap-2">
                <span className="text-[#c13d28] font-bold">✓</span>
                <span>Xem trọn vẹn <strong>7 trang</strong> từ đầu tới cuối (hộp quà, thư tay, album ảnh, video, cassette nhạc, voice).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#c13d28] font-bold">✓</span>
                <span>Mở xem <strong>offline không cần internet</strong> trên mọi điện thoại & máy tính.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#c13d28] font-bold">✓</span>
                <span>Dễ dàng gửi tặng qua Zalo, Messenger, Email hoặc lưu vào Google Drive.</span>
              </div>
            </div>

            <div className="w-full mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSavePngCard}
                disabled={isGeneratingPng}
                className="w-full py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isGeneratingPng ? (
                  <>
                    <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang tạo ảnh PNG...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[17px]">wallpaper</span>
                    <span>Tải thêm ảnh thẻ làm hình nền (PNG)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Đã sao chép liên kết thiệp vào bộ nhớ tạm!");
                  }
                }}
                className="w-full py-2.5 px-4 rounded-full bg-[#1c3f50] hover:bg-[#142d3a] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">content_copy</span>
                <span>Sao chép link xem online</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keepsake Photo Preview Modal (Useful for mobile/iOS where long-press is preferred) */}
      {previewModalUrl && (
        <div
          data-no-swipe
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewModalUrl(null);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-4 shadow-2xl border border-white/80 flex flex-col items-center animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-3.5 -right-3.5 z-10 w-9 h-9 rounded-full bg-white text-[#c13d28] shadow-xl border border-stone-200 flex items-center justify-center hover:bg-[#c13d28] hover:text-white transition-colors cursor-pointer"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>

            <div className="w-full text-center mb-2">
              <h3 className="font-serif font-bold text-base text-[#1c3f50]">Ảnh Kỷ Niệm 20/10</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Nhấn giữ ảnh để lưu vào Thư viện ảnh (Photo Library) hoặc bấm nút bên dưới.
              </p>
            </div>

            <div className="w-full max-h-[60vh] overflow-hidden rounded-2xl shadow-md border border-stone-100 flex items-center justify-center bg-stone-900">
              <img
                src={previewModalUrl}
                alt="Ảnh thiệp kỷ niệm"
                className="w-full h-full object-contain max-h-[58vh]"
              />
            </div>

            <div className="w-full mt-3 flex items-center gap-2">
              <a
                href={previewModalUrl}
                download={`thiep-ky-niem-${(gift.recipientName || "20-10").toLowerCase().replace(/\s+/g, "-")}.png`}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#c13d28] hover:bg-[#a83232] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">download</span>
                <span>Tải ảnh lại</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Đã sao chép liên kết thiệp vào bộ nhớ tạm!");
                  }
                }}
                className="py-2.5 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">content_copy</span>
                <span>Copy link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
