"use client";

import React from "react";
import { getTemplate } from "../gift-templates/template-config";
import type { GiftDraft } from "./draft";
import { Icon } from "./ui";

/** A small postcard that shows how the card is coming along. The real card is the viewer page. */
export default function PreviewCard({
  draft,
  onOpenFullPreview,
}: {
  draft: GiftDraft;
  onOpenFullPreview?: () => void;
}) {
  const info = getTemplate(draft.template);
  const cover = draft.blocks.includes("photos") ? draft.photos[0]?.url : undefined;

  return (
    <div className="rounded-3xl liquid-glass-card border border-rose-200/70 p-5 shadow-[0_16px_40px_-8px_rgba(114,26,40,0.08)] relative overflow-hidden">
      {/* Decorative top accent line with template color */}
      <div
        className="absolute inset-x-0 top-0 h-1.5 z-10"
        style={{ background: "#721a28" }}
      />

      <div className="mb-3.5 flex items-center justify-between gap-2 relative z-10">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#721a28" }} />
          Bản xem trước
        </span>
        <span className="inline-flex items-center gap-1 rounded-full liquid-glass-pill px-3 py-1 text-xs font-bold text-[#721a28] border border-rose-200/80 whitespace-nowrap shrink-0">
          <span>{info?.icon}</span>
          <span>{info?.name}</span>
        </span>
      </div>

      {/* Miniature Card Frame: Just the photo / cover on clean neutral canvas */}
      <div
        onClick={onOpenFullPreview}
        className="rounded-2xl p-4 shadow-inner border border-slate-200/80 bg-slate-50/70 transition-all cursor-pointer hover:shadow-md hover:border-[#721a28]/40 flex flex-col items-center justify-center min-h-[190px] relative z-10 overflow-hidden"
      >
        {cover ? (
          <div className="w-36 rotate-[-1deg] rounded-lg bg-white p-2 pb-5 shadow-md ring-1 ring-black/5 hover:rotate-0 transition-transform">
            <img src={cover} alt="Ảnh bìa thiệp" className="aspect-square w-full object-cover rounded-xs" />
          </div>
        ) : (
          <div className="flex h-32 w-36 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 gap-2">
            <Icon name="photo_library" className="text-[32px]" />
            <span className="text-xs font-medium text-slate-500">Khung ảnh thiệp</span>
          </div>
        )}
      </div>

      {onOpenFullPreview && (
        <button
          type="button"
          onClick={onOpenFullPreview}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl liquid-glass-btn-primary px-4 py-2.5 text-sm font-bold text-white shadow-xs cursor-pointer hover:shadow-md transition-all"
        >
          <Icon name="visibility" className="text-[20px]" />
          Mở xem thiệp đầy đủ
        </button>
      )}
    </div>
  );
}


