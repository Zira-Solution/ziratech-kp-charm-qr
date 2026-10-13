"use client";

import React, { useState } from "react";

interface PreorderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onRemoveItem: (index: number) => void;
  onOrderSuccess: (orderData: any) => void;
}

export default function PreorderDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onOrderSuccess,
}: PreorderDrawerProps) {
  // Form state according to Spec Section 6.2
  const [recipientName, setRecipientName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 - 12:00 (Sáng 20/10)");
  const [qrMethod, setQrMethod] = useState<"print" | "email">("print");
  const [deliveryLocation, setDeliveryLocation] = useState("desk"); // desk or classroom
  const [roomNote, setRoomNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vietqr">("cod");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [pinCode, setPinCode] = useState("");

  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || item.price || 0), 0);
  const totalCharity = items.reduce(
    (sum, item) => sum + (item.charityAmount || Math.round((item.price || 0) * 0.5)),
    0
  );
  const totalMeals = items.reduce(
    (sum, item) => sum + (item.meals || Math.max(1, Math.round((item.charityAmount || (item.price || 0) * 0.4) / 10000))),
    0
  );

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + "₫";
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      alert("Vui lòng nhập tên người nhận quà!");
      return;
    }
    if (!senderPhone.trim() || senderPhone.length < 9) {
      alert("Vui lòng nhập số điện thoại người đặt hợp lệ để đối soát đơn!");
      return;
    }
    if (qrMethod === "email" && !senderEmail.trim()) {
      alert("Vui lòng nhập email để hệ thống gửi Thẻ QR và link mở quà!");
      return;
    }

    // Generate Order Code according to Spec: KP-2010-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `KP-2010-${randomSuffix}`;

    const orderData = {
      orderCode,
      createdAt: new Date().toISOString(),
      recipientName,
      senderPhone,
      senderEmail,
      timeSlot,
      qrMethod,
      deliveryLocation: deliveryLocation === "desk" ? "Bàn sảnh trung tâm ĐH FPT" : `Tòa/Phòng: ${roomNote}`,
      paymentMethod,
      isAnonymous,
      pinCode,
      items,
      totalPrice: subtotal,
      charityAmount: totalCharity,
      totalMeals,
      orderStatus: "Đã đặt",
      paymentStatus: paymentMethod === "cod" ? "Chờ thu tiền (20/10)" : "Chờ chuyển khoản (VietQR)",
    };

    // Save to localStorage for Lookup feature
    try {
      const existingOrders = JSON.parse(localStorage.getItem("kp_orders") || "[]");
      existingOrders.unshift(orderData);
      localStorage.setItem("kp_orders", JSON.stringify(existingOrders));
    } catch (err) {
      console.error(err);
    }

    setConfirmedOrder(orderData);
    setStep("confirmed");
    onOrderSuccess(orderData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex justify-end transition-opacity duration-300">
      <div className="relative w-full max-w-lg liquid-glass h-full shadow-[0_25px_60px_rgba(84,1,20,0.3)] border-l-2 border-white/90 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 liquid-glass border-b border-white/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">
              shopping_bag
            </span>
            <div>
              <h3 className="font-serif text-base font-bold text-primary">
                {step === "form" ? "Đơn Đặt Trước 20/10 Tại ĐH FPT" : "Xác Nhận Đơn Hàng Thành Công"}
              </h3>
              <span className="text-[10px] text-outline">
                {step === "form" ? "Hạn chót đóng đặt hàng: 18/10/2026" : `Mã đơn: ${confirmedOrder?.orderCode}`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass-pill hover:bg-white text-primary flex items-center justify-center transition-colors cursor-pointer border border-white/80"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {step === "form" ? (
            <>
              {/* Product items in preorder */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  Sản phẩm trong đơn ({items.length})
                </span>

                {items.length === 0 ? (
                  <div className="p-6 rounded-2xl liquid-glass border border-white/80 text-center">
                    <span className="material-symbols-outlined text-outline text-4xl mb-2">
                      remove_shopping_cart
                    </span>
                    <p className="text-xs text-on-surface-variant">Chưa có món quà nào trong đơn.</p>
                    <p className="text-[11px] text-outline mt-1">
                      Hãy chọn mẫu sẵn hoặc tự phối vòng ở Bàn Xưởng!
                    </p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl liquid-glass-card border border-white/85 shadow-sm flex items-start justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-primary">
                          {item.title || item.name}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {item.charms?.length
                            ? `${item.charms.length} charm: ${item.charms.map((c: any) => c.name).join(", ")}`
                            : item.desc}
                        </p>
                        {item.message && (
                          <p className="text-[10px] text-outline italic mt-1 line-clamp-1">
                            Thiệp QR: "{item.message}"
                          </p>
                        )}
                        <span className="inline-block mt-1 text-[10px] text-on-secondary-fixed-variant bg-secondary-fixed px-2.5 py-0.5 rounded-full font-semibold border border-white/60">
                          🐾 Góp ~{item.meals || Math.max(1, Math.round((item.charityAmount || item.price * 0.4) / 10000))} bữa ăn cho các bé
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-serif text-sm font-bold text-primary">
                          {formatMoney(item.totalPrice || item.price)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="text-outline hover:text-primary text-[11px] font-semibold cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form Input fields strictly complying with Spec Section 6.2 */}
              {items.length > 0 && (
                <form id="preorder-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
                  <div className="p-4.5 rounded-2xl liquid-glass border border-white/85 space-y-3 shadow-xs">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                      Thông Tin Nhận Quà Tại FPT
                    </span>

                    {/* Recipient Name */}
                    <div>
                      <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                        Tên người nhận quà (bắt buộc):
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="VD: Nguyễn Ngọc Anh"
                        className="w-full px-3 py-2 rounded-xl liquid-glass-input text-xs text-on-surface focus:outline-none"
                      />
                    </div>

                    {/* Sender Phone */}
                    <div>
                      <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                        Số điện thoại người đặt (bắt buộc để đối soát):
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="VD: 0987654321"
                        className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Time Slot on 20/10 */}
                    <div>
                      <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                        Khung giờ nhận ngày 20/10/2026:
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="08:00 - 10:00 (Sáng 20/10)">
                          08:00 - 10:00 (Sáng 20/10) - Còn 12 suất
                        </option>
                        <option value="10:00 - 12:00 (Sáng 20/10)">
                          10:00 - 12:00 (Sáng 20/10) - Còn 8 suất
                        </option>
                        <option value="13:00 - 15:00 (Chiều 20/10)">
                          13:00 - 15:00 (Chiều 20/10) - Còn 15 suất
                        </option>
                        <option value="15:00 - 17:30 (Chiều 20/10)">
                          15:00 - 17:30 (Chiều 20/10) - Còn 20 suất
                        </option>
                      </select>
                    </div>

                    {/* Delivery Location within FPT */}
                    <div>
                      <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                        Địa điểm giao nhận trong trường:
                      </label>
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryLocation("desk")}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            deliveryLocation === "desk"
                              ? "bg-primary text-white border-primary"
                              : "bg-brand-bg text-on-surface-variant border-outline-variant"
                          }`}
                        >
                          Bàn nhận sảnh trung tâm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryLocation("classroom")}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            deliveryLocation === "classroom"
                              ? "bg-primary text-white border-primary"
                              : "bg-brand-bg text-on-surface-variant border-outline-variant"
                          }`}
                        >
                          Giao tận phòng/lớp
                        </button>
                      </div>

                      {deliveryLocation === "classroom" && (
                        <input
                          type="text"
                          required
                          value={roomNote}
                          onChange={(e) => setRoomNote(e.target.value)}
                          placeholder="VD: Phòng 302 tòa Beta, lớp SE1801"
                          className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-outline-variant text-xs text-on-surface focus:outline-none"
                        />
                      )}
                    </div>

                    {/* QR Issuance Method (Spec Section 3.2) */}
                    <div>
                      <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                        Hình thức phát hành Thẻ QR thông minh:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          onClick={() => setQrMethod("print")}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs ${
                            qrMethod === "print"
                              ? "bg-surface-container-low border-primary font-bold text-primary"
                              : "bg-brand-bg border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          Phương án B: In thẻ cứng kẹp hộp quà
                        </div>
                        <div
                          onClick={() => setQrMethod("email")}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs ${
                            qrMethod === "email"
                              ? "bg-surface-container-low border-primary font-bold text-primary"
                              : "bg-brand-bg border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          Phương án C: Gửi ảnh QR qua Email
                        </div>
                      </div>

                      {qrMethod === "email" && (
                        <input
                          type="email"
                          required
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="Nhập email của bạn để nhận mã QR..."
                          className="w-full mt-2 px-3 py-2 rounded-xl bg-brand-bg border border-outline-variant text-xs text-on-surface focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Payment Method (Spec Section 6.3) */}
                    <div>
                      <label className="text-xs text-on-surface-variant font-semibold block mb-1">
                        Phương thức thanh toán:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cod")}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left ${
                            paymentMethod === "cod"
                              ? "bg-surface-container-low border-primary text-primary"
                              : "bg-brand-bg border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          💵 Tiền mặt khi nhận (COD 20/10)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("vietqr")}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left ${
                            paymentMethod === "vietqr"
                              ? "bg-surface-container-low border-primary text-primary"
                              : "bg-brand-bg border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          📲 Chuyển khoản VietQR
                        </button>
                      </div>
                    </div>

                    {/* Options: Anonymous & PIN */}
                    <div className="pt-2 border-t border-outline-variant/30 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded accent-primary"
                        />
                        <span>Ẩn danh người tặng (Người nhận không thấy tên người gửi)</span>
                      </label>
                    </div>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Order Confirmed Screen */
            <div className="p-4 rounded-2xl bg-white border border-outline-variant/50 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container text-primary flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-4xl">verified</span>
              </div>

              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">
                  Đã Lưu Đơn Đặt Trước Thành Công!
                </span>
                <h3 className="font-serif text-xl font-bold text-primary mt-1">
                  Mã Đơn: {confirmedOrder.orderCode}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Hãy lưu lại mã đơn và số điện thoại <strong>{confirmedOrder.senderPhone}</strong> để tra cứu tiến độ.
                </p>
              </div>

              {/* VietQR Demo if selected */}
              {confirmedOrder.paymentMethod === "vietqr" && (
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 text-center">
                  <span className="text-xs font-bold text-primary block mb-2">
                    Mã QR Chuyển Khoản Đối Soát
                  </span>
                  <div className="w-40 h-40 bg-white rounded-xl mx-auto p-2 border border-outline-variant flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[64px] text-primary">
                      qr_code_2
                    </span>
                    <span className="text-[9px] font-mono text-outline">
                      VIETQR • {confirmedOrder.orderCode}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-on-surface-variant space-y-0.5">
                    <p>Số tiền: <strong>{formatMoney(confirmedOrder.totalPrice)}</strong></p>
                    <p>Nội dung CK: <strong className="font-mono text-primary">{confirmedOrder.orderCode}</strong></p>
                    <p className="text-[10px] text-outline italic">
                      Admin sẽ đối chiếu và đánh dấu "Đã thanh toán" trước ngày 18/10.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-surface-container rounded-xl text-left text-xs space-y-1 text-on-surface-variant">
                <p>📍 <strong>Địa điểm nhận:</strong> {confirmedOrder.deliveryLocation}</p>
                <p>⏰ <strong>Khung giờ:</strong> {confirmedOrder.timeSlot}</p>
                <p>🐾 <strong>Gây quỹ:</strong> Bạn đã góp vào ~{confirmedOrder.totalMeals || totalMeals} bữa ăn cho các bé tại Sân Nhà Nhiều Chó</p>
              </div>

              <button
                onClick={() => {
                  setStep("form");
                  onClose();
                }}
                className="w-full py-3 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors"
              >
                Hoàn tất &amp; Đóng
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step === "form" && items.length > 0 && (
          <div className="p-5 liquid-glass border-t border-white/70 space-y-3">
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Tạm tính ({items.length} món):</span>
              <span className="font-bold text-on-surface">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-primary font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">pets</span>
                Đóng góp trạm cứu hộ:
              </span>
              <span>Góp ~{totalMeals} bữa ăn cho các bé 🐾</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/60">
              <span className="font-serif text-base font-bold text-primary">
                Tổng thanh toán:
              </span>
              <span className="font-serif text-xl font-bold text-primary">
                {formatMoney(subtotal)}
              </span>
            </div>

            <button
              type="submit"
              form="preorder-form"
              className="liquid-glass-btn-primary w-full py-3.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">verified</span>
              Xác Nhận Đặt Trước 20/10
            </button>
            <p className="text-[10px] text-center text-outline">
              Độc quyền sinh viên &amp; cán bộ ĐH FPT • Không phát sinh phụ phí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
