"use client";

import React from "react";
import { BLOCK_IDS, BLOCK_LABELS, type BlockId } from "../gift-templates/blocks";
import { Icon, StudioSection } from "./ui";

const INFO: Record<BlockId, { icon: string; desc: string; badge?: string }> = {
  letter: { icon: "mail", desc: "Bức thư tay chan chứa tâm tư", badge: "Trang 2" },
  photos: { icon: "photo_library", desc: "Tối đa 6 ảnh kỷ niệm kiểu Polaroid", badge: "Trang 3" },
  video: { icon: "movie", desc: "Dán liên kết video YouTube / Drive", badge: "Trang 4" },
  music: { icon: "music_note", desc: "Nhạc nền du dương phát khi mở thiệp", badge: "Trang 5" },
  voice: { icon: "mic", desc: "Ghi âm lời nhắn chân thành bằng giọng nói", badge: "Trang 6" },
  finalMessage: { icon: "favorite", desc: "Câu chúc ngắn đọng lại ở hoàng hôn", badge: "Trang 7" },
  anniversary: { icon: "event", desc: "Đếm số ngày đã bên nhau" },
  timeline: { icon: "timeline", desc: "Tối đa 5 khoảnh khắc đáng nhớ" },
};

interface Props {
  step: number;
  value: BlockId[];
  onToggle: (block: BlockId) => void;
  allowedBlocks?: readonly BlockId[];
  templateName?: string;
}

export default function MessagePicker({ step, value, onToggle, allowedBlocks, templateName }: Props) {
  const availableIds = allowedBlocks && allowedBlocks.length > 0 ? allowedBlocks : BLOCK_IDS;

  return (
    <StudioSection
      id="messages"
      step={step}
      title="Bạn muốn gửi những gì?"
      hint={
        templateName
          ? `Mẫu thiệp "${templateName}" gồm Trang bìa 1, các trang nội dung bên dưới và Trang bìa kết 7. Hãy tích chọn các phần bạn muốn chuẩn bị.`
          : "Tích những thứ bạn muốn có trong thiệp. Bỏ tích không làm mất nội dung đã nhập."
      }
    >
      <div role="group" aria-labelledby="messages-title" className="grid gap-3 sm:grid-cols-2">
        {availableIds.map((id) => {
          const checked = value.includes(id);
          const meta = INFO[id];
          return (
            <button
              key={id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => onToggle(id)}
              className={`flex items-start gap-3.5 rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                checked
                  ? "liquid-glass-card border-[#721a28] ring-2 ring-[#721a28]/25 shadow-[0_10px_24px_-4px_rgba(114,26,40,0.16)] -translate-y-0.5"
                  : "liquid-glass-card border-rose-200/60 hover:border-[#721a28]/40"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                  checked ? "liquid-glass-btn-primary text-white shadow-xs" : "liquid-glass-pill text-slate-600 border-slate-200"
                }`}
              >
                <Icon name={meta.icon} className="text-[24px]" />
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="flex items-center gap-2">
                  <span className={`block text-base font-bold tracking-tight ${checked ? "text-[#721a28]" : "text-slate-800"}`}>
                    {BLOCK_LABELS[id]}
                  </span>
                  {meta.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full liquid-glass-pill text-amber-900 border-amber-200/70 leading-none">
                      {meta.badge}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-slate-500 leading-relaxed">{meta.desc}</span>
              </span>
              <span className="pt-1">
                <Icon
                  name={checked ? "check_circle" : "radio_button_unchecked"}
                  className={`text-[24px] transition-colors ${checked ? "text-[#721a28]" : "text-slate-300"}`}
                />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-semibold text-slate-600">
          {value.length === 0 ? (
            <span className="text-amber-700 font-bold">Chưa chọn mục nào. Hãy tích ít nhất một mục để bắt đầu.</span>
          ) : (
            <>
              Đã chọn <strong className="text-[#721a28]">{value.length}</strong> / {availableIds.length} mục khả dụng.
            </>
          )}
        </span>
        <span className="text-slate-400">Bạn sẽ sắp xếp thứ tự và nội dung ở bước Soạn.</span>
      </div>
    </StudioSection>
  );
}

