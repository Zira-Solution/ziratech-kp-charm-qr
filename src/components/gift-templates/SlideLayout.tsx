"use client";

import React from "react";
import type { Layout } from "./layout";

interface Props {
  layout: Layout;
  /** The picture or illustration half. */
  visual: React.ReactNode;
  /** The content half (letter, photos, a player...). Scrolls by itself when it is long. */
  children: React.ReactNode;
  /** Classes for the whole page (background, text colour, font). */
  className?: string;
  visualClassName?: string;
  contentClassName?: string;
}

/**
 * One page of the card, split in two: picture on top and content below in a portrait frame, picture on
 * the left and content on the right in a landscape frame. Every template builds its pages on this, so
 * they all fill the frame the same way and differ only in what they put in it and how it looks.
 */
export default function SlideLayout({ layout, visual, children, className = "", visualClassName = "", contentClassName = "" }: Props) {
  const landscape = layout === "landscape";
  return (
    <div className={`grid h-full w-full ${landscape ? "grid-cols-[minmax(0,5fr)_minmax(0,6fr)]" : "grid-rows-[minmax(0,2fr)_minmax(0,3fr)]"} ${className}`}>
      {/* A size container: illustrations can size themselves in `cqmin` (1% of the smaller side of this box). */}
      <div style={{ containerType: "size" }} className={`relative min-h-0 min-w-0 overflow-hidden ${visualClassName}`}>
        {visual}
      </div>
      <div className={`min-h-0 min-w-0 overflow-y-auto ${contentClassName}`}>
        <div className={`flex min-h-full flex-col justify-center gap-4 ${landscape ? "px-10 py-8" : "px-5 py-5"}`}>{children}</div>
      </div>
    </div>
  );
}
