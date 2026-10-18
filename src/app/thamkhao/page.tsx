"use client";

import React, { useState } from "react";
import Link from "next/link";
import GiftTemplateViewer from "@/components/gift-templates/GiftTemplateViewer";
import type { ViewerGift } from "@/components/gift-templates/normalize";

type ViewDevice = "desktop" | "ipad" | "phone";

const DEMO_GIFT: ViewerGift = {
  template: "storybook-sunset",
  blocks: ["letter", "photos", "video", "music", "voice"],
  recipientName: "Lan",
  sender: "Hoàng Nam",
  anonymous: false,
  addressing: "Anh - Em",
  letter: {
    title: "LỜI NHẮN",
    subtitle: "Gửi đến bạn...",
    content:
      "Có vài điều mình luôn muốn nói nhưng chưa có dịp...\nHôm nay, mình muốn gửi tất cả vào món quà này.",
    signature: "Hoàng Nam",
  },
  photos: [
    { url: "/thamkhao/anime_sunset_couple_wide.png", caption: "Những buổi chiều đi dạo...", date: "2024-02-14" },
    { url: "/thamkhao/bg_1.jpg", caption: "Những chuyến đi...", date: "2024-03-08" },
    { url: "/thamkhao/sunset_couple_clean.jpg", caption: "Những ngày bên nhau...", date: "2024-04-30" },
    { url: "/thamkhao/bg.jpg", caption: "Và thật nhiều điều nhỏ...", date: "2024-05-19" },
  ],
  video: "https://youtu.be/dQw4w9WgXcQ",
  song: {
    source: "preset",
    presetId: "lofi",
    title: "Giai điệu kỷ niệm",
    artist: "K&P Melody",
  },
  voice: {
    audioPath: "demo",
    duration: "02:34",
    noteText:
      "Có những điều viết ra vẫn chưa đủ. Nên lần này, mình muốn bạn nghe bằng chính giọng nói của mình. ❤️",
  },
  finalMessage: "Món quà này sẽ luôn ở đây,\nmỗi khi bạn muốn nhớ lại.",
  timeline: [],
};

export default function ThamKhaoPage() {
  const [device, setDevice] = useState<ViewDevice>("desktop");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("device");
      if (p === "ipad" || p === "phone" || p === "desktop") {
        setDevice(p);
      }
    }
  }, []);

  const switchDevice = (next: ViewDevice) => {
    setDevice(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("device", next);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-stone-900 font-sans text-stone-900 select-none">
      {/* Top Floating Control Bar */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-white/80 max-w-[96vw]">
        <Link
          href="/"
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-[#6b4737] text-xs font-bold transition-all"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span className="hidden sm:inline">Trang chủ</span>
        </Link>

        <div className="h-4 w-px bg-stone-300 mx-0.5 hidden sm:block" />

        {/* 2 Sample Templates Switcher */}
        <div className="flex items-center gap-1 bg-stone-100/90 p-0.5 rounded-full border border-stone-200/60">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#c13d28] text-white shadow-xs"
            title="Đang xem Mẫu 1: Storybook Hoàng Hôn 20/10"
          >
            <span>🌅</span>
            <span>Mẫu 1: Storybook</span>
          </button>

          <Link
            href="/messenger"
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-stone-700 hover:bg-white/80 transition-all"
            title="Chuyển sang xem Mẫu 2: Hộp Quà Messenger"
          >
            <span>💬</span>
            <span>Mẫu 2: Messenger</span>
          </Link>
        </div>

        <div className="h-4 w-px bg-stone-300 mx-0.5 hidden md:block" />

        {/* Device Switcher (Desktop / iPad / Phone) */}
        <div className="hidden md:flex items-center gap-1 bg-stone-100 p-0.5 rounded-full">
          <button
            type="button"
            onClick={() => switchDevice("desktop")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              device === "desktop"
                ? "bg-stone-800 text-white shadow-xs"
                : "text-stone-700 hover:bg-white/60"
            }`}
            title="Xem toàn màn hình Desktop"
          >
            <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => switchDevice("ipad")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              device === "ipad"
                ? "bg-stone-800 text-white shadow-xs"
                : "text-stone-700 hover:bg-white/60"
            }`}
            title="Xem chế độ iPad ngang"
          >
            <span className="material-symbols-outlined text-[15px]">tablet</span>
            <span>iPad</span>
          </button>

          <button
            type="button"
            onClick={() => switchDevice("phone")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              device === "phone"
                ? "bg-stone-800 text-white shadow-xs"
                : "text-stone-700 hover:bg-white/60"
            }`}
            title="Xem chế độ Điện thoại (Mobile chuẩn)"
          >
            <span className="material-symbols-outlined text-[15px]">smartphone</span>
            <span>Điện thoại</span>
          </button>
        </div>

        <div className="h-4 w-px bg-stone-300 mx-0.5 hidden sm:block" />

        {/* CTA: Create gift with this template */}
        <Link
          href="/gift"
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-[#721a28] to-[#9b2c3d] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
          <span>Tự tạo thiệp</span>
        </Link>
      </header>

      {/* Main Presentation Stage */}
      <main className="h-full w-full flex items-center justify-center overflow-hidden">
        {device === "desktop" && (
          /* True Full Screen Desktop (Zero borders, zero phone frame in the middle) */
          <div className="h-full w-full">
            <GiftTemplateViewer gift={DEMO_GIFT} embedded />
          </div>
        )}

        {device === "ipad" && (
          /* iPad Landscape Stage */
          <div className="p-4 sm:p-6 flex items-center justify-center h-full w-full">
            <div className="w-full max-w-[1024px] h-[720px] max-h-[92vh] rounded-[32px] overflow-hidden shadow-2xl border-8 border-stone-800 bg-black">
              <GiftTemplateViewer gift={DEMO_GIFT} embedded />
            </div>
          </div>
        )}

        {device === "phone" && (
          /* Phone Portrait Stage (Matching 7 frames 90-100%) */
          <div className="p-4 flex items-center justify-center h-full w-full">
            <div className="w-[390px] max-w-full h-[780px] max-h-[92vh] rounded-[44px] overflow-hidden shadow-2xl border-8 border-stone-800 bg-black flex flex-col">
              <div className="h-5 bg-black w-full shrink-0 flex items-center justify-center">
                <div className="w-24 h-3.5 bg-stone-900 rounded-full" />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <GiftTemplateViewer gift={DEMO_GIFT} embedded />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
