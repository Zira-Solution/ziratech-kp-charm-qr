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
              className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                selected
                  ? "liquid-glass bg-white/95 border-amber-400 ring-2 ring-primary-container/20 shadow-md"
                  : "liquid-glass-card border-white/70 hover:bg-white/80"
              }`}
            >
              <span aria-hidden="true" className="mb-1 text-2xl">
                {tpl.icon}
              </span>
              <span className="font-serif text-sm font-bold text-primary">{tpl.name}</span>
              <span className="mt-0.5 text-[11px] font-sans text-warm-neutral">{tpl.desc}</span>
            </button>
          );
        })}
      </div>
    </StudioSection>
  );
}
