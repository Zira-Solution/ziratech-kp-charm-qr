"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full liquid-glass border-t border-white/80 relative overflow-hidden mt-12">
      {/* 3 Core Value Cards */}
      <div className="py-10 border-b border-white/50 bg-white/30 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-5 liquid-glass-card rounded-2xl group">
            <span className="material-symbols-outlined text-[#540114] text-[30px] p-2.5 liquid-glass-pill rounded-2xl shrink-0 group-hover:scale-105 transition-transform border border-white/80">
              qr_code_2
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-[#540114]">
                Quà Số Cá Nhân Hóa (QR &amp; PIN)
              </h4>
              <p className="text-xs text-[#564243] mt-1 leading-relaxed">
                Mỗi sản phẩm kèm 1 thẻ chứa mã QR &amp; mã ngắn dẫn tới trang quà số: lời chúc AI, voice note 2 phút, nhạc và album Polaroid.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 liquid-glass-card rounded-2xl group">
            <span className="material-symbols-outlined text-[#540114] text-[30px] p-2.5 liquid-glass-pill rounded-2xl shrink-0 group-hover:scale-105 transition-transform border border-white/80">
              pets
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-[#540114]">
                Góp Bữa Ăn Cho Các Bé
              </h4>
              <p className="text-xs text-[#564243] mt-1 leading-relaxed">
                Mỗi món quà bạn đặt trước là bạn đã góp vào các bữa ăn no cho thú cưng cơ nhỡ tại trạm cứu hộ <strong>Sân Nhà Nhiều Chó</strong> (Thanh Oai, Hà Nội).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 liquid-glass-card rounded-2xl group">
            <span className="material-symbols-outlined text-[#540114] text-[30px] p-2.5 liquid-glass-pill rounded-2xl shrink-0 group-hover:scale-105 transition-transform border border-white/80">
              school
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-[#540114]">
                Độc Quyền Tại Đại Học FPT
              </h4>
              <p className="text-xs text-[#564243] mt-1 leading-relaxed">
                Nhận hàng duy nhất ngày <strong>20/10/2026</strong> tại bàn nhận trường FPT hoặc giao tận phòng học theo yêu cầu. Không ship ngoài trường.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl liquid-glass-btn-primary text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">pets</span>
              </div>
              <span className="font-serif text-xl font-bold text-[#540114]">
                K&amp;P Atelier — SSG Project
              </span>
            </div>

            <p className="text-xs text-[#564243] leading-relaxed">
              Dự án Phygital (Vật lý &amp; Số hóa) do nhóm sinh viên FPT thực hiện nhân ngày Phụ nữ Việt Nam 20/10/2026. Biến từng chiếc vòng tay và đóa hoa thủ công thành chiếc chìa khóa mở ra không gian kỷ niệm số ấm áp và nguồn cứu trợ cho động vật cơ nhỡ.
            </p>

            <div className="p-4 rounded-2xl liquid-glass-card text-xs text-[#564243] border border-white/80">
              <div className="flex items-center gap-1.5 font-bold text-[#540114] mb-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Lưu ý vòng đời quà số (Digital Expiry)
              </div>
              <p className="leading-relaxed">
                Hệ thống web quà số hoạt động đến hết <strong>31/10/2026</strong>. Sau đó máy chủ ngừng hoạt động và xóa dữ liệu trong 30 ngày. Người nhận có thể tải <strong>Bản lưu trữ offline (file HTML tự chứa kèm media)</strong> về máy để lưu giữ vĩnh viễn.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-serif text-sm font-bold text-[#540114] uppercase tracking-wider">
              Khám Phá Quà 20/10
            </h5>
            <ul className="space-y-2 text-xs text-[#564243]">
              <li>
                <a href="#digital-gift" className="hover:text-[#540114] transition-colors">
                  Trải nghiệm Thẻ QR Quà Số
                </a>
              </li>
              <li>
                <a href="#customizer-workspace" className="hover:text-[#540114] transition-colors">
                  Bàn tự phối vòng &amp; charm
                </a>
              </li>
              <li>
                <a href="#recipient-guide" className="hover:text-[#540114] transition-colors">
                  Gợi ý quà cho Nàng / Mẹ / Bạn
                </a>
              </li>
              <li>
                <a href="#collections" className="hover:text-[#540114] transition-colors">
                  Bộ sưu tập phối sẵn (49k-69k)
                </a>
              </li>
              <li>
                <a href="#charity-mission" className="hover:text-[#540114] transition-colors">
                  Báo cáo bữa ăn Sân Nhà Nhiều Chó
                </a>
              </li>
            </ul>
          </div>

          {/* Quy định & Hướng dẫn */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-serif text-sm font-bold text-[#540114] uppercase tracking-wider">
              Quy Trình &amp; Hỗ Trợ
            </h5>
            <ul className="space-y-2 text-xs text-[#564243]">
              <li>
                <a href="#fpt-fulfillment" className="hover:text-[#540114] transition-colors">
                  Khung giờ nhận ngày 20/10 tại FPT
                </a>
              </li>
              <li>
                <a href="#fpt-fulfillment" className="hover:text-[#540114] transition-colors">
                  Hình thức thẻ QR (In / Email)
                </a>
              </li>
              <li>
                <a href="#customizer-workspace" className="hover:text-[#540114] transition-colors">
                  Bảo mật mã PIN 4 số
                </a>
              </li>
              <li>
                <a href="#digital-gift" className="hover:text-[#540114] transition-colors">
                  Hướng dẫn tải Bản lưu trữ offline
                </a>
              </li>
              <li>
                <a href="#charity-mission" className="hover:text-[#540114] transition-colors">
                  Trao tặng bữa ăn &amp; chăm sóc trạm cứu hộ
                </a>
              </li>
            </ul>
          </div>

          {/* Thông tin sự kiện */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-serif text-sm font-bold text-[#540114] uppercase tracking-wider">
              Chiến Dịch 20/10/2026
            </h5>
            <div className="p-4 rounded-2xl liquid-glass-card space-y-2 text-xs text-[#564243] border border-white/80">
              <div className="flex items-center gap-2 text-[#540114] font-semibold">
                <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                Địa điểm: Khuôn viên Đại học FPT
              </div>
              <p className="text-[11px] leading-relaxed">
                Hạn chót đặt trước: <strong>23:59 ngày 18/10/2026</strong>. Sau hạn chót, hệ thống đóng đặt hàng để hoàn thiện vòng và in thẻ.
              </p>
              <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px]">
                <span>Thanh toán:</span>
                <span className="font-bold text-[#540114]">COD 20/10 / VietQR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#897172]">
          <p>
            © 2026 K&amp;P Atelier. Dự án sinh viên vì cộng đồng FPT &amp; Sân Nhà Nhiều Chó.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="hover:text-[#540114] cursor-pointer">Bảo mật dữ liệu cá nhân</span>
            <span>•</span>
            <span className="hover:text-[#540114] cursor-pointer">Quy chế hoạt động</span>
            <span>•</span>
            <span className="text-[#540114] font-semibold">Thanh Oai, Hà Nội</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
