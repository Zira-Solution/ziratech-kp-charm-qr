"use client";

import React, { useEffect, useState } from "react";

const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(Math.round(n))}đ`;

const QUICK = [
  { amount: 20000, label: "20.000đ" },
  { amount: 50000, label: "50.000đ" },
  { amount: 100000, label: "100.000đ" },
];

// Receiving account (the one linked to SePay). Public by nature: it is what the QR code encodes.
const BANK = process.env.NEXT_PUBLIC_DONATION_BANK ?? "";
const ACCOUNT = process.env.NEXT_PUBLIC_DONATION_ACCOUNT ?? "";
const ACCOUNT_NAME = process.env.NEXT_PUBLIC_DONATION_NAME ?? "";

/** Transfer notes must be plain ASCII for banks: strip accents, keep letters/digits/spaces. */
function toTransferNote(name: string): string {
  const clean = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
  return `KP2010 ${clean || "UNG HO"}`;
}

export default function Shelter() {
  const [amount, setAmount] = useState(20000);
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [raised, setRaised] = useState<{ total: number; count: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/donations/summary")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success) setRaised({ total: d.total, count: d.count });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const note = toTransferNote(anonymous ? "" : name);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
  const qrReady = Boolean(BANK && ACCOUNT);
  const qrSrc = qrReady
    ? `https://qr.sepay.vn/img?acc=${encodeURIComponent(ACCOUNT)}&bank=${encodeURIComponent(BANK)}&amount=${safeAmount}&des=${encodeURIComponent(note)}`
    : "";

  return (
    <section className="max-w-7xl mx-auto px-6 py-20" id="shelter">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Story */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-xl text-primary font-sans text-xs font-semibold border border-white/80 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-secondary-dark">pets</span>
            <span>Sứ Mệnh Nhân Ái Sinh Viên</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl text-primary tracking-tight font-bold">
            Đồng Hành Cùng Trạm Cứu Hộ Sân Nhà Nhiều Chó
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
            <strong>Sân Nhà Nhiều Chó</strong> là mái ấm phi lợi nhuận tại Thanh Oai, Hà Nội, hiện đang cưu mang hơn 120 chú chó mèo già yếu, khuyết tật hoặc bị bỏ rơi. Dự án 20/10 của sinh viên Đại học FPT TP. Hồ Chí Minh ra đời không chỉ để tôn vinh phụ nữ Việt Nam, mà còn là cầu nối tiếp tế khẩu phần ăn, thuốc men và cải tạo chuồng trại trước mùa đông giá rét.
          </p>
          <div className="p-5 rounded-[28px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-headline text-base text-primary font-bold">
              <span className="material-symbols-outlined text-secondary-dark">verified</span>
              <span>Cam kết minh bạch tài chính 100%</span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Toàn bộ doanh thu sau khi trừ chi phí nguyên vật liệu giấy, cước, hoa và tiền ủng hộ trực tiếp được sao kê công khai và chuyển thẳng tới số tài khoản thiện nguyện của trạm.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "Dự kiến gây quỹ", value: "15.000.000đ", tone: "text-primary" },
              { label: "Đơn chung tay", value: "186+", tone: "text-secondary-dark" },
              {
                label: "Ủng hộ trực tiếp",
                value: raised ? vnd(raised.total) : "—",
                tone: "text-primary",
                note: raised && raised.count > 0 ? `${raised.count} lượt` : undefined,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="p-4 rounded-[26px] bg-white/65 backdrop-blur-xl border border-white/80 text-center shadow-xs transition-all hover:bg-white/80 hover:-translate-y-0.5"
              >
                <span className="text-[11px] text-on-surface-variant block mb-1">{m.label}</span>
                <span className={`font-headline text-lg font-bold ${m.tone}`}>{m.value}</span>
                {m.note && <span className="text-[10px] text-on-surface-variant block mt-0.5">{m.note}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Donation box */}
        <div
          className="lg:col-span-6 bg-linear-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-2xl rounded-[38px] p-6 sm:p-8 border border-white/90 shadow-liquid-card"
          id="shelter-donate"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-headline text-2xl text-primary font-bold">Ủng Hộ Trực Tiếp Cho Trạm</h3>
            <span className="px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-primary font-sans text-xs font-bold border border-white/80 shadow-xs">
              Tùy tâm
            </span>
          </div>
          <p className="font-sans text-xs text-on-surface-variant mb-6 leading-relaxed">
            Nếu bạn không có nhu cầu nhận hoa hoặc quà, bạn vẫn có thể gửi gắm tấm lòng tới trạm cứu hộ thông qua cổng tiếp nhận của sinh viên K&amp;P:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4" role="group" aria-label="Chọn nhanh số tiền">
            {QUICK.map((q) => {
              const on = safeAmount === q.amount;
              return (
                <button
                  key={q.amount}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAmount(q.amount)}
                  className={`py-2.5 rounded-full border font-sans text-xs transition-all ${
                    on
                      ? "border-white/30 bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-bold shadow-pill"
                      : "border-white/80 bg-white/65 backdrop-blur-md hover:border-primary text-primary font-semibold shadow-xs"
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block font-sans text-xs text-neutral font-semibold mb-1" htmlFor="custom-amount">
                Số tiền tùy chỉnh (VNĐ)
              </label>
              <input
                className="w-full px-5 py-2.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-full focus:border-primary focus:outline-none text-primary font-semibold text-sm shadow-inner"
                id="custom-amount"
                type="number"
                min={1000}
                step={1000}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-neutral font-semibold mb-1" htmlFor="donor-name">
                Tên người gửi / Lời chúc ấm áp
              </label>
              <input
                className="w-full px-5 py-2.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-full focus:border-primary focus:outline-none text-primary text-sm shadow-inner disabled:opacity-50"
                id="donor-name"
                maxLength={30}
                placeholder="Nguyễn Văn A - Sinh viên K18"
                type="text"
                disabled={anonymous}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                className="accent-primary w-4 h-4"
                id="anon-check"
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <label className="font-sans text-xs text-on-surface-variant font-medium" htmlFor="anon-check">
                Ủng hộ ẩn danh trên bảng sao kê
              </label>
            </div>
          </div>

          <div className="p-5 rounded-[26px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="w-36 h-36 shrink-0 bg-white/90 backdrop-blur-md p-2 rounded-[22px] border border-white/90 shadow-sm flex items-center justify-center">
              {qrReady ? (
                <img className="w-full h-full object-contain" alt={`Mã QR chuyển khoản ${vnd(safeAmount)}`} src={qrSrc} />
              ) : (
                <div className="text-center font-mono text-xs text-on-surface-variant flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-primary mb-1">qr_code_2</span>
                  <span className="text-[10px]">Mã QR sẽ hiện khi cấu hình tài khoản nhận</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1 text-xs text-on-surface-variant">
              <div className="font-bold text-primary text-sm">Nội dung chuyển khoản tự động:</div>
              <div className="p-2.5 rounded-full bg-white/80 backdrop-blur-md font-mono text-primary font-bold text-xs select-all border border-white/90 text-center shadow-xs break-all">
                {note}
              </div>
              {qrReady && (
                <div className="pt-1">
                  {BANK} · <span className="font-mono select-all">{ACCOUNT}</span>
                  {ACCOUNT_NAME ? ` · ${ACCOUNT_NAME}` : ""}
                </div>
              )}
              <div className="text-secondary-dark font-semibold">100% tiền gửi được chuyển trực tiếp vào tài khoản trạm cứu hộ.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
