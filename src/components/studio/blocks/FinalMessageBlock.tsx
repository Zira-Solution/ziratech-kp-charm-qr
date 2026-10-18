"use client";

import React from "react";
import type { GiftDraft } from "../draft";
import { Field, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

const MAX = 200;

export default function FinalMessageBlock({ step, draft, onChange }: Props) {
  return (
    <StudioSection id="final" step={step} title="Lời kết" hint="Tùy chỉnh tiêu đề, câu nhắn gửi ngắn đọng lại ở hoàng hôn cuối thiệp.">
      <div className="space-y-4 rounded-2xl liquid-glass-subtle border border-rose-200/60 p-4 sm:p-5 shadow-inner">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiêu đề lời kết" htmlFor="final-title" hint="Không bắt buộc (mặc định: Cảm ơn em)">
            <input
              id="final-title"
              type="text"
              maxLength={100}
              value={draft.finalTitle}
              onChange={(e) => onChange({ finalTitle: e.target.value })}
              placeholder="Ví dụ: Cảm ơn em"
              className={fieldClass}
            />
          </Field>
          <Field label="Dòng nhắn phụ" htmlFor="final-subtitle" hint="Không bắt buộc (mặc định: đã đi qua những ngày này...)">
            <input
              id="final-subtitle"
              type="text"
              maxLength={200}
              value={draft.finalSubtitle}
              onChange={(e) => onChange({ finalSubtitle: e.target.value })}
              placeholder="Ví dụ: đã đi qua những ngày này cùng anh."
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="Câu kết thiệp (lời nhắn đọng lại)" htmlFor="final-message" counter={`${draft.finalMessage.length}/${MAX}`}>
          <textarea
            id="final-message"
            rows={3}
            maxLength={MAX}
            value={draft.finalMessage}
            onChange={(e) => onChange({ finalMessage: e.target.value })}
            placeholder="Ví dụ: Món quà này sẽ luôn ở đây, mỗi khi bạn muốn nhớ lại. ♡"
            className={`${fieldClass} resize-none`}
          />
        </Field>
      </div>
    </StudioSection>
  );
}
