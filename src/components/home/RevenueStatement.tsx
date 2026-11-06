"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  STATEMENT_CATEGORIES,
  STATEMENT_DAYS,
  STATEMENT_SUMMARY,
  STATEMENT_TRANSACTIONS,
  StatementItem,
  buildStatementCsv,
} from "@/lib/sales/statement-data";

const formatVnd = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.round(amount))}đ`;

const formatShortDate = (iso: string) => {
  const parts = iso.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return iso;
};

const ITEMS_PER_PAGE = 12;

type ActiveTab = "days" | "categories" | "transactions";
type FilterDate = "all" | "2026-10-17" | "2026-10-19" | "2026-10-20";
type FilterType = "all" | "sales" | "donation";

export default function RevenueStatement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("days");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<FilterDate>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [modalTab, setModalTab] = useState<"bank" | "chat">("bank");

  // Close modal on Escape
  useEffect(() => {
    if (!showReceiptModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowReceiptModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showReceiptModal]);

  // Filtered transactions for Tab 3
  const filteredTransactions = useMemo(() => {
    return STATEMENT_TRANSACTIONS.filter((item: StatementItem) => {
      if (filterDate !== "all" && item.soldOn !== filterDate) return false;
      if (filterType === "sales" && item.isDonation) return false;
      if (filterType === "donation" && !item.isDonation) return false;

      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCat = item.categoryLabel.toLowerCase().includes(query);
        const matchNote = item.note ? item.note.toLowerCase().includes(query) : false;
        return matchName || matchCat || matchNote;
      }
      return true;
    });
  }, [filterDate, filterType, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handleDownloadCsv = () => {
    try {
      const csvContent = buildStatementCsv();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sao-ke-doanh-thu-kp-atelier-20-10.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch {
      setDownloadSuccess(false);
    }
  };

  return (
    <section
      id="sao-ke"
      className="relative pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 overflow-hidden scroll-mt-20"
      aria-label="Bảng sao kê doanh thu và gây quỹ thiện nguyện"
    >
      {/* Ambient glowing atmosphere behind section */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-130 h-130 rounded-full bg-linear-to-tr from-[#721a28]/18 via-[#fea095]/15 to-transparent blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-130 h-130 rounded-full bg-linear-to-bl from-emerald-500/12 via-rose-300/15 to-transparent blur-[130px]" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full bg-amber-400/8 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grand Frame Wrapper with distinctive border and glass elevation */}
        <div className="relative rounded-[36px] sm:rounded-[44px] p-6 sm:p-10 lg:p-12 bg-linear-to-b from-white/95 via-white/90 to-[#fff8f7]/95 backdrop-blur-3xl border-2 border-rose-200/80 shadow-[0_25px_80px_-15px_rgba(114,26,40,0.16),0_1px_4px_rgba(255,255,255,0.95)_inset] overflow-hidden">
          
          {/* Subtle Decorative Atelier Watermark / Seal in top right corner */}
          <div
            aria-hidden="true"
            className="hidden lg:flex absolute -top-6 -right-6 w-44 h-44 rounded-full border border-rose-200/50 bg-rose-50/30 backdrop-blur-sm pointer-events-none items-center justify-center rotate-12 opacity-85"
          >
            <div className="w-36 h-36 rounded-full border border-dashed border-rose-300/70 flex flex-col items-center justify-center text-center p-2 text-[10px] uppercase font-sans font-bold tracking-wider text-primary/70">
              <span className="material-symbols-outlined text-[26px] text-secondary-dark mb-0.5">
                verified
              </span>
              <span>K&amp;P ATELIER</span>
              <span className="text-[9px] text-emerald-700 font-extrabold tracking-widest">
                ĐÃ ĐỐI SOÁT
              </span>
              <span className="text-[8px] text-stone-500 font-normal">20/10/2026</span>
            </div>
          </div>

          <div className="flex flex-col space-y-10">
            {/* Header / Hero statement row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Title & Key Narrative */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-rose-50 via-white to-emerald-50 text-primary font-sans text-xs font-bold border border-rose-200/90 shadow-2xs">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                  <span className="tracking-wide">BÁO CÁO MINH BẠCH TÀI CHÍNH 100%</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-secondary-dark font-semibold">SÂN NHÀ NHIỀU CHÓ</span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-tight">
                    Sao Kê Doanh Thu &amp; Gây Quỹ Thiện Nguyện
                  </h2>
                  <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    K&amp;P Atelier cam kết công khai minh bạch toàn bộ doanh thu bán hàng tại quầy (17/10 – 20/10/2026 tại ĐH FPT TP.HCM) và tiền ủng hộ trực tiếp. Mọi khoản thu đều được ghi nhận từng dòng và chuyển giao tới trạm cứu hộ.
                  </p>
                </div>

                {/* Big Grand Total Callout */}
                <div className="pt-2 flex flex-wrap items-baseline gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Tổng doanh thu &amp; gây quỹ:
                  </span>
                  <span className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
                    {formatVnd(STATEMENT_SUMMARY.totalRevenue)}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold font-sans">
                    {STATEMENT_TRANSACTIONS.length} giao dịch ghi nhận
                  </span>
                </div>
              </div>

              {/* Right Column: Digital Transfer Slip & Shelter Confirmation Card */}
              <div className="lg:col-span-5 bg-linear-to-br from-white via-emerald-50/40 to-rose-50/50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300/80 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                          Chứng Từ &amp; Xác Nhận Từ Trạm
                        </span>
                        <span className="font-headline text-xs font-bold text-primary block">
                          Sân Nhà Nhiều Chó Đã Ghi Nhận
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-sans font-bold uppercase tracking-wider shadow-2xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Đã hoàn tất</span>
                    </span>
                  </div>

                  <div className="py-3.5 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                        Số tiền đã chuyển giao
                      </span>
                      <div className="font-headline text-2xl font-extrabold text-emerald-800 tracking-tight">
                        1.800.000 VNĐ
                      </div>
                    </div>

                    {/* Dual Proof Thumbnails Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Thumbnail 1: Bank Transfer Slip */}
                      <button
                        type="button"
                        onClick={() => {
                          setModalTab("bank");
                          setShowReceiptModal(true);
                        }}
                        className="group relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer text-left bg-white p-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        title="Bấm để xem biên lai chuyển tiền MB Bank"
                      >
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 mb-1.5">
                          <img
                            src="/images/proof_chuyen_khoan_san_nha_nhieu_cho.jpg"
                            alt="Biên lai chuyển khoản MB Bank 1.800.000đ"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                            <span>Phóng to</span>
                          </span>
                        </div>
                        <div className="px-1 pb-0.5">
                          <span className="text-[10px] font-bold text-primary block truncate">1. Biên lai MB Bank</span>
                          <span className="text-[9px] text-emerald-700 font-mono font-semibold block">1.800.000đ • 22:18</span>
                        </div>
                      </button>

                      {/* Thumbnail 2: Shelter Confirmation Message */}
                      <button
                        type="button"
                        onClick={() => {
                          setModalTab("chat");
                          setShowReceiptModal(true);
                        }}
                        className="group relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer text-left bg-white p-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        title="Bấm để xem tin nhắn xác nhận & cảm ơn từ Sân Nhà Nhiều Chó"
                      >
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 mb-1.5">
                          <img
                            src="/images/xac_nhan_san_nha_nhieu_cho.jpg"
                            alt="Tin nhắn Sân Nhà Nhiều Chó ghi nhận và cảm ơn"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                            <span>Phóng to</span>
                          </span>
                        </div>
                        <div className="px-1 pb-0.5">
                          <span className="text-[10px] font-bold text-primary block truncate">2. SNNC ghi nhận</span>
                          <span className="text-[9px] text-emerald-700 font-semibold block truncate">Xác nhận &amp; Cảm ơn</span>
                        </div>
                      </button>
                    </div>

                    {/* Verified Quote Snippet from Shelter */}
                    <div className="p-2.5 rounded-xl bg-white/85 border border-emerald-200/80 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">forum</span>
                        <span>Đại diện SNNC phản hồi (22:42 • 25/10):</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant italic leading-snug line-clamp-2">
                        &ldquo;Chúng mình rất ghi nhận tinh thần và sự hỗ trợ từ các bạn... Hi vọng rằng các bé tại SNNC vẫn sẽ nhận được sự quan tâm từ các bạn trong tương lai ạ&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons inside the card */}
                <div className="pt-3 border-t border-emerald-200/70 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-sans text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      downloadSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-white hover:bg-rose-50 text-primary border border-rose-200 hover:border-primary/50"
                    }`}
                    title="Tải bảng sao kê định dạng CSV để mở bằng Excel"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {downloadSuccess ? "check" : "download"}
                    </span>
                    <span>{downloadSuccess ? "Đã tải CSV" : "Tải sao kê CSV"}</span>
                  </button>

                  <a
                    href="#shelter-donate"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-sans text-xs font-bold transition-all shadow-pill cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-tertiary">favorite</span>
                    <span>Ủng hộ thêm</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 4 financial blocks: total fund, expenses, revenue, transferred to the shelter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Tổng tiền thu được */}
              <div className="relative p-5 rounded-3xl bg-linear-to-br from-white via-white to-rose-50/70 border border-rose-200/90 shadow-liquid-card transition-all duration-300 hover:-translate-y-1 hover:shadow-liquid-card-hover group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Tổng tiền thu được
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-rose-100 to-rose-200 flex items-center justify-center text-primary shadow-2xs group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
                  </div>
                </div>
                <div className="font-headline text-2xl lg:text-3xl font-extrabold text-primary">
                  {formatVnd(STATEMENT_SUMMARY.fundTotal)}
                </div>
                <div className="mt-2 text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-secondary-dark">savings</span>
                  <span>Vốn nhóm tự góp {formatVnd(STATEMENT_SUMMARY.capitalAmount)} + doanh thu {formatVnd(STATEMENT_SUMMARY.totalRevenue)}</span>
                </div>
                <div className="w-full bg-rose-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${100}%` }} />
                </div>
              </div>

              {/* Card 2: Chi phí */}
              <div className="relative p-5 rounded-3xl bg-linear-to-br from-white via-white to-amber-50/60 border border-amber-200/80 shadow-liquid-card transition-all duration-300 hover:-translate-y-1 hover:shadow-liquid-card-hover group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Chi phí
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-800 shadow-2xs group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                  </div>
                </div>
                <div className="font-headline text-2xl lg:text-3xl font-extrabold text-primary">
                  {formatVnd(STATEMENT_SUMMARY.expensesAmount)}
                </div>
                <div className="mt-2 text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-amber-700">inventory_2</span>
                  <span>Nguyên vật liệu, hàng hoá và chi phí phát sinh</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${Math.round((STATEMENT_SUMMARY.expensesAmount / STATEMENT_SUMMARY.fundTotal) * 100)}%` }} />
                </div>
              </div>

              {/* Card 3: Doanh thu còn lại sau chi phí */}
              <div className="relative p-5 rounded-3xl bg-linear-to-br from-white via-white to-rose-50/80 border border-rose-200/90 shadow-liquid-card transition-all duration-300 hover:-translate-y-1 hover:shadow-liquid-card-hover group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-secondary-dark uppercase tracking-wider">
                    Doanh thu còn lại
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-rose-100 to-rose-200 flex items-center justify-center text-secondary-dark shadow-2xs group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">account_balance</span>
                  </div>
                </div>
                <div className="font-headline text-2xl lg:text-3xl font-extrabold text-secondary-dark">
                  {formatVnd(STATEMENT_SUMMARY.fundTotal - STATEMENT_SUMMARY.expensesAmount)}
                </div>
                <div className="mt-2 text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-secondary-dark">calculate</span>
                  <span>
                    Tổng tiền thu được trừ chi phí
                  </span>
                </div>
                <div className="w-full bg-rose-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="bg-secondary-dark h-1.5 rounded-full"
                    style={{
                      width: `${Math.round(((STATEMENT_SUMMARY.fundTotal - STATEMENT_SUMMARY.expensesAmount) / STATEMENT_SUMMARY.fundTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Card 4: Ủng hộ Sân Nhà Nhiều Chó */}
              <div className="relative p-5 rounded-3xl bg-linear-to-br from-emerald-50 via-white to-emerald-50/70 border-2 border-emerald-300 shadow-liquid-card transition-all duration-300 hover:-translate-y-1 hover:shadow-liquid-card-hover group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Ủng hộ Sân Nhà Nhiều Chó
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-200 to-emerald-300 flex items-center justify-center text-emerald-800 shadow-2xs group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">task_alt</span>
                  </div>
                </div>
                <div className="font-headline text-2xl lg:text-3xl font-extrabold text-emerald-800">
                  {formatVnd(STATEMENT_SUMMARY.transferredAmount)}
                </div>
                <div className="mt-2 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {STATEMENT_SUMMARY.transferredAmount > STATEMENT_SUMMARY.fundTotal - STATEMENT_SUMMARY.expensesAmount
                      ? `Nhóm tự bù thêm ${formatVnd(STATEMENT_SUMMARY.transferredAmount - (STATEMENT_SUMMARY.fundTotal - STATEMENT_SUMMARY.expensesAmount))} để đủ số ủng hộ`
                      : "Toàn bộ phần còn lại đã chuyển cho trạm"}
                  </span>
                </div>
                <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{ width: `${Math.round((STATEMENT_SUMMARY.transferredAmount / STATEMENT_SUMMARY.fundTotal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="inline-flex p-1.5 rounded-2xl bg-rose-100/60 backdrop-blur-xl border border-rose-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("days")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "days"
                      ? "bg-primary text-white shadow-pill"
                      : "text-on-surface-variant hover:text-primary hover:bg-white/70"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">calendar_month</span>
                  <span>Theo 3 ngày sự kiện</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "categories"
                      ? "bg-primary text-white shadow-pill"
                      : "text-on-surface-variant hover:text-primary hover:bg-white/70"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">category</span>
                  <span>Cơ cấu {STATEMENT_CATEGORIES.length} nhóm sản phẩm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("transactions")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "transactions"
                      ? "bg-primary text-white shadow-pill"
                      : "text-on-surface-variant hover:text-primary hover:bg-white/70"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">receipt_long</span>
                  <span>Sổ sao kê chi tiết ({STATEMENT_TRANSACTIONS.length} dòng)</span>
                </button>
              </div>

              {/* Status Note */}
              <div className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>Dữ liệu thực tế ghi nhận từ gian hàng ĐH FPT</span>
              </div>
            </div>

            {/* TAB 1: BY DAYS */}
            {activeTab === "days" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {STATEMENT_DAYS.map((day, idx) => {
                    const tagConfig = [
                      { label: "Khai mạc gian hàng", tone: "bg-amber-50 text-amber-800 border-amber-200" },
                      { label: "Chủ nhật đón khách", tone: "bg-blue-50 text-blue-800 border-blue-200" },
                      { label: "Chính hội 20/10 • Bùng nổ", tone: "bg-rose-50 text-rose-800 border-rose-200 font-bold" },
                    ][idx] || { label: "Ngày sự kiện", tone: "bg-stone-50 text-stone-700 border-stone-200" };

                    return (
                      <div
                        key={day.soldOn}
                        className={`p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between space-y-4 ${
                          idx === 2
                            ? "bg-linear-to-b from-white via-white to-rose-50/70 border-rose-300 shadow-md ring-2 ring-rose-200/60"
                            : "bg-white/85 border-rose-150 shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-sans uppercase tracking-wider border ${tagConfig.tone}`}>
                              {tagConfig.label}
                            </span>
                            <span className="text-xs font-bold text-primary font-mono">
                              {day.percentage}% tổng quỹ
                            </span>
                          </div>

                          <div className="mb-4">
                            <span className="text-xs font-semibold text-stone-500 block">Ngày {day.dayShort}</span>
                            <h3 className="font-headline text-xl font-bold text-primary">
                              {day.dayLabel}
                            </h3>
                          </div>

                          {/* Day Progress bar */}
                          <div className="w-full bg-stone-100 rounded-full h-2 mb-4 overflow-hidden">
                            <div
                              className="bg-linear-to-r from-secondary-dark to-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${day.percentage}%` }}
                            />
                          </div>

                          {/* Breakdown Lines */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/80 border border-stone-150">
                              <span className="text-stone-600 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[15px] text-amber-700">shopping_bag</span>
                                <span>Bán quà ({day.salesCount} đơn)</span>
                              </span>
                              <span className="font-mono font-bold text-primary">{formatVnd(day.salesAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/80 border border-stone-150">
                              <span className="text-stone-600 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[15px] text-rose-600">favorite</span>
                                <span>Ủng hộ ({day.donationCount} lượt)</span>
                              </span>
                              <span className="font-mono font-bold text-secondary-dark">
                                {formatVnd(day.donationAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-rose-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            Tổng thu trong ngày
                          </span>
                          <span className="font-headline text-xl sm:text-2xl font-bold text-primary">
                            {formatVnd(day.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Day Comparison Bar */}
                <div className="p-5 rounded-3xl bg-white/90 border border-rose-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary-dark">bar_chart</span>
                      <span>Biểu đồ tỷ lệ đóng góp giữa các ngày</span>
                    </span>
                    <span className="text-stone-500 font-normal">Tổng 100% doanh thu</span>
                  </div>

                  {/* Multi-segment bar */}
                  <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner bg-stone-100">
                    <div
                      style={{ width: `${STATEMENT_DAYS[0].percentage}%` }}
                      className="bg-rose-400 hover:bg-rose-500 transition-colors"
                      title={`17/10: ${formatVnd(STATEMENT_DAYS[0].total)} (${STATEMENT_DAYS[0].percentage}%)`}
                    />
                    <div
                      style={{ width: `${STATEMENT_DAYS[1].percentage}%` }}
                      className="bg-amber-400 hover:bg-amber-500 transition-colors"
                      title={`19/10: ${formatVnd(STATEMENT_DAYS[1].total)} (${STATEMENT_DAYS[1].percentage}%)`}
                    />
                    <div
                      style={{ width: `${STATEMENT_DAYS[2].percentage}%` }}
                      className="bg-primary hover:bg-primary-container transition-colors"
                      title={`20/10: ${formatVnd(STATEMENT_DAYS[2].total)} (${STATEMENT_DAYS[2].percentage}%)`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span>17/10: <strong>{formatVnd(STATEMENT_DAYS[0].total)}</strong> (33.3%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span>19/10: <strong>{formatVnd(STATEMENT_DAYS[1].total)}</strong> (25.5%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary" />
                      <span>20/10: <strong>{formatVnd(STATEMENT_DAYS[2].total)}</strong> (41.2% - Cao điểm)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BY CATEGORIES */}
            {activeTab === "categories" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/90 border border-rose-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-headline text-xl sm:text-2xl font-bold text-primary">
                      Cơ Cấu Bán Hàng 9 Nhóm Quà Tặng
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      Số lượng sản phẩm trao tay và tỷ lệ doanh thu được phân loại theo danh mục
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Doanh thu bán quà:</span>
                    <span className="font-headline text-lg sm:text-xl font-bold text-primary">
                      {formatVnd(STATEMENT_SUMMARY.stallSalesAmount)} ({STATEMENT_SUMMARY.stallSalesCount} món)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {STATEMENT_CATEGORIES.map((cat, idx) => (
                    <div
                      key={cat.category}
                      className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:bg-white hover:border-rose-200 hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-rose-100/80 text-primary text-xs font-bold flex items-center justify-center font-mono">
                            #{idx + 1}
                          </span>
                          <span className="font-sans text-sm font-bold text-primary">{cat.label}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-primary text-[11px] font-bold">
                          {cat.count} món
                        </span>
                      </div>

                      {/* Percentage Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-600">
                          <span>Tỷ trọng doanh thu</span>
                          <span className="font-bold text-primary font-mono">{cat.percentage}%</span>
                        </div>
                        <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-linear-to-r from-secondary-dark to-primary h-2 rounded-full"
                            style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-[11px] text-stone-500">Thành tiền</span>
                        <span className="font-mono text-base font-bold text-primary">
                          {formatVnd(cat.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ALL TRANSACTIONS */}
            {activeTab === "transactions" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/90 border border-rose-200/80 shadow-xs space-y-5">
                {/* Search & Filter Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Tìm tên món, ghi chú (ví dụ: vòng, gấu, bông, donate...)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50/80 border border-rose-200 text-xs sm:text-sm text-on-surface focus:outline-hidden focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary shadow-inner"
                    />
                  </div>

                  {/* Date & Type Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Date Dropdown */}
                    <select
                      value={filterDate}
                      onChange={(e) => {
                        setFilterDate(e.target.value as FilterDate);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-primary focus:outline-hidden shadow-2xs"
                      aria-label="Lọc theo ngày"
                    >
                      <option value="all">Tất cả các ngày</option>
                      <option value="2026-10-17">17/10 (Khai mạc)</option>
                      <option value="2026-10-19">19/10 (Chủ nhật)</option>
                      <option value="2026-10-20">20/10 (Chính hội)</option>
                    </select>

                    {/* Type Filter */}
                    <div className="inline-flex rounded-xl bg-stone-100 p-0.5 border border-stone-200 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterType("all");
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          filterType === "all" ? "bg-white text-primary shadow-xs font-bold" : "text-stone-600"
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterType("sales");
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          filterType === "sales" ? "bg-white text-primary shadow-xs font-bold" : "text-stone-600"
                        }`}
                      >
                        Bán hàng
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterType("donation");
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          filterType === "donation" ? "bg-white text-primary shadow-xs font-bold" : "text-stone-600"
                        }`}
                      >
                        Quyên góp
                      </button>
                    </div>
                  </div>
                </div>

                {/* Counter Bar */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium pt-1">
                  <span>
                    Khớp <strong>{filteredTransactions.length}</strong> dòng sao kê
                  </span>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
                  <table className="w-full min-w-140 text-left text-xs">
                    <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-600 font-bold border-b border-stone-200">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-center w-12">
                          #
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Ngày
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Sản phẩm / Nội dung
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Phân loại
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Ghi chú đối soát
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                          Số tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150">
                      {paginatedTransactions.map((tx, idx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-rose-50/50 transition-colors odd:bg-white even:bg-stone-50/40"
                        >
                          <td className="px-4 py-2.5 text-center text-stone-400 font-mono text-[11px]">
                            {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap font-medium text-stone-600">
                            {formatShortDate(tx.soldOn)}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-primary">
                            {tx.name}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.isDonation
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : "bg-stone-100 text-stone-700 border border-stone-200"
                              }`}
                            >
                              {tx.categoryLabel}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-stone-500 italic max-w-xs truncate">
                            {tx.note || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-primary whitespace-nowrap">
                            {formatVnd(tx.amount)}
                          </td>
                        </tr>
                      ))}
                      {paginatedTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                            Không tìm thấy giao dịch nào phù hợp với bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-white font-sans text-xs font-bold text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-rose-50 shadow-2xs"
                    >
                      Trang trước
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === p
                              ? "bg-primary text-white shadow-xs"
                              : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-white font-sans text-xs font-bold text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-rose-50 shadow-2xs"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Commitment Box */}
            <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-50/80 via-white to-rose-50/80 border border-emerald-200/80 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">shield</span>
                  </span>
                  <div>
                    <h4 className="font-headline text-base font-bold text-primary">
                      Cam Kết Minh Bạch &amp; Không Lợi Nhuận
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      K&amp;P Atelier duy trì tính minh bạch tuyệt đối: không trích giữ, đối soát sổ sách đầy đủ và cập nhật công khai cho toàn thể thầy cô, sinh viên cùng cộng đồng theo dõi.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("bank");
                      setShowReceiptModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-sans text-xs font-bold border border-emerald-300 shadow-2xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                    <span>Biên lai chuyển tiền</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("chat");
                      setShowReceiptModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-primary font-sans text-xs font-bold border border-rose-300 shadow-2xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-secondary-dark">chat</span>
                    <span>SNNC ghi nhận</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-primary font-sans text-xs font-bold border border-rose-200 shadow-2xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">file_download</span>
                    <span>Tải sao kê (.CSV)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox Modal for Authentic Bank Transfer & Shelter Confirmation */}
      {showReceiptModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Minh chứng chuyển tiền và xác nhận từ Sân Nhà Nhiều Chó"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-linear-to-b from-[#0e214d] via-[#091533] to-[#040c1d] rounded-3xl p-5 border border-sky-400/40 shadow-2xl flex flex-col items-center space-y-4 animate-scale-up max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/15 text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[22px]">verified</span>
                <div>
                  <h4 className="font-headline text-sm font-bold text-white">Minh Chứng Minh Bạch</h4>
                  <p className="text-[10px] text-slate-300 font-sans">Chiến dịch thiện nguyện 20/10</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng minh chứng"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Proof Switcher Tabs inside Modal */}
            <div className="w-full grid grid-cols-2 p-1 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white">
              <button
                type="button"
                onClick={() => setModalTab("bank")}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === "bank" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                <span>1. Biên lai MB Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("chat")}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === "chat" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">chat</span>
                <span>2. SNNC ghi nhận</span>
              </button>
            </div>

            {/* Image Display */}
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-inner max-h-[58vh] flex items-center justify-center bg-black/40 w-full">
              {modalTab === "bank" ? (
                <img
                  src="/images/proof_chuyen_khoan_san_nha_nhieu_cho.jpg"
                  alt="Chứng từ chuyển tiền 1.800.000 VNĐ cho Sân Nhà Nhiều Chó"
                  className="w-full h-auto max-h-[56vh] object-contain rounded-xl"
                />
              ) : (
                <img
                  src="/images/xac_nhan_san_nha_nhieu_cho.jpg"
                  alt="Tin nhắn xác nhận và cảm ơn từ Sân Nhà Nhiều Chó"
                  className="w-full h-auto max-h-[56vh] object-contain rounded-xl"
                />
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="w-full text-center space-y-1.5 text-xs text-slate-300 pt-1">
              {modalTab === "bank" ? (
                <>
                  <p className="font-mono text-emerald-300 font-bold text-sm">
                    1.800.000 VND ➔ SÂN NHÀ NHIỀU CHÓ (VCB 1060402678)
                  </p>
                  <p className="text-[11px] text-slate-300 italic">
                    Giao dịch thực hiện lúc 22:18 ngày 25/10/2026 bởi MB Bank
                  </p>
                </>
              ) : (
                <>
                  <p className="font-sans text-emerald-300 font-bold text-xs">
                    Đại diện Sân Nhà Nhiều Chó phản hồi lúc 22:42 ngày 25/10/2026:
                  </p>
                  <p className="text-[11px] text-slate-200 italic leading-relaxed px-2">
                    &ldquo;Dạ cảm ơn các bạn nhiều lắm ạ. Chúng mình rất ghi nhận tinh thần và sự hỗ trợ từ các bạn ạ. Mình tin rằng SNNC sẽ được lan toả đến nhiều người hơn...&rdquo;
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
