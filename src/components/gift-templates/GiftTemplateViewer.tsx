"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { musicPlayerSynth } from "./audio-helper";
import { layoutFor, moveIndex, slideAnnouncement } from "./layout";
import type { ViewerGift } from "./normalize";
import type { TemplateContext } from "./template-contract";
import type { GiftTemplateId } from "./types";
import { getViewerTemplate } from "./viewer-templates";
import { useContainerSize } from "./useContainerSize";
import { NavBar } from "./viewer-nav";
import { useMusicPlayer } from "./media/useMusicPlayer";

interface Props {
  gift: ViewerGift;
  /** Asks the server for a fresh link to the recording. */
  refreshVoiceUrl?: () => Promise<string | null>;
  /** Shows a button that calls this (lock the card again, or close the preview). */
  onBack?: () => void;
  backLabel?: string;
  /** Inside the studio preview: no link back to the site. */
  embedded?: boolean;
}

const BACKGROUND: Record<GiftTemplateId, string> = {
  "vintage-scrapbook": "bg-parchment-light",
  "retro-nostalgia": "bg-parchment-border",
  "storybook-sunset": "bg-[#fdebd8]",
  "kp-atelier": "bg-surface-container-low",
};

const SWIPE_MIN = 50;

/**
 * The card page. It fills the box it is put in and takes the shape of it: a portrait frame (picture on
 * top, content below) on phones and tablets held upright, a landscape frame (picture left, content
 * right) on tablets held sideways and computers. It owns what does not depend on the look: moving
 * between pages by buttons, keys or swipe, the opening melody and the announcement for screen readers.
 * The template only draws the page it is given.
 */
export default function GiftTemplateViewer({ gift, refreshVoiceUrl, onBack, backLabel = "Khóa lại", embedded = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(rootRef);
  const layout = layoutFor(width, height);

  const template = getViewerTemplate(gift.template);
  const slides = useMemo(() => template.slides(gift), [template, gift]);
  const [requested, setRequested] = useState(0);
  const index = moveIndex(requested, 0, slides.length);

  // Which way the visitor moved, so the new page slides in from the matching side.
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const go = useCallback(
    (i: number) => {
      setDirection(i < index ? "prev" : "next");
      setRequested(moveIndex(0, i, slides.length));
    },
    [index, slides.length]
  );
  const next = useCallback(() => {
    setDirection("next");
    setRequested((i) => moveIndex(i, 1, slides.length));
  }, [slides.length]);
  const prev = useCallback(() => {
    setDirection("prev");
    setRequested((i) => moveIndex(i, -1, slides.length));
  }, [slides.length]);

  // The built-in melody starts when the card opens. A browser may hold it back until the visitor first touches
  // the page, so the first touch or key press lets it through, and the button always shows the real state.
  const hasMelody = gift.song?.source === "preset";
  const music = useMusicPlayer(hasMelody ? gift.song?.presetId : undefined);
  useEffect(() => {
    music.start();
    const letSoundIn = () => musicPlayerSynth.resume();
    window.addEventListener("pointerdown", letSoundIn, { once: true });
    window.addEventListener("keydown", letSoundIn, { once: true });
    return () => {
      window.removeEventListener("pointerdown", letSoundIn);
      window.removeEventListener("keydown", letSoundIn);
    };
  }, []);

  // A little confetti when a recipient opens the card (not in the studio preview, not for people who ask for less motion).
  useEffect(() => {
    if (embedded || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.35 }, colors: ["#c13d28", "#d99b26", "#fea095", "#ffffff"], disableForReducedMotion: true });
  }, [embedded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      else if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const touch = useRef<{ x: number; y: number } | null>(null);
  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const start = touch.current;
      touch.current = null;
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
    },
  };

  const slide = slides[index];
  const ctx: TemplateContext = { layout, width, height, index, count: slides.length, go, next, prev, refreshVoiceUrl };

  const floating = "inline-flex min-h-10 items-center gap-1 rounded-full border border-slate-300 bg-white/90 px-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur cursor-pointer hover:bg-white";

  return (
    <div ref={rootRef} data-layout={layout} className={`relative flex h-full w-full flex-col overflow-hidden text-on-surface ${BACKGROUND[gift.template]}`}>
      <p aria-live="polite" className="sr-only">
        {slideAnnouncement(index, slides)}
      </p>

      {(onBack || !embedded) && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
          {onBack && (
            <button type="button" onClick={onBack} className={floating}>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
                {embedded ? "close" : "lock"}
              </span>
              {backLabel}
            </button>
          )}
          {!embedded && (
            <Link href="/" className={floating}>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
                home
              </span>
              Trang chủ
            </Link>
          )}
        </div>
      )}

      {hasMelody && (
        <button
          type="button"
          onClick={music.toggle}
          aria-pressed={music.playing}
          aria-label={music.playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
          className={`${floating} absolute right-3 top-3 z-20`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] leading-none">
            {music.playing ? "music_note" : "music_off"}
          </span>
          <span className="hidden sm:inline">{music.playing ? "Đang phát nhạc" : "Bật nhạc"}</span>
        </button>
      )}

      <main className="relative min-h-0 flex-1 overflow-hidden" aria-roledescription="carousel" aria-label="Thiệp" {...swipe}>
        {slide ? (
          <div key={slide.id} className={`h-full ${direction === "prev" ? "kp-page-prev" : "kp-page-next"}`}>
            {template.render(slide, gift, ctx)}
          </div>
        ) : null}
      </main>

      <NavBar slides={slides} index={index} onGo={go} onPrev={prev} onNext={next} />
    </div>
  );
}
