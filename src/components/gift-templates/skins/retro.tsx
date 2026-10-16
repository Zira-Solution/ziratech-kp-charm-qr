import React from "react";
import type { Skin, SlideKind } from "../slides/skin";

/** Gold and rust sparkles, the way the old card had them. Sizes follow the picture box (`cqmin`). */
function Sparkles() {
  const spots = [
    { top: "6%", left: "8%", color: "text-rust", size: "6cqmin" },
    { top: "10%", right: "9%", color: "text-gold-accent", size: "9cqmin" },
    { bottom: "9%", left: "10%", color: "text-gold-accent", size: "8cqmin" },
    { bottom: "6%", right: "8%", color: "text-rust", size: "6cqmin" },
  ];
  return (
    <>
      {spots.map((s, i) => (
        <span key={i} aria-hidden="true" className={`pointer-events-none absolute font-bold ${s.color}`} style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, fontSize: s.size, lineHeight: 1 }}>
          ✦
        </span>
      ))}
    </>
  );
}

/** A stamp-like badge: a big icon in a round frame with a hard rust shadow, three stripes and a label. */
function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="retro-card-bg absolute inset-0">
      <Sparkles />
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: "4cqmin" }}>
        <div
          className="flex items-center justify-center rounded-full border-4 border-dusk bg-cream-paper"
          style={{ width: "54cqmin", height: "54cqmin", boxShadow: "1.6cqmin 1.6cqmin 0 #c13d28" }}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-rust" style={{ fontSize: "28cqmin", lineHeight: 1 }}>
            {icon}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: "2cqmin" }}>
          <span className="rounded-full bg-dusk" style={{ width: "9cqmin", height: "1.4cqmin" }} />
          <span className="rounded-full bg-gold-accent" style={{ width: "9cqmin", height: "1.4cqmin" }} />
          <span className="rounded-full bg-rust" style={{ width: "9cqmin", height: "1.4cqmin" }} />
        </div>
        <p className="font-serif font-black uppercase tracking-widest text-dusk" style={{ fontSize: "7cqmin", lineHeight: 1 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * Retro 90s: dotted cream paper, heavy serif titles with a red 3D shadow, dusk-blue outlines, hard shadows.
 * (Abril Fatface, the old title font, has no Vietnamese letters: its accents came apart.)
 */
export const RETRO_SKIN: Skin = {
  id: "retro-nostalgia",
  page: "retro-card-bg text-ink",
  visual: "shadow-[inset_0_0_0_3px_#1c3f50]",
  content: "retro-card-bg",
  heading: "font-serif font-black uppercase leading-tight tracking-wider retro-3d-title-red",
  sub: "font-serif italic font-bold text-dusk",
  body: "font-serif text-dark-timber",
  paper: "rounded-md border-2 border-dusk bg-cream-paper p-5 shadow-[4px_4px_0_#1c3f50]",
  button: "inline-flex items-center gap-2 rounded-md border-2 border-dusk bg-rust px-6 py-3 font-serif font-black text-base uppercase tracking-wider text-white shadow-[3px_3px_0_#1c3f50] hover:bg-terracotta",
  caption: "font-serif italic font-bold text-dusk",
  photoFrame: "rounded-md border-2 border-dusk bg-cream-paper p-2 pb-4 shadow-[5px_5px_0_#1c3f50]",

  title(kind: SlideKind, gift) {
    switch (kind) {
      case "open":
        return { title: "Món quà", sub: `dành cho ${gift.recipientName || "bạn"}` };
      case "letter":
        return { title: gift.letter?.title || "Lời nhắn", sub: gift.letter?.subtitle || "Gửi đến bạn…" };
      case "photos":
        return { title: "Những ngày như thế", sub: "Cuộn phim kỷ niệm" };
      case "video":
        return { title: "Băng video", sub: "Thước phim kỷ niệm" };
      case "music":
        return { title: "Băng cassette", sub: "Side A · Giai điệu của mình" };
      case "voice":
        return { title: "Băng ghi âm", sub: "Lời nhắn giọng nói" };
      case "anniversary":
        return { title: "Ngày kỷ niệm", sub: "Những ngày bên nhau" };
      case "timeline":
        return { title: "Dòng thời gian", sub: "Những khoảnh khắc đáng nhớ" };
      case "closing":
        return { title: "Hẹn gặp lại", sub: "Cảm ơn bạn đã nghe hết cuốn băng này" };
    }
  },

  art(kind: SlideKind) {
    switch (kind) {
      case "open":
        return <Badge icon="redeem" label="Quà" />;
      case "letter":
        return <Badge icon="mail" label="Thư" />;
      case "video":
        return <Badge icon="movie" label="Video" />;
      case "music":
        return <Badge icon="graphic_eq" label="Nhạc" />;
      case "voice":
        return <Badge icon="mic" label="Ghi âm" />;
      case "anniversary":
        return <Badge icon="favorite" label="Kỷ niệm" />;
      case "timeline":
        return <Badge icon="route" label="Mốc" />;
      case "closing":
        return <Badge icon="favorite" label="Cảm ơn" />;
      case "photos":
        return (
          <div className="retro-card-bg absolute inset-0">
            <Sparkles />
          </div>
        );
    }
  },
};
