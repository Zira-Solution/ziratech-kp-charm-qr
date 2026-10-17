"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GiftTemplateViewer from "../gift-templates/GiftTemplateViewer";
import { normalizeGift, type ViewerGift } from "../gift-templates/normalize";
import { TEMPLATES } from "../gift-templates/template-config";
import type { GiftTemplateId } from "../gift-templates/types";
import { draftToPayload, type GiftDraft } from "./draft";
import { Icon } from "./ui";

type Device = "fill" | "phone" | "tablet" | "desktop";

// The card fills its frame: a phone is upright, an iPad is held sideways, a computer is wide.
const DEVICES: { id: Device; label: string; icon: string; width: number; height: number }[] = [
  // "fill" is the card as the recipient sees it on THIS screen: it takes the whole window, upright or wide.
  { id: "fill", label: "Màn hình này", icon: "fullscreen", width: 0, height: 0 },
  { id: "phone", label: "Điện thoại", icon: "smartphone", width: 390, height: 844 },
  { id: "tablet", label: "iPad", icon: "tablet_mac", width: 1024, height: 768 },
  { id: "desktop", label: "Máy tính", icon: "desktop_windows", width: 1280, height: 720 },
];

export const STORYBOOK_DEMO_GIFT: ViewerGift = {
  template: "storybook-sunset",
  blocks: ["letter", "photos", "video", "music", "voice"],
  recipientName: "Bảo Ngọc",
  sender: "Hoàng Nam",
  anonymous: false,
  addressing: "Anh - Em",
  letter: {
    title: "LỜI NHẮN",
    subtitle: "Vẫn còn vài điều mình muốn kể bạn nghe... ♡",
    content:
      "Có vài điều mình luôn muốn nói nhưng chưa có dịp... Hôm nay, mình muốn gửi tất cả vào món quà nhỏ này.\n\nCảm ơn vì đã luôn ở bên cạnh, cùng đi qua những ngày tháng rực rỡ và ấm áp nhất. Mong nụ cười của bạn luôn tỏa sáng như ánh nắng mùa thu nhé! 🌸",
    signature: "Hoàng Nam ♡",
  },
  photos: [
    { url: "/thamkhao/anime_sunset_couple_wide.png", caption: "Những buổi chiều đi dạo...", date: "2024-02-14" },
    { url: "/thamkhao/bg_1.jpg", caption: "Những chuyến đi ngọt ngào...", date: "2024-03-08" },
    { url: "/thamkhao/sunset_couple_clean.jpg", caption: "Những ngày bên nhau bình yên...", date: "2024-04-30" },
    { url: "/thamkhao/bg.jpg", caption: "Và thật nhiều điều nhỏ bé...", date: "2024-05-19" },
  ],
  video: "https://youtu.be/dQw4w9WgXcQ",
  videoAspectRatio: "9:16",
  song: {
    source: "preset",
    presetId: "lofi",
    title: "Giai điệu kỷ niệm",
    artist: "K&P Melody",
  },
  voice: {
    audioPath: "demo",
    audioUrl: "/audio/test-music.wav",
    duration: "02:34",
    noteText:
      "Có những điều viết ra vẫn chưa đủ. Nên lần này, mình muốn bạn nghe bằng chính giọng nói của mình. ❤️",
  },
  finalMessage: "Món quà này sẽ luôn ở đây,\nmỗi khi bạn muốn nhớ lại. ♡",
  timeline: [],
};

interface Props {
  draft: GiftDraft;
  template: GiftTemplateId;
  onTemplateChange: (template: GiftTemplateId) => void;
  onClose: () => void;
  initialMode?: "demo" | "draft";
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The card as the recipient will see it. Users can view the full 7-page standard Storybook
 * demonstration or inspect what they have authored in their draft so far.
 */
export default function PreviewOverlay({ draft, template, onTemplateChange, onClose, initialMode }: Props) {
  // Opens as the card looks on the screen in the buyer's hands (full window); the other frames are one click away.
  const [device, setDevice] = useState<Device>("fill");
  const [mode, setMode] = useState<"demo" | "draft">(
    initialMode ?? (draft.blocks.length > 0 ? "draft" : "demo")
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const demoGift = useMemo<ViewerGift>(() => {
    return {
      ...STORYBOOK_DEMO_GIFT,
      template,
      recipientName: draft.recipientName?.trim() || STORYBOOK_DEMO_GIFT.recipientName,
      sender: draft.anonymous ? "" : (draft.senderName?.trim() || STORYBOOK_DEMO_GIFT.sender),
      anonymous: draft.anonymous,
    };
  }, [template, draft.recipientName, draft.senderName, draft.anonymous]);

  const draftGift = useMemo(() => normalizeGift({ ...draftToPayload(draft).giftData, template }), [draft, template]);

  const gift = mode === "demo" ? demoGift : draftGift;
  const frame = DEVICES.find((d) => d.id === device)!;

  // Move focus in when it opens, give it back when it closes, and keep the page behind from scrolling.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const segment = (active: boolean) =>
    `inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-bold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
      active ? "bg-white text-primary-container" : "text-white hover:bg-black/20"
    }`;

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Xem thử thiệp" onKeyDown={onKeyDown} className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-primary-container px-3 py-2 text-white">
        <div className="flex items-center gap-3">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Icon name="visibility" className="text-[20px]" />
            <span className="hidden sm:inline">Xem thử thiệp</span>
          </p>

          {/* Mode Switcher: Full 7-page Demo vs User's Draft */}
          <div className="flex items-center gap-1 rounded-xl bg-black/25 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setMode("demo")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "demo"
                  ? "bg-white text-[#721a28] shadow-xs"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              title="Xem toàn bộ 7 trang mẫu chuẩn chỉnh của Storybook 20/10"
            >
              <Icon name="auto_stories" className="text-[16px]" />
              <span>Mẫu chuẩn (7 trang)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("draft")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "draft"
                  ? "bg-white text-[#721a28] shadow-xs"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              title="Xem nội dung thực tế bạn đang soạn thảo"
            >
              <Icon name="edit_note" className="text-[16px]" />
              <span>Nội dung đang soạn</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label="Mẫu thiệp" className="flex items-center gap-1 rounded-xl bg-black/20 p-1">
            {TEMPLATES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={t.id === template} onClick={() => onTemplateChange(t.id)} className={segment(t.id === template)}>
                <span aria-hidden="true">{t.icon}</span>
                <span className="hidden sm:inline">{t.name}</span>
              </button>
            ))}
          </div>

          <div role="radiogroup" aria-label="Xem như trên thiết bị" className="hidden items-center gap-1 rounded-xl bg-black/20 p-1 sm:flex">
            {DEVICES.map((d) => (
              <button key={d.id} type="button" role="radio" aria-checked={d.id === device} onClick={() => setDevice(d.id)} className={segment(d.id === device)}>
                <Icon name={d.icon} className="text-[18px]" />
                {d.label}
              </button>
            ))}
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-bold text-primary-container cursor-pointer hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Icon name="close" className="text-[18px]" />
            Quay lại bàn viết
          </button>
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 items-center justify-center ${device === "fill" ? "" : "sm:p-4"}`}>
        <div
          style={frame.id === "fill" ? { width: "100%", height: "100%" } : { width: frame.width, height: frame.height, maxWidth: "100%", maxHeight: "100%" }}
          className={`overflow-hidden bg-white ${frame.id === "fill" ? "" : "sm:rounded-2xl sm:shadow-2xl"}`}
        >
          <GiftTemplateViewer gift={gift} embedded />
        </div>
      </div>
    </div>
  );
}
