"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Entry point for the card creator (the buyer): card code + "OTP tạo thiệp" (sent by email).
 * Recipients do not use this page: they open a gift from the home page with the card code and
 * the "OTP xem thiệp" printed on the card.
 */
function CreatorPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tokenInput, setTokenInput] = useState<string>((searchParams.get("token") || "").toUpperCase());
  const [otpInput, setOtpInput] = useState<string>("");
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Old links such as /gift?tab=open belonged to recipients: send them to the home page form.
  useEffect(() => {
    if (searchParams.get("tab") === "open") router.replace("/#hero");
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const code = tokenInput.trim().toUpperCase();
    const otp = otpInput.trim();

    if (!code) {
      setErrorMsg("Vui lòng nhập mã thiệp.");
      return;
    }
    if (!otp) {
      setErrorMsg("Vui lòng nhập OTP tạo thiệp bạn đã nhận qua email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/gifts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code, passcode: otp, mode: "create" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Mã thiệp hoặc OTP tạo thiệp không đúng.");
      }

      router.push(data.redirectUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi kiểm tra mã.");
      setLoading(false);
    }
  };

  // Quick demo fill (development only: the demo record does not exist in production)
  const fillDemo = () => {
    setTokenInput("KP-2010-DEMO");
    setOtpInput("TAO-2010");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-serif text-on-surface">
      <div className="max-w-md w-full mx-auto my-auto">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-primary text-xs font-bold shadow-xs mb-3 border border-white/95 hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-500">auto_awesome</span>
            <span>K&amp;P ATELIER • TẠO THIỆP QUÀ SỐ</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Thiết Kế Thiệp Quà Số</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-2 leading-relaxed">
            Trang dành cho <strong>người mua</strong> để tự tay viết thư, thêm ảnh và hoàn thiện thiệp trước khi tặng.
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-4xl liquid-glass border-2 border-white/95 shadow-xl bg-white/90 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-gold/20 rounded-full blur-2xl pointer-events-none" />

          <div className="p-3.5 rounded-2xl mb-5 text-xs font-sans border flex items-start gap-2.5 leading-relaxed bg-brand-bg border-rose-200 text-primary-container">
            <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">lock_open</span>
            <div>
              Nhập <strong>Mã thiệp</strong> kèm <strong>OTP tạo thiệp</strong> đã nhận qua email để bắt đầu thiết kế.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errorMsg && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans font-bold flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Card code */}
            <div>
              <label htmlFor="creator-code" className="block text-xs font-sans font-bold text-primary mb-1.5 uppercase tracking-wider">
                Mã thiệp
              </label>
              <input
                id="creator-code"
                type="text"
                autoComplete="off"
                placeholder="Ví dụ: KP-2010-ABC123"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3.5 rounded-2xl liquid-glass-input font-mono font-bold text-base text-primary tracking-wider uppercase border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
              <span className="text-[11px] font-sans text-warm-neutral mt-1 block">
                In trên thẻ gắn kèm chiếc vòng và trong email.
              </span>
            </div>

            {/* Creator OTP */}
            <div>
              <label htmlFor="creator-otp" className="block text-xs font-sans font-bold text-primary mb-1.5 uppercase tracking-wider">
                OTP tạo thiệp (nhận qua email)
              </label>
              <div className="relative">
                <input
                  id="creator-otp"
                  type={showOtp ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Ví dụ: TAO-ABCD1234"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full pl-4 pr-14 py-3.5 rounded-2xl liquid-glass-input font-mono font-bold text-base text-primary tracking-wider border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
                <button
                  type="button"
                  onClick={() => setShowOtp((v) => !v)}
                  aria-label={showOtp ? "Ẩn OTP" : "Hiện OTP"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans font-bold text-secondary hover:text-primary cursor-pointer"
                >
                  {showOtp ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl liquid-glass-btn-primary text-white font-serif font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg text-amber-300">edit_note</span>
                  <span>VÀO STUDIO TẠO THIỆP</span>
                </>
              )}
            </button>
          </form>

          {process.env.NODE_ENV !== "production" && (
            <div className="mt-5 pt-4 border-t border-white/70 text-center">
              <button
                type="button"
                onClick={fillDemo}
                className="text-[11px] font-sans font-bold text-secondary hover:text-primary hover:underline cursor-pointer"
              >
                Điền mẫu thử nghiệm (KP-2010-DEMO / TAO-2010)
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-xs font-sans text-warm-neutral hover:text-primary inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GiftPortalPage() {
  return (
    <Suspense fallback={null}>
      <CreatorPortalContent />
    </Suspense>
  );
}
