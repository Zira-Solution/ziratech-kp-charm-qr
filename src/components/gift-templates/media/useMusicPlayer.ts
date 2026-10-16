"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { musicPlayerSynth } from "../audio-helper";

export interface MusicPlayerState {
  playing: boolean;
  toggle: () => void;
  start: () => void;
  stop: () => void;
}

/**
 * One of the built-in melodies (made in the browser with Web Audio, so there is no file to host).
 * Browsers only let sound start after the visitor has touched the page, so the page calls `start()`
 * from the gesture that opens the gift, or the visitor presses a button. Every player of the same
 * melody shows the same state, because they all read it from the synthesizer.
 */
export function useMusicPlayer(presetId: string | undefined): MusicPlayerState {
  const playing = useSyncExternalStore(
    musicPlayerSynth.subscribe,
    () => !!presetId && musicPlayerSynth.playingId === presetId,
    () => false
  );

  const start = useCallback(() => {
    if (presetId) musicPlayerSynth.play(presetId);
  }, [presetId]);

  const stop = useCallback(() => {
    if (presetId && musicPlayerSynth.playingId === presetId) musicPlayerSynth.stop();
  }, [presetId]);

  const toggle = useCallback(() => (playing ? stop() : start()), [playing, start, stop]);

  // Leaving the card ends the melody.
  useEffect(() => stop, [stop]);

  return { playing, toggle, start, stop };
}
