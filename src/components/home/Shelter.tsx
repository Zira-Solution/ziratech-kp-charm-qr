"use client";

import React, { useEffect, useState } from "react";

const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(Math.round(n))}đ`;

// Receiving account (the one linked to SePay & VietQR).
const BANK = process.env.NEXT_PUBLIC_DONATION_BANK || "MBBank";
const ACCOUNT = process.env.NEXT_PUBLIC_DONATION_ACCOUNT || "1025032006";
const ACCOUNT_NAME = process.env.NEXT_PUBLIC_DONATION_NAME || "TRAN HOANG HAO";

const TRANSFER_NOTE = "Ho_va_Ten_MSSV";

export default function Shelter() {
  const [copiedAccount, setCopiedAccount] = useState(false);
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

  const qrReady = Boolean(BANK && ACCOUNT);
  // Omit amount param so banking apps let the donor freely choose their donation amount
  const qrSrc = qrReady
    ? `https://qr.sepay.vn/img?acc=${encodeURIComponent(ACCOUNT)}&bank=${encodeURIComponent(BANK)}&des=${encodeURIComponent(TRANSFER_NOTE)}`
    : "";

  const handleCopyAccount = async () => {
    if (!ACCOUNT) return;
    try {
      await navigator.clipboard.writeText(ACCOUNT);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      // Fallback
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

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
          className="lg:col-span-6 bg-linear-to-br from-white/85 via-white/65 to-white/45 backdrop-blur-2xl rounded-[38px] p-6 sm:p-8 border border-white/90 shadow-liquid-card flex flex-col justify-between"
          id="shelter-donate"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-headline text-2xl text-primary font-bold">Ủng Hộ Trực Tiếp Cho Trạm</h3>
              <span className="px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-primary font-sans text-xs font-bold border border-white/80 shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary-dark">favorite</span>
                Tùy tâm đóng góp
              </span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Mỗi sự đóng góp dù nhỏ nhất từ bạn đều là những bữa ăn no, liều thuốc ấm và tình yêu thương tiếp sức cho hơn 120 bé cún mèo già yếu, cơ nhỡ tại trạm cứu hộ Sân Nhà Nhiều Chó.
            </p>
          </div>

          {/* Main QR Section & Bank details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center p-5 rounded-[28px] bg-white/65 backdrop-blur-xl border border-white/85 shadow-xs mb-5">
            {/* QR Code */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative group p-2 bg-white rounded-3xl border border-rose-100/80 shadow-md transition-all duration-300 hover:shadow-lg">
                <img
                  className="w-44 sm:w-48 h-auto object-contain rounded-2xl shadow-inner"
                  alt="Mã VietQR MBBank TRAN HOANG HAO 1025032006"
                  src="/images/qr_vietqr_card.png"
                />
              </div>
              <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
                <div className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-primary">qr_code_scanner</span>
                  <span>Quét bằng App Ngân hàng / MoMo</span>
                </div>
                <a
                  href="/images/qr_vietqr_tranhoanghao.png"
                  download="VietQR_MBBank_TRAN_HOANG_HAO.png"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-rose-50 text-[#721a28] text-[11px] font-sans font-semibold border border-rose-200/80 shadow-2xs transition-all cursor-pointer"
                  title="Tải ảnh gốc mã QR"
                >
                  <span className="material-symbols-outlined text-[13px]">download</span>
                  <span>Tải ảnh mã VietQR</span>
                </a>
              </div>
            </div>

            {/* Bank details info */}
            <div className="sm:col-span-7 flex flex-col space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/85 border border-white/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Ngân hàng</span>
                  <div className="text-right">
                    <span className="font-bold text-primary font-sans block">MB (Quân Đội)</span>
                    <span className="text-[10px] text-stone-500 font-sans">VietQR • Napas 247</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-rose-100/50 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold mb-0.5">Số tài khoản</span>
                    <span className="font-mono text-base font-bold text-primary tracking-wider select-all">{ACCOUNT}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className={`shrink-0 px-3 py-1.5 rounded-full font-sans text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      copiedAccount
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-white hover:bg-rose-50 text-primary border border-rose-150 hover:border-primary/40 shadow-xs"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedAccount ? "check" : "content_copy"}
                    </span>
                    <span>{copiedAccount ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-rose-100/50 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold shrink-0">Chủ tài khoản</span>
                  <span className="font-bold text-primary font-sans uppercase text-right truncate">{ACCOUNT_NAME}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer syntax */}
          <div className="p-4 rounded-[26px] bg-white/70 backdrop-blur-xl border border-white/90 shadow-xs mb-5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-2">
              <span className="material-symbols-outlined text-[16px] text-secondary-dark">badge</span>
              <span>Cú pháp nội dung chuyển khoản gợi ý:</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-linear-to-r from-rose-50/90 via-white to-rose-50/90 border border-rose-100 text-center font-mono text-primary font-bold text-base sm:text-lg tracking-wide select-all shadow-inner">
              {TRANSFER_NOTE}
            </div>

            <p className="mt-2 text-center text-xs text-on-surface-variant font-medium">
              Khi chuyển khoản, bạn vui lòng thay bằng <strong className="text-primary font-semibold">Họ và Tên kèm MSSV của bạn</strong> (Ví dụ: <code className="font-mono text-primary font-bold">Nguyen_Van_A_SE180000</code>).
            </p>
          </div>

          {/* Footer note */}
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100/80 flex items-center gap-2 text-xs text-secondary-dark font-medium">
            <span className="material-symbols-outlined text-[18px] text-secondary-dark shrink-0">verified</span>
            <span>100% tiền gửi được chuyển trực tiếp vào tài khoản trạm cứu hộ &amp; cập nhật minh bạch trên sao kê.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
