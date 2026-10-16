"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { layoutFor, moveIndex, slideAnnouncement } from "./layout";
import type { ViewerGift } from "./normalize";
import type { TemplateContext } from "./template-contract";
import type { GiftTemplateId } from "./types";
import { getViewerTemplate } from "./viewer-templates";
import { useContainerWidth } from "./useContainerWidth";
import { Dots, SlideList, StepButton } from "./viewer-nav";
import MusicPlayer from "./media/MusicPlayer";
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
  "vintage-scrapbook": "bg-linear-to-br from-parchment-light via-parchment-light to-surface-container-high",
  "retro-nostalgia": "bg-linear-to-br from-parchment-light via-parchment-border to-craft-border",
  "storybook-sunset": "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
};

const SWIPE_MIN = 50;

/**
 * The card page. It owns what does not depend on the look: the arrangement for the device (decided by
 * the width of the box it sits in), moving between pages by buttons, keys or swipe, the opening melody
 * and the announcement for screen readers. The template only draws the page it is given.
 */
export default function GiftTemplateViewer({ gift, refreshVoiceUrl, onBack, backLabel = "Khóa lại", embedded = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(rootRef);
  const layout = layoutFor(width);

  const template = getViewerTemplate(gift.template);
  const slides = useMemo(() => template.slides(gift), [template, gift]);
  const [requested, setRequested] = useState(0);
  const index = moveIndex(requested, 0, slides.length);

  const go = useCallback((i: number) => setRequested(moveIndex(0, i, slides.length)), [slides.length]);
  const next = useCallback(() => setRequested((i) => moveIndex(i, 1, slides.length)), [slides.length]);
  const prev = useCallback(() => setRequested((i) => moveIndex(i, -1, slides.length)), [slides.length]);

  // The built-in melody starts when the card opens (the visitor has just tapped to open it).
  const music = useMusicPlayer(gift.song?.source === "preset" ? gift.song.presetId : undefined);
  useEffect(() => {
    music.start();
  }, []);

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
  const ctx: TemplateContext = { layout, width, index, count: slides.length, go, next, prev, refreshVoiceUrl };
  const page = slide ? template.render(slide, gift, ctx) : null;

  const topBar = (
    <header className="flex items-center justify-between gap-2 px-3 py-2">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm cursor-pointer hover:bg-slate-50"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
              {embedded ? "close" : "lock"}
            </span>
            {backLabel}
          </button>
        )}
        {!embedded && (
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
              home
            </span>
            Trang chủ
          </Link>
        )}
      </div>
      <p className="hidden text-sm font-bold text-slate-700 sm:block">K&amp;P Atelier · Quà 20/10</p>
    </header>
  );

  const hasPrev = index > 0;
  const hasNext = index < slides.length - 1;

  return (
    <div ref={rootRef} data-layout={layout} className={`flex min-h-screen w-full flex-col text-on-surface ${BACKGROUND[gift.template]}`}>
      {topBar}
      <p aria-live="polite" className="sr-only">
        {slideAnnouncement(index, slides)}
      </p>

      {layout === "desktop" ? (
        <main className="mx-auto grid w-full max-w-275 flex-1 grid-cols-[18rem_minmax(0,1fr)] gap-8 px-8 py-4" aria-roledescription="carousel" aria-label="Thiệp">
          <aside className="space-y-5">
            <div>
              <p className="text-2xl font-bold leading-snug">Gửi {gift.recipientName || "bạn"}</p>
              {gift.sender && <p className="mt-1 text-base text-slate-700">từ {gift.sender}</p>}
              {gift.addressing && <p className="mt-0.5 text-sm text-slate-600">{gift.addressing}</p>}
            </div>
            {gift.song?.source === "preset" && <MusicPlayer song={gift.song} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900" />}
            <SlideList slides={slides} index={index} onGo={go} />
          </aside>
          <section className="flex min-w-0 flex-col items-center" {...swipe}>
            <div className="w-full max-w-180">{page}</div>
            <div className="mt-4 flex items-center gap-4">
              <StepButton direction={-1} disabled={!hasPrev} onClick={prev} />
              <span className="min-w-16 text-center text-sm font-bold text-slate-700">
                {index + 1} / {slides.length}
              </span>
              <StepButton direction={1} disabled={!hasNext} onClick={next} />
            </div>
          </section>
        </main>
      ) : layout === "tablet" ? (
        <main className="flex w-full flex-1 flex-col" aria-roledescription="carousel" aria-label="Thiệp">
          <div className="mx-auto flex w-full max-w-190 flex-1 items-center gap-3 px-4" {...swipe}>
            <StepButton direction={-1} disabled={!hasPrev} onClick={prev} />
            <div className="min-w-0 flex-1">{page}</div>
            <StepButton direction={1} disabled={!hasNext} onClick={next} />
          </div>
          <Dots slides={slides} index={index} onGo={go} />
        </main>
      ) : (
        <main className="flex w-full flex-1 flex-col" aria-roledescription="carousel" aria-label="Thiệp">
          <div className="flex-1 px-2" {...swipe}>
            {page}
          </div>
          <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur">
            <Dots slides={slides} index={index} onGo={go} />
          </div>
        </main>
      )}
    </div>
  );
}
