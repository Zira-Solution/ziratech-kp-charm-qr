"use client";

import React from "react";
import type { TimelineItem } from "@/components/gift-templates/types";
import { MAX_TIMELINE } from "@/lib/validation/gift";
import { Icon, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
}

export default function TimelineBlock({ step, items, onChange }: Props) {
  const patch = (index: number, change: Partial<TimelineItem>) =>
    onChange(items.map((t, i) => (i === index ? { ...t, ...change } : t)));

  return (
    <StudioSection
      id="timeline"
      step={step}
      title="Mốc thời gian"
      hint={`Những khoảnh khắc đáng nhớ của hai người, tối đa ${MAX_TIMELINE} mốc. Mỗi mốc cần có ngày và tiêu đề.`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full liquid-glass-pill px-3 py-1 text-[11px] font-sans font-bold text-primary border border-rose-200/80">
          {items.length}/{MAX_TIMELINE} mốc
        </span>
        {items.length < MAX_TIMELINE && (
          <button
            type="button"
            onClick={() => onChange([...items, { date: "", title: "", text: "" }])}
            className="flex items-center gap-1 rounded-xl liquid-glass-btn-primary px-3 py-1.5 text-xs font-sans font-bold text-white shadow-xs cursor-pointer"
          >
            <Icon name="add" className="text-[16px]" />
            Thêm mốc
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[#721a28]/25 liquid-glass-subtle px-4 py-6 text-center text-xs font-sans text-warm-neutral">
          Chưa có mốc nào. Bấm <strong className="text-primary">Thêm mốc</strong> để bắt đầu.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="rounded-2xl liquid-glass-card border border-rose-200/60 p-3.5 shadow-sm overflow-hidden">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-handwriting text-xl leading-none text-secondary">mốc {i + 1}</span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  aria-label={`Xóa mốc số ${i + 1}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-warm-neutral hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                >
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <div>
                  <label htmlFor={`timeline-${i}-date`} className="sr-only">
                    Ngày của mốc số {i + 1}
                  </label>
                  <input
                    id={`timeline-${i}-date`}
                    type="date"
                    min="1900-01-01"
                    max="2100-12-31"
                    value={item.date}
                    onChange={(e) => patch(i, { date: e.target.value })}
                    className={`${fieldClass} !py-2`}
                  />
                </div>
                <div>
                  <label htmlFor={`timeline-${i}-title`} className="sr-only">
                    Tiêu đề của mốc số {i + 1}
                  </label>
                  <input
                    id={`timeline-${i}-title`}
                    type="text"
                    maxLength={60}
                    value={item.title}
                    onChange={(e) => patch(i, { title: e.target.value })}
                    placeholder="Tiêu đề, ví dụ: Lần đầu gặp nhau"
                    className={`${fieldClass} !py-2`}
                  />
                </div>
              </div>
              <label htmlFor={`timeline-${i}-text`} className="sr-only">
                Mô tả của mốc số {i + 1}
              </label>
              <textarea
                id={`timeline-${i}-text`}
                rows={2}
                maxLength={200}
                value={item.text}
                onChange={(e) => patch(i, { text: e.target.value })}
                placeholder="Mô tả ngắn (không bắt buộc)"
                className={`${fieldClass} mt-2.5 resize-y !py-2`}
              />
            </li>
          ))}
        </ol>
      )}
    </StudioSection>
  );
}
