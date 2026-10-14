import React from "react";
import { EVENT } from "@/config/event";

export default function EventInfo() {
  const items = [
    {
      icon: "event",
      label: "Ngày",
      value: `${EVENT.weekday}, ${EVENT.dateFull}`,
      note: "Ngày hội quà tặng 20/10",
    },
    {
      icon: "schedule",
      label: "Giờ",
      value: EVENT.hours ?? "Sẽ cập nhật",
      note: EVENT.hours ? "Gian hàng mở cửa liên tục" : "Khung giờ cụ thể sẽ được thông báo",
    },
    {
      icon: "location_on",
      label: "Địa điểm",
      value: EVENT.venue,
      note: EVENT.campus,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 mb-24" id="event">
      <div className="bg-linear-to-br from-white/75 via-white/55 to-white/35 backdrop-blur-2xl border border-white/85 rounded-[36px] p-6 lg:p-10 shadow-liquid-card">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-xl text-primary font-sans text-xs font-semibold mb-3 border border-white/80 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-secondary-dark">celebration</span>
            <span>Ngày hội K&amp;P Atelier</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl text-primary tracking-tight">Gặp K&amp;P ngày {EVENT.dateShort}</h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed mt-3">
            Ghé gian hàng để nhận hoa đã đặt, tự tay làm vòng charm và tham gia vòng quay may mắn.
          </p>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((it) => (
            <div
              key={it.label}
              className="p-6 rounded-[28px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-xs text-center transition-all hover:-translate-y-1 hover:shadow-soft-glow hover:bg-white/80"
            >
              <span className="mx-auto mb-3 flex w-12 h-12 items-center justify-center rounded-full bg-white/80 border border-white/90 text-primary shadow-xs">
                <span className="material-symbols-outlined text-[24px]">{it.icon}</span>
              </span>
              <dt className="font-sans text-[11px] uppercase tracking-wider font-semibold text-secondary-dark">{it.label}</dt>
              <dd className="font-headline text-xl sm:text-2xl text-primary font-bold mt-1">{it.value}</dd>
              <dd className="font-sans text-xs text-on-surface-variant mt-1">{it.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
