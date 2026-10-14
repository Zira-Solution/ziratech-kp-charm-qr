"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full liquid-glass border-t border-white/80 relative overflow-hidden mt-12">
      {/* 3 Core Value Cards */}
      <div className="py-10 border-b border-white/50 bg-white/30 backdrop-blur-md">
        <div className="max-w-320 mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-5 liquid-glass-card rounded-2xl group">
            <span className="material-symbols-outlined text-primary text-3xl p-2.5 liquid-glass-pill rounded-2xl shrink-0 group-hover:scale-105 transition-transform border border-white/80">
              qr_code_2
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-primary">
                Quà Số Cá Nhân Hóa (QR &amp; PIN)
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Mỗi sản phẩm kèm 1 thẻ chứa mã QR &amp; mã ngắn dẫn tới trang quà số: lời chúc AI, voice note 2 phút, nhạc và album Polaroid.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 liquid-glass-card rounded-2xl group">
            <span className="material-symbols-outlined text-primary text-3xl p-2.5 liquid-glass-pill rounded-2xl shrink-0 group-hover:scale-105 transition-transform border border-white/80">
              pets
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-primary">
                Đồng Hành Cùng Các Bé
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Lợi nhuận từ mỗi món quà được dành ủng hộ thú cưng cơ nhỡ tại trạm cứu hộ <strong>Sân Nhà Nhiều Chó</strong> (Thanh Oai, Hà Nội).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 liquid-glass-card rounded-2xl group">
            <span className="material-symbols-outlined text-primary text-3xl p-2.5 liquid-glass-pill rounded-2xl shrink-0 group-hover:scale-105 transition-transform border border-white/80">
              school
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-primary">
                Độc Quyền Tại Đại Học FPT
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Nhận hàng duy nhất ngày <strong>20/10/2026</strong> tại bàn nhận trường FPT hoặc giao tận phòng học theo yêu cầu. Không ship ngoài trường.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-320 mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl liquid-glass-btn-primary text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-xl">pets</span>
              </div>
              <span className="font-serif text-xl font-bold text-primary">
                K&amp;P Atelier — SSG Project
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Dự án Phygital (Vật lý &amp; Số hóa) do nhóm sinh viên FPT thực hiện nhân ngày Phụ nữ Việt Nam 20/10/2026. Biến từng chiếc vòng tay và đóa hoa thủ công thành chiếc chìa khóa mở ra không gian kỷ niệm số ấm áp và nguồn cứu trợ cho động vật cơ nhỡ.
            </p>

            <div className="p-4 rounded-2xl liquid-glass-card text-xs text-on-surface-variant border border-white/80">
              <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
                <span className="material-symbols-outlined text-base">info</span>
                Lưu ý vòng đời quà số (Digital Expiry)
              </div>
              <p className="leading-relaxed">
                Hệ thống web quà số hoạt động đến hết <strong>31/10/2026</strong>. Sau đó máy chủ ngừng hoạt động và xóa dữ liệu trong 30 ngày. Người nhận có thể tải <strong>Bản lưu trữ offline (file HTML tự chứa kèm media)</strong> về máy để lưu giữ vĩnh viễn.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
              Khám Phá K&amp;P Atelier
            </h5>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <a href="#hero" className="hover:text-primary transition-colors">
                  Cổng mở thiệp quà tặng số
                </a>
              </li>
              <li>
                <a href="#digital-gift" className="hover:text-primary transition-colors">
                  Trải nghiệm Thẻ QR Quà Số
                </a>
              </li>
              <li>
                <a href="#showroom" className="hover:text-primary transition-colors">
                  Bộ sưu tập concept thiết kế
                </a>
              </li>
              <li>
                <a href="#showroom" className="hover:text-primary transition-colors">
                  Bàn thử nghiệm phối vòng charm
                </a>
              </li>
              <li>
                <a href="#charity-and-timeline" className="hover:text-primary transition-colors">
                  Sứ mệnh gây quỹ Sân Nhà Nhiều Chó
                </a>
              </li>
            </ul>
          </div>

          {/* Quy định & Hướng dẫn */}
          <div className="lg:col-span-4 space-y-3">
            <h5 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
              Trải Nghiệm &amp; Hỗ Trợ
            </h5>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <a href="#charity-and-timeline" className="hover:text-primary transition-colors">
                  Lịch trình trao quà ngày 20/10 tại FPT
                </a>
              </li>
              <li>
                <Link href="/create" className="hover:text-primary transition-colors">
                  Khu vực người mua: Tự tạo thiệp số
                </Link>
              </li>
              <li>
                <a href="#digital-gift" className="hover:text-primary transition-colors">
                  Bảo mật mã PIN 4 số chống xem lén
                </a>
              </li>
              <li>
                <a href="#digital-gift" className="hover:text-primary transition-colors">
                  Tải Bản lưu trữ HTML offline trọn đời
                </a>
              </li>
              <li>
                <a href="#charity-and-timeline" className="hover:text-primary transition-colors">
                  Đồng hành cùng trạm cứu trợ động vật
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-outline">
          <p>
            © 2026 K&amp;P Atelier. Dự án sinh viên vì cộng đồng FPT &amp; Sân Nhà Nhiều Chó.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="hover:text-primary cursor-pointer">Bảo mật dữ liệu cá nhân</span>
            <span>•</span>
            <span className="hover:text-primary cursor-pointer">Quy chế hoạt động</span>
            <span>•</span>
            <span className="text-primary font-semibold">Thanh Oai, Hà Nội</span>
            <span>•</span>
            <a
              href="/admin"
              className="text-secondary hover:text-primary inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
              title="Khu vực đăng nhập dành riêng cho ban tổ chức và nhân sự trực quầy"
            >
              <span className="material-symbols-outlined text-[13px]">lock</span>
              <span>Cổng Quản Trị / POS</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
