"use client";

import React from "react";
import type { SlideDef } from "./template-contract";

const iconBase = "material-symbols-outlined leading-none";

/** Previous / next. Disabled at the ends. */
export function StepButton({ direction, disabled, onClick }: { direction: -1 | 1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === -1 ? "Trang trước" : "Trang sau"}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm cursor-pointer transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:cursor-not-allowed disabled:opacity-30"
    >
      <span aria-hidden="true" className={`${iconBase} text-[24px]`}>
        {direction === -1 ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
}

/** One dot per page. Each is a button, so the visitor can jump. */
function Dots({ slides, index, onGo }: { slides: readonly SlideDef[]; index: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Các trang của thiệp" className="flex items-center justify-center gap-0.5">
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

/** The bar under the card: back, one dot per page with the name of the current page, forward. */
export function NavBar({ slides, index, onGo, onPrev, onNext }: { slides: readonly SlideDef[]; index: number; onGo: (i: number) => void; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white/90 px-3 py-2 backdrop-blur">
      <StepButton direction={-1} disabled={index === 0} onClick={onPrev} />
      <div className="min-w-0 flex items-center justify-center">
        <Dots slides={slides} index={index} onGo={onGo} />
      </div>
      <StepButton direction={1} disabled={index === slides.length - 1} onClick={onNext} />
    </div>
  );
}
