"use client";

import React from "react";
import type { GiftDraft } from "../draft";
import { Field, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
  errors: { letterContent?: string };
}

const MAX_LETTER = 3000;

export default function LetterBlock({ step, draft, onChange, errors }: Props) {
  return (
    <StudioSection
      id="letter"
      step={step}
      title="Bức thư tay"
      hint="Nắn nót từng câu chữ gửi trao từ trái tim đến người thương."
    >

      <div className="space-y-4 rounded-2xl liquid-glass-subtle border border-rose-200/60 p-4 sm:p-5 shadow-inner">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiêu đề bức thư" htmlFor="letter-title">
            <input
              id="letter-title"
              type="text"
              maxLength={200}
              value={draft.letterTitle}
              onChange={(e) => onChange({ letterTitle: e.target.value })}
              placeholder="Ví dụ: GỬI NGƯỜI THƯƠNG"
              className={`${fieldClass} font-serif tracking-wide uppercase font-bold text-[#721a28] placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal`}
            />
          </Field>
          <Field label="Lời đề từ phụ (nhỏ phía trên)" htmlFor="letter-subtitle" hint="Không bắt buộc">
            <input
              id="letter-subtitle"
              type="text"
              maxLength={200}
              value={draft.letterSubtitle}
              onChange={(e) => onChange({ letterSubtitle: e.target.value })}
              placeholder="Ví dụ: Vẫn còn vài điều mình muốn kể bạn nghe..."
              className={fieldClass}
            />
          </Field>
        </div>

        <Field
          label="Nội dung bức thư"
          htmlFor="letter-content"
          required
          counter={`${draft.letterContent.length}/${MAX_LETTER}`}
          error={errors.letterContent}
        >
          <textarea
            id="letter-content"
            rows={8}
            maxLength={MAX_LETTER}
            value={draft.letterContent}
            onChange={(e) => onChange({ letterContent: e.target.value })}
            placeholder="Nhấp vào đây để viết những lời nhắn gửi chân thành nhất..."
            aria-invalid={errors.letterContent ? true : undefined}
            className={`${fieldClass} resize-y leading-relaxed font-sans`}
          />
        </Field>

        <Field label="Chữ ký cuối thư" htmlFor="letter-signature" hint="Hiển thị với nét chữ viết tay mềm mại">
          <div className="relative">
            <input
              id="letter-signature"
              type="text"
              maxLength={100}
              value={draft.letterSignature}
              onChange={(e) => onChange({ letterSignature: e.target.value })}
              placeholder="Ví dụ: Người luôn thương bạn ♡"
              className={`${fieldClass} font-handwriting text-lg text-[#721a28] placeholder:font-sans placeholder:text-sm placeholder:font-normal`}
            />
          </div>
        </Field>
      </div>
    </StudioSection>
  );
}

