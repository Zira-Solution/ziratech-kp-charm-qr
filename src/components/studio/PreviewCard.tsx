"use client";

import React from "react";
import { getTemplate } from "../gift-templates/template-config";
import { BLOCK_LABELS, type BlockId } from "../gift-templates/blocks";
import { daysSince, type GiftDraft } from "./draft";
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
  const has = (b: BlockId) => draft.blocks.includes(b);

  const cover = has("photos") ? draft.photos[0]?.url : undefined;
  const days = has("anniversary") ? daysSince(draft.anniversaryDate) : null;

  const facts: string[] = [];
  if (has("photos") && draft.photos.length) facts.push(`${draft.photos.length} ảnh`);
  if (days !== null && days >= 0) facts.push(`Đã bên nhau ${days} ngày`);
  if (has("timeline") && draft.timeline.length) facts.push(`${draft.timeline.length} mốc kỷ niệm`);
  if (has("music") && draft.song.source !== "none") facts.push(BLOCK_LABELS.music);
  if (has("voice") && draft.voice.audioPath) facts.push(BLOCK_LABELS.voice);
  if (has("video") && draft.videoUrl.trim()) facts.push(BLOCK_LABELS.video);

  return (
    <div className="rounded-3xl border border-parchment-border bg-parchment-light p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between text-[11px] font-sans font-bold uppercase tracking-wider text-secondary">
        <span>Bản xem trước</span>
        <span>
          {info?.icon} {info?.name}
        </span>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-center font-handwriting text-lg text-secondary">
          gửi {draft.recipientName.trim() || "người nhận"}
          {draft.anonymous ? "" : draft.senderName.trim() ? `, từ ${draft.senderName.trim()}` : ""}
        </p>

        {cover ? (
          <div className="mx-auto mt-3 w-40 rotate-[-1.5deg] rounded-xs bg-white p-1.5 pb-5 shadow-md ring-1 ring-black/5">
            <img src={cover} alt="Ảnh đầu tiên của thiệp" className="aspect-square w-full object-cover" />
          </div>
        ) : (
          <div className="mx-auto mt-3 flex h-24 w-40 items-center justify-center rounded-xs border border-dashed border-secondary/30 text-secondary/50">
            <Icon name="photo_library" className="text-[28px]" />
          </div>
        )}

        {has("letter") && (
          <>
            <h3 className="mt-3 text-center font-sans text-sm font-bold text-primary">{draft.letterTitle.trim() || "LỜI NHẮN"}</h3>
            <p className="mt-1 line-clamp-4 whitespace-pre-line text-center text-xs font-sans leading-relaxed text-espresso">
              {draft.letterContent.trim() || "Lời nhắn của bạn sẽ hiện ở đây..."}
            </p>
            {draft.letterSignature.trim() && (
              <p className="mt-2 text-right font-handwriting text-base text-secondary">{draft.letterSignature.trim()}</p>
            )}
          </>
        )}
        {draft.blocks.length === 0 && (
          <p className="mt-3 text-center text-xs font-sans text-warm-neutral">Tích những thứ bạn muốn gửi để xem trước ở đây.</p>
        )}
        {has("finalMessage") && draft.finalMessage.trim() && (
          <p className="mt-3 border-t border-parchment-border pt-2 text-center text-[11px] font-sans italic text-warm-neutral">
            {draft.finalMessage.trim()}
          </p>
        )}
      </div>

      {facts.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {facts.map((f) => (
            <li key={f} className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-sans font-bold text-primary border border-white/90">
              {f}
            </li>
          ))}
        </ul>
      )}

      {onOpenFullPreview && (
        <button
          type="button"
          onClick={onOpenFullPreview}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl liquid-glass-btn-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer"
        >
          <Icon name="visibility" className="text-[18px]" />
          Xem thiệp đầy đủ
        </button>
      )}
    </div>
  );
}
