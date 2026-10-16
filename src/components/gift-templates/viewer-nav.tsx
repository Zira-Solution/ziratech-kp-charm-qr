"use client";

import React from "react";
import type { SlideDef } from "./template-contract";

const iconBase = "material-symbols-outlined leading-none";

/** Previous / next. Disabled at the ends. */
export function StepButton({ direction, disabled, onClick, className = "" }: { direction: -1 | 1; disabled: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === -1 ? "Trang trước" : "Trang sau"}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm cursor-pointer transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
    >
      <span aria-hidden="true" className={`${iconBase} text-[26px]`}>
        {direction === -1 ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
}

/** One dot per page. Each is a button, so the visitor can jump. */
export function Dots({ slides, index, onGo }: { slides: readonly SlideDef[]; index: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Các trang của thiệp" className="flex items-center justify-center gap-1 py-2">
      {slides.map((slide, i) => (
        <button
          key={slide.id}
          type="button"
          onClick={() => onGo(i)}
          aria-label={`Trang ${i + 1}: ${slide.label}`}
          aria-current={i === index ? "page" : undefined}
          className="flex h-8 w-6 items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-container"
        >
          <span className={`block rounded-full transition-all ${i === index ? "h-2.5 w-5 bg-slate-800" : "h-2.5 w-2.5 bg-slate-400"}`} />
        </button>
      ))}
    </nav>
  );
}

/** The list of pages in the desktop side pane. */
export function SlideList({ slides, index, onGo }: { slides: readonly SlideDef[]; index: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Các trang của thiệp">
      <ol className="space-y-1.5">
        {slides.map((slide, i) => {
          const current = i === index;
          return (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => onGo(i)}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl border-2 px-3 text-left text-sm font-bold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container ${
                  current ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                <span aria-hidden="true" className={`${iconBase} text-[20px]`}>
                  {slide.icon}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {i + 1}. {slide.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
