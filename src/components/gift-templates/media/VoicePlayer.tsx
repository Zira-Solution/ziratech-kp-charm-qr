"use client";

import React from "react";
import { formatClock } from "../../studio/recorder";
import { useVoicePlayer } from "./useVoicePlayer";

interface Props {
  /** Signed link to the recording. */
  src?: string;
  /** Length the buyer recorded, "MM:SS". */
  duration: string;
  /** Asked once for a new link when the current one stops working. */
  onRefresh?: () => Promise<string | null>;
  /** Spoken name of the control, e.g. "lời nhắn giọng nói". */
  label?: string;
  className?: string;
}

const secondsFrom = (clock: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(clock);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
};

/** The plain player. Templates that want their own look use `useVoicePlayer` directly. */
export default function VoicePlayer({ src, duration, onRefresh, label = "lời nhắn giọng nói", className = "" }: Props) {
  const { playing, current, total, failed, toggle, seek } = useVoicePlayer(src, secondsFrom(duration), onRefresh);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Tạm dừng ${label}` : `Phát ${label}`}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
      >
        <span aria-hidden="true" className="material-symbols-outlined leading-none text-[26px]">
          {playing ? "pause" : "play_arrow"}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={1000}
          value={total > 0 ? Math.round((current / total) * 1000) : 0}
          onChange={(e) => seek(Number(e.target.value) / 1000)}
          disabled={failed || !src}
          aria-label={`Vị trí trong ${label}`}
          aria-valuetext={`${formatClock(current)} trên ${formatClock(total)}`}
          className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-warm-neutral">
          <span>{formatClock(current)}</span>
          <span>{formatClock(total)}</span>
        </div>
        {failed && (
          <p role="alert" className="mt-1 text-[11px] font-sans font-bold text-rose-700">
            Không phát được ghi âm. Hãy tải lại trang rồi thử lại.
          </p>
        )}
      </div>
    </div>
  );
}
