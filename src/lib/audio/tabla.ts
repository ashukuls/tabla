'use client';

import * as Tone from 'tone';

interface BolParams {
  frequency: number;
  decay: number;
  pitchDecay?: number;
  octaves?: number;
}

// Dayan (treble) parameters - MetalSynth
const DAYAN_PARAMS: Record<string, BolParams> = {
  ta: { frequency: 850, decay: 0.12 },
  na: { frequency: 850, decay: 0.12 },
  tin: { frequency: 650, decay: 0.15 },
  tun: { frequency: 650, decay: 0.15 },
  te: { frequency: 1000, decay: 0.05 },
  ti: { frequency: 1000, decay: 0.05 },
  ra: { frequency: 750, decay: 0.08 },
  ka: { frequency: 900, decay: 0.06 },
};

// Bayan (bass) parameters - MembraneSynth
const BAYAN_PARAMS: Record<string, BolParams> = {
  ghe: { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
  ga: { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
  ge: { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
  ke: { frequency: 80, decay: 0.08, pitchDecay: 0.05, octaves: 2 },
  kat: { frequency: 80, decay: 0.08, pitchDecay: 0.05, octaves: 2 },
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
    this.dayanSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.2,
      },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();

    // Bayan - membrane with pitch glissando
    this.bayanSynth = new Tone.MembraneSynth({
      pitchDecay: 0.1,
      octaves: 3,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.02,
        decay: 0.5,
        sustain: 0,
        release: 1,
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
    this.dayanSynth.envelope.decay = params.decay;
    this.dayanSynth.triggerAttackRelease('32n', time ?? Tone.now());
  }

  private playBayan(bol: string, time?: number): void {
    if (!this.bayanSynth) return;
    const params = BAYAN_PARAMS[bol.toLowerCase()];
    if (!params) return;

    if (params.pitchDecay !== undefined) {
      this.bayanSynth.pitchDecay = params.pitchDecay;
    }
    if (params.octaves !== undefined) {
      this.bayanSynth.octaves = params.octaves;
    }
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
