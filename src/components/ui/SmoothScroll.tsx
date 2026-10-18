"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * Global smooth scroll provider using Lenis.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        allowNestedScroll: true,
        prevent: (node) => {
          if (!node || typeof node.hasAttribute !== "function") return false;
          return Boolean(
            node.hasAttribute("data-lenis-prevent") ||
            node.closest?.("[data-lenis-prevent]") ||
            node.closest?.(".overflow-y-auto") ||
            node.closest?.(".overflow-x-auto") ||
            node.closest?.(".overflow-auto")
          );
        },
      }}
    >
      {children}
    </ReactLenis>
  );
}
