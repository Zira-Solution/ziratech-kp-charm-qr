"use client";

import React from "react";
import { daysSince, type GiftDraft } from "../draft";
import { Field, Icon, StudioSection, fieldClass } from "../ui";
import SmartDateInput, { isoToDisplay } from "../SmartDateInput";

interface Props {
  step: number;
  draft: GiftDraft;
  onChange: (patch: Partial<GiftDraft>) => void;
}

const LABEL_PRESETS = [
  "Ngày mình yêu nhau",
  "Ngày đầu gặp gỡ",
  "Ngày chính thức chung đôi",
  "Ngày cưới",
];

export default function AnniversaryBlock({ step, draft, onChange }: Props) {
  const days = daysSince(draft.anniversaryDate);

  // Quick date presets
  const setYearsAgo = (years: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    onChange({ anniversaryDate: `${y}-${m}-${day}` });
  };

  const setOct20 = () => {
    const currentYear = new Date().getFullYear();
    onChange({ anniversaryDate: `${currentYear}-10-20` });
  };

  return (
    <StudioSection
      id="anniversary"
      step={step}
      title="Ngày kỷ niệm"
      hint="Gõ trực tiếp ngày bằng bàn phím (ví dụ 20/10/2023) hoặc bấm biểu tượng lịch để chọn. Thiệp sẽ tính chính xác số ngày yêu nhau."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Ngày kỷ niệm (gõ ngày/tháng/năm)"
          htmlFor="anniversary-date"
          hint="Gõ tay thoải mái theo định dạng ngày/tháng/năm"
        >
          <SmartDateInput
            id="anniversary-date"
            value={draft.anniversaryDate}
            onChange={(date) => onChange({ anniversaryDate: date })}
            placeholder="dd/mm/yyyy (ví dụ: 20/10/2023)"
          />

          {/* Quick Date Presets */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium mr-0.5">Chọn nhanh:</span>
            <button
              type="button"
              onClick={setOct20}
              className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#721a28] text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
            >
              20/10
            </button>
            <button
              type="button"
              onClick={() => setYearsAgo(1)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              1 năm trước
            </button>
            <button
              type="button"
              onClick={() => setYearsAgo(2)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              2 năm trước
            </button>
          </div>
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

          {/* Quick Label Presets */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {LABEL_PRESETS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onChange({ anniversaryLabel: label })}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-colors cursor-pointer ${
                  draft.anniversaryLabel === label
                    ? "bg-[#721a28] text-white font-bold"
                    : "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-[#721a28]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {days !== null && draft.anniversaryDate && (
        <div className="mt-3.5 inline-flex items-center gap-2 rounded-2xl liquid-glass-pill border border-rose-200/80 px-4 py-2 text-xs font-sans font-bold text-[#721a28] shadow-2xs">
          <Icon name="favorite" className="text-[17px] text-[#721a28]" />
          <span>
            {isoToDisplay(draft.anniversaryDate)}:{" "}
            <strong className="underline decoration-rose-300">
              {days >= 0 ? `Đã bên nhau ${days.toLocaleString("vi-VN")} ngày` : `Còn ${(-days).toLocaleString("vi-VN")} ngày nữa`}
            </strong>
          </span>
        </div>
      )}
    </StudioSection>
  );
}
