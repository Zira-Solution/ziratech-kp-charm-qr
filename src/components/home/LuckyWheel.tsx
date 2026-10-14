import React from "react";

export default function LuckyWheel() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="relative overflow-hidden rounded-[38px] bg-linear-to-br from-[#721a28] via-[#5c131f] to-[#3a0a13] text-white p-8 lg:p-14 border border-white/20 shadow-liquid-card">
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-[#fea095]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xl text-white font-sans text-xs font-bold border border-white/30 shadow-xs">
              <span className="material-symbols-outlined text-[14px]">casino</span>
              <span>Chương Trình Đặc Biệt 20/10</span>
            </div>
            <h2 className="font-headline text-3xl sm:text-4xl text-white leading-tight font-bold">Vòng Quay May Mắn K&amp;P Atelier</h2>
            <p className="font-body text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
              Diễn ra duy nhất trong ngày 20/10 tại gian hàng sảnh lầu 2 ĐH FPT. Mỗi đơn hàng hoặc trải nghiệm làm vòng đều nhận được 01 lượt quay trúng thưởng kỷ niệm ấm áp.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-white text-xs font-semibold shadow-xs">
                🎁 Giải thưởng: <span className="italic font-normal">Danh sách quà tặng sẽ sớm công bố</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center" aria-hidden="true">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-2xl shadow-soft-glow motion-safe:animate-pulse">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-white font-bold flex items-center justify-center font-headline text-lg shadow-md">
                20/10
              </div>
              <span className="absolute top-2.5 font-sans text-xs text-white font-bold">Charm Bạc</span>
              <span className="absolute bottom-2.5 font-sans text-xs text-white font-bold">Hoa Nhập</span>
              <span className="absolute left-2.5 font-sans text-xs text-white font-bold">Thẻ Quà</span>
              <span className="absolute right-2.5 font-sans text-xs text-white font-bold">Blindbox</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
