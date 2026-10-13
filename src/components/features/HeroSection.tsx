"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "error" | "pending";
    message: string;
  } | null>(null);

  // Recipient opens a gift: card code + "OTP xem thiệp" (printed on the card) are checked on the server.
  const handleOpenGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusFeedback(null);

    const code = tokenInput.trim().toUpperCase();
    const otp = otpInput.trim();

    if (!code) {
      setStatusFeedback({ type: "error", message: "Vui lòng nhập mã thiệp in trên thẻ quà tặng." });
      return;
    }
    if (!otp) {
      setStatusFeedback({ type: "error", message: "Vui lòng nhập OTP xem thiệp (4 số) in trên thẻ." });
      return;
    }

    setIsChecking(true);
    try {
      const res = await fetch("/api/gifts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code, passcode: otp, mode: "open" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusFeedback({
          type: "error",
          message: data.error || "Mã thiệp hoặc OTP xem thiệp không đúng.",
        });
        return;
      }

      if (data.isCompleted) {
        router.push(data.redirectUrl || `/g/${code}`);
      } else {
        setStatusFeedback({
          type: "pending",
          message: "Mã hợp lệ! Người tặng chưa thiết kế xong thiệp. Bạn hãy quay lại sau nhé.",
        });
      }
    } catch {
      setStatusFeedback({
        type: "error",
        message: "Lỗi kết nối. Vui lòng thử lại.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section id="hero" className="relative w-full overflow-hidden pb-16 lg:pb-24 pt-6 sm:pt-10 lg:pt-14">
      {/* Ambient glowing liquid backdrop orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 rounded-full bg-linear-to-b from-secondary-fixed/60 via-secondary-container/30 to-transparent opacity-60 blur-3xl pointer-events-none animate-liquid-float-slow" />
      <div className="absolute -bottom-10 left-1/4 w-112.5 h-112.5 rounded-full bg-linear-to-tr from-rose-petal/40 to-surface-container/30 opacity-70 blur-3xl pointer-events-none animate-liquid-float-fast" />

      <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full liquid-glass-pill text-primary mb-5 shadow-xs border border-white/95">
          <span className="material-symbols-outlined text-[17px] text-amber-500 animate-pulse">auto_awesome</span>
          <span className="text-xs sm:text-sm font-serif font-bold tracking-wider">
            K&amp;P ATELIER • CỔNG MỞ THIỆP QUÀ TẶNG SỐ 20/10
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[62px] text-primary leading-[1.16] tracking-tight font-black max-w-4xl">
          Nhập Mã Thẻ Quà Tặng.<br />
          <span className="bg-linear-to-r from-primary-container via-rust to-secondary bg-clip-text text-transparent italic font-normal">
            Mở Cả Bầu Trời Kỷ Niệm.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mt-4 max-w-3xl leading-relaxed font-sans font-medium">
          Mỗi hộp quà K&amp;P Atelier đều đi kèm một <strong>thẻ nhung ép kim mạ vàng</strong> chứa mã định danh độc bản. Hãy nhập <strong>mã thiệp</strong> và <strong>OTP xem thiệp</strong> in trên thẻ dưới đây để mở bức thư hoa khô, album ảnh kỷ niệm và lời chúc âm thanh!
        </p>

        {/* EXPANSIVE WIDE REDEMPTION BAR IN HERO */}
        <div className="w-full max-w-3xl lg:max-w-4xl mx-auto mt-8 sm:mt-11 text-left">
          <form onSubmit={handleOpenGift} className="w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-3xl sm:rounded-full liquid-glass bg-white/95 border-2 border-white/95 shadow-[0_24px_60px_rgba(114,26,40,0.13)] transition-all focus-within:ring-4 focus-within:ring-primary-container/15">
              
              {/* Input field */}
              <div className="relative flex-1 flex items-center min-w-0">
                <span className="material-symbols-outlined absolute left-4 sm:left-5 text-[22px] sm:text-2xl text-secondary pointer-events-none">
                  vpn_key
                </span>
                <input
                  type="text"
                  required
                  placeholder="Mã thiệp in trên thẻ (VD: KP-2010-ABC123)"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className="w-full pl-12 sm:pl-14 pr-4 py-3.5 sm:py-4 bg-transparent font-mono font-bold text-base sm:text-xl text-primary tracking-widest uppercase focus:outline-none placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-xs sm:placeholder:text-sm placeholder:text-secondary/55"
                  aria-label="Mã thiệp"
                  autoComplete="off"
                />
              </div>

              {/* OTP xem thiệp */}
              <div className="relative flex items-center sm:w-52 border-t sm:border-t-0 sm:border-l border-secondary/20 min-w-0">
                <span className="material-symbols-outlined absolute left-4 sm:left-5 text-[22px] sm:text-2xl text-secondary pointer-events-none">
                  lock
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  placeholder="OTP xem thiệp"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-12 sm:pl-14 pr-4 py-3.5 sm:py-4 bg-transparent font-mono font-bold text-base sm:text-xl text-primary tracking-[0.35em] focus:outline-none placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-xs sm:placeholder:text-sm placeholder:text-secondary/55"
                  aria-label="OTP xem thiệp"
                  autoComplete="off"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isChecking}
                className="w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl sm:rounded-full liquid-glass-btn-primary text-white font-serif font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
              >
                {isChecking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang Kiểm Tra...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[19px] sm:text-[21px] text-amber-300">favorite</span>
                    <span>MỞ THIỆP KỶ NIỆM NGAY</span>
                  </>
                )}
              </button>
            </div>

            {/* Status / Feedback message */}
            {statusFeedback ? (
              <div
                className={`mt-4 p-4 rounded-2xl text-xs sm:text-sm font-sans max-w-2xl mx-auto ${
                  statusFeedback.type === "error"
                    ? "bg-rose-100 text-rose-800 border border-rose-300 font-bold"
                    : "bg-amber-50 text-amber-900 border border-amber-200"
                }`}
              >
                <p role={statusFeedback.type === "error" ? "alert" : "status"}>{statusFeedback.message}</p>
              </div>
            ) : null}
          </form>
        </div>

        {/* Micro Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 w-full max-w-3xl">
          <div className="liquid-glass-pill px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/85 shadow-xs">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">qr_code_2</span>
            <span className="text-xs text-on-surface-variant font-medium">Thẻ QR Không Cần Cài App</span>
          </div>
          <div className="liquid-glass-pill px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/85 shadow-xs">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">school</span>
            <span className="text-xs text-on-surface-variant font-medium">Booth Nhận Tại ĐH FPT</span>
          </div>
          <div className="liquid-glass-pill px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/85 shadow-xs">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">lock</span>
            <span className="text-xs text-on-surface-variant font-medium">Bảo Mật OTP 4 Số</span>
          </div>
        </div>

      </div>
    </section>
  );
}
