"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/**
 * Entry point for the card creator (the buyer): card code + "OTP tạo thiệp" (sent by email).
 * Recipients do not use this page: they open a gift from the home page with the card code and
 * the PIN received via email.
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
    if (searchParams.get("tab") === "open") router.replace("/#keepsake");
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
    <div
      className={`${beVietnam.className} min-h-screen bg-linear-to-b from-[#fff6f4] via-[#fdf0ec] to-[#f8e4de] flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 antialiased`}
    >
      <div className="max-w-md w-full mx-auto my-auto">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#721a28] text-xs font-bold shadow-xs mb-3 border border-rose-200/80 hover:bg-white transition-all"
          >
            <img src="/images/logo_icon_kp.png" alt="Team K&P" className="w-4 h-4 object-contain" />
            <span className="tracking-wide">TEAM K&amp;P • TẠO THIỆP QUÀ SỐ</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#721a28] tracking-tight">
            Thiết Kế Thiệp Quà Số
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
            Dành cho <strong>người đặt quà</strong> tự tay viết thư, gửi gắm ảnh kỷ niệm và thiết kế trang thiệp số trước khi trao tặng.
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_16px_40px_-10px_rgba(114,26,40,0.08)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

          <div className="p-3.5 rounded-2xl mb-5 text-xs border flex items-start gap-2.5 leading-relaxed bg-rose-50/70 border-rose-200/80 text-slate-700">
            <span className="material-symbols-outlined text-lg text-[#721a28] shrink-0 mt-0.5">lock_open</span>
            <div>
              Nhập <strong className="text-[#721a28]">Mã thiệp</strong> kèm <strong className="text-[#721a28]">OTP tạo thiệp</strong> đã nhận qua email để bắt đầu thiết kế.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2 leading-snug"
              >
                <span className="material-symbols-outlined text-lg shrink-0 text-red-600">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Card code */}
            <div>
              <label htmlFor="creator-code" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Mã thiệp
              </label>
              <input
                id="creator-code"
                type="text"
                autoComplete="off"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 hover:bg-white focus:bg-white font-semibold text-base text-[#721a28] tracking-wider uppercase border border-slate-200/90 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#721a28]/20 focus:border-[#721a28] transition-all"
              />
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                Mã được gửi trong email xác nhận đơn hàng của K&amp;P Atelier.
              </span>
            </div>

            {/* Creator OTP */}
            <div>
              <label htmlFor="creator-otp" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                OTP tạo thiệp (nhận qua email)
              </label>
              <div className="relative">
                <input
                  id="creator-otp"
                  type={showOtp ? "text" : "password"}
                  autoComplete="off"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full pl-4 pr-16 py-3.5 rounded-2xl bg-slate-50/80 hover:bg-white focus:bg-white font-semibold text-base text-[#721a28] tracking-wider border border-slate-200/90 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#721a28]/20 focus:border-[#721a28] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOtp((v) => !v)}
                  aria-label={showOtp ? "Ẩn OTP" : "Hiện OTP"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-700 hover:text-[#721a28] px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  {showOtp ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-[#721a28] via-[#8c2233] to-[#721a28] hover:from-[#5c131f] hover:to-[#721a28] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 mt-2"
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
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={fillDemo}
                className="text-xs font-bold text-rose-700 hover:text-[#721a28] hover:underline cursor-pointer"
              >
                Điền mẫu thử nghiệm (KP-2010-DEMO / TAO-2010)
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-[#721a28] inline-flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
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
