/**
 * AlertAudioSynthesizer - Zero-dependency synthesized audio chime engine
 * using native Web Audio API oscillators. Requires no external MP3/audio files.
 */

class AlertAudioSynthesizer {
  constructor(audioContext = null) {
    this._audioContext = audioContext;
  }

  get context() {
    if (!this._audioContext) {
      const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (Ctx) {
        this._audioContext = new Ctx();
      }
    }
    if (this._audioContext && this._audioContext.state === "suspended") {
      this._audioContext.resume().catch(() => {});
    }
    return this._audioContext;
  }

  /**
   * Play Spark alert chime (upbeat dual-tone sweep).
   */
  playSparkAlert() {
    const ctx = this.context;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Play Heart Rain alert chime (soft warm arpeggio).
   */
  playHeartAlert() {
    const ctx = this.context;
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  /**
   * Play Crown Drop alert fanfare (triumphant brass-like chord progression).
   */
  playCrownAlert() {
    const ctx = this.context;
    if (!ctx) return;

    const chordNotes = [
      { freq: 440, start: 0, dur: 0.15 },    // A4
      { freq: 554.37, start: 0.12, dur: 0.15 }, // C#5
      { freq: 659.25, start: 0.24, dur: 0.18 }, // E5
      { freq: 880, start: 0.38, dur: 0.5 },    // A5
      { freq: 1108.73, start: 0.38, dur: 0.5 } // C#6
    ];

    chordNotes.forEach(({ freq, start, dur }) => {
      const now = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    });
  }
}

module.exports = {
  AlertAudioSynthesizer,
};
