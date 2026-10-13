"use client";

import React, { useState } from "react";
import type { GiftDraft } from "../draft";
import { LETTER_SAMPLES, type LetterSample } from "../samples";
import { Field, StudioSection, fieldClass, ghostButton } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
  errors: { letterContent?: string };
}

const MAX_LETTER = 3000;

export default function LetterBlock({ step, draft, onChange, errors }: Props) {
  // A sample never overwrites the buyer's own words without asking first.
  const [pending, setPending] = useState<LetterSample | null>(null);

  const apply = (sample: LetterSample) => {
    onChange({
      letterTitle: sample.title,
      letterContent: sample.content,
      letterSignature: sample.signature,
    });
    setPending(null);
  };

  const pick = (sample: LetterSample) => {
    if (draft.letterContent.trim()) setPending(sample);
    else apply(sample);
  };

  return (
    <StudioSection
      id="letter"
      step={step}
      title="Bức thư tay"
      hint="Viết lời nhắn của riêng bạn, hoặc bắt đầu từ một câu mẫu rồi sửa lại cho giống mình."
    >
      <div className="mb-4">
        <p className="mb-2 text-[11px] font-sans font-bold uppercase tracking-wider text-secondary">Câu mẫu để bắt đầu</p>
        <div className="flex flex-wrap gap-2">
          {LETTER_SAMPLES.map((s) => (
            <button key={s.id} type="button" onClick={() => pick(s)} className={ghostButton}>
              {s.label}
            </button>
          ))}
        </div>

        {pending && (
          <div role="alertdialog" aria-label="Thay lời nhắn bằng câu mẫu" className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-sans text-amber-900">
            <p>
              Thay lời nhắn hiện tại bằng câu mẫu <strong>{pending.label}</strong>? Nội dung bạn đã viết sẽ bị thay thế.
            </p>
            <div className="mt-2.5 flex gap-2">
              <button type="button" onClick={() => apply(pending)} className="rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white hover:bg-amber-700">
                Thay thế
              </button>
              <button type="button" onClick={() => setPending(null)} className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-bold text-amber-900 hover:bg-amber-100">
                Giữ nội dung của tôi
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiêu đề thư" htmlFor="letter-title">
            <input
              id="letter-title"
              type="text"
              maxLength={200}
              value={draft.letterTitle}
              onChange={(e) => onChange({ letterTitle: e.target.value })}
              placeholder="LỜI NHẮN"
              className={fieldClass}
            />
          </Field>
          <Field label="Lời đề từ phụ" htmlFor="letter-subtitle" hint="Không bắt buộc">
            <input
              id="letter-subtitle"
              type="text"
              maxLength={200}
              value={draft.letterSubtitle}
              onChange={(e) => onChange({ letterSubtitle: e.target.value })}
              placeholder="Vẫn còn vài điều mình muốn kể bạn nghe..."
              className={fieldClass}
            />
          </Field>
        </div>

        <Field
          label="Nội dung lời nhắn"
          htmlFor="letter-content"
          required
          counter={`${draft.letterContent.length}/${MAX_LETTER}`}
          error={errors.letterContent}
        >
          <textarea
            id="letter-content"
            rows={7}
            maxLength={MAX_LETTER}
            value={draft.letterContent}
            onChange={(e) => onChange({ letterContent: e.target.value })}
            placeholder="Viết những lời nhắn gửi chân thành nhất tại đây..."
            aria-invalid={errors.letterContent ? true : undefined}
            className={`${fieldClass} resize-y leading-relaxed`}
          />
        </Field>

        <Field label="Chữ ký cuối thư" htmlFor="letter-signature">
          <input
            id="letter-signature"
            type="text"
            maxLength={100}
            value={draft.letterSignature}
            onChange={(e) => onChange({ letterSignature: e.target.value })}
            placeholder="Ví dụ: Người luôn dõi theo bạn ♡"
            className={fieldClass}
          />
        </Field>
      </div>
    </StudioSection>
  );
}
