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

  // Ultra-smooth interactive swipe gesture state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const gestureRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    isLockedHorizontal: boolean;
    isLockedVertical: boolean;
    pointerId?: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Only primary button for mouse
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Do not start swipe if user is interacting with buttons, links, inputs, or media controls
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select, [data-no-swipe], video, audio, iframe")) {
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    gestureRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      isLockedHorizontal: false,
      isLockedVertical: false,
      pointerId: e.pointerId,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (!g || isExiting) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (g.isLockedVertical) return;

    if (!g.isLockedHorizontal) {
      if (Math.hypot(dx, dy) < 8) return; // small deadzone

      if (Math.abs(dy) > Math.abs(dx)) {
        g.isLockedVertical = true;
        return;
      }
      g.isLockedHorizontal = true;
      setIsDragging(true);
    }

    // Rubber-band resistance at boundaries (first slide right, last slide left)
    let effectiveOffset = dx;
    if ((index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0)) {
      effectiveOffset = dx * 0.22;
    }

    setDragOffset(effectiveOffset);
  };

  const endDrag = useCallback(
    (e?: React.PointerEvent<HTMLElement>) => {
      const g = gestureRef.current;
      if (!g) return;

      if (e && g.pointerId !== undefined) {
        try {
          e.currentTarget.releasePointerCapture(g.pointerId);
        } catch {}
      }

      if (!g.isLockedHorizontal) {
        gestureRef.current = null;
        setIsDragging(false);
        setDragOffset(0);
        return;
      }

      const clientX = e ? e.clientX : g.startX + dragOffset;
      const dx = clientX - g.startX;
      const dt = Math.max(1, performance.now() - g.startTime);
      const velocity = dx / dt; // px per ms

      const containerWidth = rootRef.current?.clientWidth || 380;
      const threshold = Math.min(55, containerWidth * 0.14);
      const isFlick = Math.abs(velocity) >= 0.32 && Math.abs(dx) >= 20;
      const isDistance = Math.abs(dx) >= threshold;

      gestureRef.current = null;

      // Swiped Left -> Go Next slide
      if (dx < 0 && index < slides.length - 1 && (isDistance || isFlick)) {
        setIsExiting(true);
        setDragOffset(-containerWidth);
        setTimeout(() => {
          next();
          setIsExiting(false);
          setIsDragging(false);
          setDragOffset(0);
        }, 220);
        return;
      }

      // Swiped Right -> Go Prev slide
      if (dx > 0 && index > 0 && (isDistance || isFlick)) {
        setIsExiting(true);
        setDragOffset(containerWidth);
        setTimeout(() => {
          prev();
          setIsExiting(false);
          setIsDragging(false);
          setDragOffset(0);
        }, 220);
        return;
      }

      // Snap back smoothly
      setIsDragging(false);
      setDragOffset(0);
    },
    [dragOffset, index, next, prev, slides.length]
  );

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
          aria-label={music.playing ? "Tắt âm thanh" : "Bật âm thanh"}
          title={music.playing ? "Tắt loa" : "Bật loa"}
          className="absolute right-13 top-3.5 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-stone-200/80 bg-white/90 text-stone-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-105 active:scale-90 cursor-pointer"
        >
          <span
            aria-hidden="true"
            className={`material-symbols-outlined text-[19px] leading-none transition-colors ${
              music.playing ? "text-[#c13d28]" : "text-stone-400"
            }`}
          >
            {music.playing ? "volume_up" : "volume_off"}
          </span>
        </button>
      )}

      <main
        className="relative min-h-0 flex-1 overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing"
        aria-roledescription="carousel"
        aria-label="Thiệp"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {slide ? (
          <div
            key={slide.id}
            className={`h-full w-full ${!isDragging && !isExiting ? (direction === "prev" ? "kp-page-prev" : "kp-page-next") : ""}`}
            style={{
              transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
              transition: isDragging
                ? "none"
                : isExiting
                ? "transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.22s ease-out"
                : "transform 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 0.25s ease-out",
              opacity: isExiting ? 0.35 : isDragging ? 1 - Math.min(0.25, Math.abs(dragOffset) / 800) : 1,
              willChange: isDragging || isExiting ? "transform, opacity" : undefined,
            }}
          >
            {template.render(slide, gift, ctx)}
          </div>
        ) : null}
      </main>

      <NavBar slides={slides} index={index} onGo={go} onPrev={prev} onNext={next} />
    </div>
  );
}
