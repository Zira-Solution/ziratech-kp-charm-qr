"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    title: "Quét mã QR trong email",
    text: "Mở email K&P Atelier gửi tới và dùng camera điện thoại quét mã QR để vào trang quà tặng.",
  },
  {
    title: "Nhập OTP xem thiệp",
    text: "Nhập OTP xem thiệp 4 số có trong email để mở khóa trang kỷ niệm riêng tư của bạn.",
  },
  {
    title: "Chạm mở không gian quà",
    text: "Thưởng thức lời chúc viết tay, ảnh kỷ niệm polaroid, bản nhạc thân thương và giọng nói voice note ấm lòng.",
  },
];

const POLAROID_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEJ9Ljday1bJQfzwhaBOz4ThW-QR2y5Ra7AekdB3fcRT4BH_3EzIHUwn9SzLWCCMHijIstipR8T74gUPf4y3mKLOJPIPta8mNzLB4EYwOnmYWW-_eW_DlQRsxcrVybA6u4zMkaX6ZsH-atVa7i3aCXRAixHxQpHt67gTJQzsjCZItyWZWL3Z44lskh_FvxPBJwvAOrVrQy3pa8xlK-as5t0M8UwDteGQfGpi5fFRaTeZGn4yz22qehkQ";

const WAVE = [3, 5, 2, 6, 4, 5, 2, 6, 3, 4];

const inputClass =
  "w-full px-5 py-3.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-full focus:border-primary focus:outline-none focus:ring-2 focus:ring-tertiary text-primary text-center shadow-inner";

export default function Keepsake() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "pending"; message: string } | null>(null);

  // Same check the old hero form made: card code + 4-digit viewing OTP are verified on the server.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const token = code.trim().toUpperCase();
    const passcode = otp.trim();
    if (!token) return setFeedback({ type: "error", message: "Vui lòng nhập mã thiệp có trong email." });
    if (!passcode) return setFeedback({ type: "error", message: "Vui lòng nhập OTP xem thiệp (4 số) có trong email." });

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
      setFeedback({ type: "error", message: "Lỗi kết nối. Vui lòng thử lại." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="py-24 px-6 relative" id="keepsake">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-xl text-primary font-sans text-xs font-semibold mb-4 border border-white/80 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary-dark">qr_code_scanner</span>
            <span>Ý Tưởng Độc Bản K&amp;P</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl text-primary mb-4 tracking-tight">
            Quét QR, mở ra cả thế giới kỷ niệm bí mật
          </h2>
          <p className="font-body text-base text-on-surface-variant leading-relaxed">
            Không cần cài app, không đăng ký tài khoản rườm rà. Người tặng tự tay soạn quà; người nhận chỉ cần quét mã QR được gửi qua email để mở cánh cửa tâm tình riêng tư.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="p-7 rounded-[32px] bg-linear-to-br from-white/70 via-white/50 to-white/30 backdrop-blur-2xl border border-white/80 shadow-liquid-card flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-liquid-card-hover"
            >
              <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md text-primary border border-white/90 flex items-center justify-center font-bold mb-4 font-headline text-lg shadow-xs">
                {i + 1}
              </div>
              <h3 className="font-headline text-lg text-primary font-bold mb-2">{s.title}</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Preview mockup */}
          <div className="lg:col-span-7 bg-linear-to-br from-white/75 via-white/55 to-white/35 backdrop-blur-2xl rounded-[36px] p-6 lg:p-8 border border-white/85 shadow-liquid-card">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/60 mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full bg-primary/70" />
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <span className="w-3 h-3 rounded-full bg-tertiary" />
                <span className="text-xs text-on-surface-variant font-mono ml-2 truncate">kp-atelier.fptu/qua/2010-secret</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/70 backdrop-blur-md text-xs text-primary font-semibold border border-white/80 shadow-xs whitespace-nowrap">
                Bản xem trước quà tặng
              </span>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs relative">
                <span className="material-symbols-outlined absolute -top-3 right-4 text-secondary-dark text-2xl">format_quote</span>
                <p className="font-headline text-lg sm:text-xl text-primary italic mb-2">
                  &quot;Gửi cô gái luôn mang nụ cười ấm áp như hoa hướng dương...&quot;
                </p>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  Mong rằng chiếc vòng charm nhỏ bé luồn cước này sẽ luôn bên bạn những ngày thi cử áp lực tại FPT. Cảm ơn vì đã cùng mình ủng hộ các bé cún tại trạm cứu hộ nhé!
                </p>
                <div className="mt-3 text-right">
                  <span className="font-sans text-xs text-secondary-dark font-bold">— Người bạn thầm lặng</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-xl p-3.5 rounded-3xl border border-white/85 shadow-xs flex flex-col items-center">
                  <div className="w-full aspect-4/3 rounded-[18px] bg-surface-container-low overflow-hidden mb-2">
                    <img className="w-full h-full object-cover" alt="Ảnh polaroid hai bạn sinh viên cười trong sân trường" loading="lazy" src={POLAROID_IMG} />
                  </div>
                  <span className="font-sans text-xs text-on-surface-variant italic">Kỷ niệm ở trường FPT</span>
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <div className="p-4 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-9 h-9 shrink-0 rounded-full bg-linear-to-br from-[#721a28] to-[#8c2233] text-white flex items-center justify-center shadow-pill border border-white/30">
                        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      </span>
                      <div>
                        <h4 className="font-sans text-xs text-primary font-bold">Bài ca kỷ niệm 20/10</h4>
                        <span className="text-[11px] text-on-surface-variant">Giai điệu Acoustic êm dịu</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 h-6 px-1" aria-hidden="true">
                      {WAVE.map((h, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full ${i % 4 === 3 ? "bg-primary" : i % 2 ? "bg-secondary-dark" : "bg-secondary"}`}
                          style={{ height: `${h * 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary-dark text-2xl">mic</span>
                    <div className="flex-1">
                      <span className="font-sans text-xs text-primary font-bold block">Lời nhắn thoại (Voice note)</span>
                      <span className="text-[11px] text-on-surface-variant">0:48 giây ghi âm ngọt ngào</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary-dark text-lg">graphic_eq</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real open-gift form */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-[36px] bg-linear-to-br from-white/75 via-white/55 to-white/35 backdrop-blur-2xl border border-white/85 shadow-liquid-card">
              <div className="flex items-center gap-2 text-secondary-dark mb-2">
                <span className="material-symbols-outlined text-[20px]">key</span>
                <span className="font-sans text-xs uppercase tracking-wider font-bold">Mở thiệp bằng mã trong email</span>
              </div>
              <h3 className="font-headline text-2xl text-primary font-bold mb-2">Tra cứu hoặc nhập mã trực tiếp</h3>
              <p className="font-sans text-xs text-on-surface-variant mb-6 leading-relaxed">
                Nếu camera điện thoại không đọc được mã QR, hãy nhập mã thiệp và OTP xem thiệp trong email vào các ô dưới đây để mở ngay.
              </p>
              <form className="space-y-4" onSubmit={submit} noValidate>
                <div>
                  <label className="block font-sans text-xs text-neutral font-semibold mb-1.5" htmlFor="keepsake-code-input">
                    Mã thiệp
                  </label>
                  <input
                    className={`${inputClass} font-mono tracking-widest uppercase font-bold text-lg`}
                    id="keepsake-code-input"
                    placeholder="VD: KP-2010-ABC123"
                    type="text"
                    autoComplete="off"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-neutral font-semibold mb-1.5" htmlFor="keepsake-otp-input">
                    OTP xem thiệp (4 số)
                  </label>
                  <input
                    className={`${inputClass} font-mono tracking-widest text-lg`}
                    id="keepsake-otp-input"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    type="password"
                    autoComplete="off"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <button
                  className="w-full py-3.5 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-sm font-bold shadow-pill border border-white/25 hover:from-[#5e131f] hover:to-[#721a28] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">lock_open</span>
                      <span>Mở trang quà tặng số</span>
                    </>
                  )}
                </button>
                {feedback && (
                  <p
                    role={feedback.type === "error" ? "alert" : "status"}
                    className={`p-3 rounded-2xl text-xs ${
                      feedback.type === "error"
                        ? "bg-rose-100 text-rose-800 border border-rose-300 font-bold"
                        : "bg-amber-50 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {feedback.message}
                  </p>
                )}
              </form>
              <div className="mt-4 text-center">
                <span className="text-[11px] text-on-surface-variant">Mã và OTP chỉ dùng để mở đúng thiệp này. Nhập sai 5 lần sẽ bị khóa 15 phút.</span>
                <div className="mt-2.5 pt-2 border-t border-white/60">
                  <button
                    type="button"
                    onClick={() => {
                      setCode("KP-2010-DEMO");
                      setOtp("2010");
                      setFeedback(null);
                    }}
                    className="text-[11px] font-sans font-bold text-secondary-dark hover:text-primary hover:underline cursor-pointer"
                  >
                    ✦ Điền mã xem thử nghiệm (KP-2010-DEMO / 2010)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
