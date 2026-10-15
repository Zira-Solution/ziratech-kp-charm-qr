"use client";

import React from "react";
import { BLOCK_IDS, BLOCK_LABELS, type BlockId } from "../gift-templates/blocks";
import { Icon, StudioSection } from "./ui";

const INFO: Record<BlockId, { icon: string; desc: string }> = {
  letter: { icon: "mail", desc: "Một bức thư viết tay" },
  photos: { icon: "photo_library", desc: "Tối đa 6 ảnh kỷ niệm" },
  voice: { icon: "mic", desc: "Ghi âm lời nhắn bằng micro" },
  video: { icon: "movie", desc: "Dán liên kết video" },
  music: { icon: "music_note", desc: "Nhạc phát khi mở thiệp" },
  anniversary: { icon: "event", desc: "Số ngày bên nhau" },
  timeline: { icon: "timeline", desc: "Tối đa 5 khoảnh khắc đáng nhớ" },
  finalMessage: { icon: "favorite", desc: "Một câu ngắn ở cuối thiệp" },
};

interface Props {
  step: number;
  value: BlockId[];
  onToggle: (block: BlockId) => void;
}

export default function MessagePicker({ step, value, onToggle }: Props) {
  return (
    <StudioSection
      id="messages"
      step={step}
      title="Bạn muốn gửi những gì?"
      hint="Tích những thứ bạn muốn có trong thiệp, mỗi người một cách. Bỏ tích không làm mất nội dung đã nhập."
    >
      <div role="group" aria-labelledby="messages-title" className="grid gap-2.5 sm:grid-cols-2">
        {BLOCK_IDS.map((id) => {
          const checked = value.includes(id);
          return (
            <button
              key={id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => onToggle(id)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                checked
                  ? "liquid-glass bg-white/95 border-amber-400 ring-2 ring-primary-container/20 shadow-md"
                  : "liquid-glass-card border-white/70 hover:bg-white/80"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${checked ? "bg-primary text-white" : "bg-surface-container text-secondary"}`}
              >
                <Icon name={INFO[id].icon} className="text-[22px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-sm font-bold text-primary">{BLOCK_LABELS[id]}</span>
                <span className="block text-[11px] font-sans text-warm-neutral">{INFO[id].desc}</span>
              </span>
              <Icon name={checked ? "check_circle" : "radio_button_unchecked"} className={`text-[22px] ${checked ? "text-primary" : "text-warm-neutral/60"}`} />
            </button>
          );
        })}
      </div>
      <p role="status" className="mt-3 text-xs font-sans font-bold text-secondary">
        {value.length === 0 ? "Chưa chọn mục nào. Hãy tích ít nhất một mục." : `Đã chọn ${value.length}/${BLOCK_IDS.length} mục. Sắp xếp thứ tự ở phần soạn bên dưới.`}
      </p>
    </StudioSection>
  );
}
