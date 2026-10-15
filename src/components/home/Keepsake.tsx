"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ExperienceTab {
  id: "letter" | "photos" | "music" | "voice";
  label: string;
  icon: string;
}

const TABS: ExperienceTab[] = [
  { id: "letter", label: "Thư Tay", icon: "mail" },
  { id: "photos", label: "Ảnh Polaroid", icon: "photo_library" },
  { id: "music", label: "Giai Điệu", icon: "graphic_eq" },
  { id: "voice", label: "Voice Note", icon: "mic" },
];

const JOURNEY_STEPS = [
  {
    step: "01",
    tag: "QUÉT MÃ TIỆN LỢI",
    title: "Quét Mã QR Bằng Camera",
    desc: "Mở camera điện thoại quét mã QR in trên thẻ quà tặng hoặc mã nhận qua email. Trang thiệp số mở ngay trên trình duyệt mà không cần tải bất kỳ ứng dụng nào.",
    icon: "qr_code_scanner",
    iconBg: "from-rose-500 to-rose-600",
    badge: "Không cần cài app",
    accentGlow: "from-rose-500/10",
    borderColor: "border-rose-200/80 hover:border-rose-300",
  },
  {
    step: "02",
    tag: "BẢO MẬT RIÊNG TƯ",
    title: "Nhập Mã OTP Xem Thiệp",
    desc: "Nhập 4 chữ số bảo mật do người tặng thiết lập riêng. Đảm bảo toàn bộ tâm tư, hình ảnh kỷ niệm và ghi âm giọng nói chỉ dành riêng cho bạn mở khóa.",
    icon: "lock_open",
    iconBg: "from-amber-500 to-amber-600",
    badge: "Mã 4 số bảo mật",
    accentGlow: "from-amber-500/10",
    borderColor: "border-amber-200/80 hover:border-amber-300",
  },
  {
    step: "03",
    tag: "CHẠM MỞ CẢM XÚC",
    title: "Trải Nghiệm Món Quà Số",
    desc: "Chạm nhẹ màn hình để mở thiệp: nhạc nền tự động ngân vang, trang thư tay nắn nót, album ảnh polaroid lướt nhẹ và giọng nói thì thầm ấm áp.",
    icon: "auto_awesome",
    iconBg: "from-[#721a28] to-[#8c2233]",
    badge: "Đa giác quan Phygital",
    accentGlow: "from-rose-700/10",
    borderColor: "border-[#721a28]/30 hover:border-[#721a28]/60",
  },
];

export default function Keepsake() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "pending"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"letter" | "photos" | "music" | "voice">("letter");
  const [isPlayingDemoMusic, setIsPlayingDemoMusic] = useState(false);

  const fillDemo = () => {
    setCode("KP-2010-DEMO");
    setOtp("2010");
    setFeedback(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const token = code.trim().toUpperCase();
    const passcode = otp.trim();
    if (!token) return setFeedback({ type: "error", message: "Vui lòng nhập mã thiệp (VD: KP-2010-DEMO)." });
    if (!passcode) return setFeedback({ type: "error", message: "Vui lòng nhập OTP xem thiệp (4 số)." });

    setBusy(true);
    try {
      const res = await fetch("/api/gifts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, passcode, mode: "open" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return setFeedback({ type: "error", message: data.error || "Mã thiệp hoặc OTP xem thiệp không đúng." });
      }
      if (data.isCompleted) {
        router.push(data.redirectUrl || `/g/${token}`);
      } else {
        setFeedback({
          type: "pending",
          message: "Mã hợp lệ! Người tặng chưa thiết kế xong thiệp. Bạn hãy quay lại sau nhé.",
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Lỗi kết nối. Vui lòng thử lại sau." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden" id="keepsake">
      {/* Ambient background light */}
      <div className="absolute top-1/3 -left-36 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-36 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title & Description */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-[#721a28] font-sans text-xs font-bold mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-rose-600 animate-spin" style={{ animationDuration: "8s" }}>
              auto_awesome
            </span>
            <span>CÔNG NGHỆ QUÀ TẶNG PHYGITAL 20/10</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl text-[#721a28] tracking-tight font-bold">
            Quét Mã QR — Chạm Vào Thế Giới Kỷ Niệm
          </h2>

          <p className="font-body text-sm sm:text-base text-stone-600 leading-relaxed mt-4 max-w-2xl mx-auto">
            Không cần cài ứng dụng. Chiếc vòng tay charm thực tế được liên kết với một tấm thiệp số đa phương tiện: nơi cất giữ bức thư tay nắn nót, giai điệu bài hát của hai người, album ảnh Polaroid và giọng nói ghi âm chân thành.
          </p>
        </div>

        {/* 3 Interactive Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {JOURNEY_STEPS.map((s) => (
            <div
              key={s.step}
              className={`relative rounded-3xl p-6 sm:p-7 bg-white/80 backdrop-blur-xl border ${s.borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(114,26,40,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group overflow-hidden`}
            >
              {/* Inner Top Accent Glow */}
              <div className={`absolute top-0 inset-x-0 h-28 bg-linear-to-b ${s.accentGlow} to-transparent pointer-events-none`} />

              <div>
                {/* Step Header: Tag & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-stone-500">
                    {s.tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-[#721a28] font-sans text-[10px] font-bold border border-stone-200/60 shadow-2xs">
                    {s.badge}
                  </span>
                </div>

                {/* Step Icon & Title */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-linear-to-br ${s.iconBg} text-white shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
                  </div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-[#721a28] leading-tight">
                    {s.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="font-body text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {/* Step Number Bottom Strip */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-[#721a28] transition-colors">
                  BƯỚC {s.step}
                </span>
                <span className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-rose-100 text-stone-400 group-hover:text-[#721a28] flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lower Main Showcase: Smartphone Live Preview on Left + Unlock Box on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT: Deluxe Smartphone Keepsake Showcase (7 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 rounded-[40px] p-6 sm:p-8 bg-linear-to-br from-white/90 via-white/80 to-rose-50/50 backdrop-blur-2xl border border-white/95 shadow-[0_20px_50px_rgba(114,26,40,0.08)] flex flex-col justify-between">
            {/* Top Interactive Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/70 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-stone-500 font-mono ml-2">kp-atelier.fptu/g/KP-2010-DEMO</span>
              </div>

              {/* Experience Tabs */}
              <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-full border border-stone-200/60 shadow-2xs self-stretch sm:self-auto overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-sans font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-white text-[#721a28] shadow-xs"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Phone Showcase View */}
            <div className="relative rounded-3xl p-5 sm:p-6 bg-[#fffdfa] border border-stone-200/80 shadow-md min-h-[300px] flex flex-col justify-between">
              
              {/* TAB 1: THƯ TAY (LETTER) */}
              {activeTab === "letter" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-handwriting text-lg text-rose-700 font-bold">
                      Gửi bạn đặc biệt ❤️
                    </span>
                    <span className="text-[11px] font-sans text-stone-400">Thiệp viết tay 20/10</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 relative">
                    <span className="material-symbols-outlined absolute -top-3 right-4 text-rose-300 text-2xl">
                      format_quote
                    </span>
                    <p className="font-handwriting text-base sm:text-lg text-stone-800 leading-relaxed italic">
                      &quot;Có những điều viết ra vẫn chưa đủ... Chiếc vòng charm nhỏ bé này là tất cả những lời chúc bình an, dịu dàng nhất mình muốn gửi đến bạn. Mong bạn luôn rạng rỡ như ánh nắng mùa thu nhé!&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 font-sans">
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">favorite</span>
                      Đính kèm Vòng Charm Pha Lê Xanh
                    </span>
                    <span className="font-handwriting text-sm text-stone-700 font-bold">— Người thương của bạn</span>
                  </div>
                </div>
              )}

              {/* TAB 2: ẢNH POLAROID */}
              {activeTab === "photos" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-sm font-bold text-[#721a28]">
                      Album Kỷ Niệm Polaroid (6 Ảnh)
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">Chạm để phóng to</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-md border border-stone-200 transform -rotate-1 hover:rotate-0 transition-transform">
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-stone-100 mb-1.5">
                        <img
                          src="/images/vong_charm_san.png"
                          alt="Vòng charm"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-handwriting text-xs text-stone-700 block text-center line-clamp-1">
                        Chiếc vòng của chúng mình ✨
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl shadow-md border border-stone-200 transform rotate-1 hover:rotate-0 transition-transform">
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-stone-100 mb-1.5">
                        <img
                          src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
                          alt="Sunset walk"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-handwriting text-xs text-stone-700 block text-center line-clamp-1">
                        Hoàng hôn sân trường FPT ❤️
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GIAI ĐIỆU (MUSIC) */}
              {activeTab === "music" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-sm font-bold text-[#721a28]">
                      Băng Cassette Nhạc Kỷ Niệm
                    </span>
                    <span className="text-[11px] text-rose-600 font-sans font-bold">Hi-Fi Stereo</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-900 text-white flex flex-col gap-3 shadow-inner">
                    <div className="flex items-center justify-between text-xs text-stone-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="font-mono text-[10px]">
                          {isPlayingDemoMusic ? "PLAYING: Có Chàng Trai Viết Lên Cây" : "CASSETTE TAPE READY"}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">03:45</span>
                    </div>

                    {/* Equalizer Waveform */}
                    <div className="flex items-center justify-center gap-1.5 h-8">
                      {[14, 28, 20, 32, 24, 16, 30, 22, 34, 26, 18, 28, 14, 32, 20, 26].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-rose-400 transition-all duration-300"
                          style={{
                            height: isPlayingDemoMusic
                              ? `${Math.max(6, (h * (i % 2 === 0 ? 1.3 : 0.8)) % 32)}px`
                              : "6px",
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsPlayingDemoMusic(!isPlayingDemoMusic)}
                        className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isPlayingDemoMusic ? "pause" : "play_arrow"}
                        </span>
                        <span>{isPlayingDemoMusic ? "Tạm Dừng" : "Phát Nhạc Thử"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VOICE NOTE */}
              {activeTab === "voice" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-sm font-bold text-[#721a28]">
                      Lời Nhắn Thoại (Voice Note 02:34)
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">Giọng nói ấm áp</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#721a28] text-white flex items-center justify-center shadow-md shrink-0">
                      <span className="material-symbols-outlined text-[24px]">mic</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="font-sans text-xs font-bold text-stone-800 block mb-1">
                        &quot;Lắng nghe giọng nói của mình nhé...&quot;
                      </span>
                      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-2/5" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mt-1">
                        <span>01:02</span>
                        <span>02:34</span>
                      </div>
                    </div>
                  </div>

                  <p className="font-body text-xs text-stone-500 italic text-center">
                    Có những điều viết ra vẫn chưa trọn vẹn, người tặng đã thu âm lại giọng nói ngọt ngào để bạn lắng nghe bất kỳ lúc nào.
                  </p>
                </div>
              )}

              {/* Bottom Quick Feature Highlights */}
              <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500 font-sans">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Lưu trữ vĩnh viễn
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Tải bản Offline HTML
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT: Deluxe Gift Unlock Portal (5 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 rounded-[40px] p-6 sm:p-8 bg-linear-to-br from-white/95 via-white/85 to-rose-50/60 backdrop-blur-2xl border border-white/95 shadow-[0_20px_50px_rgba(114,26,40,0.08)] flex flex-col justify-between">
            <div>
              {/* Badge & Title */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-sans text-xs font-bold mb-3 shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-rose-600">lock_open</span>
                <span>TRA CỨU &amp; MỞ THIỆP SỐ</span>
              </div>

              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#721a28] mb-2 leading-tight">
                Mở Thiệp Quà Tặng Của Bạn
              </h3>

              <p className="font-body text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                Nhập <strong>Mã thiệp</strong> và <strong>Mã OTP 4 số</strong> bạn nhận được để bước vào không gian quà tặng bí mật.
              </p>

              {/* Unlock Form */}
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-stone-700 mb-1.5" htmlFor="keepsake-token-input">
                    Mã thiệp quà tặng
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                      qr_code_2
                    </span>
                    <input
                      id="keepsake-token-input"
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 border border-stone-300 text-stone-900 font-mono text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-inner"
                      placeholder="VD: KP-2010-DEMO"
                      autoCapitalize="characters"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-stone-700 mb-1.5" htmlFor="keepsake-otp-input">
                    Mã OTP xem thiệp (4 số)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                      pin
                    </span>
                    <input
                      id="keepsake-otp-input"
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 border border-stone-300 text-stone-900 font-mono tracking-widest text-base placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-inner"
                      placeholder="••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-[#721a28] to-[#8c2233] hover:from-[#5e131f] hover:to-[#721a28] text-white font-sans text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang kiểm tra bảo mật...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">key</span>
                      <span>MỞ KHÓA THIỆP QUÀ TẶNG SỐ</span>
                    </>
                  )}
                </button>

                {/* Feedback status message */}
                {feedback && (
                  <div
                    role={feedback.type === "error" ? "alert" : "status"}
                    className={`p-3 rounded-2xl text-xs font-sans ${
                      feedback.type === "error"
                        ? "bg-rose-100 text-rose-800 border border-rose-300 font-bold"
                        : "bg-amber-50 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}
              </form>
            </div>

            {/* Quick Demo Pre-fill Pill & Gifter Link */}
            <div className="pt-4 mt-4 border-t border-stone-200/70 text-center space-y-3">
              <button
                type="button"
                onClick={fillDemo}
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-rose-50 text-[#721a28] border border-stone-200/80 font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-500">auto_fix_high</span>
                <span>Điền nhanh mã xem thử (KP-2010-DEMO / 2010)</span>
              </button>

              <div className="text-xs font-sans text-stone-500">
                Bạn là người tặng?{" "}
                <Link href="/gift" className="text-[#721a28] font-bold hover:underline">
                  Vào Studio tạo thiệp quà →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
