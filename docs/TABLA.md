To understand Tabla sound synthesis, you must treat the instrument not as one drum, but as two distinct sound engines. They are physically different and play different roles in the sound spectrum.

### 1. The Dayan (Right Drum) – The "Treble"

* **Material:** Wood.
* **Role:** Provides the high-pitched, precise tonal framework. It is tuned to a specific musical note (the tonic or "Sa").
* **Synthesis Characteristic:** **Fixed Pitch.**
When you strike the Dayan (e.g., *Ta* or *Tin*), the pitch remains relatively stable. The synthesis challenge here is recreating the complex metallic overtones and the "ringing" quality.

### 2. The Bayan (Left Drum) – The "Bass"

* **Material:** Metal (brass/copper) or Clay.
* **Role:** Provides the deep, resonant bass foundation.
* **Synthesis Characteristic:** **Modulated Pitch.**
The unique feature of the Bayan is the "Syahi" (black patch) combined with the player's wrist pressure. This allows the pitch to slide up and down (glissando). A synthesizer *must* have a pitch envelope to recreate the "whoop" sound of a *Ghe*.

---

### Summary Table: Bols by Drum

Here is how the bols map to the specific drums:

| Bol | Which Drum? | Sound Type | Acoustic Characteristic |
| --- | --- | --- | --- |
| **Ta / Na** | **Dayan** (Right) | **Treble Ring** | Sharp metallic "ping," high pitch, long sustain. |
| **Tin / Tun** | **Dayan** (Right) | **Soft Bell** | Mellow, hollow tone, medium sustain. |
| **Te / Ti** | **Dayan** (Right) | **Dead Slap** | Non-resonant "thud," purely percussive, no pitch. |
| **Ghe / Ga** | **Bayan** (Left) | **Bass Boom** | Deep bass that **slides/bends** in pitch. |
| **Ke / Kat** | **Bayan** (Left) | **Flat Slap** | Flat "thwack" sound, no resonance. |
| **Dha** | **BOTH** | **Combo** | **Ta** (Right) + **Ghe** (Left). (Ring + Bass Slide). |
| **Dhin** | **BOTH** | **Combo** | **Tin** (Right) + **Ghe** (Left). (Bell + Bass Slide). |

---

## Synthesis Implementation (Tone.js)

### Synth Selection

| Drum | Tone.js Synth | Why |
| --- | --- | --- |
| **Dayan** | `MetalSynth` | Produces metallic harmonics and bell-like tones |
| **Bayan** | `MembraneSynth` | Membrane-based with pitch decay for glissando |

### Dayan (Treble) Parameters

The Dayan needs high-frequency metallic overtones with varying resonance.

```typescript
const dayanSynth = new Tone.MetalSynth({
  frequency: 800,           // base frequency (tuned to Sa)
  envelope: {
    attack: 0.001,          // instant attack (percussive)
    decay: 0.1,             // short decay for dead strokes
    release: 0.2,           // ring-out time
  },
  harmonicity: 5.1,         // overtone complexity
  modulationIndex: 16,      // metallic character
  resonance: 4000,          // high-frequency emphasis
  octaves: 1.5,             // harmonic spread
}).toDestination();
```

| Bol | Frequency | Decay | Character |
| --- | --- | --- | --- |
| Ta / Na | 800-900 Hz | 0.12s | Ring - long sustain, clear pitch |
| Tin / Tun | 600-700 Hz | 0.15s | Bell - mellow, hollow |
| Te / Ti | 1000+ Hz | 0.05s | Slap - very short, no sustain |

### Bayan (Bass) Parameters

The Bayan needs pitch envelope for the characteristic "whoop" glissando.

```typescript
const bayanSynth = new Tone.MembraneSynth({
  pitchDecay: 0.08,         // how fast pitch drops (glissando speed)
  octaves: 4,               // pitch drop range
  oscillator: { type: 'sine' },
  envelope: {
    attack: 0.001,          // instant hit
    decay: 0.4,             // bass resonance time
    sustain: 0.01,
    release: 0.4,
  },
}).toDestination();
```

| Bol | Start Freq | End Freq | Duration | Character |
| --- | --- | --- | --- | --- |
| Ghe / Ga | 120 Hz | 60 Hz | 0.25s | Boom - pitch slides down |
| Ke / Kat | 80 Hz | 40 Hz | 0.08s | Slap - flat, no resonance |
| Tun | 150 Hz | 80 Hz | 0.4s | Open - full resonance, long |

### Combined Bols

Combined bols trigger both synths simultaneously:

```typescript
const COMBINED_BOLS = {
  dha:  { bass: 'ghe', treble: 'ta' },   // Ring + Bass Slide
  dhin: { bass: 'ghe', treble: 'tin' },  // Bell + Bass Slide
};

function playBol(bol: string, time: number) {
  const combo = COMBINED_BOLS[bol];
  if (combo) {
    playBayan(combo.bass, time);
    playDayan(combo.treble, time);
  }
  // ... handle simple bols
}
```

### Key Synthesis Principles

1. **Pitch Envelope is Essential** — The bayan's glissando ("whoop") comes from `pitchDecay`. Without it, bass sounds flat and unrealistic.

2. **Attack Must Be Instant** — Tabla is purely percussive. Attack should be ≤ 0.001s.

3. **Decay Defines Character** — Dead slaps (Ti, Ke) have very short decay (~0.05s). Resonant strokes (Na, Ghe) have longer decay (~0.15-0.4s).

4. **MetalSynth for Overtones** — The dayan's wooden shell with metal syahi creates complex harmonics that `MetalSynth` approximates well.

5. **Combined Bols = Simultaneous Trigger** — Dha is not a separate sound; it's Ghe + Ta played at the exact same moment.