import React from "react";

/** A picture that fills its box. Decorative: it carries no information, so it is hidden from screen readers. */
export function Photo({ src, className = "" }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden="true" decoding="async" loading="lazy" className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
}

/** A cut-out illustration placed over a background. Position and size come from `className`. */
export function Sticker({ src, className = "" }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden="true" decoding="async" loading="lazy" className={`pointer-events-none absolute object-contain ${className}`} />;
}
