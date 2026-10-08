"use client";

import React, { useState } from "react";

export interface CharmItem {
  id: string;
  name: string;
  price: number;
  cogs: number;
  icon: string;
  category: "love" | "nature" | "campus" | "pets";
  meaning: string;
}

export interface ChainOption {
  id: string;
  name: string;
  price: number;
  cogs: number;
  strokeColor: string;
  desc: string;
}

export interface CustomizerState {
  chain: ChainOption;
  wristSize: number;
  charms: CharmItem[];
  recipientGroup: "na-ng" | "me" | "ban" | "co-giao" | "chang";
  message: string;
  pinCode: string;
  hasPin: boolean;
}

const AVAILABLE_CHAINS: ChainOption[] = [
  {
    id: "silver",
    name: "Bạc Ý S925 Thanh Mảnh",
    price: 45000,
    cogs: 20000,
    strokeColor: "#DCC0C0",
    desc: "Sáng bóng, tinh tế, trang nhã",
  },
  {
    id: "rose",
    name: "Vàng Hồng 14K Ấm Áp",
    price: 49000,
    cogs: 22000,
    strokeColor: "#FEA095",
    desc: "Ngọt ngào, tôn da phái đẹp",
  },
  {
    id: "pearl",
    name: "Ngọc Trai Nước Ngọt Mini",
    price: 55000,
    cogs: 26000,
    strokeColor: "#FAF0ED",
    desc: "Thanh lịch, dịu dàng, quý phái",
  },
  {
    id: "cord",
    name: "Dây Dù Kỷ Niệm Bền Bỉ",
    price: 35000,
    cogs: 14000,
    strokeColor: "#897172",
    desc: "Phong cách năng động, trẻ trung",
  },
];

const AVAILABLE_CHARMS: CharmItem[] = [
  {
    id: "c1",
    name: "Trái Tim Ánh Hồng",
    price: 12000,
    cogs: 5000,
    icon: "favorite",
    category: "love",
    meaning: "Tình yêu chân thành & gắn kết sâu sắc",
  },
  {
    id: "c2",
    name: "Hướng Dương Rạng Rỡ",
    price: 10000,
    cogs: 4000,
    icon: "sunny",
    category: "nature",
    meaning: "Luôn hướng về mặt trời & năng lượng tích cực",
  },
  {
    id: "c3",
    name: "Ngôi Sao Tri Kỷ",
    price: 10000,
    cogs: 4000,
    icon: "hotel_class",
    category: "campus",
    meaning: "Ánh sáng soi đường cùng nhau vượt thử thách",
  },
  {
    id: "c4",
    name: "Ly Trà Sữa Deadline",
    price: 8000,
    cogs: 3000,
    icon: "local_cafe",
    category: "campus",
    meaning: "Những buổi hẹn hò ôn thi sinh viên FPT",
  },
  {
    id: "c5",
    name: "Cỏ Bốn Lá Bình An",
    price: 10000,
    cogs: 4000,
    icon: "potted_plant",
    category: "nature",
    meaning: "Bình an & may mắn ngập tràn mọi chặng đường",
  },
  {
    id: "c6",
    name: "Trang Sách Tri Ân",
    price: 10000,
    cogs: 4000,
    icon: "auto_stories",
    category: "campus",
    meaning: "Lòng biết ơn sâu sắc gửi tới Thầy Cô",
  },
  {
    id: "c7",
    name: "Bàn Chân Cún Cứu Hộ",
    price: 12000,
    cogs: 5000,
    icon: "pets",
    category: "pets",
    meaning: "Dấu ấn yêu thương vì trạm Sân Nhà Nhiều Chó",
  },
  {
    id: "c8",
    name: "Chữ Cái Khắc Tên Nàng",
    price: 10000,
    cogs: 4000,
    icon: "draw",
    category: "love",
    meaning: "Dấu ấn cá nhân độc bản dành riêng cho người ấy",
  },
];

interface BraceletCustomizerProps {
  onAddToCart: (customizedItem: any) => void;
}

export default function BraceletCustomizer({ onAddToCart }: BraceletCustomizerProps) {
  const [chain, setChain] = useState<ChainOption>(AVAILABLE_CHAINS[0]);
  const [wristSize, setWristSize] = useState<number>(15.5);
  const [charms, setCharms] = useState<CharmItem[]>([
    AVAILABLE_CHARMS[0],
    AVAILABLE_CHARMS[1],
    AVAILABLE_CHARMS[6],
  ]);
  const [charmCategory, setCharmCategory] = useState<string>("all");
  const [recipientGroup, setRecipientGroup] = useState<string>("na-ng");
  const [message, setMessage] = useState<string>(
    "Gửi người luôn mang lại ấm áp cho mình. 20/10 này thật rực rỡ và hạnh phúc nhé! ❤️"
  );
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>("");
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Financial calculations according to Spec Section 7
  const chainPrice = chain.price;
  const charmsPrice = charms.reduce((sum, c) => sum + c.price, 0);
  const totalPrice = chainPrice + charmsPrice;

  // COGS: chain cogs + charms cogs + physical QR card print cost (3,000 VND)
  const qrCardCogs = 3000;
  const chainCogs = chain.cogs;
  const charmsCogs = charms.reduce((sum, c) => sum + c.cogs, 0);
  const totalCogs = chainCogs + charmsCogs + qrCardCogs;

  // 100% Net Profit strictly allocated to Charity: Net Profit = Revenue - COGS
  const charityFundContribution = Math.max(0, totalPrice - totalCogs);
  // Estimate meals provided (~15,000 VND per nutritious pet meal)
  const mealsCount = Math.max(1, Math.round(charityFundContribution / 12000));

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + "₫";
  };

  const handleAddCharm = (charm: CharmItem) => {
    if (charms.length >= 7) {
      alert("Mỗi chiếc vòng chỉ nên gắn tối đa 7 charm để đảm bảo vẻ thanh thoát nhất bạn nhé!");
      return;
    }
    const newCharmInstance = {
      ...charm,
      id: `${charm.id}_${Date.now().toString().slice(-4)}`,
    };
    setCharms([...charms, newCharmInstance]);
  };

  const handleRemoveCharm = (id: string) => {
    setCharms(charms.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    setCharms([]);
  };

  // AI Prompts helper
  const handleApplyAiSuggestion = (type: "write" | "ideas" | "polish") => {
    if (type === "write") {
      setMessage("20/10 dịu dàng gửi người con gái anh trân quý nhất. Cảm ơn em vì đã luôn là ánh sáng bình yên của anh!");
    } else if (type === "ideas") {
      setMessage("Kỷ niệm ngày đầu gặp nhau tại FPT • Lời cảm ơn chân thành • Lời hứa đồng hành qua mọi mùa thi cử");
    } else if (type === "polish") {
      setMessage(`"Mùa thu FPT trở nên thật ấm áp bởi vì có em bên cạnh. Chiếc vòng nhỏ này gói trọn yêu thương và sự đồng hành của anh gửi đến em nhân ngày 20/10."`);
    }
    setShowAiModal(false);
  };

  const handleFinishAndOrder = () => {
    const itemData = {
      type: "custom_bracelet",
      title: `Vòng Tay Charm K&P (${chain.name})`,
      chainName: chain.name,
      chainPrice: chain.price,
      wristSize,
      charms: [...charms],
      totalPrice,
      totalCogs,
      charityAmount: charityFundContribution,
      meals: mealsCount,
      recipientGroup,
      message,
      hasPin,
      pinCode: hasPin ? pinCode : "",
    };
    onAddToCart(itemData);
  };

  return (
    <section id="customizer-workspace" className="w-full py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full liquid-glass-pill text-[#540114] text-xs font-semibold mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[14px] text-[#fea095]">brush</span>
              Atelier Workshop 20/10 • ĐH FPT
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#540114]">
              Bàn Tự Phối Vòng &amp; Thiết Kế Quà Số
            </h2>
            <p className="text-sm text-[#564243] mt-1">
              Tùy biến từng hạt charm, soạn trang quà số kèm thẻ QR và cùng chúng mình góp bữa ăn cho các bé cún mèo tại Sân Nhà Nhiều Chó.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="liquid-glass-btn-secondary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Đặt lại vòng
            </button>
            <div className="liquid-glass-pill px-3.5 py-1.5 rounded-full text-[#76322b] text-xs font-semibold flex items-center gap-1.5 border border-white/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#540114] animate-pulse" />
              Định giá sinh viên: 40k – 70k
            </div>
          </div>
        </div>

        {/* Workspace 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Visual Bracelet Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="relative w-full min-h-[460px] rounded-3xl liquid-glass p-6 shadow-xl border-2 border-white/80 flex flex-col justify-between overflow-hidden">
              {/* Top Canvas Status */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base font-bold text-[#540114]">
                    Vòng {chain.name}
                  </span>
                  <span className="px-3 py-1 rounded-full liquid-glass-pill text-[11px] text-[#540114] font-bold border border-white/80">
                    Size {wristSize}cm
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#564243] px-3.5 py-1 rounded-full liquid-glass-pill border border-white/80">
                  {charms.length} / 7 Charms
                </span>
              </div>

              {/* Central Bracelet SVG Canvas Graphic */}
              <div className="relative my-auto py-6 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
                  {/* SVG Bracelet Circle Chain */}
                  <svg
                    className="w-full h-full transform rotate-45 transition-transform duration-500"
                    viewBox="0 0 400 400"
                  >
                    {/* Background glow path */}
                    <circle
                      cx="200"
                      cy="200"
                      r="140"
                      fill="none"
                      stroke="#F0DFDB"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    {/* Dynamic chain link ring */}
                    <circle
                      cx="200"
                      cy="200"
                      r="140"
                      fill="none"
                      stroke={chain.strokeColor}
                      strokeWidth="8"
                      strokeDasharray={chain.id === "pearl" ? "14 8" : "8 6"}
                      className="transition-colors duration-300"
                    />
                    {/* Clasp Visual */}
                    <rect x="188" y="52" width="24" height="16" rx="4" fill="#721A28" />
                    <circle cx="200" cy="60" r="3" fill="#FFF" />
                  </svg>

                  {/* Attached Charm Icons positioned along lower arc */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {charms.map((charm, index) => {
                      const total = charms.length;
                      const startAngle = 120;
                      const endAngle = 240;
                      const angleStep = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
                      const angle = total === 1 ? 180 : startAngle + angleStep * index;
                      const rad = (angle * Math.PI) / 180;
                      const radius = 140;
                      const x = 200 + radius * Math.cos(rad);
                      const y = 200 + radius * Math.sin(rad);

                      return (
                        <div
                          key={charm.id}
                          className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                          style={{
                            left: `${(x / 400) * 100}%`,
                            top: `${(y / 400) * 100}%`,
                          }}
                        >
                          <div className="relative w-9 h-9 rounded-full liquid-glass-pill shadow-md flex items-center justify-center border border-white/90 group-hover:scale-125 transition-transform duration-200">
                            <span className="material-symbols-outlined text-[#540114] text-[18px]">
                              {charm.icon}
                            </span>
                            <button
                              onClick={() => handleRemoveCharm(charm.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-[#540114] text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Bỏ charm này"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Digital QR Badge Preview floating below bracelet */}
                <div className="mt-2 px-4 py-2 rounded-2xl liquid-glass-pill border border-white/80 shadow-xs flex items-center gap-2 max-w-sm text-center">
                  <span className="material-symbols-outlined text-[#540114] text-[18px]">
                    qr_code_2
                  </span>
                  <span className="text-xs text-[#221a18] italic truncate">
                    {hasPin ? "🔒 Đã đặt PIN • " : "🔓 Không khóa PIN • "} "{message}"
                  </span>
                </div>
              </div>

              {/* Bottom Canvas Controls */}
              <div className="z-10 pt-4 border-t border-white/60 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#564243] font-semibold">Chất liệu:</span>
                  <div className="inline-flex p-1 liquid-glass-pill rounded-full text-xs">
                    {AVAILABLE_CHAINS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setChain(c)}
                        className={`px-3 py-1 rounded-full transition-all text-[11px] font-bold cursor-pointer ${
                          chain.id === c.id
                            ? "liquid-glass-btn-primary text-white shadow-xs"
                            : "text-[#564243] hover:text-[#540114]"
                        }`}
                      >
                        {c.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#564243] font-semibold">Cổ tay:</span>
                  <input
                    type="range"
                    min="14"
                    max="18"
                    step="0.5"
                    value={wristSize}
                    onChange={(e) => setWristSize(parseFloat(e.target.value))}
                    className="w-20 accent-[#540114] cursor-pointer"
                  />
                  <span className="text-xs text-[#540114] font-bold">{wristSize} cm</span>
                </div>
              </div>
            </div>

            {/* Attached Charms Tray */}
            <div className="p-4 rounded-2xl liquid-glass border border-white/70 shadow-xs">
              <span className="text-xs font-bold text-[#540114] block mb-2">
                Các charm đang treo trên vòng ({charms.length}/7):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {charms.length === 0 ? (
                  <span className="text-xs text-[#897172] italic">
                    Chưa có charm nào. Hãy bấm "+ Thêm" ở bảng bên cạnh!
                  </span>
                ) : (
                  charms.map((c) => (
                    <div
                      key={c.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill border border-white/80 text-xs text-[#221a18] whitespace-nowrap shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#540114]">
                        {c.icon}
                      </span>
                      <span>{c.name}</span>
                      <button
                        onClick={() => handleRemoveCharm(c.id)}
                        className="text-[#897172] hover:text-[#540114] font-bold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Customization Step Panels (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* STEP 1: Chọn Dây Vòng */}
            <div className="p-5 rounded-3xl liquid-glass shadow-md border border-white/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-base font-bold text-[#540114] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full liquid-glass-btn-primary text-white text-xs flex items-center justify-center font-sans">
                    1
                  </span>
                  Chọn Kiểu Dây Cơ Bản
                </h3>
                <span className="text-[10px] text-[#934841] font-bold uppercase">Bắt buộc</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {AVAILABLE_CHAINS.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setChain(c)}
                    className={`cursor-pointer p-3 rounded-2xl transition-all border flex flex-col justify-between ${
                      chain.id === c.id
                        ? "liquid-glass border-white/95 ring-2 ring-[#540114]/20 shadow-md"
                        : "liquid-glass-card hover:bg-white/80 border-white/70"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-[#221a18] block">{c.name}</span>
                      <span className="text-[11px] text-[#564243] block mt-0.5">{c.desc}</span>
                    </div>
                    <span className="text-xs font-bold text-[#540114] mt-2 block">
                      {formatMoney(c.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 2: Chọn Charm Kỷ Niệm */}
            <div className="p-5 rounded-3xl liquid-glass shadow-md border border-white/80 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-base font-bold text-[#540114] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full liquid-glass-btn-primary text-white text-xs flex items-center justify-center font-sans">
                    2
                  </span>
                  Chọn Charm Ý Nghĩa
                </h3>
                <span className="text-[11px] text-[#897172]">Tối đa 7 charm</span>
              </div>

              {/* Category filter pills */}
              <div className="flex gap-1.5 overflow-x-auto py-2">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "love", label: "❤️ Yêu thương" },
                  { id: "nature", label: "🌸 Hoa lá" },
                  { id: "campus", label: "🎓 FPT Thanh xuân" },
                  { id: "pets", label: "🐾 Cứu hộ thú cưng" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCharmCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      charmCategory === cat.id
                        ? "liquid-glass-btn-primary text-white shadow-xs"
                        : "liquid-glass-pill text-[#564243] hover:bg-white/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Charm Grid */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1 mt-2">
                {AVAILABLE_CHARMS.filter(
                  (c) => charmCategory === "all" || c.category === charmCategory
                ).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl liquid-glass-card border border-white/70 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <span className="material-symbols-outlined text-[#540114] text-[22px] p-1.5 liquid-glass-pill rounded-xl shadow-xs border border-white/80">
                        {c.icon}
                      </span>
                      <span className="text-[10px] text-[#934841] font-bold">
                        +{formatMoney(c.price)}
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-[#221a18]">{c.name}</h4>
                      <p className="text-[10px] text-[#564243] line-clamp-1 mt-0.5">{c.meaning}</p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-white/50 flex justify-end">
                      <button
                        onClick={() => handleAddCharm(c)}
                        className="px-3 py-0.5 rounded-full liquid-glass-btn-primary text-white text-[11px] font-bold shadow-xs cursor-pointer"
                      >
                        + Thêm
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 3: Cấu Hình Quà Số & Thiệp QR */}
            <div className="p-5 rounded-3xl liquid-glass shadow-md border border-white/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-base font-bold text-[#540114] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full liquid-glass-btn-primary text-white text-xs flex items-center justify-center font-sans">
                    3
                  </span>
                  Cấu Hình Quà Số QR &amp; Lời Chúc
                </h3>
                <span className="text-[10px] text-[#934841] font-bold uppercase">Kèm Thẻ QR</span>
              </div>

              {/* 5 Recipient groups according to Spec Section 4.1 */}
              <div className="mb-3">
                <label className="text-xs text-[#564243] font-semibold block mb-1.5">
                  Đối tượng nhận quà:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: "na-ng", label: "Cho nàng" },
                    { id: "me", label: "Cho Mẹ" },
                    { id: "co-giao", label: "Cho Cô giáo" },
                    { id: "ban", label: "Cho Bạn thân" },
                    { id: "chang", label: "Cho Chàng" },
                  ].map((rg) => (
                    <button
                      key={rg.id}
                      onClick={() => setRecipientGroup(rg.id)}
                      className={`px-2 py-1 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer ${
                        recipientGroup === rg.id
                          ? "liquid-glass-btn-primary text-white"
                          : "liquid-glass-pill text-[#564243] hover:bg-white/80"
                      }`}
                    >
                      {rg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message box with AI buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#564243] font-semibold">Lời chúc hiển thị khi quét QR:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleApplyAiSuggestion("write")}
                      className="px-2.5 py-0.5 rounded-lg liquid-glass-btn-secondary text-[#540114] text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                      AI viết
                    </button>
                    <button
                      onClick={() => handleApplyAiSuggestion("polish")}
                      className="px-2.5 py-0.5 rounded-lg liquid-glass-btn-secondary text-[#540114] text-[10px] font-bold cursor-pointer"
                    >
                      Trau chuốt
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  maxLength={120}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-xs text-[#221a18] focus:outline-none resize-none"
                  placeholder="Gõ lời nhắn muốn in thiệp & hiển thị khi quét mã QR..."
                />

                {/* PIN Code Setup according to Spec Section 3.1 */}
                <div className="pt-2 border-t border-white/60 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#221a18]">
                    <input
                      type="checkbox"
                      checked={hasPin}
                      onChange={(e) => setHasPin(e.target.checked)}
                      className="rounded accent-[#540114]"
                    />
                    <span>Đặt mã PIN 4 số bảo vệ thẻ quà</span>
                  </label>

                  {hasPin && (
                    <input
                      type="password"
                      maxLength={4}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="VD: 2010"
                      className="w-20 px-2 py-1 rounded-lg liquid-glass-input text-xs font-mono text-center focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* REAL-TIME CHARITY & PRICING BREAKDOWN */}
            <div className="p-5 rounded-3xl liquid-glass shadow-xl border-2 border-white/90 flex flex-col gap-3">
              {/* Transparency Formula strictly from Spec Section 7 */}
              <div className="liquid-glass-pill p-3.5 rounded-2xl border border-white/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#564243]">
                  <span>Trọn gói vòng + quà số QR:</span>
                  <span className="font-bold text-sm text-[#221a18]">{formatMoney(totalPrice)}</span>
                </div>
                <div className="pt-2 border-t border-white/60 flex items-center gap-2 text-[#540114]">
                  <span className="material-symbols-outlined text-[18px] text-[#934841] shrink-0">pets</span>
                  <span className="text-xs font-semibold leading-relaxed">
                    Với đơn hàng này, <strong>bạn đã góp vào {mealsCount} bữa ăn cho các bé</strong> tại Sân Nhà Nhiều Chó! 🐾
                  </span>
                </div>
              </div>

              {/* Total and Order Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-[#934841] uppercase font-bold tracking-wider block">
                    Tổng đơn đặt trước 20/10
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#540114]">
                    {formatMoney(totalPrice)}
                  </span>
                </div>

                <button
                  onClick={handleFinishAndOrder}
                  className="liquid-glass-btn-primary px-6 py-3.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  Đặt Trước Cho 20/10
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
