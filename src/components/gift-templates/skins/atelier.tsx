import React from "react";
import type { Skin, SlideKind } from "../slides/skin";

/** Soft rose light and a few hearts, the look of the K&P Atelier page. Sizes follow the picture box (`cqmin`). */
function Glow() {
  const hearts = [
    { top: "8%", left: "10%", size: "7cqmin", color: "text-primary-container/50" },
    { top: "12%", right: "10%", size: "10cqmin", color: "text-secondary-container" },
    { bottom: "10%", left: "12%", size: "9cqmin", color: "text-secondary-container" },
    { bottom: "8%", right: "9%", size: "6cqmin", color: "text-primary-container/50" },
  ];
  return (
    <>
      <div aria-hidden="true" className="absolute -top-[10%] left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full bg-secondary-container/25 blur-3xl" />
      {hearts.map((h, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`material-symbols-outlined pointer-events-none absolute ${h.color}`}
          style={{ top: h.top, left: h.left, right: h.right, bottom: h.bottom, fontSize: h.size, lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
      ))}
    </>
  );
}

/** A round burgundy medallion with a big icon, over the rose glow. */
function Medallion({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="absolute inset-0 bg-linear-to-br from-surface-container-low via-secondary-fixed/60 to-surface-container">
      <Glow />
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: "4cqmin" }}>
        <div
          className="flex items-center justify-center rounded-full bg-primary-container text-on-primary"
          style={{ width: "50cqmin", height: "50cqmin", boxShadow: "0 3cqmin 7cqmin rgba(114,26,40,0.28)" }}
        >
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: "26cqmin", lineHeight: 1 }}>
            {icon}
          </span>
        </div>
        <p className="font-serif font-semibold uppercase tracking-widest text-primary-container" style={{ fontSize: "5cqmin", lineHeight: 1 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * K&P Atelier: warm blush paper, burgundy titles in italic serif, round pill buttons, white polaroids with a
 * champagne edge. Taken from the K&P Atelier mobile design; the pages and what they hold stay the shared ones.
 */
export const ATELIER_SKIN: Skin = {
  id: "kp-atelier",
  page: "bg-brand-bg text-on-surface",
  visual: "bg-surface-container-low",
  content: "bg-brand-bg",
  heading: "font-serif italic font-bold leading-tight text-primary-container",
  sub: "font-serif italic text-secondary",
  body: "font-serif text-on-surface-variant",
  paper: "rounded-xl border border-secondary-fixed bg-white p-5 shadow-md",
  button: "inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-3 font-serif font-semibold text-base text-on-primary shadow-pill hover:bg-primary",
  caption: "font-serif italic text-secondary",
  photoFrame: "rounded-xl border border-secondary-fixed bg-white p-2.5 pb-4 shadow-md",

  title(kind: SlideKind, gift) {
    switch (kind) {
      case "open":
        return { title: "Một món quà", sub: `dành riêng cho ${gift.recipientName || "bạn"}` };
      case "letter":
        return { title: gift.letter?.title || "Lời nhắn", sub: gift.letter?.subtitle || "Viết từ trái tim…" };
      case "photos":
        return { title: "Ảnh kỷ niệm", sub: "Những khoảnh khắc được giữ lại" };
      case "video":
        return { title: "Thước phim", sub: "Một đoạn kỷ niệm để xem lại" };
      case "music":
        return { title: "Bài nhạc của chúng ta", sub: "Bấm nghe khi bạn sẵn sàng" };
      case "voice":
        return { title: "Lời thì thầm", sub: "Nghe bằng chính giọng của người tặng" };
      case "anniversary":
        return { title: "Ngày kỷ niệm", sub: "Những ngày bên nhau" };
      case "timeline":
        return { title: "Hành trình của chúng ta", sub: "Từng chương một" };
      case "closing":
        return { title: "Cảm ơn bạn", sub: "Mỗi món quà là một phần cho Sân Nhà Nhiều Chó" };
    }
  },

  art(kind: SlideKind) {
    switch (kind) {
      case "open":
        return <Medallion icon="redeem" label="K&P Atelier" />;
      case "letter":
        return <Medallion icon="mail" label="Thư tay" />;
      case "video":
        return <Medallion icon="movie" label="Video" />;
      case "music":
        return <Medallion icon="music_note" label="Nhạc" />;
      case "voice":
        return <Medallion icon="mic" label="Giọng nói" />;
      case "anniversary":
        return <Medallion icon="event" label="Kỷ niệm" />;
      case "timeline":
        return <Medallion icon="timeline" label="Hành trình" />;
      case "closing":
        return <Medallion icon="pets" label="Cảm ơn" />;
      case "photos":
        return (
          <div className="absolute inset-0 bg-linear-to-br from-surface-container-low via-secondary-fixed/60 to-surface-container">
            <Glow />
          </div>
        );
    }
  },
};
