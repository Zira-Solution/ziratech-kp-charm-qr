"use client";

import React from "react";
import type { GiftDraft } from "../draft";
import { Field, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
  errors: { recipientName?: string };
}

export default function NamesBlock({ step, draft, onChange, errors }: Props) {
  return (
    <StudioSection
      id="names"
      step={step}
      title="Người tặng và người nhận"
      hint="Tên hiện trên thiệp. Bạn có thể ẩn tên người tặng nếu muốn giữ bí mật."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên bạn (người tặng)" htmlFor="names-sender">
          <input
            id="names-sender"
            type="text"
            maxLength={100}
            autoComplete="off"
            value={draft.senderName}
            onChange={(e) => onChange({ senderName: e.target.value })}
            placeholder="Ví dụ: Hoàng Nam"
            className={fieldClass}
          />
        </Field>

        <Field label="Tên người nhận" htmlFor="names-recipient" required error={errors.recipientName}>
          <input
            id="names-recipient"
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

        <Field label="Cách xưng hô" htmlFor="names-addressing" hint="Không bắt buộc">
          <input
            id="names-addressing"
            type="text"
            maxLength={40}
            autoComplete="off"
            value={draft.addressing}
            onChange={(e) => onChange({ addressing: e.target.value })}
            placeholder="Ví dụ: Anh - Em, Tớ - Cậu"
            className={fieldClass}
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-2.5 self-end rounded-xl border border-white/90 bg-white/50 px-3.5 py-2.5 text-xs font-sans text-espresso">
          <input
            type="checkbox"
            checked={draft.anonymous}
            onChange={(e) => onChange({ anonymous: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-primary-container"
          />
          <span>
            <strong className="text-primary">Ẩn tên người tặng</strong>
            <span className="block text-warm-neutral">Người nhận sẽ không thấy tên bạn.</span>
          </span>
        </label>
      </div>
    </StudioSection>
  );
}
