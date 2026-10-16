"use client";

import { useCallback, useEffect, useState } from "react";
import { musicPlayerSynth } from "../audio-helper";

export interface MusicPlayerState {
  playing: boolean;
  toggle: () => void;
  start: () => void;
  stop: () => void;
}

/**
 * One of the built-in melodies (made in the browser with Web Audio, so there is no file to host).
 * Browsers only let sound start after the visitor has touched the page, so nothing plays on its own:
 * the page calls `start()` from the tap that opens the gift, or the visitor presses the button.
 */
export function useMusicPlayer(presetId: string | undefined): MusicPlayerState {
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    if (presetId && musicPlayerSynth.playingId === presetId) musicPlayerSynth.stop();
    setPlaying(false);
  }, [presetId]);

  const start = useCallback(() => {
    if (!presetId) return;
    musicPlayerSynth.play(presetId);
    setPlaying(true);
  }, [presetId]);

  const toggle = useCallback(() => (playing ? stop() : start()), [playing, start, stop]);

  // Leaving the card, or another melody taking over, ends this one.
  useEffect(() => () => stop(), [stop]);

  return { playing, toggle, start, stop };
}
