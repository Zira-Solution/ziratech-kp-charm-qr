"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { musicPlayerSynth } from "../audio-helper";

export interface MusicPlayerState {
  playing: boolean;
  toggle: () => void;
  start: () => void;
  stop: () => void;
}

interface AudioFileStore {
  audio: HTMLAudioElement | null;
  currentUrl: string;
  playing: boolean;
  listeners: Set<() => void>;
  notify: () => void;
  subscribe: (fn: () => void) => () => void;
  getAudio: (url: string) => HTMLAudioElement;
  play: (url: string) => void;
  stop: () => void;
  toggle: (url: string) => void;
}

const fileStore: AudioFileStore = {
  audio: null,
  currentUrl: "",
  playing: false,
  listeners: new Set(),
  notify() {
    for (const fn of this.listeners) {
      fn();
    }
  },
  subscribe(fn: () => void) {
    fileStore.listeners.add(fn);
    return () => {
      fileStore.listeners.delete(fn);
    };
  },
  getAudio(url: string) {
    if (!this.audio || this.currentUrl !== url) {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.currentUrl = url;
      this.audio = new Audio(url);
      this.audio.loop = true;
      this.audio.onplay = () => {
        this.playing = true;
        this.notify();
      };
      this.audio.onpause = () => {
        this.playing = false;
        this.notify();
      };
      this.audio.onended = () => {
        this.playing = false;
        this.notify();
      };
    }
    return this.audio;
  },
  play(url: string) {
    if (!url) return;
    const a = this.getAudio(url);
    a.play().catch((err: unknown) => {
      console.warn("[MusicPlayer] playback prevented by browser:", err);
    });
  },
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.playing = false;
      this.notify();
    }
  },
  toggle(url: string) {
    if (this.playing) {
      this.audio?.pause();
    } else {
      this.play(url);
    }
  },
};

/**
 * Handles playing either built-in synth melodies or custom uploaded MP3 audio files.
 */
export function useMusicPlayer(presetId?: string, audioUrl?: string): MusicPlayerState {
  const isUpload = Boolean(audioUrl);

  const synthPlaying = useSyncExternalStore(
    musicPlayerSynth.subscribe,
    () => !isUpload && !!presetId && musicPlayerSynth.playingId === presetId,
    () => false
  );

  const filePlaying = useSyncExternalStore(
    fileStore.subscribe,
    () => isUpload && fileStore.currentUrl === audioUrl && fileStore.playing,
    () => false
  );

  const playing = isUpload ? filePlaying : synthPlaying;

  const start = useCallback(() => {
    if (isUpload && audioUrl) {
      fileStore.play(audioUrl);
    } else if (presetId) {
      musicPlayerSynth.play(presetId);
    }
  }, [isUpload, audioUrl, presetId]);

  const stop = useCallback(() => {
    if (isUpload) {
      fileStore.stop();
    } else if (presetId && musicPlayerSynth.playingId === presetId) {
      musicPlayerSynth.stop();
    }
  }, [isUpload, presetId]);

  const toggle = useCallback(() => {
    if (isUpload && audioUrl) {
      fileStore.toggle(audioUrl);
    } else if (playing) {
      stop();
    } else {
      start();
    }
  }, [isUpload, audioUrl, playing, start, stop]);

  useEffect(() => stop, [stop]);

  return { playing, toggle, start, stop };
}
