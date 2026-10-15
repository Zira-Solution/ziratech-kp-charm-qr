"use client";

import React from "react";
import { daysSince, type GiftDraft } from "../draft";
import { Field, Icon, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

export default function AnniversaryBlock({ step, draft, onChange }: Props) {
  const days = daysSince(draft.anniversaryDate);

  return (
    <StudioSection
      id="anniversary"
      step={step}
      title="Ngày kỷ niệm"
      hint="Chọn một ngày đáng nhớ. Thiệp sẽ hiện số ngày đã bên nhau."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ngày" htmlFor="anniversary-date">
          <input
            id="anniversary-date"
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            value={draft.anniversaryDate}
            onChange={(e) => onChange({ anniversaryDate: e.target.value })}
            className={fieldClass}
          />
        </Field>
        <Field label="Tên ngày này" htmlFor="anniversary-label" hint="Mặc định: Ngày kỷ niệm">
          <input
            id="anniversary-label"
            type="text"
            maxLength={60}
            value={draft.anniversaryLabel}
            onChange={(e) => onChange({ anniversaryLabel: e.target.value })}
            placeholder="Ví dụ: Ngày mình bên nhau"
            className={fieldClass}
          />
        </Field>
      </div>

      {days !== null && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/70 px-3 py-1.5 text-xs font-sans font-bold text-primary">
          <Icon name="event" className="text-[16px] text-secondary" />
          {days >= 0 ? `Đã bên nhau ${days} ngày` : `Còn ${-days} ngày nữa`}
        </p>
      )}
    </StudioSection>
  );
}
