"use client";

import React from "react";
import type { GiftTemplateId } from "../gift-templates/types";
import { TEMPLATES } from "../gift-templates/template-config";
import { StudioSection } from "./ui";

interface Props {
  step: number;
  value: GiftTemplateId;
  onChange: (id: GiftTemplateId) => void;
}

export default function TemplatePicker({ step, value, onChange }: Props) {
  return (
    <StudioSection
      id="template"
      step={step}
      title="Giao diện thiệp"
      hint="Chỉ là cách trình bày: mẫu nào cũng hiện đầy đủ những gì bạn đã chọn, đổi mẫu không làm mất nội dung."
    >
      <div role="radiogroup" aria-label="Mẫu thiệp" className="grid gap-3 sm:grid-cols-3">
        {TEMPLATES.map((tpl) => {
          const selected = tpl.id === value;
          return (
            <button
              key={tpl.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(tpl.id)}
              className={`flex flex-col items-start rounded-xl border-2 p-3.5 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                selected ? "border-primary-container bg-surface-container-low" : "border-rose-petal bg-white hover:border-primary-container"
              }`}
            >
              <span aria-hidden="true" className="mb-1 text-2xl">
                {tpl.icon}
              </span>
              <span className="text-base font-bold text-on-surface">{tpl.name}</span>
              <span className="mt-0.5 text-sm text-warm-neutral">{tpl.desc}</span>
            </button>
          );
        })}
      </div>
    </StudioSection>
  );
}
