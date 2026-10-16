"use client";

import { useEffect, useState, type RefObject } from "react";

/** The width of an element, kept up to date as it changes. 0 until the first measurement. */
export function useContainerWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect.width;
      if (typeof box === "number") setWidth(box);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
