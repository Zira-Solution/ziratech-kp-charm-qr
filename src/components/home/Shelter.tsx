"use client";

import React, { useEffect, useState } from "react";
import { STATEMENT_SUMMARY } from "@/lib/sales/statement-data";

const vnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(Math.round(n))}đ`;

// Receiving account (direct official account of Sân Nhà Nhiều Chó).
const BANK = process.env.NEXT_PUBLIC_DONATION_BANK || "Vietcombank";
const ACCOUNT = process.env.NEXT_PUBLIC_DONATION_ACCOUNT || "1060402678";
const ACCOUNT_NAME =
  process.env.NEXT_PUBLIC_DONATION_NAME || "T.TAM CUU HO CHO MEO SAN NHA NHIEU CHO";
const BRANCH = "VCB Tây Hà Nội - PGD Nam Thanh Xuân";

const TRANSFER_NOTE = "Ung_ho_San_Nha_Nhieu_Cho";

export default function Shelter() {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [fund, setFund] = useState<{
    totalRevenue: number;
    transferred: number;
    donations: number;
  }>({
    totalRevenue: STATEMENT_SUMMARY.totalRevenue,
    transferred: STATEMENT_SUMMARY.transferredAmount,
    donations: STATEMENT_SUMMARY.donationAmount,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fund/summary")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.success && d.ready) {
          setFund({
            totalRevenue: d.totalRevenue,
            transferred: d.transferred,
            donations: d.channels.donationStall + d.channels.donationWeb,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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

  useEffect(() => {
    if (!showQrModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowQrModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showQrModal]);

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
          <div className="p-5 rounded-[28px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-headline text-base text-primary font-bold">
                <span className="material-symbols-outlined text-secondary-dark">verified</span>
                <span>Cam kết minh bạch tài chính 100%</span>
              </div>
              <a
                href="#sao-ke"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-rose-100 via-white to-rose-50 text-primary font-sans text-xs font-bold border border-rose-200/90 hover:border-primary/50 shadow-2xs hover:shadow-xs hover:scale-105 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[15px] text-secondary-dark">receipt_long</span>
                <span>Xem bảng sao kê chi tiết</span>
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              </a>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Toàn bộ doanh thu sau khi trừ chi phí nguyên vật liệu giấy, cước, hoa và tiền ủng hộ trực tiếp được sao kê công khai và chuyển thẳng tới số tài khoản thiện nguyện của trạm.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "Tổng doanh thu", value: fund ? vnd(fund.totalRevenue) : "—", tone: "text-primary" },
              { label: "Đã chuyển cho trạm", value: fund ? vnd(fund.transferred) : "—", tone: "text-secondary-dark" },
              { label: "Ủng hộ trực tiếp", value: fund ? vnd(fund.donations) : "—", tone: "text-primary" },
            ].map((m) => (
              <div
                key={m.label}
                className="p-4 rounded-[26px] bg-white/65 backdrop-blur-xl border border-white/80 text-center shadow-xs transition-all hover:bg-white/80 hover:-translate-y-0.5"
              >
                <span className="text-[11px] text-on-surface-variant block mb-1">{m.label}</span>
                <span className={`font-headline text-lg font-bold ${m.tone}`}>{m.value}</span>
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
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="relative group p-2 bg-white rounded-3xl border border-rose-100/80 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                aria-label="Nhấn để phóng to mã QR Vietcombank"
                title="Nhấn để phóng to mã QR"
              >
                <img
                  className="w-48 sm:w-52 h-auto object-contain rounded-2xl shadow-inner"
                  alt="Mã QR Vietcombank T.TAM CUU HO CHO MEO SAN NHA NHIEU CHO 1060402678"
                  src="/images/qr_vietcombank_san_nha_nhieu_cho.jpg"
                />
                {/* Hover overlay hint */}
                <div className="absolute inset-2 rounded-2xl bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 p-3 text-center">
                  <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">zoom_in</span>
                  </span>
                  <span className="font-sans text-xs font-bold tracking-wide">Nhấn để phóng to</span>
                </div>
              </button>

              <div className="mt-3 flex flex-col items-center gap-2 text-center w-full">
                <div className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-primary">qr_code_scanner</span>
                  <span>Quét bằng App Ngân hàng / MoMo</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-[#5a1420] text-white text-xs font-sans font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                    title="Phóng to mã QR để quét dễ dàng"
                  >
                    <span className="material-symbols-outlined text-[15px]">zoom_in</span>
                    <span>Phóng to mã QR</span>
                  </button>

                  <a
                    href="/images/qr_vietcombank_san_nha_nhieu_cho.jpg"
                    download="QR_Vietcombank_San_Nha_Nhieu_Cho_1060402678.jpg"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-[#721a28] text-xs font-sans font-semibold border border-rose-200/80 shadow-2xs transition-all cursor-pointer"
                    title="Tải ảnh gốc mã QR Vietcombank"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Tải ảnh</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bank details info */}
            <div className="sm:col-span-7 flex flex-col space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/85 border border-white/90 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Ngân hàng</span>
                  <div className="text-right">
                    <span className="font-bold text-primary font-sans block">Vietcombank (VCB)</span>
                    <span className="text-[10px] text-emerald-700 font-sans font-semibold">Tài khoản chính thức của trạm</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-rose-100/50 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold mb-0.5">Số tài khoản</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-primary tracking-wider select-all">{ACCOUNT}</span>
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
                  <span className="font-bold text-primary font-sans uppercase text-right text-[11px] sm:text-xs leading-snug">
                    {ACCOUNT_NAME}
                  </span>
                </div>

                <div className="pt-2 border-t border-rose-100/50 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold shrink-0">Chi nhánh</span>
                  <span className="text-stone-600 font-sans text-right text-[11px]">
                    {BRANCH}
                  </span>
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
              Bạn có thể nhập cú pháp trên hoặc lời chúc tùy tâm gửi đến các bé cún mèo (Ví dụ: <code className="font-mono text-primary font-bold">Ho_Ten_Ung_ho_SNNC</code>).
            </p>
          </div>

          {/* Footer note */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">verified</span>
            <span>100% tiền gửi được chuyển thẳng trực tiếp vào tài khoản ngân hàng chính thức của Mái ấm Sân Nhà Nhiều Chó.</span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Zoomed QR Code */}
      {showQrModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Phóng to mã QR Vietcombank ủng hộ Sân Nhà Nhiều Chó"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-linear-to-b from-white via-white to-rose-50/90 rounded-3xl p-5 sm:p-6 border border-rose-200/90 shadow-2xl flex flex-col items-center space-y-4 animate-scale-up max-h-[94vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-rose-100 text-primary">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                </span>
                <div>
                  <h4 className="font-headline text-base font-bold text-primary">Mã QR Vietcombank</h4>
                  <p className="text-[11px] text-on-surface-variant font-sans">Ủng hộ Mái ấm Sân Nhà Nhiều Chó</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-rose-100/70 hover:bg-rose-200 text-primary flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng phóng to"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Big QR Display */}
            <div className="relative p-3 sm:p-4 bg-white rounded-2xl border border-rose-100 shadow-md flex items-center justify-center max-w-[320px] sm:max-w-[360px] w-full">
              <img
                src="/images/qr_vietcombank_san_nha_nhieu_cho.jpg"
                alt="Mã QR Vietcombank phóng to - 1060402678 T.TAM CUU HO CHO MEO SAN NHA NHIEU CHO"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            {/* Quick Summary Info */}
            <div className="w-full p-3.5 rounded-2xl bg-white/90 border border-rose-100 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Ngân hàng:</span>
                <span className="font-bold text-emerald-700">Vietcombank (VCB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Số tài khoản:</span>
                <span className="font-mono font-bold text-primary text-sm sm:text-base select-all tracking-wider">{ACCOUNT}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Chủ tài khoản:</span>
                <span className="font-bold text-primary text-right uppercase text-[11px] select-all">{ACCOUNT_NAME}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Chi nhánh:</span>
                <span className="text-stone-600 text-right text-[11px]">{BRANCH}</span>
              </div>
              <div className="pt-2 border-t border-rose-100/70 flex items-center justify-between">
                <span className="text-on-surface-variant">Cú pháp gợi ý:</span>
                <span className="font-mono font-bold text-primary select-all">{TRANSFER_NOTE}</span>
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="w-full flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyAccount}
                className={`flex-1 py-2.5 px-3 rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  copiedAccount
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                    : "bg-white hover:bg-rose-50 text-primary border border-rose-200 shadow-xs"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedAccount ? "check" : "content_copy"}
                </span>
                <span>{copiedAccount ? "Đã sao chép STK" : "Sao chép STK"}</span>
              </button>

              <a
                href="/images/qr_vietcombank_san_nha_nhieu_cho.jpg"
                download="QR_Vietcombank_San_Nha_Nhieu_Cho_1060402678.jpg"
                className="flex-1 py-2.5 px-3 rounded-xl bg-primary hover:bg-[#5a1420] text-white font-sans text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Tải ảnh mã QR</span>
              </a>
            </div>

            {/* Close hint */}
            <p className="text-[11px] text-stone-500 font-sans text-center">
              Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] font-mono">Esc</kbd> hoặc bấm ra ngoài để đóng
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
