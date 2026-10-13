"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";

function GiftPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") === "open" ? "open" : "create";
  const initialToken = searchParams.get("token") || "";

  const [activeTab, setActiveTab] = useState<"create" | "open">(initialTab);
  const [tokenInput, setTokenInput] = useState<string>(initialToken.toUpperCase());
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "open" || tabParam === "create") {
      setActiveTab(tabParam);
    }
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setTokenInput(tokenParam.toUpperCase());
    }
  }, [searchParams]);

  // Handle Verify & Route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanToken = tokenInput.trim().toUpperCase();
    const cleanPasscode = passcodeInput.trim();

    if (!cleanToken) {
      setErrorMsg("Vui lòng nhập mã thiệp.");
      return;
    }

    if (!cleanPasscode) {
      setErrorMsg(
        activeTab === "create"
          ? "Vui lòng nhập OTP tạo thiệp bạn đã nhận qua email."
          : "Vui lòng nhập OTP xem thiệp in trên thẻ."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/gifts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cleanToken,
          passcode: cleanPasscode,
          mode: activeTab,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Mã không hợp lệ hoặc không chính xác.");
      }

      setSuccessMsg(data.message || "Xác thực thành công!");

      if (activeTab === "open") {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#721a28", "#ffd700", "#fea095", "#ffffff"],
        });
      }

      // Short delay for visual feedback then redirect
      setTimeout(() => {
        router.push(data.redirectUrl);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi kiểm tra mã.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill
  const handleAutofillDemo = () => {
    setTokenInput("KP-2010-DEMO");
    if (activeTab === "create") {
      setPasscodeInput("TAO-2010");
    } else {
      setPasscodeInput("2010");
    }
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-serif text-on-surface">
      <div className="max-w-md w-full mx-auto my-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-primary text-xs font-bold shadow-xs mb-3 border border-white/95 hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-500">auto_awesome</span>
            <span>K&amp;P ATELIER • CỔNG QUÀ TẶNG PHYGITAL</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            {activeTab === "create" ? "Thiết Kế Thiệp Quà Số" : "Mở Hộp Quà Kỷ Niệm 20/10"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-2 leading-relaxed">
            Mỗi chiếc vòng tay vật lý được cấp <strong>2 mã bảo mật riêng biệt</strong>: 1 mã để người mua nắn nót tạo thiệp, 1 mã trao người nhận mở quà.
          </p>
        </div>

        {/* Card Container */}
        <div className="p-6 sm:p-8 rounded-4xl liquid-glass border-2 border-white/95 shadow-xl bg-white/90 relative overflow-hidden">
          
          {/* Subtle Decorative Aura */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-gold/20 rounded-full blur-2xl pointer-events-none" />

          {/* TWO-TAB SWITCHER */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/70 border border-white/90 shadow-xs mb-6">
            
            {/* Tab 1: Tạo Thiệp (Người Mua) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("create");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "create"
                  ? "liquid-glass-btn-primary text-white shadow-sm scale-[1.01]"
                  : "text-primary hover:bg-white/60"
              }`}
            >
              <span className="material-symbols-outlined text-base">edit_note</span>
              <span>Người Mua Tạo Thiệp</span>
            </button>

            {/* Tab 2: Mở Thiệp (Người Nhận) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("open");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "open"
                  ? "liquid-glass-btn-primary text-white shadow-sm scale-[1.01]"
                  : "text-primary hover:bg-white/60"
              }`}
            >
              <span className="material-symbols-outlined text-base">card_giftcard</span>
              <span>Người Nhận Mở Quà</span>
            </button>

          </div>

          {/* Mode Explainer Banner */}
          <div className={`p-3.5 rounded-2xl mb-5 text-xs font-sans border flex items-start gap-2.5 leading-relaxed ${
            activeTab === "create"
              ? "bg-brand-bg border-rose-200 text-primary-container"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
            <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">
              {activeTab === "create" ? "lock_open" : "celebration"}
            </span>
            <div>
              {activeTab === "create" ? (
                <>
                  <strong>Dành cho người mua quà:</strong> Nhập <strong>Mã thiệp</strong> kèm <strong>OTP tạo thiệp</strong> đã nhận qua email để bắt đầu thiết kế thư tay, ảnh Polaroid &amp; giọng nói.
                </>
              ) : (
                <>
                  <strong>Dành cho người nhận quà:</strong> Nhập <strong>Mã thiệp</strong> kèm <strong>OTP xem thiệp</strong> in trên thẻ trao kèm chiếc vòng tay để chiêm ngưỡng cuốn thiệp 3D!
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-sans font-bold border border-rose-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-sans font-bold border border-emerald-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Field 1: Bracelet Token */}
            <div>
              <label className="block text-xs font-sans font-bold text-primary mb-1.5 uppercase tracking-wider">
                MÃ THIỆP:
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-xl text-secondary">
                  toll
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: KP-2010-DEMO"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl liquid-glass-input font-mono font-bold text-base text-primary tracking-wider uppercase border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
              </div>
              <span className="text-[11px] font-sans text-on-surface-variant mt-1 block">
                Mã thiệp in trên thẻ gắn kèm chiếc vòng và trong email.
              </span>
            </div>

            {/* Field 2: Password / PIN according to active tab */}
            <div>
              <label className="block text-xs font-sans font-bold text-primary mb-1.5 uppercase tracking-wider">
                {activeTab === "create" ? "OTP TẠO THIỆP (NHẬN QUA EMAIL):" : "OTP XEM THIỆP (IN TRÊN THẺ):"}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-xl text-secondary">
                  {activeTab === "create" ? "key" : "pin"}
                </span>
                <input
                  type={showPasscode ? "text" : "password"}
                  required
                  placeholder={activeTab === "create" ? "Ví dụ: TAO-ABCD1234" : "OTP 4 số in trên thẻ"}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl liquid-glass-input font-mono font-bold text-base text-primary tracking-wider border border-white/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-3.5 text-secondary hover:text-primary p-0.5 cursor-pointer"
                  title={showPasscode ? "Ẩn" : "Hiện"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPasscode ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <span className="text-[11px] font-sans text-on-surface-variant mt-1 block">
                {activeTab === "create"
                  ? "Chỉ người mua nhận được mã này qua hộp thư Gmail để bảo mật quyền biên soạn thiệp."
                  : "Mã 4 số in trên thẻ nhung hoặc được người tặng nhắn riêng cho bạn."}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl liquid-glass-btn-primary text-white font-serif font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang Kiểm Tra Mã...</span>
                </>
              ) : activeTab === "create" ? (
                <>
                  <span className="material-symbols-outlined text-lg text-amber-300">brush</span>
                  <span>VÀO STUDIO THIẾT KẾ THIỆP SỐ</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg text-amber-300">lock_open</span>
                  <span>MỞ THIỆP QUÀ TẶNG 3D NGAY</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper (development only: the demo record does not exist in production) */}
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-5 pt-4 border-t border-white/70 text-center">
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="text-[11px] font-sans font-bold text-secondary hover:text-primary inline-flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span className="material-symbols-outlined text-sm">play_circle</span>
                <span>Điền mẫu thử nghiệm ({activeTab === "create" ? "Mã: KP-2010-DEMO / TAO-2010" : "Mã: KP-2010-DEMO / 2010"})</span>
              </button>
            </div>
          )}

        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-sans text-on-surface-variant hover:text-primary inline-flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Quay lại trang chủ K&amp;P Atelier</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function GiftPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container flex flex-col items-center justify-center p-4 font-serif">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GiftPortalContent />
    </Suspense>
  );
}
