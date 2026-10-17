"use client";

import React from "react";
import { Icon } from "./ui";

export type Stage = 1 | 2 | 3;

export const STAGES: readonly { n: Stage; label: string; sub: string }[] = [
  { n: 1, label: "Mẫu & Mục", sub: "Chọn giao diện & thông điệp" },
  { n: 2, label: "Soạn thiệp", sub: "Điền lời chúc & kỷ niệm" },
  { n: 3, label: "Hoàn tất", sub: "Bảo mật & Lưu thiệp" },
];

interface Props {
  stage: Stage;
  /** Furthest step the buyer has confirmed. Steps beyond it stay locked. */
  reached: Stage;
  onGo: (stage: Stage) => void;
}

/** The three steps of the writing desk. Earlier steps can be reopened; later ones open only after "Tiếp tục". */
export default function Stepper({ stage, reached, onGo }: Props) {
  return (
    <nav aria-label="Các bước tạo thiệp" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STAGES.map((s, i) => {
          const current = s.n === stage;
          const done = s.n < stage;
          return (
            <li key={s.n} className="flex flex-1 items-center gap-2 sm:gap-4">
              <button
                type="button"
                disabled={s.n > reached}
                aria-current={current ? "step" : undefined}
                onClick={() => onGo(s.n)}
                className={`flex min-h-13 flex-1 items-center justify-start gap-2.5 rounded-2xl px-3 py-2 text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:cursor-not-allowed overflow-hidden ${
                  current
                    ? "liquid-glass-btn-primary border-white/60 text-white shadow-md shadow-[#721a28]/20"
                    : done
                      ? "liquid-glass-card border-rose-200/90 text-[#721a28] hover:border-[#721a28]/60 shadow-xs"
                      : "liquid-glass border-slate-200/80 text-slate-400 disabled:opacity-60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform ${
                    current
                      ? "bg-white text-[#721a28] shadow-xs scale-105"
                      : done
                        ? "liquid-glass-pill text-[#721a28] border-rose-200"
                        : "liquid-glass-subtle text-slate-400"
                  }`}
                >
                  {done ? <Icon name="check" className="text-[16px]" /> : s.n}
                </span>
                <span className="min-w-0">
                  <span className={`block text-xs sm:text-sm font-bold tracking-tight truncate ${current ? "text-white" : done ? "text-[#721a28]" : "text-slate-600"}`}>
                    <span className="sr-only">Bước {s.n}: </span>
                    {s.label}
                  </span>
                  <span className={`hidden sm:block text-[10px] truncate leading-tight ${current ? "text-rose-100" : "text-slate-400"}`}>
                    {s.sub}
                  </span>
                </span>
              </button>
              {i < STAGES.length - 1 && (
                <span aria-hidden="true" className="hidden h-0.5 w-3 shrink-0 bg-rose-200 sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

