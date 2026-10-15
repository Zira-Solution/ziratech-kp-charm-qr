import React from "react";
import Link from "next/link";

export function ClosingBanner() {
  return (
    <section className="bg-linear-to-r from-[#721a28] via-[#8c2233] to-[#721a28] text-white py-14 px-6 text-center border-t border-white/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-3 relative z-10">
        <span className="material-symbols-outlined text-3xl text-tertiary">favorite</span>
        <h3 className="font-headline text-2xl sm:text-3xl italic text-white">
          &quot;Cùng K&amp;P Atelier mang lại một ngày 20/10 ngọt ngào và ấm áp.&quot;
        </h3>
        <p className="font-sans text-xs text-white/80">
          Cảm ơn bạn đã lắng nghe câu chuyện của xưởng thủ công sinh viên FPT University và những người bạn bốn chân.
        </p>
      </div>
    </section>
  );
}

const linkClass = "text-white/70 hover:text-tertiary transition-colors text-xs";

export default function HomeFooter() {
  return (
    <footer className="w-full py-16 px-6 sm:px-12 bg-neutral text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="flex flex-col space-y-4">
            <span className="font-headline text-2xl text-white font-bold tracking-tight">K&amp;P Atelier</span>
            <p className="font-sans text-xs text-white/70 leading-relaxed">
              Dự án gây quỹ thiện nguyện 20/10 bởi sinh viên FPT University đồng hành cùng trạm cứu hộ Sân Nhà Nhiều Chó.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="material-symbols-outlined text-[16px] text-tertiary">pin_drop</span>
              <span>Sảnh lầu 2, FPT University Hà Nội</span>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <span className="font-sans text-xs text-white uppercase tracking-wider font-bold">Khám phá</span>
            <a className={linkClass} href="#hero">Câu chuyện xưởng K&amp;P</a>
            <a className={linkClass} href="#preorder">Điểm nhận quà tại FPTU</a>
            <a className={linkClass} href="#keepsake">Hướng dẫn mã QR kỷ niệm</a>
            <a className={linkClass} href="#shelter">Báo cáo quỹ minh bạch</a>
          </div>

          <div className="flex flex-col space-y-3">
            <span className="font-sans text-xs text-white uppercase tracking-wider font-bold">Hỗ trợ sinh viên</span>
            <Link className={linkClass} href="/gift">Tạo thiệp quà (người mua)</Link>
            <a className={linkClass} href="#preorder">Điều khoản đơn hàng</a>
            <span className="text-white/70 text-xs">Mở cửa 11:00 – 15:00 ngày 20/10</span>
          </div>

          <div className="p-5 rounded-[26px] bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="material-symbols-outlined text-tertiary">pets</span>
              <span>Sân Nhà Nhiều Chó</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Thanh Oai, Hà Nội. Mái ấm phi lợi nhuận cho động vật cơ nhỡ cần được che chở.
            </p>
            <a className="text-xs text-tertiary hover:underline pt-1 inline-block font-semibold" href="#shelter-donate">
              Xem sao kê &amp; đóng góp →
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© 2026 K&amp;P Atelier – Dự án gây quỹ 20/10 bởi sinh viên FPT University đồng hành cùng trạm cứu hộ Sân Nhà Nhiều Chó.</p>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white font-sans text-[11px] border border-white/15">
              Handcrafted with warmth
            </span>
            <span>•</span>
            <span>Sảnh lầu 2 FPTU</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
