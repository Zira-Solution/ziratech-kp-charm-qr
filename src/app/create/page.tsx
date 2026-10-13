"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateGiftEntryPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanToken = tokenInput.trim().toUpperCase();
    const cleanPasscode = passcodeInput.trim();

    if (!cleanToken) {
      setErrorMsg("Vui lòng nhập mã thiệp.");
      return;
    }

    if (!cleanPasscode) {
      setErrorMsg("Vui lòng nhập OTP tạo thiệp bạn đã nhận qua email.");
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
          mode: "create",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Mã thiệp hoặc OTP tạo thiệp không đúng.");
      }

      // Valid token & passcode -> go to customer studio
      router.push(data.redirectUrl || `/create/${cleanToken}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể xác thực OTP tạo thiệp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-cream via-blush-light to-surface-container flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-serif">
      <div className="max-w-md w-full mx-auto my-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-primary text-xs font-bold shadow-xs mb-3 border border-white/95"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-500">brush</span>
            <span>K&amp;P ATELIER • XƯỞNG TẠO THIỆP 20/10</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Xưởng Tự Tay Thiết Kế Thiệp Quà Số
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-2 leading-relaxed">
            Trang dành riêng cho người mua quà: Nhập <strong>Mã thiệp</strong> kèm <strong>OTP tạo thiệp</strong> nhận qua email để bảo mật quyền thiết kế.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-4xl liquid-glass border-2 border-white/95 shadow-xl bg-white/90">
          <form onSubmit={handleStartCreate} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-sans font-bold border border-rose-300">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Field 1: Token */}
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
            </div>

            {/* Field 2: Creator Key */}
            <div>
              <label className="block text-xs font-sans font-bold text-primary mb-1.5 uppercase tracking-wider">
                OTP TẠO THIỆP (NHẬN QUA EMAIL):
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-xl text-secondary">
                  key
                </span>
                <input
                  type={showPasscode ? "text" : "password"}
                  required
                  placeholder="Ví dụ: TAO-ABCD1234"
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
              <span className="text-[11px] font-sans text-warm-neutral mt-1 block">
                Mã được gửi về Gmail của bạn sau khi nhân viên tạo đơn tại quầy.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl liquid-glass-btn-primary text-white font-serif font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang Kiểm Tra Mã...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg text-amber-300">brush</span>
                  <span>BẮT ĐẦU THIẾT KẾ THIỆP SỐ</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo */}
          <div className="mt-6 pt-5 border-t border-white/80 text-center">
            {process.env.NODE_ENV !== "production" && (
              <>
              <span className="text-[11px] font-sans text-warm-neutral block mb-1.5">
                Thử nghiệm nhanh với dữ liệu mẫu:
              </span>
              <button
                type="button"
                onClick={() => {
                  setTokenInput("KP-2010-DEMO");
                  setPasscodeInput("TAO-2010");
                }}
                className="text-xs font-mono font-bold text-primary-container hover:text-primary underline cursor-pointer"
              >
                Mã: KP-2010-DEMO / Mật khẩu: TAO-2010
              </button>
              </>
            )}

            <div className="mt-3">
              <Link
                href="/gift"
                className="text-xs font-sans font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Chuyển sang trang tạo thiệp (/gift)</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-sans font-bold text-outline hover:text-primary transition-colors"
          >
            ← Về trang chủ K&amp;P Atelier
          </Link>
        </div>

      </div>

      <div className="text-center text-[11px] font-sans text-outline mt-6">
        © 2026 K&amp;P Atelier • Xưởng Quà Tặng Số 20/10
      </div>
    </div>
  );
}
