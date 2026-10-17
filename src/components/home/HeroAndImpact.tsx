"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TRUST = [
  { icon: "qr_code_2", text: "Trang thiệp số đa phương tiện 1:1" },
  { icon: "inventory_2", text: "Hộp quà đóng gói tinh tế, chỉn chu" },
  { icon: "storefront", text: "Gian hàng phục vụ 17/10 – 20/10 tại trường" },
];

const IMPACT = [
  { icon: "pets", tone: "text-primary", value: "100%", label: "Lợi nhuận ủng hộ trạm cứu hộ" },
  { icon: "receipt_long", tone: "text-secondary-dark", value: "Minh bạch", label: "Sao kê quỹ công khai" },
  { icon: "volunteer_activism", tone: "text-primary", value: "Thủ công", label: "Chế tác tỉ mỉ đong đầy tâm ý" },
  { icon: "qr_code", tone: "text-secondary-dark", value: "Độc bản", label: "Trang thiệp số riêng biệt" },
];

export function Hero() {
  const router = useRouter();
  const [giftCode, setGiftCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = giftCode.trim().toUpperCase();
    if (!clean) {
      setErrorMsg("Vui lòng nhập mã thiệp");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    router.push(`/g/${clean}`);
  };

  return (
    <section className="pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="hero">
      <div className="flex flex-col items-center text-center space-y-5 sm:space-y-6 w-full max-w-6xl mx-auto">
        {/* Top Charity Badge */}
        <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/95 text-secondary-dark font-sans text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all">
          <img src="/images/logo_icon_kp.png" alt="Team K&P" className="w-5 h-5 object-contain" />
          <span>Team K&amp;P • Bộ Sưu Tập Quà Tặng 20/10 Gây Quỹ Cứu Trợ Động Vật</span>
        </div>

        {/* Main Centered Headline - Broad, Elegant 2 Lines */}
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-[56px] 2xl:text-6xl text-primary tracking-tight leading-[1.18] max-w-6xl">
          <span className="block">Một món quà trao người thương.</span>
          <span className="italic font-normal text-secondary-dark block mt-1.5 sm:mt-2.5">
            Một mái ấm được chở che.
          </span>
        </h1>

        {/* Description - Wider and more legible */}
        <p className="font-body text-sm sm:text-base md:text-lg text-on-surface-variant max-w-3xl lg:max-w-4xl leading-relaxed">
          Mỗi hộp quà 20/10 từ K&amp;P Atelier là sự kết tinh giữa chiếc vòng charm thủ công tinh tế, hoa tươi rạng rỡ và trang thiệp số lưu giữ ký ức. Trao đi món quà gửi người phụ nữ bạn trân quý, bạn đồng thời dành trọn vẹn 100% lợi nhuận cùng chung tay sưởi ấm trạm cứu hộ Sân Nhà Nhiều Chó.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 pt-0.5">
          <a
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-xs sm:text-sm font-bold shadow-pill border border-white/25 hover:from-[#5e131f] hover:to-[#721a28] active:scale-[0.98] transition-all"
            href="#catalog"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Khám phá bộ sưu tập</span>
          </a>
          <Link
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-white/75 backdrop-blur-xl text-primary border border-white/90 font-sans text-xs sm:text-sm font-bold hover:bg-white/95 shadow-xs transition-all"
            href="/gift"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-500">draw</span>
            <span>Tự tạo thiệp quà</span>
          </Link>
          <a
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-white/55 backdrop-blur-md text-secondary-dark border border-white/70 font-sans text-xs sm:text-sm font-semibold hover:bg-white/80 shadow-xs transition-all"
            href="#shelter"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary-dark">volunteer_activism</span>
            <span>Ủng hộ trạm cứu trợ</span>
          </a>
        </div>

        {/* Recipient Gift Code Input Box - Sleek, Rounded & Balanced Capsule */}
        <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-[920px] mt-2 sm:mt-3 p-4 sm:p-5 px-5 sm:px-6 rounded-[30px] bg-linear-to-b from-white/95 via-white/85 to-white/70 backdrop-blur-2xl border border-white/95 shadow-[0_14px_40px_-6px_rgba(114,26,40,0.12),0_1px_2px_rgba(255,255,255,0.95)_inset]">
          <div className="flex items-center gap-2.5 mb-2.5 px-1 text-left">
            <span className="w-7 h-7 rounded-full bg-rose-100 text-[#721a28] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">redeem</span>
            </span>
            <h3 className="font-headline text-sm sm:text-base font-bold text-primary">
              Bạn vừa nhận được món quà 20/10?
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 bg-white/95 p-1.5 sm:p-2 pl-3 sm:pl-4 rounded-2xl sm:rounded-full border border-rose-200/80 shadow-inner">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none text-rose-900/50">
                <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
              </div>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => {
                  setGiftCode(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Nhập mã thiệp..."
                className="w-full pl-9 pr-4 py-2.5 sm:py-3.5 bg-transparent focus:outline-none text-sm sm:text-base font-sans font-semibold text-primary placeholder:text-neutral/45 uppercase tracking-wider"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-9 py-2.5 sm:py-3.5 rounded-xl sm:rounded-full bg-linear-to-r from-[#721a28] via-[#8c2233] to-[#5e131f] text-white font-sans text-sm sm:text-base font-bold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 whitespace-nowrap shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang mở...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-amber-200">lock_open</span>
                  <span>Mở thiệp ngay</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <p className="mt-2 text-xs sm:text-sm font-sans text-rose-600 font-medium text-left px-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">error</span>
              <span>{errorMsg}</span>
            </p>
          )}
        </div>

        {/* Trust Badges - Broad & Spacious 3-Column Grid */}
        <div className="pt-10 sm:pt-12 border-t border-white/60 w-full max-w-5xl lg:max-w-6xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {TRUST.map((t) => (
            <div
              key={t.icon}
              className="flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-xs hover:bg-white/70 hover:shadow-sm transition-all text-left"
            >
              <div className="w-11 h-11 shrink-0 rounded-full bg-white/90 backdrop-blur-md border border-white/95 flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
              </div>
              <p className="font-sans text-xs sm:text-sm font-semibold text-neutral leading-snug">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ImpactTicker() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-20">
      <div className="bg-linear-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-2xl border border-white/80 rounded-[36px] p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center shadow-liquid-card">
        {IMPACT.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center justify-center p-5 rounded-[26px] bg-white/60 backdrop-blur-xl border border-white/80 transition-all hover:-translate-y-1 hover:shadow-soft-glow hover:bg-white/80"
          >
            <span className={`material-symbols-outlined ${m.tone} text-3xl mb-1.5`}>{m.icon}</span>
            <span className="font-headline text-3xl text-primary font-bold">{m.value}</span>
            <span className="font-sans text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold mt-1">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
