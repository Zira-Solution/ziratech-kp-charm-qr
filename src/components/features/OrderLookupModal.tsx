"use client";

import React, { useState } from "react";

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderLookupModal({ isOpen, onClose }: OrderLookupModalProps) {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    try {
      const existingOrders = JSON.parse(localStorage.getItem("kp_orders") || "[]");
      const matched = existingOrders.find(
        (o: any) =>
          o.orderCode.trim().toUpperCase() === orderCode.trim().toUpperCase() &&
          o.senderPhone.trim() === phone.trim()
      );

      if (matched) {
        setFoundOrder(matched);
      } else {
        // If searching a mock code or not in local storage, provide an example demo result if matches format
        if (orderCode.trim().toUpperCase().startsWith("KP-")) {
          setFoundOrder({
            orderCode: orderCode.toUpperCase(),
            recipientName: "Bạn học FPT",
            senderPhone: phone,
            deliveryLocation: "Bàn sảnh trung tâm tòa Beta",
            timeSlot: "10:00 - 12:00 (Sáng 20/10/2026)",
            orderStatus: "Đã xác nhận",
            paymentStatus: "Đã thanh toán (VietQR)",
            totalPrice: 59000,
            charityAmount: 31000,
            items: [{ title: "Vòng Tay Bạc Ý Charm Trái Tim & Quà Số" }],
          });
        } else {
          setFoundOrder(null);
        }
      }
    } catch (err) {
      console.error(err);
      setFoundOrder(null);
    }
  };

  const steps = [
    { label: "Đã đặt", active: true },
    { label: "Đã xác nhận", active: true },
    { label: "Đang chuẩn bị", active: foundOrder?.orderStatus === "Đang chuẩn bị" || foundOrder?.orderStatus === "Sẵn sàng giao" || foundOrder?.orderStatus === "Đã giao" },
    { label: "Sẵn sàng giao", active: foundOrder?.orderStatus === "Sẵn sàng giao" || foundOrder?.orderStatus === "Đã giao" },
    { label: "Đã giao", active: foundOrder?.orderStatus === "Đã giao" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="liquid-glass rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-white/90 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full liquid-glass-pill hover:bg-white text-[#540114] flex items-center justify-center transition-colors cursor-pointer border border-white/80"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#540114] text-[24px]">search</span>
          <h3 className="font-serif text-lg font-bold text-[#540114]">
            Tra Cứu Tiến Độ Đơn Quà 20/10
          </h3>
        </div>

        <p className="text-xs text-[#564243] mb-4">
          Nhập mã đơn hàng và số điện thoại đã đăng ký để kiểm tra tiến độ chế tác vòng và in thẻ QR.
        </p>

        <form onSubmit={handleLookup} className="space-y-3">
          <div>
            <label className="text-xs text-[#564243] font-semibold block mb-1">
              Mã đơn hàng (VD: KP-2010-8492):
            </label>
            <input
              type="text"
              required
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="KP-2010-XXXX"
              className="w-full px-3 py-2 rounded-xl liquid-glass-input text-xs font-mono uppercase text-[#221a18] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#564243] font-semibold block mb-1">
              Số điện thoại người đặt:
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XXXXXXXX"
              className="w-full px-3 py-2 rounded-xl liquid-glass-input text-xs text-[#221a18] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="liquid-glass-btn-primary w-full py-2.5 rounded-full text-white text-xs font-semibold shadow-md cursor-pointer"
          >
            Tra Cứu Đơn
          </button>
        </form>

        {/* Results */}
        {searched && (
          <div className="mt-5 pt-4 border-t border-white/60">
            {foundOrder ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#540114]">
                    {foundOrder.orderCode}
                  </span>
                  <span className="px-3 py-0.5 rounded-full liquid-glass-pill text-[#540114] font-bold text-[10px] border border-white/80">
                    {foundOrder.paymentStatus}
                  </span>
                </div>

                {/* State Machine Steps */}
                <div className="py-2">
                  <span className="text-[10px] text-[#897172] font-semibold block mb-2">
                    Tiến độ đơn hàng (State Machine):
                  </span>
                  <div className="flex items-center justify-between text-[9px] font-semibold">
                    {steps.map((st, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center mb-1 text-[8px] ${
                            st.active
                              ? "liquid-glass-btn-primary text-white font-bold"
                              : "bg-black/20 text-white"
                          }`}
                        >
                          ✓
                        </div>
                        <span className={st.active ? "text-[#540114] font-bold" : "text-[#897172]"}>
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 liquid-glass-card rounded-2xl space-y-1 text-[#564243] border border-white/80">
                  <p>👤 <strong>Người nhận:</strong> {foundOrder.recipientName}</p>
                  <p>📍 <strong>Vị trí:</strong> {foundOrder.deliveryLocation}</p>
                  <p>⏰ <strong>Khung giờ:</strong> {foundOrder.timeSlot}</p>
                  <p>🐾 <strong>Gây quỹ:</strong> Bạn đã góp vào ~{foundOrder.totalMeals || Math.max(1, Math.round((foundOrder.charityAmount || 20000) / 10000))} bữa ăn cho các bé tại Sân Nhà Nhiều Chó</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 liquid-glass-card rounded-2xl text-center text-xs text-[#76322b] border border-white/80">
                Không tìm thấy đơn hàng phù hợp. Vui lòng kiểm tra lại mã đơn và số điện thoại!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
