"use client";

import { useEffect, useState, type RefObject } from "react";

export interface Size {
  width: number;
  height: number;
}

/** The size of an element, kept up to date as it changes. 0 x 0 until the first measurement. */
export function useContainerSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = (width: number, height: number) =>
      setSize((s) => (Math.round(s.width) === Math.round(width) && Math.round(s.height) === Math.round(height) ? s : { width, height }));
    const box = el.getBoundingClientRect();
    measure(box.width, box.height);
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) measure(rect.width, rect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
