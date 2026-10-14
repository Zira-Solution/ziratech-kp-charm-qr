"use client";

import React, { useState } from "react";

const field =
  "w-full px-5 py-3.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-full focus:border-primary focus:outline-none focus:ring-2 focus:ring-tertiary text-primary text-sm shadow-inner";

const SLOTS = [
  "08:30 – 10:00 (Buổi sáng)",
  "10:00 – 12:00 (Giờ giải lao trưa)",
  "13:30 – 15:30 (Đầu giờ chiều)",
  "15:30 – 17:30 (Cuối buổi chiều)",
];

export default function Preorder() {
  const [notice, setNotice] = useState(false);

  // Online flower orders are not collected yet, so the form must not claim an order was recorded.
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(true);
  };

  return (
    <section className="py-20 px-6 relative" id="preorder">
      <div className="max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-2xl rounded-[38px] p-6 sm:p-8 lg:p-12 border border-white/90 shadow-liquid-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/70 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-xs font-bold mb-2 shadow-xs border border-white/20">
                <span className="material-symbols-outlined text-[14px]">local_florist</span>
                <span>Đặt Trước Hoa Tươi 20/10</span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl text-primary font-bold">Biểu Mẫu Giữ Hoa Sinh Viên FPTU</h2>
            </div>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full text-primary font-sans text-xs font-bold border border-white/80 shadow-xs self-start md:self-auto">
              <span className="material-symbols-outlined text-[17px] text-secondary-dark">alarm</span>
              <span>Hạn chót: trước 23:59 ngày 18/10</span>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs flex items-start gap-3 mb-8">
            <span className="material-symbols-outlined text-secondary-dark text-2xl mt-0.5">info</span>
            <div className="font-sans text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-primary font-semibold">Quy định giao nhận:</strong> Toàn bộ hoa tươi đặt trước sẽ được phát{" "}
              <strong className="text-primary">trực tiếp tại sảnh lầu 2, FPT University</strong> trong ngày 20/10. K&amp;P Atelier cam kết giữ form hoa tươi mới nhất và không thu thập địa chỉ ship ngoài khuôn viên.
            </div>
          </div>

          <form className="space-y-6" onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs text-neutral font-semibold mb-2" htmlFor="po-name">
                  Họ và tên người đặt *
                </label>
                <input className={field} id="po-name" placeholder="Nguyễn Văn A" required type="text" />
              </div>
              <div>
                <label className="block font-sans text-xs text-neutral font-semibold mb-2" htmlFor="po-contact">
                  Số điện thoại / MSSV FPT *
                </label>
                <input className={field} id="po-contact" placeholder="0987 654 321 hoặc HE17xxxx" required type="text" />
              </div>
            </div>

            <fieldset>
              <legend className="block font-sans text-xs text-neutral font-semibold mb-2">Chọn loại hoa đặt trước *</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Hoa lẻ tinh tế (40.000 – 70.000đ)", sub: "Mã QR thiệp số gửi qua email", checked: true },
                  { title: "Hoa bó kết tay (40.000 – 70.000đ)", sub: "Phối hoa nhập, bọc giấy mỹ thuật" },
                ].map((o) => (
                  <label
                    key={o.title}
                    className="relative flex items-center p-4 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-xl cursor-pointer hover:bg-white/80 hover:border-primary/50 transition-all shadow-xs"
                  >
                    <input className="accent-primary w-4 h-4" name="flower_choice" type="radio" defaultChecked={o.checked} />
                    <span className="ml-3">
                      <span className="font-sans text-sm text-primary font-bold block">{o.title}</span>
                      <span className="text-xs text-on-surface-variant">{o.sub}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs text-neutral font-semibold mb-2" htmlFor="po-slot">
                  Khung giờ nhận tại sảnh lầu 2 ngày 20/10 *
                </label>
                <select className={field} id="po-slot">
                  {SLOTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs text-neutral font-semibold mb-2" htmlFor="po-note">
                  Nội dung ghi chú ngắn trên thiệp
                </label>
                <input className={field} id="po-note" placeholder="Để lại lời nhắn in sẵn nếu cần..." type="text" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary-dark">verified_user</span>
                <span>Xác nhận không thu phí cọc trước, nhận hoa thanh toán tại quầy</span>
              </div>
              <button
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-sm font-bold shadow-pill border border-white/25 hover:from-[#5e131f] hover:to-[#721a28] active:scale-[0.98] transition-all"
                type="submit"
              >
                Đặt trước ngay
              </button>
            </div>

            {notice && (
              <p role="status" className="p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs leading-relaxed">
                Biểu mẫu đặt trước online chưa mở nhận đơn nên thông tin bạn vừa nhập chưa được lưu. Hãy ghé gian hàng ở sảnh lầu 2 FPTU để đặt hoa trực tiếp nhé.
              </p>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-white/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 opacity-60 bg-white/40 backdrop-blur-md p-4 rounded-3xl sm:rounded-full border border-white/50">
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-outline">history_toggle_off</span>
              <span className="font-sans text-xs text-on-surface-variant italic">Minh họa trạng thái sau 23:59 ngày 18/10:</span>
            </div>
            <button
              className="px-5 py-2 rounded-full bg-white/50 text-on-surface-variant font-sans text-xs font-semibold cursor-not-allowed border border-white/40"
              disabled
              type="button"
            >
              Đã hết hạn đặt trước hoa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
