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
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                checked ? "border-primary-container bg-surface-container-low" : "border-rose-petal bg-white hover:border-primary-container"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${checked ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"}`}
              >
                <Icon name={INFO[id].icon} className="text-[22px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-on-surface">{BLOCK_LABELS[id]}</span>
                <span className="block text-sm text-warm-neutral">{INFO[id].desc}</span>
              </span>
              <Icon name={checked ? "check_circle" : "radio_button_unchecked"} className={`text-[24px] ${checked ? "text-primary" : "text-warm-neutral"}`} />
            </button>
          );
        })}
      </div>
      <p role="status" className="mt-3 text-sm font-semibold text-on-surface-variant">
        {value.length === 0 ? "Chưa chọn mục nào. Hãy tích ít nhất một mục." : `Đã chọn ${value.length}/${BLOCK_IDS.length} mục. Sắp xếp thứ tự và nội dung ở bước Soạn tiếp theo.`}
      </p>
    </StudioSection>
  );
}
