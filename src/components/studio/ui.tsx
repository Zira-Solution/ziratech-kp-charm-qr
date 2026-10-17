"use client";

import React from "react";

// Shared look of the studio: a writing desk. Each block is a sheet of paper with a strip of washi tape
// and a handwritten step number. Colours come from the site theme tokens.

export const fieldClass =
  "w-full px-4 py-2.5 rounded-xl liquid-glass-input text-base sm:text-sm font-sans text-espresso border border-white/90 " +
  "placeholder:text-warm-neutral/60 focus:outline-none focus:ring-2 focus:ring-primary-container/30";

export const ghostButton =
  "px-3 py-1.5 rounded-xl text-xs font-sans font-bold text-primary border border-white/90 liquid-glass-pill hover:bg-white " +
  "transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container";

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined leading-none ${className}`}>
      {name}
    </span>
  );
}

/** Controls (move up / down / remove) that a surrounding BlockFrame hands to the section it wraps. */
export const BlockControlsContext = React.createContext<React.ReactNode>(null);

export function StudioSection({
  id,
  step,
  icon,
  title,
  hint,
  compact = false,
  children,
}: {
  id: string;
  step?: number;
  icon?: string;
  title: string;
  hint?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  const controls = React.useContext(BlockControlsContext);
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={`relative rounded-3xl liquid-glass-section border border-rose-200/70 overflow-hidden transition-all ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7"
      }`}
    >
      <header className="mb-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {(step !== undefined || icon) && (
              <span
                aria-hidden="true"
                className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full liquid-glass-btn-primary text-xs font-extrabold text-white shadow-xs"
              >
                {step !== undefined ? step : <Icon name={icon!} className="text-[16px]" />}
              </span>
            )}
            <h2 id={`${id}-title`} className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              {step !== undefined && <span className="sr-only">Bước {step}: </span>}
              {title}
            </h2>
          </div>
          {controls}
        </div>
        {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>}
      </header>
      <div className="relative z-10">{children}</div>
    </section>
  );
}


export function Field({
  label,
  htmlFor,
  required,
  hint,
  counter,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  counter?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-sans font-bold text-primary">
          {label}
          {required && <span className="text-rose-600"> *</span>}
        </label>
        {counter && <span className="text-[11px] font-sans text-warm-neutral">{counter}</span>}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-[11px] font-sans font-bold text-rose-700">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[11px] font-sans text-warm-neutral">{hint}</p>
      )}
    </div>
  );
}
