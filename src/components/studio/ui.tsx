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

export function StudioSection({
  id,
  step,
  title,
  hint,
  children,
}: {
  id: string;
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="relative p-5 sm:p-6 pt-7 rounded-3xl liquid-glass border border-white/90 shadow-sm"
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 left-8 h-4 w-20 -rotate-2 rounded-xs bg-gold/45 border border-gold-accent/20"
      />
      <header className="mb-4">
        <div className="flex items-baseline gap-2.5">
          <span className="font-handwriting text-2xl leading-none text-secondary">bước {step}</span>
          <h2 id={`${id}-title`} className="font-serif text-base sm:text-lg font-bold text-primary">
            {title}
          </h2>
        </div>
        {hint && <p className="mt-1 text-xs font-sans text-warm-neutral leading-relaxed">{hint}</p>}
      </header>
      {children}
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
