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
      title="Bảo mật: OTP mở thiệp"
      hint="Người nhận sẽ mở thiệp ở trang chủ bằng Mã thiệp và mã OTP 4 số này. Bạn có thể giữ nguyên mã in trên thẻ hoặc đặt mã kỷ niệm riêng (ví dụ: ngày sinh, năm quen nhau)."
    >
      <div className="max-w-sm rounded-2xl liquid-glass-card border border-rose-200/70 p-4 overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl liquid-glass-btn-primary text-white shadow-xs">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">Khóa niêm phong thiệp</p>
            <p className="text-[11px] text-slate-500">Mặc định dùng mã in trên thẻ cứng đi kèm</p>
          </div>
        </div>

        <Field
          label="Đổi mã OTP mới (4 chữ số)"
          htmlFor="pin-new"
          hint="Để trống nếu muốn giữ nguyên OTP in sẵn trên thẻ."
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
            className={`${fieldClass} text-center font-mono text-xl font-bold tracking-[0.6em] text-[#721a28]`}
          />
        </Field>
      </div>
    </StudioSection>
  );
}

