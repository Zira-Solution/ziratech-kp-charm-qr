// Interactive Web Audio synthesizer for background melodies. Nothing is downloaded: every melody is
// generated in the browser, so there is no audio file to host and no copyright to clear.

export interface MelodyVoice {
  /** Notes in Hz, played in a loop. */
  notes: readonly number[];
  /** Milliseconds between notes. */
  stepMs: number;
  type: OscillatorType;
  /** Peak gain (keep low: this plays under the card). */
  volume: number;
  /** Seconds a note takes to fade out. */
  decay: number;
}

// The melody the cards have always used (gentle arpeggio, C major / A minor pentatonic).
const DEFAULT_VOICE: MelodyVoice = {
  notes: [
    261.63, 329.63, 392.0, 523.25, // C4, E4, G4, C5
    293.66, 369.99, 440.0, 587.33, // D4, F#4, A4, D5
    220.0, 261.63, 329.63, 440.0, // A3, C4, E4, A4
    349.23, 440.0, 523.25, 659.25, // F4, A4, C5, E5
  ],
  stepMs: 420,
  type: "sine",
  volume: 0.08,
  decay: 1.2,
};

/** One voice per id in MUSIC_PRESETS (music-presets.ts); a test keeps the two lists in sync. */
export const PRESET_VOICES: Record<string, MelodyVoice> = {
  lofi: {
    notes: [220.0, 261.63, 329.63, 392.0, 349.23, 261.63, 329.63, 440.0, 196.0, 246.94, 329.63, 392.0],
    stepMs: 520,
    type: "triangle",
    volume: 0.07,
    decay: 1.6,
  },
  piano: {
    notes: [392.0, 440.0, 523.25, 440.0, 392.0, 329.63, 293.66, 329.63, 392.0, 349.23, 329.63, 293.66],
    stepMs: 620,
    type: "sine",
    volume: 0.09,
    decay: 2.0,
  },
  musicbox: {
    notes: [783.99, 659.25, 523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 698.46, 587.33, 698.46, 880.0],
    stepMs: 380,
    type: "triangle",
    volume: 0.05,
    decay: 0.95,
  },
  guitar: {
    notes: [196.0, 246.94, 293.66, 392.0, 293.66, 246.94, 220.0, 261.63, 329.63, 440.0, 329.63, 261.63],
    stepMs: 460,
    type: "triangle",
    volume: 0.09,
    decay: 1.1,
  },
};

class MusicSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private noteIndex = 0;
  private voice: MelodyVoice = DEFAULT_VOICE;
  private currentId: string | null = null;
  private listeners = new Set<() => void>();

  /** Lets every play button on the page follow the one melody that is playing. */
  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  /** Id of the preset that is playing right now, or null (also null for the default melody). */
  public get playingId(): string | null {
    // A browser can keep the audio context suspended until the visitor taps: not playing yet, then.
    return this.isPlaying && this.ctx?.state === "running" ? this.currentId : null;
  }

  /** Lets sound start once the visitor has touched the page (browsers refuse it before that). */
  public resume() {
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => undefined);
  }

  /** Starts a melody. With no id it plays the default one. Playing another id switches to it. */
  public play(presetId?: string) {
    const voice = presetId ? PRESET_VOICES[presetId] : DEFAULT_VOICE;
    if (!voice) return;
    if (this.isPlaying) {
      if (this.currentId === (presetId ?? null)) {
        this.resume();
        return;
      }
      this.stop();
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.ctx.onstatechange = () => this.emit();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      this.voice = voice;
      this.currentId = presetId ?? null;
      this.noteIndex = 0;
      this.isPlaying = true;
      this.scheduleNextNote();
      this.emit();
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  public stop() {
    this.isPlaying = false;
    this.currentId = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.emit();
  }

  private scheduleNextNote() {
    if (!this.isPlaying || !this.ctx) return;

    const { notes, stepMs, type, volume, decay } = this.voice;
    const freq = notes[this.noteIndex % notes.length];
    this.noteIndex++;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + decay + 0.05);

    this.timer = setTimeout(() => {
      this.scheduleNextNote();
    }, stepMs);
  }
}

export const musicPlayerSynth = new MusicSynthesizer();
