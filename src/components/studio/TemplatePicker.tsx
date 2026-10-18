"use client";

import React from "react";
import type { GiftTemplateId } from "../gift-templates/types";
import { TEMPLATES } from "../gift-templates/template-config";
import { StudioSection } from "./ui";

interface Props {
  step: number;
  value: GiftTemplateId;
  onChange: (id: GiftTemplateId) => void;
  onPreview?: (id: GiftTemplateId) => void;
}

export default function TemplatePicker({ step, value, onChange, onPreview }: Props) {
  return (
    <StudioSection
      id="template"
      step={step}
      title="Chọn phong cách thiệp"
      hint="Chọn mẫu thiệp bạn yêu thích để bắt đầu thiết kế."
    >
      <div role="radiogroup" aria-label="Mẫu thiệp" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-2xl">
        {TEMPLATES.map((tpl) => {
          const selected = tpl.id === value;
          return (
            <div
              key={tpl.id}
              role="radio"
              aria-checked={selected}
              tabIndex={0}
              onClick={() => onChange(tpl.id)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onChange(tpl.id);
                }
              }}
              className={`group relative flex flex-col justify-between rounded-2xl p-3.5 transition-all duration-200 cursor-pointer overflow-hidden ${
                selected
                  ? "liquid-glass-card border-[#721a28] ring-2 ring-[#721a28]/25 shadow-[0_12px_28px_-6px_rgba(114,26,40,0.2)] -translate-y-1"
                  : "liquid-glass-card border-rose-200/60 hover:border-[#721a28]/40"
              }`}
            >
              {/* Clean frame mockup: only visual card frame, NO text content */}
              <div
                className="w-full h-28 rounded-xl mb-2.5 relative overflow-hidden flex items-center justify-center p-2.5 border border-black/5 shadow-inner"
                style={{ background: tpl.previewBg }}
              >
                {tpl.id === "storybook-sunset" && (
                  <div className="w-full h-full rounded-lg bg-white/75 border border-white/90 shadow-2xs flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center">
                      <span className="w-5 h-1 rounded-full bg-rose-300/60" />
                      <span className="w-2 h-2 rounded-full bg-rose-400/50" />
                    </div>
                    <div className="w-full border-b border-rose-200/40" />
                    <div className="flex gap-1">
                      <span className="w-10 h-1 rounded-full bg-amber-300/60" />
                      <span className="w-5 h-1 rounded-full bg-rose-200/60" />
                    </div>
                  </div>
                )}
                {tpl.id === "messenger" && (
                  <div className="w-full h-full rounded-lg bg-white/80 border border-pink-200 shadow-2xs flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-pink-600 font-bold">9:41</span>
                      <span className="text-[10px] text-pink-500">♥</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end my-auto">
                      <div className="px-2 py-0.5 rounded-full bg-[#0084ff] text-white text-[8px] font-medium max-w-[85%] truncate">
                        hello bé iu ❤️
                      </div>
                      <div className="px-1.5 py-0.5 rounded-full bg-pink-100 text-[#c13d28] text-[8px]">
                        💌 Thư tay &amp; Voice
                      </div>
                    </div>
                    <div className="w-10 h-0.5 rounded-full bg-stone-400/50 mx-auto" />
                  </div>
                )}

                {/* Selection badge at top-right corner of thumbnail */}
                {selected ? (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full liquid-glass-btn-primary text-white shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 h-5 w-5 rounded-full border-2 border-slate-400/50 bg-white/80 group-hover:border-[#721a28]/60 transition-colors" />
                )}
              </div>

              {/* Title & Tag */}
              <div className="text-center mb-2.5">
                <span className="inline-block text-[10px] font-bold text-[#721a28] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 mb-1">
                  {tpl.tag}
                </span>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                  {tpl.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 px-1 leading-snug">
                  {tpl.desc}
                </p>
              </div>

              {/* Preview button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tpl.id === "messenger") {
                    window.open("/messenger", "_blank");
                  } else if (onPreview) {
                    onPreview(tpl.id);
                  } else {
                    window.open("/thamkhao?device=phone", "_blank");
                  }
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl liquid-glass-pill py-2 px-3 text-xs font-bold text-[#721a28] border border-rose-200/80 hover:bg-[#721a28] hover:text-white hover:border-[#721a28] transition-all cursor-pointer mt-auto"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Xem mẫu thiệp</span>
              </button>
            </div>
          );
        })}
      </div>
    </StudioSection>
  );
}


