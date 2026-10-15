"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface VoicePlayerState {
  playing: boolean;
  /** Seconds played so far. */
  current: number;
  /** Length in seconds: the real one once the browser knows it, otherwise the length the buyer recorded. */
  total: number;
  /** True when the recording could not be played, even after asking for a fresh link. */
  failed: boolean;
  toggle: () => void;
  /** Jump to a position, 0 (start) to 1 (end). */
  seek: (ratio: number) => void;
}

/**
 * Plays one recording. The link is signed and expires after an hour, so when the browser cannot load
 * it the hook asks `refresh` for a new one (once) before giving up. Templates draw their own controls
 * (a cassette, a polaroid...) on top of this state.
 */
export function useVoicePlayer(
  src: string | undefined,
  recordedSeconds: number,
  refresh?: () => Promise<string | null>
): VoicePlayerState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retried = useRef(false);
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [measured, setMeasured] = useState(0);
  const [failed, setFailed] = useState(false);

  // Built on first use, so nothing is fetched until the recipient presses play (preload "none").
  const audio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const el = new Audio();
    el.preload = "none";
    el.addEventListener("play", () => setPlaying(true));
    el.addEventListener("pause", () => setPlaying(false));
    el.addEventListener("ended", () => {
      setPlaying(false);
      setCurrent(0);
    });
    el.addEventListener("timeupdate", () => setCurrent(el.currentTime));
    el.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(el.duration)) setMeasured(el.duration);
    });
    el.addEventListener("error", async () => {
      setPlaying(false);
      const ask = refreshRef.current;
      if (!retried.current && ask) {
        retried.current = true;
        const fresh = await ask().catch(() => null);
        if (fresh) {
          el.src = fresh;
          el.play().catch(() => undefined); // may need another tap on some phones
          return;
        }
      }
      setFailed(true);
    });
    audioRef.current = el;
    return el;
  }, []);

  // A new link (after a refresh upstream, or another card) starts from a clean state.
  useEffect(() => {
    retried.current = false;
    setFailed(false);
    setCurrent(0);
    const el = audioRef.current;
    if (el && src && el.src !== src) {
      el.pause();
      el.src = src;
    }
  }, [src]);

  useEffect(
    () => () => {
      const el = audioRef.current;
      if (!el) return;
      el.pause();
      el.removeAttribute("src");
      el.load();
      audioRef.current = null;
    },
    []
  );

  const toggle = useCallback(() => {
    if (!src) {
      setFailed(true);
      return;
    }
    const el = audio();
    if (el.src !== src) el.src = src;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [audio, src]);

  const seek = useCallback((ratio: number) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.min(1, Math.max(0, ratio)) * el.duration;
  }, []);

  return { playing, current, total: measured || recordedSeconds, failed, toggle, seek };
}
