'use client';

import * as Tone from 'tone';

interface DayanParams {
  frequency: number;
  decay: number;
  attack: number;
  harmonicity: number;
}

interface BayanParams {
  frequency: number;
  decay: number;
  attack: number;
  pitchDecay: number;
  octaves: number;
}

// Dayan (treble) parameters - derived from sample analysis
// Ta/Na: 1315 Hz fundamental, complex harmonics (0.6, 1.38, 2.03, 1.16)
// Tin: 295 Hz fundamental, harmonics (1.78, 2.66, 6.27)
const DAYAN_PARAMS: Record<string, DayanParams> = {
  ta: { frequency: 1315, decay: 0.15, attack: 0.001, harmonicity: 5.1 },
  na: { frequency: 1315, decay: 0.15, attack: 0.001, harmonicity: 5.1 },
  tin: { frequency: 295, decay: 0.2, attack: 0.004, harmonicity: 3.5 },
  tun: { frequency: 295, decay: 0.2, attack: 0.004, harmonicity: 3.5 },
  te: { frequency: 1100, decay: 0.08, attack: 0.001, harmonicity: 6.0 },
  ti: { frequency: 1100, decay: 0.08, attack: 0.001, harmonicity: 6.0 },
  ra: { frequency: 800, decay: 0.1, attack: 0.002, harmonicity: 4.0 },
  ka: { frequency: 1000, decay: 0.08, attack: 0.001, harmonicity: 5.5 },
};

// Bayan (bass) parameters - derived from sample analysis
// Ge: 120 Hz, 24ms attack, longer decay
// Ke: 140 Hz, 10ms attack, dry muted sound
const BAYAN_PARAMS: Record<string, BayanParams> = {
  ghe: { frequency: 120, decay: 0.4, attack: 0.024, pitchDecay: 0.08, octaves: 2.5 },
  ga: { frequency: 120, decay: 0.4, attack: 0.024, pitchDecay: 0.08, octaves: 2.5 },
  ge: { frequency: 120, decay: 0.4, attack: 0.024, pitchDecay: 0.08, octaves: 2.5 },
  ke: { frequency: 140, decay: 0.1, attack: 0.01, pitchDecay: 0.03, octaves: 1.5 },
  kat: { frequency: 140, decay: 0.1, attack: 0.01, pitchDecay: 0.03, octaves: 1.5 },
};

// Combined bols (both drums)
const COMBINED_BOLS: Record<string, { bass: string; treble: string }> = {
  dha: { bass: 'ghe', treble: 'ta' },
  dhin: { bass: 'ghe', treble: 'tin' },
  dhit: { bass: 'ghe', treble: 'ti' },
  tete: { bass: 'ke', treble: 'te' },
  gadi: { bass: 'ge', treble: 'ti' },
  trkt: { bass: 'ke', treble: 'ti' },
};

class TablaPlayer {
  private dayanSynth: Tone.MetalSynth | null = null;
  private bayanSynth: Tone.MembraneSynth | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();

    // Dayan - metallic overtones for treble sounds
    // Based on sample analysis: high fundamental (1315 Hz for Ta/Na), fast attack
    this.dayanSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.15,
        release: 0.1,
      },
      harmonicity: 5.1,
      modulationIndex: 12,
      resonance: 3000,
      octaves: 1.2,
    }).toDestination();

    // Bayan - membrane with pitch glissando
    // Based on sample analysis: low fundamental (~120 Hz), slower attack (24ms)
    this.bayanSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 2.5,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.024,
        decay: 0.4,
        sustain: 0,
        release: 0.8,
      },
    }).toDestination();

    this.isInitialized = true;
  }

  get ready(): boolean {
    return this.isInitialized;
  }

  private playDayan(bol: string, time?: number): void {
    if (!this.dayanSynth) return;
    const params = DAYAN_PARAMS[bol.toLowerCase()];
    if (!params) return;

    this.dayanSynth.frequency.value = params.frequency;
    this.dayanSynth.envelope.attack = params.attack;
    this.dayanSynth.envelope.decay = params.decay;
    this.dayanSynth.harmonicity = params.harmonicity;
    this.dayanSynth.triggerAttackRelease('32n', time ?? Tone.now());
  }

  private playBayan(bol: string, time?: number): void {
    if (!this.bayanSynth) return;
    const params = BAYAN_PARAMS[bol.toLowerCase()];
    if (!params) return;

    this.bayanSynth.pitchDecay = params.pitchDecay;
    this.bayanSynth.octaves = params.octaves;
    this.bayanSynth.envelope.attack = params.attack;
    this.bayanSynth.envelope.decay = params.decay;
    this.bayanSynth.triggerAttackRelease(params.frequency, '8n', time ?? Tone.now());
  }

  playBol(bol: string, time?: number): void {
    if (!this.isInitialized) return;

    const bolLower = bol.toLowerCase();
    if (bolLower === '-') return;

    // Check if combined bol
    const combo = COMBINED_BOLS[bolLower];
    if (combo) {
      this.playBayan(combo.bass, time);
      this.playDayan(combo.treble, time);
      return;
    }

    // Check treble
    if (DAYAN_PARAMS[bolLower]) {
      this.playDayan(bolLower, time);
      return;
    }

    // Check bass
    if (BAYAN_PARAMS[bolLower]) {
      this.playBayan(bolLower, time);
    }
  }

  dispose(): void {
    this.dayanSynth?.dispose();
    this.bayanSynth?.dispose();
    this.dayanSynth = null;
    this.bayanSynth = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let instance: TablaPlayer | null = null;

export function getTablaPlayer(): TablaPlayer {
  if (!instance) {
    instance = new TablaPlayer();
  }
  return instance;
}

// iOS Safari audio unlock
export async function unlockAudio(): Promise<boolean> {
  await Tone.start();

  const ctx = Tone.getContext().rawContext as AudioContext;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // Play silent buffer (iOS workaround)
  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);

  return true;
}
