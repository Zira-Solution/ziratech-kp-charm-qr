"use client";

import React from "react";
import type { SlideDef } from "./template-contract";

const iconBase = "material-symbols-outlined leading-none";

/** Previous / next buttons kept for optional fallback use. */
export function StepButton({ direction, disabled, onClick }: { direction: -1 | 1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-no-swipe
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === -1 ? "Trang trước" : "Trang sau"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs shadow-xs cursor-pointer transition-all hover:bg-black/35 focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-20"
    >
      <span aria-hidden="true" className={`${iconBase} text-[20px]`}>
        {direction === -1 ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
}

/**
 * Minimal floating pagination indicator:
 * - Subtle, translucent dots ("mờ mờ ở dưới") without any bulky white background bar.
 * - Gentle swipe hint below using the matching handwriting font of the storybook template.
 */
export function NavBar({
  slides,
  index,
  onGo,
}: {
  slides: readonly SlideDef[];
  index: number;
  onGo: (i: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const isLast = index === slides.length - 1;

  return (
    <nav
      aria-label="Các trang của thiệp"
      className="absolute bottom-2.5 sm:bottom-3.5 inset-x-0 z-30 pointer-events-none flex flex-col items-center justify-center gap-1 select-none"
    >
      {/* Subtle, translucent dots ("mờ mờ ở dưới") */}
      <div className="flex items-center justify-center gap-1.5 pointer-events-auto">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <button
              key={slide.id}
              type="button"
              data-no-swipe
              onClick={() => onGo(i)}
              aria-label={`Trang ${i + 1}: ${slide.label}`}
              aria-current={active ? "page" : undefined}
              className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-125"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active
                    ? "h-1.5 w-4 sm:h-2 sm:w-5 bg-[#c13d28] ring-1.5 ring-white shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
                    : "h-1.5 w-1.5 sm:h-2 sm:w-2 bg-stone-800/35 hover:bg-stone-800/60 ring-1 ring-white/70 shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Gentle swipe hint with subtle frosted glass pill for crisp readability on any background */}
      <div className="px-3 py-0.5 rounded-full bg-white/45 backdrop-blur-md border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <p className="font-handwriting text-xs sm:text-sm text-[#381f14] font-bold tracking-wide flex items-center justify-center gap-1.5 leading-none">
          {isLast ? (
            <>
              <span className="opacity-60 text-[11px] leading-none">‹</span>
              <span>Vuốt qua phải để xem lại trang trước</span>
            </>
          ) : (
            <>
              <span className="opacity-60 text-[11px] leading-none">‹</span>
              <span>Vuốt qua trái / phải để xem tiếp</span>
              <span className="opacity-60 text-[11px] leading-none">›</span>
            </>
          )}
        </p>
      </div>
    </nav>
  );
}

