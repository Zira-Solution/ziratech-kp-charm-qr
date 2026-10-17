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
}

export default function NamesBlock({
  step,
  icon = "person",
  draft,
  onChange,
  errors,
  compact = false,
  idPrefix = "",
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
            placeholder="Ví dụ: Bảo Ngọc"
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
            placeholder="Ví dụ: Hoàng Nam"
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
            placeholder="Ví dụ: Anh - Em"
            className={fieldClass}
          />
        </Field>
      </div>
    </StudioSection>
  );
}

