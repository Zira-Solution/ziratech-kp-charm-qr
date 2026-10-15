"use client";

import React from "react";
import { toVideoEmbed } from "../../../lib/media/embed";

interface Props {
  /** The link the buyer pasted (already checked on save, checked again here). */
  link: string;
  title?: string;
  className?: string;
}

const httpsLink = (link: string) => {
  try {
    return new URL(link).protocol === "https:" ? link : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The buyer's video in a frame. A frame cannot tell us that the site refused to show the video
 * (a private or non-embeddable video), so the link to open it in a new tab is always offered.
 */
export default function VideoEmbed({ link, title = "Video dành cho bạn", className = "" }: Props) {
  const src = toVideoEmbed(link);
  const href = httpsLink(link);

  return (
    <div className={className}>
      {src && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={src}
            title={title}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
            className="h-full w-full border-0"
          />
        </div>
      )}
      {href && (
        <p className="mt-2 text-center text-[11px] font-sans text-warm-neutral">
          {src ? "Không xem được video? " : "Không nhúng được video này. "}
          <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
            Mở video ở trang gốc
          </a>
        </p>
      )}
    </div>
  );
}
