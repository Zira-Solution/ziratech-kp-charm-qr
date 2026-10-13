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

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    try {
      const cleanCode = orderCode.trim().toUpperCase();

      // 1. Check API for POS gift products
      const apiRes = await fetch(`/api/gifts/${cleanCode}`);
      const apiData = await apiRes.json();
      if (apiData.success && apiData.product) {
        const p = apiData.product;
        setFoundOrder({
          orderCode: p.token,
          recipientName: p.customerName,
          senderPhone: p.customerPhone || "Đã xác thực",
          deliveryLocation: "Nhận tại quầy K&P Atelier (ĐH FPT)",
          timeSlot: "Đã giao vòng vật lý tại quầy",
          orderStatus: p.status === "completed" ? "Đã giao" : "Đã xác nhận",
          paymentStatus: p.paymentMethod === "transfer" ? "Đã thanh toán (CK QR)" : "Đã thanh toán (Tiền mặt)",
          totalPrice: p.totalPrice,
          charityAmount: Math.floor(p.totalPrice * 0.4),
          items: [{ title: `${p.chainName} (${p.charms.length} charm)` }],
          token: p.token,
          isPosProduct: true,
          status: p.status,
        });
        return;
      }

      // 2. Check localStorage
      const existingOrders = JSON.parse(localStorage.getItem("kp_orders") || "[]");
      const matched = existingOrders.find(
        (o: any) =>
          o.orderCode.trim().toUpperCase() === cleanCode &&
          (!phone.trim() || o.senderPhone.trim() === phone.trim())
      );

      if (matched) {
        setFoundOrder(matched);
      } else {
        if (cleanCode.startsWith("KP-")) {
          setFoundOrder({
            orderCode: cleanCode,
            recipientName: "Khách hàng FPT",
            senderPhone: phone || "09xxxx",
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
          className="absolute top-4 right-4 w-8 h-8 rounded-full liquid-glass-pill hover:bg-white text-primary flex items-center justify-center transition-colors cursor-pointer border border-white/80"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-2xl">search</span>
          <h3 className="font-serif text-lg font-bold text-primary">
            Tra Cứu Tiến Độ Đơn Quà 20/10
          </h3>
        </div>

        <p className="text-xs text-on-surface-variant mb-4">
          Nhập mã đơn hàng và số điện thoại đã đăng ký để kiểm tra tiến độ chế tác vòng và in thẻ QR.
        </p>

        <form onSubmit={handleLookup} className="space-y-3">
          <div>
            <label className="text-xs text-on-surface-variant font-semibold block mb-1">
              Mã đơn hàng (VD: KP-2010-8492):
            </label>
            <input
              type="text"
              required
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="KP-2010-XXXX"
              className="w-full px-3 py-2 rounded-xl liquid-glass-input text-xs font-mono uppercase text-on-surface focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant font-semibold block mb-1">
              Số điện thoại người đặt:
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XXXXXXXX"
              className="w-full px-3 py-2 rounded-xl liquid-glass-input text-xs text-on-surface focus:outline-none"
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
                  <span className="font-mono font-bold text-primary">
                    {foundOrder.orderCode}
                  </span>
                  <span className="px-3 py-0.5 rounded-full liquid-glass-pill text-primary font-bold text-[10px] border border-white/80">
                    {foundOrder.paymentStatus}
                  </span>
                </div>

                {/* State Machine Steps */}
                <div className="py-2">
                  <span className="text-[10px] text-outline font-semibold block mb-2">
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
                        <span className={st.active ? "text-primary font-bold" : "text-outline"}>
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 liquid-glass-card rounded-2xl space-y-1 text-on-surface-variant border border-white/80">
                  <p>👤 <strong>Người nhận:</strong> {foundOrder.recipientName}</p>
                  <p>📍 <strong>Vị trí:</strong> {foundOrder.deliveryLocation}</p>
                  <p>⏰ <strong>Khung giờ:</strong> {foundOrder.timeSlot}</p>
                  <p>🐾 <strong>Gây quỹ:</strong> Bạn đã góp vào ~{foundOrder.totalMeals || Math.max(1, Math.round((foundOrder.charityAmount || 20000) / 10000))} bữa ăn cho các bé tại Sân Nhà Nhiều Chó</p>
                </div>

                {foundOrder.isPosProduct && (
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={`/create/${foundOrder.token}`}
                      target="_blank"
                      className="flex-1 py-2.5 rounded-xl liquid-glass-btn-primary text-white text-center text-xs font-bold font-serif shadow-xs"
                    >
                      ✏️ Tự Tay Tạo Thiệp Số
                    </a>
                    {foundOrder.status === "completed" && (
                      <a
                        href={`/g/${foundOrder.token}`}
                        target="_blank"
                        className="flex-1 py-2.5 rounded-xl liquid-glass-btn-secondary text-primary text-center text-xs font-bold font-serif border border-white/90 shadow-xs"
                      >
                        💌 Xem Thiệp Số
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 liquid-glass-card rounded-2xl text-center text-xs text-on-secondary-fixed-variant border border-white/80">
                Không tìm thấy đơn hàng phù hợp. Vui lòng kiểm tra lại mã đơn và số điện thoại!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
