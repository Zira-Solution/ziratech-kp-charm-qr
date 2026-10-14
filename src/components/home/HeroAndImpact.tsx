import React from "react";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCc7nnfHXxUOfha53a1o_9bNbtqKnnttmUa4NjPK96JAiZfGiklPSDzAHT7tSA2gUb446MwpiHi55PsMwbOtB0lJzQkkJFl01ATCuh90DTBrYmUwQ0KpRJOlggMtRD_2vyQXac5evM3AjtJRzeQTI3jfkcvvwzAyAkOq3FPMITWqFqmD52FCD670eaDpE_VnVkB3px06kuJnROnD2G823IQKvXR-qBNYCwRZFPSHnHADgCRTl0ezejadg";

const TRUST = [
  { icon: "qr_code_2", text: "Kèm thiệp & mã quà số QR" },
  { icon: "inventory_2", text: "Đóng hộp thủ công cẩn trọng" },
  { icon: "storefront", text: "Nhận tại sảnh tòa Alpha FPTU" },
];

const IMPACT = [
  { icon: "rice_bowl", tone: "text-primary", value: "1.250+", label: "Bữa ăn no ấm cho chó" },
  { icon: "healing", tone: "text-secondary-dark", value: "100%", label: "Quỹ minh bạch công khai" },
  { icon: "diversity_3", tone: "text-primary", value: "45", label: "Sinh viên FPT chế tác" },
  { icon: "qr_code", tone: "text-secondary-dark", value: "1:1", label: "Trang quà tặng số riêng biệt" },
];

export function Hero() {
  return (
    <section className="pt-36 pb-20 px-6 max-w-7xl mx-auto" id="hero">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 text-secondary-dark font-sans text-xs font-semibold shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-primary">favorite</span>
            <span>Bộ Sưu Tập Quà Tặng 20/10 • Gây Quỹ Cứu Trợ Động Vật</span>
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl lg:text-[54px] text-primary tracking-tight leading-[1.15]">
            Một kỷ vật trao tay.
            <br />
            <span className="italic font-normal text-secondary-dark">Một mái ấm được chở che.</span>
          </h1>

          <p className="font-body text-base lg:text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Mỗi đóa hoa tươi và chiếc vòng charm luồn dây cước thủ công từ sinh viên FPT không chỉ gửi gắm trọn vẹn yêu thương tới người phụ nữ bạn trân quý dịp 20/10, mà còn dành toàn bộ lợi nhuận tiếp sức cho trạm cứu hộ Sân Nhà Nhiều Chó.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-linear-to-r from-[#721a28] to-[#8c2233] text-white font-sans text-sm font-bold shadow-pill border border-white/25 hover:from-[#5e131f] hover:to-[#721a28] active:scale-[0.98] transition-all"
              href="#catalog"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>Khám phá bộ sưu tập</span>
            </a>
            <a
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/60 backdrop-blur-xl text-primary border border-white/80 font-sans text-sm font-bold hover:bg-white/90 shadow-xs transition-all"
              href="#shelter-donate"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-dark">volunteer_activism</span>
              <span>Ủng hộ trạm cứu trợ</span>
            </a>
          </div>

          <div className="pt-8 border-t border-white/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TRUST.map((t) => (
              <div
                key={t.icon}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xs"
              >
                <div className="w-10 h-10 shrink-0 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                </div>
                <p className="font-sans text-xs font-medium text-neutral">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative p-3.5 rounded-[36px] bg-linear-to-br from-white/75 via-white/50 to-white/30 backdrop-blur-2xl border border-white/80 shadow-liquid-card">
            <div className="relative w-full aspect-4/5 rounded-[26px] overflow-hidden bg-surface-container-low shadow-inner">
              <img
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                alt="Vòng tay charm thủ công trên bàn gỗ cùng ruy băng hồng và hoa baby trắng"
                src={HERO_IMG}
              />
              <div className="absolute top-4 left-4 bg-white/75 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/90 flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <span className="font-sans text-[11px] text-primary font-semibold">Little Heart • Trọn Tình Yêu</span>
              </div>
              <div className="absolute top-4 right-4 bg-white/75 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/90 flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[15px] text-secondary-dark">hotel_class</span>
                <span className="font-sans text-[11px] text-secondary-dark font-semibold">Dreamy Star • Ánh Sáng</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/75 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/90 flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[15px] text-primary">wb_sunny</span>
                <span className="font-sans text-[11px] text-on-surface font-semibold">Sunflower • Tươi Sáng &amp; Rực Rỡ</span>
              </div>
              <div className="absolute bottom-4 right-4 bg-linear-to-r from-[#721a28] to-[#8c2233] text-white px-4 py-2 rounded-full flex items-center gap-1.5 shadow-pill border border-white/30 backdrop-blur-md">
                <span className="material-symbols-outlined text-[15px]">loyalty</span>
                <span className="font-sans text-xs font-bold tracking-wide">Best Seller 20/10</span>
              </div>
            </div>
            <div className="mt-3 px-4 py-3 bg-white/50 backdrop-blur-xl rounded-2xl flex items-center justify-between gap-2 border border-white/70">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary-dark text-[18px]">pets</span>
                <span className="font-sans text-xs text-on-surface-variant font-medium">
                  100% lợi nhuận chuyển đổi thành bữa ăn cứu trợ
                </span>
              </div>
              <span className="font-sans text-xs text-primary font-bold shrink-0">Sân Nhà Nhiều Chó</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ImpactTicker() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-20">
      <div className="bg-linear-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-2xl border border-white/80 rounded-[36px] p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center shadow-liquid-card">
        {IMPACT.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center justify-center p-5 rounded-[26px] bg-white/60 backdrop-blur-xl border border-white/80 transition-all hover:-translate-y-1 hover:shadow-soft-glow hover:bg-white/80"
          >
            <span className={`material-symbols-outlined ${m.tone} text-3xl mb-1.5`}>{m.icon}</span>
            <span className="font-headline text-3xl text-primary font-bold">{m.value}</span>
            <span className="font-sans text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold mt-1">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
