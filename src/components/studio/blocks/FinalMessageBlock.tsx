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
    <StudioSection id="final" step={step} title="Lời kết" hint="Một câu ngắn hiện ở cuối thiệp, để người nhận mang theo.">
      <Field label="Câu kết thiệp" htmlFor="final-message" counter={`${draft.finalMessage.length}/${MAX}`}>
        <input
          id="final-message"
          type="text"
          maxLength={MAX}
          value={draft.finalMessage}
          onChange={(e) => onChange({ finalMessage: e.target.value })}
          placeholder="Ví dụ: Món quà này sẽ luôn ở đây, mỗi khi bạn muốn nhớ lại. ♡"
          className={fieldClass}
        />
      </Field>
    </StudioSection>
  );
}
