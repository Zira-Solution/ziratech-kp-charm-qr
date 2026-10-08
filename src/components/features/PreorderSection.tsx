"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";

interface CartItem {
  title: string;
  price: number;
  totalPrice?: number;
  charityAmount?: number;
  charms?: { name: string }[];
  message?: string;
  desc?: string;
}

interface PreorderSectionProps {
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onAddToCart?: (item: CartItem) => void;
}

export default function PreorderSection({
  items,
  onRemoveItem,
  onAddToCart,
}: PreorderSectionProps) {
  // Form State
  const [recipientName, setRecipientName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 - 12:00 (Giờ nghỉ trưa)");
  const [deliveryType, setDeliveryType] = useState<"booth" | "classroom">("booth");
  const [roomNote, setRoomNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vietqr">("cod");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  // Submission State
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + (item.totalPrice || item.price || 0),
    0
  );

  // Quy đổi bữa ăn từ thiện: cứ mỗi ~15.000đ quy đổi thành 1 bữa ăn ấm bụng cho các bé tại Sân Nhà Nhiều Chó
  // Tuyệt đối không hiển thị tiền mặt gây quỹ, chỉ nói số bữa ăn
  const totalMeals = Math.max(1, Math.round(subtotal / 15000));

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + "₫";
  };

  const handleQuickAddPreset = (name: string, price: number, charmsList: string[]) => {
    if (onAddToCart) {
      onAddToCart({
        title: name,
        price,
        totalPrice: price,
        charms: charmsList.map((c) => ({ name: c })),
        message: "Chúc bạn ngày 20/10 ngập tràn niềm vui, rạng rỡ và hạnh phúc!",
      });
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống. Vui lòng chọn ít nhất 1 set quà trước khi đặt!");
      return;
    }
    if (!recipientName.trim()) {
      alert("Vui lòng nhập tên người nhận quà 20/10!");
      return;
    }
    if (!senderPhone.trim() || senderPhone.length < 9) {
      alert("Vui lòng nhập số điện thoại người đặt hợp lệ để đối soát và nhận thông báo!");
      return;
    }
    if (deliveryType === "classroom" && !roomNote.trim()) {
      alert("Vui lòng nhập số phòng học / giảng đường để K&P giao tận nơi!");
      return;
    }

    setIsSubmitting(true);

    // Generate Order Code: KP-2010-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `KP-2010-${randomSuffix}`;

    const orderData = {
      orderCode,
      createdAt: new Date().toISOString(),
      recipientName,
      senderPhone,
      senderEmail,
      timeSlot,
      deliveryLocation:
        deliveryType === "booth"
          ? "Booth K&P Atelier (Sảnh Tòa Nhà Alpha / Beta ĐH FPT)"
          : `Giao tận phòng: ${roomNote}`,
      paymentMethod,
      isAnonymous,
      orderNote,
      items: [...items],
      totalPrice: subtotal,
      totalMeals,
      orderStatus: "Đã xác nhận đặt trước",
      paymentStatus:
        paymentMethod === "cod"
          ? "Thanh toán tiền mặt tại Booth (20/10)"
          : "Chờ chuyển khoản (VietQR)",
    };

    // Save to localStorage for Lookup modal
    try {
      const existing = JSON.parse(localStorage.getItem("kp_orders") || "[]");
      existing.unshift(orderData);
      localStorage.setItem("kp_orders", JSON.stringify(existing));
    } catch (err) {
      console.error(err);
    }

    // Fire Confetti Celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#540114", "#934841", "#fea095", "#ffd8d2", "#2d4734"],
      });
    } catch {}

    setTimeout(() => {
      setConfirmedOrder(orderData);
      setIsSubmitting(false);
    }, 600);
  };

  const handleResetForm = () => {
    setConfirmedOrder(null);
    setRecipientName("");
    setRoomNote("");
    setOrderNote("");
  };

  return (
    <section
      id="preorder-section"
      className="scroll-mt-24 w-full py-16 sm:py-24 bg-gradient-to-b from-[#fbf1ed] via-[#fff8f6] to-[#faece7] border-t border-[#ebd5cf] relative overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#ffd8d2]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#f9dad3]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================= */}
        {/* SECTION HEADER: Editorial Luxury Pre-order */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#540114] text-white text-xs font-semibold shadow-md mb-3 transform hover:scale-105 transition-transform border border-[#fea095]/30">
            <span className="material-symbols-outlined text-[16px] text-[#fea095]">local_shipping</span>
            <span className="tracking-wide">Hẹn Giờ Nhận Quà 20/10 • Booth ĐH FPT</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#540114] tracking-tight leading-tight">
            Đặt Trước Kỷ Vật 20/10.<br />
            <span className="text-[#934841]">Nhận Quà Trọn Vẹn Tại Booth ĐH FPT.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#564243] mt-3.5 leading-relaxed max-w-2xl">
            Đặt trước ngay hôm nay để K&amp;P chuẩn bị thiệp viết tay theo yêu cầu, khắc thẻ mã QR cá nhân và đóng gói hộp nhung nơ lụa. Nhận hàng đúng khung giờ hẹn tại Booth hoặc nhờ giao tận phòng học.
          </p>

          {/* Micro Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 text-xs text-[#6e5550]">
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-[#ebd5cf] shadow-2xs font-medium">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
              Miễn phí hộp nhung &amp; nơ lụa
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-[#ebd5cf] shadow-2xs font-medium">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
              Tặng kèm Thẻ Thông Minh khắc QR
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-[#ebd5cf] shadow-2xs font-medium">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
              Thanh toán linh hoạt tiền mặt / VietQR
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN PREORDER INTERFACE */}
        {/* ========================================================= */}
        {confirmedOrder ? (
          /* ======================================================= */
          /* SUCCESS CONFIRMATION VIEW */
          /* ======================================================= */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(84,1,20,0.15)] border-2 border-[#540114]/20 text-center animate-in fade-in zoom-in-95 duration-400">
            
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500 shadow-sm animate-bounce">
              <span className="material-symbols-outlined text-[42px] text-emerald-600">
                celebration
              </span>
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              Đặt Trước Thành Công
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#540114]">
              Cảm Ơn Bạn Đã Đồng Hành!
            </h3>

            <p className="text-sm text-[#564243] mt-2 max-w-md mx-auto">
              Đơn hàng của bạn đã được tiếp nhận và lưu vào hệ thống đối soát quà tặng 20/10 của K&amp;P Atelier.
            </p>

            {/* Order Code Callout Box */}
            <div className="my-6 p-4 rounded-2xl bg-[#fff8f6] border border-[#ebd5cf] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <span className="text-xs text-[#897172] block font-mono">MÃ ĐƠN HÀNG TRA CỨU:</span>
                <span className="font-mono text-2xl font-black text-[#540114] tracking-wider">
                  {confirmedOrder.orderCode}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(confirmedOrder.orderCode);
                  alert(`Đã sao chép mã đơn: ${confirmedOrder.orderCode}`);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#faece7] border border-[#dcc0c0] text-xs font-semibold text-[#540114] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Sao chép mã</span>
              </button>
            </div>

            {/* Order Summary Details */}
            <div className="bg-[#faf5eb] p-4.5 rounded-2xl border border-[#ebd5cf] text-left text-xs sm:text-sm text-[#443a36] space-y-2 mb-6">
              <div className="flex justify-between border-b border-[#ebd5cf]/60 pb-1.5">
                <span className="text-[#765e55]">Người nhận quà:</span>
                <span className="font-bold text-[#540114]">{confirmedOrder.recipientName}</span>
              </div>
              <div className="flex justify-between border-b border-[#ebd5cf]/60 pb-1.5">
                <span className="text-[#765e55]">Số điện thoại liên hệ:</span>
                <span className="font-mono font-bold text-[#221a18]">{confirmedOrder.senderPhone}</span>
              </div>
              <div className="flex justify-between border-b border-[#ebd5cf]/60 pb-1.5">
                <span className="text-[#765e55]">Khung giờ hẹn nhận:</span>
                <span className="font-bold text-[#934841]">{confirmedOrder.timeSlot}</span>
              </div>
              <div className="flex justify-between border-b border-[#ebd5cf]/60 pb-1.5">
                <span className="text-[#765e55]">Địa điểm nhận:</span>
                <span className="font-medium text-[#221a18] text-right">{confirmedOrder.deliveryLocation}</span>
              </div>
              <div className="flex justify-between border-b border-[#ebd5cf]/60 pb-1.5">
                <span className="text-[#765e55]">Hình thức thanh toán:</span>
                <span className="font-bold text-[#540114]">{confirmedOrder.paymentStatus}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-base text-[#540114]">
                <span>Tổng giá trị đơn:</span>
                <span className="text-lg font-extrabold text-[#721a28]">{formatMoney(confirmedOrder.totalPrice)}</span>
              </div>
            </div>

            {/* Charity Impact Box (TUÂN THỦ: chỉ nói số bữa ăn) */}
            <div className="p-3.5 rounded-2xl bg-[#f0f7f2] border border-[#c4e3cc] flex items-center gap-3 text-left mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">pets</span>
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Đóng Góp Bữa Ăn Sân Nhà Nhiều Chó
                </span>
                <span className="text-xs text-emerald-800">
                  Đơn hàng của bạn đã góp phần mang lại <strong>{confirmedOrder.totalMeals} bữa ăn ấm bụng</strong> cho các bé cún mèo bị bỏ rơi.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#540114] hover:bg-[#721a28] text-white font-serif font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Đặt Thêm Đơn Hàng Mới
              </button>
              <a
                href="#digital-gift"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#fff8f6] border border-[#dcc0c0] text-[#540114] font-serif font-bold text-sm shadow-2xs transition-all"
              >
                Xem Lại Mẫu Thiệp Quà Số
              </a>
            </div>

          </div>
        ) : (
          /* ======================================================= */
          /* SPLIT PREORDER WORKSPACE: CART ON LEFT, FORM ON RIGHT */
          /* ======================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ===================================================== */}
            {/* LEFT COLUMN (5 COLS): Cart Items & Charity Impact */}
            {/* ===================================================== */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(84,1,20,0.06)] border border-[#ebd5cf]">
                
                <div className="flex items-center justify-between pb-3 border-b border-[#ebd5cf]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#540114] text-[22px]">shopping_bag</span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#540114]">
                      Giỏ Quà Đang Chọn ({items.length})
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#934841] bg-[#ffdad6] px-2.5 py-0.5 rounded-full">
                    20/10 Edition
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#f5e4e0] my-2 max-h-[360px] overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="py-8 text-center text-[#897172] space-y-3">
                      <span className="material-symbols-outlined text-[42px] text-[#cca59b]">
                        inventory_2
                      </span>
                      <p className="text-xs">Giỏ quà chưa có set vòng nào.</p>
                      
                      {/* Quick Add Suggestions */}
                      <div className="pt-2 text-left space-y-2">
                        <span className="text-[11px] font-bold text-[#540114] block">
                          Thêm nhanh set quà được yêu thích:
                        </span>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickAddPreset("Set Vòng Hoa Hướng Dương Tri Kỷ", 49000, [
                                "Hoa Hướng Dương",
                                "Ngôi Sao Tri Kỷ",
                              ])
                            }
                            className="p-2 rounded-xl bg-[#fff8f6] hover:bg-[#fceae6] border border-[#ebd5cf] text-left text-xs font-semibold text-[#540114] flex items-center justify-between transition-colors"
                          >
                            <span>🌻 Set Vòng Hướng Dương (49k)</span>
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickAddPreset("Set Vòng Lam Ngọc Trai Đại Dương", 59000, [
                                "Đá Lam Ngọc Trai",
                                "Cá Heo Tự Do",
                                "Sao Biển",
                              ])
                            }
                            className="p-2 rounded-xl bg-[#fff8f6] hover:bg-[#fceae6] border border-[#ebd5cf] text-left text-xs font-semibold text-[#540114] flex items-center justify-between transition-colors"
                          >
                            <span>🌊 Vòng Lam Ngọc Trai (59k)</span>
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickAddPreset("Set Trái Tim Hồng Nhung S925", 65000, [
                                "Trái Tim Ánh Hồng",
                                "Cánh Bướm Tinh Khôi",
                              ])
                            }
                            className="p-2 rounded-xl bg-[#fff8f6] hover:bg-[#fceae6] border border-[#ebd5cf] text-left text-xs font-semibold text-[#540114] flex items-center justify-between transition-colors"
                          >
                            <span>❤️ Set Trái Tim Hồng Nhung (65k)</span>
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2e1d1b] leading-tight">
                            {item.title}
                          </h4>
                          
                          {/* Charms Preview Tags */}
                          {item.charms && item.charms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.charms.map((c, ci) => (
                                <span
                                  key={ci}
                                  className="text-[10px] bg-[#fff0ed] text-[#76322b] px-1.5 py-0.5 rounded border border-[#f5d5ce]"
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.message && (
                            <p className="text-[11px] text-[#705652] italic line-clamp-1 mt-1">
                              "{item.message}"
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-serif font-bold text-xs sm:text-sm text-[#721a28] block">
                            {formatMoney(item.totalPrice || item.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            className="text-[11px] text-[#bda099] hover:text-red-600 transition-colors mt-0.5"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal & Free Gifts */}
                {items.length > 0 && (
                  <div className="pt-3 border-t border-[#ebd5cf] space-y-2 text-xs">
                    <div className="flex justify-between text-[#6e5550]">
                      <span>Hộp nhung nơ lụa cao cấp:</span>
                      <span className="font-bold text-emerald-700">Miễn phí (Tặng kèm)</span>
                    </div>
                    <div className="flex justify-between text-[#6e5550]">
                      <span>Thẻ thông minh khắc QR &amp; Thiệp in:</span>
                      <span className="font-bold text-emerald-700">Miễn phí (Tặng kèm)</span>
                    </div>
                    <div className="flex justify-between text-[#6e5550]">
                      <span>Phí giao tại khuôn viên ĐH FPT:</span>
                      <span className="font-bold text-emerald-700">0₫ (Freeship)</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#ebd5cf] text-sm sm:text-base font-bold text-[#540114]">
                      <span>Tổng thanh toán:</span>
                      <span className="text-lg sm:text-xl font-serif font-extrabold text-[#721a28]">
                        {formatMoney(subtotal)}
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Charity Impact Box (TUÂN THỦ: KHÔNG NÓI TIỀN MẶT, CHỈ NÓI SỐ BỮA ĂN) */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#f2f8f4] to-[#e4f2e7] border border-[#bfe0c7] shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">pets</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-emerald-950">
                    Sứ Mệnh Gây Quỹ "Sân Nhà Nhiều Chó"
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Đơn hàng này của bạn sẽ quy đổi trực tiếp thành{" "}
                    <strong className="text-emerald-900 font-extrabold">{totalMeals} bữa ăn ấm bụng</strong>{" "}
                    cho các bé cún mèo bị bỏ rơi tại trạm cứu hộ.
                  </p>
                </div>
              </div>

            </div>

            {/* ===================================================== */}
            {/* RIGHT COLUMN (7 COLS): Comprehensive Pre-Order Form */}
            {/* ===================================================== */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmitOrder}
                className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_14px_35px_rgba(84,1,20,0.08)] border border-[#ebd5cf] space-y-5"
              >
                
                {/* Step 1: Thông tin người nhận & người đặt */}
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#ebd5cf]">
                    <span className="w-5 h-5 rounded-full bg-[#540114] text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#540114]">
                      Thông Tin Người Nhận &amp; Người Tặng
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#443a36] mb-1">
                        Tên người nhận quà 20/10 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="VD: Mai Anh, Cô Thu Hà..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff8f6] border border-[#ebd5cf] text-xs sm:text-sm text-[#221a18] placeholder:text-[#a08882] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#443a36] mb-1">
                        Số điện thoại người đặt (đối soát) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="VD: 0987654321"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff8f6] border border-[#ebd5cf] text-xs sm:text-sm text-[#221a18] placeholder:text-[#a08882] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#443a36] mb-1">
                        Email người đặt (nhận Thẻ QR dự phòng &amp; hóa đơn)
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="VD: ban.fpt@fe.edu.vn"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff8f6] border border-[#ebd5cf] text-xs sm:text-sm text-[#221a18] placeholder:text-[#a08882] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                      />
                    </div>

                    {/* Anonymous Checkbox */}
                    <div className="sm:col-span-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-[#fff8f6] p-2.5 rounded-xl border border-[#ebd5cf] w-full">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-4 h-4 rounded text-[#540114] focus:ring-[#540114] border-[#dcc0c0]"
                        />
                        <span className="text-xs text-[#540114] font-semibold">
                          🤫 Tặng quà ẩn danh (Secret Admirer — Không để lộ tên người gửi trên thiệp)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Step 2: Hẹn giờ & Địa điểm nhận tại Booth ĐH FPT */}
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#ebd5cf]">
                    <span className="w-5 h-5 rounded-full bg-[#934841] text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#540114]">
                      Hẹn Giờ &amp; Địa Điểm Nhận Hàng (Ngày 20/10)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Time Slot Radio Options */}
                    <div>
                      <label className="block text-xs font-bold text-[#443a36] mb-1.5">
                        Chọn khung giờ nhận quà tại trường:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          "08:30 - 10:00 (Sáng sớm - Vào ca)",
                          "10:00 - 12:00 (Giờ nghỉ trưa)",
                          "14:00 - 16:00 (Buổi chiều)",
                          "16:30 - 18:00 (Tan trường)",
                        ].map((slot) => (
                          <label
                            key={slot}
                            className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center gap-2 transition-all ${
                              timeSlot === slot
                                ? "bg-[#fff0ed] border-[#540114] text-[#540114] font-bold shadow-2xs"
                                : "bg-white border-[#ebd5cf] text-[#564243] hover:bg-[#fff8f6]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="timeSlot"
                              checked={timeSlot === slot}
                              onChange={() => setTimeSlot(slot)}
                              className="text-[#540114] focus:ring-[#540114]"
                            />
                            <span>{slot}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Location Options */}
                    <div>
                      <label className="block text-xs font-bold text-[#443a36] mb-1.5">
                        Địa điểm giao nhận tại ĐH FPT:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center gap-2 transition-all ${
                            deliveryType === "booth"
                              ? "bg-[#fff0ed] border-[#540114] text-[#540114] font-bold shadow-2xs"
                              : "bg-white border-[#ebd5cf] text-[#564243] hover:bg-[#fff8f6]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            checked={deliveryType === "booth"}
                            onChange={() => setDeliveryType("booth")}
                            className="text-[#540114] focus:ring-[#540114]"
                          />
                          <span>🏛️ Nhận tại Booth K&amp;P (Sảnh Alpha/Beta)</span>
                        </label>

                        <label
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center gap-2 transition-all ${
                            deliveryType === "classroom"
                              ? "bg-[#fff0ed] border-[#540114] text-[#540114] font-bold shadow-2xs"
                              : "bg-white border-[#ebd5cf] text-[#564243] hover:bg-[#fff8f6]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            checked={deliveryType === "classroom"}
                            onChange={() => setDeliveryType("classroom")}
                            className="text-[#540114] focus:ring-[#540114]"
                          />
                          <span>🚪 Giao tận phòng học / hội trường</span>
                        </label>
                      </div>

                      {deliveryType === "classroom" && (
                        <div className="mt-2 animate-in fade-in duration-200">
                          <input
                            type="text"
                            required
                            value={roomNote}
                            onChange={(e) => setRoomNote(e.target.value)}
                            placeholder="Nhập tòa nhà & số phòng học (VD: Tòa Alpha - Phòng 204, Ca 2)"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#fff8f6] border border-[#540114] text-xs text-[#221a18] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Phương thức thanh toán */}
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#ebd5cf]">
                    <span className="w-5 h-5 rounded-full bg-[#721a28] text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#540114]">
                      Phương Thức Thanh Toán
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer text-xs flex items-start gap-2.5 transition-all ${
                        paymentMethod === "cod"
                          ? "bg-[#fff0ed] border-[#540114] text-[#540114] shadow-2xs"
                          : "bg-white border-[#ebd5cf] text-[#564243] hover:bg-[#fff8f6]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-0.5 text-[#540114] focus:ring-[#540114]"
                      />
                      <div>
                        <span className="font-bold block">💵 Tiền mặt khi nhận (COD)</span>
                        <span className="text-[11px] text-[#705652]">Thanh toán trực tiếp tại Booth ngày 20/10</span>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer text-xs flex items-start gap-2.5 transition-all ${
                        paymentMethod === "vietqr"
                          ? "bg-[#fff0ed] border-[#540114] text-[#540114] shadow-2xs"
                          : "bg-white border-[#ebd5cf] text-[#564243] hover:bg-[#fff8f6]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "vietqr"}
                        onChange={() => setPaymentMethod("vietqr")}
                        className="mt-0.5 text-[#540114] focus:ring-[#540114]"
                      />
                      <div>
                        <span className="font-bold block">📱 Quét mã VietQR chuyển khoản</span>
                        <span className="text-[11px] text-[#705652]">Tiện lợi qua App ngân hàng / MoMo</span>
                      </div>
                    </label>
                  </div>

                  {/* Optional Note */}
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-[#443a36] mb-1">
                      Lời dặn dò thêm cho K&amp;P (tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="VD: Cột nơ màu đỏ rượu, dán kín phong bì giúp mình..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#fff8f6] border border-[#ebd5cf] text-xs text-[#221a18] placeholder:text-[#a08882] focus:outline-none focus:ring-1 focus:ring-[#540114]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-serif font-bold text-sm sm:text-base text-white shadow-lg transition-all transform flex items-center justify-center gap-2 ${
                      items.length === 0
                        ? "bg-stone-400 cursor-not-allowed"
                        : "bg-[#540114] hover:bg-[#721a28] hover:-translate-y-0.5 shadow-[#540114]/25 hover:shadow-xl active:scale-98"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#fea095]">
                      verified
                    </span>
                    <span>
                      {isSubmitting
                        ? "Đang lưu đơn hàng..."
                        : `XÁC NHẬN ĐẶT TRƯỚC (PRE-ORDER) • ${formatMoney(subtotal)}`}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>

                  <p className="text-[11px] text-[#897172] text-center mt-2">
                    🔒 Thông tin của bạn được bảo mật tuyệt đối • Hỗ trợ hủy/đổi lịch hẹn trước 19/10
                  </p>
                </div>

              </form>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
