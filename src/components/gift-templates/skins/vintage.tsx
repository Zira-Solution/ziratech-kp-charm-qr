import React from "react";
import { Sticker } from "../slides/Art";
import type { Skin, SlideKind } from "../slides/skin";

const ART = "/thamkhao";

/** A taped note on scrapbook paper with a big icon and a handwritten label, and a faded sticker beside it. */
function Note({ icon, label, sticker }: { icon: string; label: string; sticker?: string }) {
  return (
    <div className="scrapbook-card-bg absolute inset-0">
      <div className="absolute inset-[7%] flex -rotate-2 items-center justify-center">
        <img src={`${ART}/paper.png`} alt="" aria-hidden="true" decoding="async" loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
        <div className="relative flex flex-col items-center" style={{ gap: "2cqmin" }}>
          <span aria-hidden="true" className="material-symbols-outlined text-crimson" style={{ fontSize: "24cqmin", lineHeight: 1 }}>
            {icon}
          </span>
          <p className="font-handwriting font-bold text-crimson" style={{ fontSize: "11cqmin", lineHeight: 1 }}>
            {label}
          </p>
        </div>
      </div>
      {sticker && <Sticker src={`${ART}/${sticker}`} className="-bottom-[3%] -right-[3%] h-[40%] w-[40%] rotate-6 opacity-90 sepia-[.35]" />}
    </div>
  );
}

/** Sổ Hoa Khô: scrapbook paper and tape, crimson handwriting, polaroids, faded stickers. */
export const VINTAGE_SKIN: Skin = {
  id: "vintage-scrapbook",
  page: "scrapbook-card-bg text-dark-espresso",
  visual: "",
  content: "scrapbook-card-bg",
  heading: "font-handwriting font-extrabold leading-none text-crimson",
  headingSize: { portrait: "text-5xl", landscape: "text-6xl xl:text-7xl" },
  sub: "font-handwriting font-bold text-forest-green",
  body: "font-handwriting text-dark-espresso",
  bodySize: { portrait: "text-2xl", landscape: "text-3xl" },
  paper: "paper-lined rounded-sm border border-stone-warm bg-cream-paper p-5 shadow-md",
  button: "inline-flex items-center gap-2 rounded-sm border border-stone-warm bg-crimson px-6 py-3 font-handwriting text-2xl font-bold text-white shadow-md hover:bg-ruby",
  caption: "font-handwriting font-bold text-crimson",
  photoFrame: "polaroid-card -rotate-2",

  title(kind: SlideKind, gift) {
    switch (kind) {
      case "open":
        return { title: "Có một món quà", sub: `gửi ${gift.recipientName || "bạn"}` };
      case "letter":
        return { title: gift.letter?.title || "Lời nhắn", sub: gift.letter?.subtitle || "Gửi đến bạn…" };
      case "photos":
        return { title: "Những trang kỷ niệm", sub: "Dán vào sổ nhỏ của mình" };
      case "video":
        return { title: "Thước phim cũ", sub: "Một đoạn ký ức" };
      case "music":
        return { title: "Giai điệu xưa", sub: "Bài hát của mình" };
      case "voice":
        return { title: "Giọng nói của mình", sub: "Lời nhắn giọng nói" };
      case "anniversary":
        return { title: "Ngày đáng nhớ", sub: "Những ngày bên nhau" };
      case "timeline":
        return { title: "Dòng thời gian", sub: "Những khoảnh khắc đáng nhớ" };
      case "closing":
        return { title: "Cảm ơn bạn", sub: "đã đọc hết cuốn sổ này" };
    }
  },

  art(kind: SlideKind) {
    switch (kind) {
      case "open":
        return <Note icon="redeem" label="Quà" sticker="gift_box.png" />;
      case "letter":
        return <Note icon="mail" label="Thư" sticker="pen.png" />;
      case "video":
        return <Note icon="movie" label="Video" sticker="star.png" />;
      case "music":
        return <Note icon="music_note" label="Nhạc" sticker="music_notes.png" />;
      case "voice":
        return <Note icon="mic" label="Ghi âm" sticker="microphone.png" />;
      case "anniversary":
        return <Note icon="favorite" label="Kỷ niệm" sticker="heart.png" />;
      case "timeline":
        return <Note icon="route" label="Mốc" sticker="signpost.png" />;
      case "closing":
        return <Note icon="favorite" label="Cảm ơn" sticker="heart_2.png" />;
      case "photos":
        return (
          <div className="scrapbook-card-bg absolute inset-0">
            <Sticker src={`${ART}/binder_clip.png`} className="-left-[2%] -top-[4%] h-[26%] w-[26%] -rotate-12 sepia-[.3]" />
          </div>
        );
    }
  },
};
