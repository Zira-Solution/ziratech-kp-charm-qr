"use client";

import React from "react";
import type { GiftDraft } from "../draft";
import { Field, StudioSection, fieldClass } from "../ui";

interface Props {
  step?: number;
  icon?: string;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
  errors: { recipientName?: string };
  compact?: boolean;
  idPrefix?: string;
  customerName?: string;
}

export default function NamesBlock({
  step,
  icon = "person",
  draft,
  onChange,
  errors,
  compact = false,
  idPrefix = "",
  customerName = "",
}: Props) {
  return (
    <StudioSection
      id={`${idPrefix}names`}
      step={step}
      icon={step === undefined ? icon : undefined}
      title="Người tặng và người nhận"
      hint="Tên hiện trang trọng trên thiệp để gửi trao tình cảm."
      compact={compact}
    >
      <div className="space-y-3.5">
        <Field label="Tên người nhận (bắt buộc)" htmlFor={`${idPrefix}names-recipient`} required error={errors.recipientName}>
          <input
            id={`${idPrefix}names-recipient`}
            type="text"
            maxLength={100}
            autoComplete="off"
            value={draft.recipientName}
            onChange={(e) => onChange({ recipientName: e.target.value })}
            placeholder="Ví dụ: Bảo Ngọc (hoặc Tên / Biệt danh người thương)"
            aria-invalid={errors.recipientName ? true : undefined}
            className={fieldClass}
          />
        </Field>

        <Field label="Tên bạn (người tặng)" htmlFor={`${idPrefix}names-sender`}>
          <input
            id={`${idPrefix}names-sender`}
            type="text"
            maxLength={100}
            autoComplete="off"
            value={draft.senderName}
            onChange={(e) => onChange({ senderName: e.target.value, anonymous: false })}
            placeholder={customerName ? `Ví dụ: ${customerName}` : "Ví dụ: Hoàng Nam"}
            className={fieldClass}
          />
        </Field>

        <Field label="Cách xưng hô" htmlFor={`${idPrefix}names-addressing`} hint="Xuất hiện trong lời chào thiệp (Ví dụ: Anh - Em, Tớ - Cậu, Bạn - Mình)">
          <input
            id={`${idPrefix}names-addressing`}
            type="text"
            maxLength={40}
            autoComplete="off"
            value={draft.addressing}
            onChange={(e) => onChange({ addressing: e.target.value })}
            placeholder="Ví dụ: Anh - Em (hoặc Tớ - Cậu, Bạn - Mình)"
            className={fieldClass}
          />
          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["Anh - Em", "Em - Anh", "Tớ - Cậu", "Mình - Bạn", "Chị - Em"].map((preset) => {
              const active = draft.addressing.trim().toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange({ addressing: preset })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                    active
                      ? "bg-[#ba4230] text-white border-[#ba4230] shadow-xs"
                      : "bg-[#fffdfa] text-stone-600 border-stone-200 hover:border-[#ba4230]/50 hover:bg-stone-50"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </StudioSection>
  );
}

