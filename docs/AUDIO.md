# Audio System (Tone.js)

## TablaPlayer - Tabla Synthesis

Two synths: MetalSynth (dayan/treble) + MembraneSynth (bayan/bass)

### Dayan (Treble) Parameters

```typescript
const DAYAN_PARAMS: Record<string, BolParams> = {
  ta:  { frequency: 850, decay: 0.12 },
  na:  { frequency: 850, decay: 0.12 },
  tin: { frequency: 650, decay: 0.15 },
  tun: { frequency: 650, decay: 0.15 },
  te:  { frequency: 1000, decay: 0.05 },
  ti:  { frequency: 1000, decay: 0.05 },
};
```

### Bayan (Bass) Parameters

```typescript
const BAYAN_PARAMS: Record<string, BolParams> = {
  ghe: { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
  ga:  { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
  ge:  { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
  ke:  { frequency: 80, decay: 0.08, pitchDecay: 0.05, octaves: 2 },
  kat: { frequency: 80, decay: 0.08, pitchDecay: 0.05, octaves: 2 },
};
```

### Combined Bols (Both Drums)

```typescript
const COMBINED_BOLS: Record<string, { bass: string; treble: string }> = {
  dha:  { bass: 'ghe', treble: 'ta' },
  dhin: { bass: 'ghe', treble: 'tin' },
  dhit: { bass: 'ghe', treble: 'ti' },
  tete: { bass: 'ke', treble: 'te' },
};
```

### Synth Configuration

```typescript
// Dayan - metallic overtones
const dayanSynth = new Tone.MetalSynth({
  envelope: { attack: 0.001, decay: 0.1, release: 0.2 },
  harmonicity: 5.1,
  modulationIndex: 16,
  resonance: 4000,
  octaves: 1.5,
}).toDestination();

// Bayan - membrane with pitch glissando (meend effect)
const bayanSynth = new Tone.MembraneSynth({
  pitchDecay: 0.1,
  octaves: 3,
  oscillator: { type: 'sine' },
  envelope: { attack: 0.02, decay: 0.5, sustain: 0, release: 1 },
}).toDestination();
```

## Metronome

Three click types with separate gain nodes:

```typescript
// Beat click - mid-pitch (900Hz)
beatSynth.triggerAttackRelease(900, '32n', time);

// Subdivision - high-pitch short (1800Hz)
subdivSynth.triggerAttackRelease(1800, '64n', time);

// Downbeat - accented (700Hz)
downbeatSynth.triggerAttackRelease(700, '16n', time);
```

## Polyrhythm Synth

Three layers for polyrhythm training:

```typescript
// Beat sound - frequency sweep 900→700Hz
beatSynth.frequency.setValueAtTime(900, t);
beatSynth.frequency.exponentialRampToValueAtTime(700, t + 0.1);
beatSynth.triggerAttackRelease('32n', t);

// Bol sound - low membrane (150Hz)
bolSynth.triggerAttackRelease(150, '8n', time);

// Subdivision tick (1800Hz)
subdivSynth.triggerAttackRelease(1800, '128n', time);
```

Volume control via Gain nodes (0-100 scale → 0-1 gain value).

## Audio Initialization Pattern

```typescript
class AudioPlayer {
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();  // Required for iOS

    // Create synths...

    this.isInitialized = true;
  }

  get ready(): boolean {
    return this.isInitialized;
  }
}

// Singleton pattern
let instance: AudioPlayer | null = null;
export function getAudioPlayer(): AudioPlayer {
  if (!instance) instance = new AudioPlayer();
  return instance;
}
```

## iOS Safari Audio Unlock

```typescript
async function unlockAudio(): Promise<boolean> {
  await Tone.start();

  const ctx = Tone.getContext().rawContext;
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
```

Always show "Tap to Enable Audio" button for mobile.
