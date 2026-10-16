"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GiftTemplateViewer from "../gift-templates/GiftTemplateViewer";
import { normalizeGift } from "../gift-templates/normalize";
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

interface Props {
  draft: GiftDraft;
  template: GiftTemplateId;
  onTemplateChange: (template: GiftTemplateId) => void;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The card as the recipient will see it, built from what the buyer has typed so far (nothing is saved
 * and nothing is filled in with sample content). The buyer can look at it as a phone, an iPad or a
 * computer, and try the other looks.
 */
export default function PreviewOverlay({ draft, template, onTemplateChange, onClose }: Props) {
  // Opens as the card looks on the screen in the buyer's hands (full window); the other frames are one click away.
  const [device, setDevice] = useState<Device>("fill");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const gift = useMemo(() => normalizeGift({ ...draftToPayload(draft).giftData, template }), [draft, template]);
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
        <p className="flex items-center gap-2 text-sm font-bold">
          <Icon name="visibility" className="text-[20px]" />
          Xem thử thiệp
          <span className="hidden font-normal text-white/80 md:inline">· đúng những gì bạn đã soạn, chưa lưu</span>
        </p>

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
