"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GiftTemplateViewer from "../gift-templates/GiftTemplateViewer";
import { normalizeGift, type ViewerGift } from "../gift-templates/normalize";
import { TEMPLATES } from "../gift-templates/template-config";
import type { GiftTemplateId } from "../gift-templates/types";
import { draftToPayload, type GiftDraft } from "./draft";
import { Icon } from "./ui";
import {
  parseAddressing,
  getDefaultLetterContent,
  getDefaultLetterSubtitle,
  getDefaultVoiceNote,
  getDefaultFinalMessage,
} from "../gift-templates/addressing";

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
  videoAspectRatio: "16:9",
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
    const addressing = draft.addressing?.trim() || STORYBOOK_DEMO_GIFT.addressing;
    const pronouns = parseAddressing(addressing);
    return {
      ...STORYBOOK_DEMO_GIFT,
      template,
      addressing,
      recipientName: draft.recipientName?.trim() || STORYBOOK_DEMO_GIFT.recipientName,
      sender: draft.anonymous ? "" : (draft.senderName?.trim() || STORYBOOK_DEMO_GIFT.sender),
      anonymous: draft.anonymous,
      letter: {
        ...STORYBOOK_DEMO_GIFT.letter!,
        subtitle: getDefaultLetterSubtitle(pronouns),
        content: getDefaultLetterContent(pronouns),
      },
      voice: STORYBOOK_DEMO_GIFT.voice
        ? {
            ...STORYBOOK_DEMO_GIFT.voice,
            noteText: getDefaultVoiceNote(pronouns),
          }
        : undefined,
      finalTitle: draft.finalTitle?.trim() || undefined,
      finalSubtitle: draft.finalSubtitle?.trim() || undefined,
      finalMessage: draft.finalMessage?.trim() || getDefaultFinalMessage(pronouns),
    };
  }, [template, draft.addressing, draft.recipientName, draft.senderName, draft.anonymous, draft.finalTitle, draft.finalSubtitle, draft.finalMessage]);

  const draftGift = useMemo(() => {
    const payload = draftToPayload(draft).giftData;
    const normalized = normalizeGift({
      ...payload,
      template,
      voiceNote: {
        ...(payload.voiceNote as Record<string, unknown> | undefined),
        audioUrl: draft.voice?.audioUrl || undefined,
      },
    });
    if (normalized.voice && draft.voice?.audioUrl) {
      normalized.voice.audioUrl = draft.voice.audioUrl;
    }
    return normalized;
  }, [draft, template]);

  const gift = mode === "demo" ? demoGift : draftGift;
  const frame = DEVICES.find((d) => d.id === device)!;

  const messengerPreviewUrl = useMemo(() => {
    const q = new URLSearchParams();
    q.set("embed", "true");
    q.set("hideConfig", "true");
    if (mode === "demo") {
      return `/messenger?${q.toString()}`;
    }
    if (draft.recipientName) q.set("to", draft.recipientName);
    if (draft.senderName) q.set("sender", draft.senderName);
    if (draft.unlockPin) q.set("pin", draft.unlockPin);
    if (draft.letterTitle) q.set("ltitle", draft.letterTitle);
    if (draft.letterContent) q.set("lbody", draft.letterContent);
    if (draft.letterSignature) q.set("lsig", draft.letterSignature);
    if (draft.voice?.audioUrl) q.set("voice", draft.voice.audioUrl);
    if (draft.song?.link) q.set("music", draft.song.link);
    if (draft.photos?.length > 0) {
      q.set("photos", JSON.stringify(draft.photos.map((p) => p.url)));
    }
    const m = draft.messenger;
    if (m) {
      if (m.wallpaperUrl) q.set("wallpaper", m.wallpaperUrl);
      if (m.chatWallpaperUrl) q.set("chatWallpaper", m.chatWallpaperUrl);
      if (m.avatarUrl) q.set("avatar", m.avatarUrl);
      if (m.notificationText) q.set("text", m.notificationText);
      if (m.messages && m.messages.length > 0) q.set("msg", m.messages.join("||"));
      q.set("hearts", m.showFloatingHearts ? "1" : "0");
      if (m.giftLeadMessage) q.set("glead", m.giftLeadMessage);
      if (m.voiceLeadMessage) q.set("vlead", m.voiceLeadMessage);
      if (m.voiceAfterMessage) q.set("vafter", m.voiceAfterMessage);
    }
    const vUrl = (m?.videoUrl || draft.videoUrl || "").trim();
    if (vUrl) q.set("vurl", vUrl);
    if (m?.videoLeadMessage) q.set("videolead", m.videoLeadMessage);
    if (m?.videoTitle) q.set("vtitle", m.videoTitle);
    return `/messenger?${q.toString()}`;
  }, [mode, draft]);

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
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Xem thử thiệp"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 flex flex-col bg-[#faf5f0] overflow-hidden select-none"
    >
      {/* Luxurious Ambient Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-[#ffd5cc]/45 via-[#fce4de]/30 to-transparent blur-3xl animate-liquid-float-slow" />
        <div className="absolute -bottom-36 -right-36 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tl from-[#fae2c8]/40 via-[#fceae0]/30 to-transparent blur-3xl animate-liquid-float-fast" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[40rem] rounded-full bg-white/40 blur-3xl" />
      </div>

      {/* Liquid Glass Navigation Bar */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 px-3.5 sm:px-6 py-2.5 bg-white/70 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_24px_rgba(114,26,40,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)]">
        {/* Left: Branding & Mode Switcher */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c13d28] to-[#e38b29] text-white shadow-[0_4px_14px_rgba(193,61,40,0.3)]">
              <Icon name="visibility" className="text-[19px]" />
            </div>
            <div>
              <h2 className="font-serif font-black text-sm sm:text-base text-[#2e1d1b] tracking-tight leading-none">
                Xem thử thiệp
              </h2>
              <p className="text-[10px] text-[#8c6d5e] font-sans font-medium mt-0.5 hidden xs:block">
                Trải nghiệm thực tế người nhận
              </p>
            </div>
          </div>

          {/* Mode Switcher: Full 7-page Demo vs User's Draft */}
          <div className="flex items-center gap-1 rounded-2xl bg-[#f2e7dc]/70 p-1 border border-white/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setMode("demo")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "demo"
                  ? "bg-white text-[#c13d28] shadow-[0_2px_8px_rgba(114,26,40,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)]"
                  : "text-[#6c5143] hover:text-[#2e1d1b] hover:bg-white/40"
              }`}
              title="Xem toàn bộ 7 trang mẫu chuẩn chỉnh của Storybook 20/10"
            >
              <Icon name="auto_stories" className="text-[15px]" />
              <span>Mẫu chuẩn (7 trang)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("draft")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "draft"
                  ? "bg-white text-[#c13d28] shadow-[0_2px_8px_rgba(114,26,40,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)]"
                  : "text-[#6c5143] hover:text-[#2e1d1b] hover:bg-white/40"
              }`}
              title="Xem nội dung thực tế bạn đang soạn thảo"
            >
              <Icon name="edit_note" className="text-[16px]" />
              <span>Nội dung đang soạn</span>
            </button>
          </div>
        </div>

        {/* Right: Template Badge, Device Switcher & Exit Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Template Badge / Selector */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-2xl bg-white/80 border border-white/95 px-3 py-1.5 shadow-[0_2px_8px_rgba(114,26,40,0.04)] text-xs font-bold text-[#721a28]">
            <span className="text-sm">🌅</span>
            <span>{TEMPLATES.find((t) => t.id === template)?.name || "Storybook 20/10"}</span>
          </div>

          {/* Device Frame Switcher */}
          <div role="radiogroup" aria-label="Xem như trên thiết bị" className="hidden sm:flex items-center gap-1 rounded-2xl bg-[#f2e7dc]/70 p-1 border border-white/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            {DEVICES.map((d) => {
              const active = d.id === device;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDevice(d.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-white text-[#c13d28] shadow-[0_2px_8px_rgba(114,26,40,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)]"
                      : "text-[#6c5143] hover:text-[#2e1d1b] hover:bg-white/40"
                  }`}
                >
                  <Icon name={d.icon} className="text-[16px]" />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Close button: Quay lại bàn viết */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-2xl bg-gradient-to-r from-[#721a28] to-[#9e273a] hover:from-[#5a1420] hover:to-[#821e2e] text-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(114,26,40,0.25)] hover:shadow-[0_6px_22px_rgba(114,26,40,0.38)] active:scale-95 transition-all cursor-pointer border border-white/30 backdrop-blur-md"
          >
            <Icon name="close" className="text-[17px]" />
            <span>Quay lại bàn viết</span>
          </button>
        </div>
      </header>

      {/* Main Stage with Device Frame */}
      <div className={`relative flex min-h-0 flex-1 items-center justify-center ${device === "fill" ? "" : "p-3 sm:p-5 lg:p-6"}`}>
        <div
          style={
            frame.id === "fill"
              ? { width: "100%", height: "100%" }
              : { width: frame.width, height: frame.height, maxWidth: "100%", maxHeight: "100%" }
          }
          className={`overflow-hidden bg-white transition-all duration-300 ${
            frame.id === "fill"
              ? ""
              : frame.id === "phone"
              ? "rounded-[38px] sm:rounded-[44px] border-[6px] sm:border-[8px] border-[#2e2624] shadow-[0_30px_80px_rgba(70,30,20,0.22),0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/10"
              : "rounded-2xl sm:rounded-3xl border-4 sm:border-[6px] border-white/95 shadow-[0_28px_80px_rgba(70,30,20,0.16),0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
          }`}
        >
          {template === "messenger" ? (
            <iframe
              src={messengerPreviewUrl}
              className="w-full h-full border-0"
              title="Xem thử Hộp Quà Messenger"
            />
          ) : (
            <GiftTemplateViewer gift={gift} embedded />
          )}
        </div>
      </div>
    </div>
  );
}
