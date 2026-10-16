"use client";

import React from "react";
import type { TimelineItem } from "../types";
import { formatDateVi, sortTimeline } from "./format";

interface Props {
  items: readonly TimelineItem[];
  className?: string;
}

/** The moments in the order they happened. Templates restyle it through `className` and the markup's own tags. */
export default function TimelineList({ items, className = "" }: Props) {
  return (
    <ol className={`space-y-4 ${className}`}>
      {sortTimeline(items).map((item, i) => (
        <li key={`${item.date}-${i}`} className="flex gap-3">
          <span aria-hidden="true" className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary" />
          <div className="min-w-0">
            <time dateTime={item.date} className="text-xs font-bold opacity-75">
              {formatDateVi(item.date)}
            </time>
            <p className="text-base font-bold">{item.title}</p>
            {item.text && <p className="text-sm leading-relaxed opacity-90">{item.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
