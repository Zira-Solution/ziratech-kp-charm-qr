"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GiftTemplateViewer from "../gift-templates/GiftTemplateViewer";
import { normalizeGift } from "../gift-templates/normalize";
import { TEMPLATES } from "../gift-templates/template-config";
import type { GiftTemplateId } from "../gift-templates/types";
import { draftToPayload, type GiftDraft } from "./draft";
import { Icon } from "./ui";

type Device = "phone" | "tablet" | "desktop";

const DEVICES: { id: Device; label: string; icon: string; width: number }[] = [
  { id: "phone", label: "Điện thoại", icon: "smartphone", width: 390 },
  { id: "tablet", label: "iPad", icon: "tablet_mac", width: 768 },
  { id: "desktop", label: "Máy tính", icon: "desktop_windows", width: 1280 },
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
  // Open as the screen in the buyer's hands: a tablet shows the iPad frame, anything else starts as a phone
  // (what most recipients will use after scanning the card).
  const [device, setDevice] = useState<Device>(() =>
    typeof window !== "undefined" && window.innerWidth >= 640 && window.innerWidth < 1024 ? "tablet" : "phone"
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const gift = useMemo(() => normalizeGift({ ...draftToPayload(draft).giftData, template }), [draft, template]);
  const frameWidth = DEVICES.find((d) => d.id === device)!.width;

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

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-0 py-0 sm:px-4 sm:py-4">
        <div
          style={{ width: frameWidth, maxWidth: "100%" }}
          className={`mx-auto overflow-hidden bg-white ${device === "desktop" ? "rounded-lg" : "sm:rounded-3xl"} sm:shadow-2xl`}
        >
          <GiftTemplateViewer gift={gift} embedded />
        </div>
      </div>
    </div>
  );
}
