'use client';

import * as Tone from 'tone';

class Metronome {
  private clickSynth: Tone.Synth | null = null;
  private accentSynth: Tone.Synth | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();

    // Regular click - mid pitch
    this.clickSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.05,
      },
    }).toDestination();

    // Accent/downbeat - lower pitch, louder
    this.accentSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.08,
      },
    }).toDestination();

    this.isInitialized = true;
  }

  get ready(): boolean {
    return this.isInitialized;
  }

  click(time?: number): void {
    if (!this.clickSynth) return;
    this.clickSynth.triggerAttackRelease(900, '32n', time);
  }

  accent(time?: number): void {
    if (!this.accentSynth) return;
    this.accentSynth.triggerAttackRelease(700, '16n', time);
  }

  dispose(): void {
    this.clickSynth?.dispose();
    this.accentSynth?.dispose();
    this.clickSynth = null;
    this.accentSynth = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let instance: Metronome | null = null;

export function getMetronome(): Metronome {
  if (!instance) {
    instance = new Metronome();
  }
  return instance;
}
