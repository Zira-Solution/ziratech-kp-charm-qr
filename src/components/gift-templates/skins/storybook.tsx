import React from "react";
import { Photo, Sticker } from "../slides/Art";
import type { Skin, SlideKind } from "../slides/skin";

const ART = "/thamkhao";

/** Storybook 20/10: warm paper, ink-blue handwriting, rust-red titles, polaroids and the sunset painting. */
export const STORYBOOK_SKIN: Skin = {
  id: "storybook-sunset",
  page: "bg-[#fdebd8] text-[#2e1d1b]",
  visual: "bg-[#f8d9b8]",
  // The paper picture under a cream veil, so its little drawings never run into the text.
  content: "bg-[#fdebd8] bg-[linear-gradient(rgba(253,235,216,0.8),rgba(253,235,216,0.8)),url('/thamkhao/bg.jpg')] bg-cover bg-center",
  heading: "font-black uppercase leading-tight tracking-wide text-[#c13d28]",
  sub: "font-handwriting font-bold text-[#1c3f50]",
  body: "text-[#2e1d1b]",
  paper: "rounded-2xl border border-[#e6d2bb] bg-[#fffaf1] p-5 shadow-md",
  button: "inline-flex items-center gap-2 rounded-full border border-[#e6d2bb] bg-[#fff7ec] px-6 py-3 text-base font-bold text-[#2e1d1b] shadow-md hover:bg-white",
  caption: "font-handwriting font-bold text-[#1c3f50]",
  photoFrame: "rounded-sm bg-white p-2 pb-8 shadow-xl -rotate-1",

  title(kind: SlideKind, gift) {
    switch (kind) {
      case "open":
        return { title: "Có một món quà", sub: `dành cho ${gift.recipientName || "bạn"}` };
      case "letter":
        return { title: gift.letter?.title || "Lời nhắn", sub: gift.letter?.subtitle || "Gửi đến bạn…" };
      case "photos":
        return { title: "Những ngày như thế", sub: "Mình đã có…" };
      case "video":
        return { title: "Video dành cho bạn", sub: "Thước phim kỷ niệm" };
      case "music":
        return { title: "Giai điệu kỷ niệm", sub: "Bài hát của mình" };
      case "voice":
        return { title: "Giọng nói của mình", sub: "Lời nhắn giọng nói" };
      case "anniversary":
        return { title: "Ngày kỷ niệm", sub: "Những ngày bên nhau" };
      case "timeline":
        return { title: "Mốc thời gian", sub: "Những khoảnh khắc đáng nhớ" };
      case "closing":
        return { title: "Cảm ơn bạn", sub: "đã đi qua những ngày này cùng mình" };
    }
  },

  art(kind: SlideKind) {
    switch (kind) {
      case "open":
        return <Photo src={`${ART}/sunset_couple_clean.jpg`} />;
      case "closing":
        return (
          <>
            <Photo src={`${ART}/bg.jpg`} />
            <Sticker src={`${ART}/gift_box.png`} className="inset-[6%] h-[88%] w-[88%]" />
          </>
        );
      case "video":
        return <Photo src={`${ART}/bg_1.jpg`} />;
      case "letter":
        return (
          <>
            <Photo src={`${ART}/bg.jpg`} />
            <Sticker src={`${ART}/envelope.png`} className="left-[6%] top-[8%] h-[84%] w-[88%]" />
            <Sticker src={`${ART}/pen.png`} className="-bottom-[10%] -right-[8%] h-[62%] w-[62%] rotate-12" />
          </>
        );
      case "music":
        return (
          <>
            <Photo src={`${ART}/bg.jpg`} />
            <Sticker src={`${ART}/music_notes.png`} className="inset-[6%] h-[88%] w-[88%]" />
          </>
        );
      case "voice":
        return (
          <>
            <Photo src={`${ART}/bg.jpg`} />
            <Sticker src={`${ART}/microphone.png`} className="inset-[6%] h-[88%] w-[88%]" />
          </>
        );
      case "anniversary":
        return (
          <>
            <Photo src={`${ART}/bg.jpg`} />
            <Sticker src={`${ART}/heart.png`} className="inset-[8%] h-[84%] w-[84%]" />
          </>
        );
      case "timeline":
        return (
          <>
            <Photo src={`${ART}/bg.jpg`} />
            <Sticker src={`${ART}/signpost.png`} className="inset-[4%] h-[92%] w-[92%]" />
          </>
        );
      case "photos":
        return <Photo src={`${ART}/bg.jpg`} />;
    }
  },
};
