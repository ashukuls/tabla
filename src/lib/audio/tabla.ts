'use client';

import * as Tone from 'tone';

// Default sample variations
const DEFAULT_SAMPLES: Record<string, string> = {
  Dha: '01',
  Dhin: '01',
  Dhit: '01',
  Dhun: '01',
  Ga: '01',
  Ge: '01',
  Ke: '01',
  Na: '01',
  Ta: '01',
  Ti: '01',
  Tin: '01',
  Tun: '01',
};

// Map bol names to their canonical form
const BOL_MAP: Record<string, string> = {
  dha: 'Dha',
  dhin: 'Dhin',
  dhit: 'Dhit',
  dhun: 'Dhun',
  ga: 'Ga',
  ghe: 'Ge',
  ge: 'Ge',
  ke: 'Ke',
  kat: 'Ke',
  ka: 'Ke',
  na: 'Na',
  ta: 'Ta',
  ti: 'Ti',
  te: 'Ti',
  tin: 'Tin',
  tun: 'Tun',
  ra: 'Ta',
  tete: 'Ti',
  trkt: 'Ti',
};

class TablaPlayer {
  private players: Map<string, Tone.Player> = new Map();
  private isInitialized = false;
  private isLoading = false;
  private sampleConfig: Record<string, string> = DEFAULT_SAMPLES;

  async init(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;

    this.isLoading = true;

    await Tone.start();

    // Load sample config from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tablaSamples');
      if (saved) {
        try {
          this.sampleConfig = { ...DEFAULT_SAMPLES, ...JSON.parse(saved) };
        } catch {
          // ignore
        }
      }
    }

    // Load all samples
    const loadPromises: Promise<void>[] = [];

    for (const [bolType, variation] of Object.entries(this.sampleConfig)) {
      const url = `/samples/${bolType}${variation}.mp3`;
      const player = new Tone.Player(url).toDestination();
      this.players.set(bolType, player);
      loadPromises.push(Tone.loaded());
    }

    await Promise.all(loadPromises);

    this.isInitialized = true;
    this.isLoading = false;
  }

  get ready(): boolean {
    return this.isInitialized;
  }

  playBol(bol: string, time?: number): void {
    if (!this.isInitialized) return;

    const bolLower = bol.toLowerCase();
    if (bolLower === '-') return;

    // Get canonical bol name
    const bolType = BOL_MAP[bolLower];
    if (!bolType) return;

    const player = this.players.get(bolType);
    if (player && player.loaded) {
      // Create a new player instance for overlapping sounds
      const tempPlayer = new Tone.Player(player.buffer).toDestination();
      tempPlayer.start(time ?? Tone.now());

      // Cleanup after playback
      setTimeout(() => {
        tempPlayer.dispose();
      }, 3000);
    }
  }

  dispose(): void {
    this.players.forEach((player) => player.dispose());
    this.players.clear();
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

// Force reload samples (after changing selection in lab)
export function reloadTablaPlayer(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
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
