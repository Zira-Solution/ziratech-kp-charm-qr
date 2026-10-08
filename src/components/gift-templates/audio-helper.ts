// Interactive Web Audio synthesizer for background melody and audio playback simulation

class MusicSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: any = null;
  private noteIndex = 0;

  // Lofi / Gentle romantic arpeggio notes in Hz (C major / A minor pentatonic)
  private melody = [
    261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
    293.66, 369.99, 440.00, 587.33, // D4, F#4, A4, D5
    220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
    349.23, 440.00, 523.25, 659.25  // F4, A4, C5, E5
  ];

  public play() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      this.isPlaying = true;
      this.scheduleNextNote();
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextNote() {
    if (!this.isPlaying || !this.ctx) return;

    const freq = this.melody[this.noteIndex % this.melody.length];
    this.noteIndex++;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.25);

    this.timer = setTimeout(() => {
      this.scheduleNextNote();
    }, 420);
  }
}

export const musicPlayerSynth = new MusicSynthesizer();
