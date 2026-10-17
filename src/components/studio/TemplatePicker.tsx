"use client";

import React from "react";
import type { GiftTemplateId } from "../gift-templates/types";
import { TEMPLATES } from "../gift-templates/template-config";
import { StudioSection } from "./ui";

interface Props {
  step: number;
  value: GiftTemplateId;
  onChange: (id: GiftTemplateId) => void;
  onPreview?: (id: GiftTemplateId) => void;
}

export default function TemplatePicker({ step, value, onChange, onPreview }: Props) {
  return (
    <StudioSection
      id="template"
      step={step}
      title="Giao diện thiệp"
      hint="Chỉ là cách trình bày: mẫu nào cũng hiện đầy đủ những gì bạn đã chọn, đổi mẫu không làm mất nội dung."
    >
      <div role="radiogroup" aria-label="Mẫu thiệp" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATES.map((tpl) => {
          const selected = tpl.id === value;
          return (
            <div
              key={tpl.id}
              className={`flex flex-col justify-between rounded-xl border-2 p-3.5 transition-colors ${
                selected ? "border-primary-container bg-surface-container-low" : "border-rose-petal bg-white hover:border-primary-container"
              }`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(tpl.id)}
                className="flex flex-1 flex-col items-start text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
              >
                <div className="flex w-full items-center justify-between mb-1">
                  <span aria-hidden="true" className="text-2xl">
                    {tpl.icon}
                  </span>
                  {selected && (
                    <span className="flex items-center gap-1 rounded-full bg-primary-container px-2 py-0.5 text-[11px] font-bold text-white">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      Đang chọn
                    </span>
                  )}
                </div>
                <span className="text-base font-bold text-on-surface">{tpl.name}</span>
                <span className="mt-0.5 text-sm text-warm-neutral">{tpl.desc}</span>
              </button>

              {onPreview && (
                <button
                  type="button"
                  onClick={() => onPreview(tpl.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary-container/20 bg-white py-1.5 px-3 text-xs font-bold text-primary-container shadow-2xs hover:bg-primary-container hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Xem thử mẫu này
                </button>
              )}
            </div>
          );
        })}
      </div>

      {onPreview && (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-rose-petal bg-surface-container-low p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <span className="material-symbols-outlined text-[22px]">visibility</span>
            </span>
            <div>
              <p className="text-sm font-bold text-on-surface">Xem trước thiệp thực tế</p>
              <p className="text-xs text-warm-neutral">Mở toàn màn hình xem trải nghiệm trọn vẹn thiệp với nội dung bạn đã soạn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPreview(value)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl liquid-glass-btn-primary px-5 text-sm font-bold text-white shadow-sm cursor-pointer whitespace-nowrap sm:w-auto"
          >
            <span className="material-symbols-outlined text-[20px]">play_circle</span>
            Xem trước ngay
          </button>
        </div>
      )}
    </StudioSection>
  );
}
