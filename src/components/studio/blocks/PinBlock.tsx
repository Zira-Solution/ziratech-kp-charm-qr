"use client";

import React from "react";
import type { GiftDraft } from "../draft";
import { Field, StudioSection, fieldClass } from "../ui";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

export default function PinBlock({ step, draft, onChange }: Props) {
  return (
    <StudioSection
      id="pin"
      step={step}
      title="OTP xem thiệp"
      hint="Người nhận nhập mã thiệp và OTP này ở trang chủ để mở thiệp. Mặc định dùng OTP in trên thẻ."
    >
      <div className="max-w-xs">
        <Field
          label="Đổi OTP xem thiệp (4 số)"
          htmlFor="pin-new"
          hint="Để trống để giữ nguyên OTP in trên thẻ. Nếu đổi, hãy báo OTP mới cho người nhận."
        >
          <input
            id="pin-new"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={draft.unlockPin}
            onChange={(e) => onChange({ unlockPin: e.target.value.replace(/\D/g, "") })}
            placeholder="••••"
            className={`${fieldClass} text-center font-mono text-lg tracking-[0.5em]`}
          />
        </Field>
      </div>
    </StudioSection>
  );
}
