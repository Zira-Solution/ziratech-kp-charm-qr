"use client";

import React from "react";
import { Icon } from "./ui";

export type Stage = 1 | 2 | 3;

export const STAGES: readonly { n: Stage; label: string }[] = [
  { n: 1, label: "Chọn" },
  { n: 2, label: "Soạn" },
  { n: 3, label: "Hoàn tất" },
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
    <nav aria-label="Các bước tạo thiệp" className="mb-6">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STAGES.map((s, i) => {
          const current = s.n === stage;
          const done = s.n < stage;
          return (
            <li key={s.n} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={s.n > reached}
                aria-current={current ? "step" : undefined}
                onClick={() => onGo(s.n)}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-bold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:cursor-not-allowed ${
                  current
                    ? "border-primary-container bg-primary-container text-white"
                    : done
                      ? "border-primary-container bg-white text-primary-container"
                      : "border-rose-petal bg-white text-warm-neutral disabled:opacity-70"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${current ? "bg-white text-primary-container" : done ? "bg-primary-container text-white" : "bg-surface-container text-warm-neutral"}`}
                >
                  {done ? <Icon name="check" className="text-[16px]" /> : s.n}
                </span>
                <span>
                  <span className="sr-only">Bước {s.n}: </span>
                  {s.label}
                </span>
              </button>
              {i < STAGES.length - 1 && <span aria-hidden="true" className="hidden h-0.5 w-4 bg-rose-petal sm:block" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
