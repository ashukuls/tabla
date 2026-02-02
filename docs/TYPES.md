# TypeScript Types

## Core Types

```typescript
// Tabla bol syllables
type Bol =
  | 'Dha' | 'Dhin' | 'Ta' | 'Tin' | 'Na' | 'Tun'
  | 'Ge' | 'Ke' | 'Ti' | 'Te' | 'Ra' | 'Ka'
  | 'Tete' | 'Gadi' | 'Trkt'
  | '-'; // rest/empty

// A single beat containing one or more bols
interface Beat {
  bols: Bol[];
}

// A row/line in a composition
interface Row {
  beats: Beat[];
}

// Composition metadata
interface CompositionMeta {
  taal: string;        // e.g., "Teentaal", "Jhaptaal"
  tempo: number;       // BPM
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
}

// Full composition structure (Firebase document)
interface Composition {
  id: string;
  meta: CompositionMeta;
  rows: Row[];
  createdAt?: string;  // ISO timestamp
  updatedAt?: string;
}

// Taal definition
interface TaalDefinition {
  name: string;
  beats: number;
  divisions: number[];  // beats per vibhag
  claps: number[];      // taali positions (0-indexed)
  wave: number;         // khaali position (-1 if none)
}

// Audio playback state
interface PlaybackState {
  isPlaying: boolean;
  currentBeat: number;
  currentRow: number;
  tempo: number;
}

// Polyrhythm preset
interface PolyrhythmPreset {
  id: string;
  name: string;
  bols: number;         // N - number of bol accents
  beats: number;        // D - number of beats
  tempo: number;
  volumes: {
    beat: number;       // 0-100
    bol: number;
    subdivision: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Polyrhythm pattern calculation
interface PolyrhythmPattern {
  totalBlocks: number;
  bolInterval: number;
  beatInterval: number;
  bolBlocks: number[];  // indices where bols occur
  beatBlocks: number[]; // indices where beats occur
  boxNumbers: number[]; // display number for each block
}
```

## Taal Definitions

```typescript
const TAALS: Record<string, TaalDefinition> = {
  Teentaal: { name: 'Teentaal', beats: 16, divisions: [4, 4, 4, 4], claps: [0, 4, 12], wave: 8 },
  Jhaptaal: { name: 'Jhaptaal', beats: 10, divisions: [2, 3, 2, 3], claps: [0, 2, 7], wave: 5 },
  Ektaal: { name: 'Ektaal', beats: 12, divisions: [2, 2, 2, 2, 2, 2], claps: [0, 4, 8], wave: 2 },
  Rupak: { name: 'Rupak', beats: 7, divisions: [3, 2, 2], claps: [3, 5], wave: 0 },
  Dadra: { name: 'Dadra', beats: 6, divisions: [3, 3], claps: [0], wave: 3 },
  Keherwa: { name: 'Keherwa', beats: 8, divisions: [4, 4], claps: [0], wave: 4 },
  Roopak: { name: 'Roopak', beats: 7, divisions: [3, 2, 2], claps: [3, 5], wave: 0 },
  Tilwada: { name: 'Tilwada', beats: 16, divisions: [4, 4, 4, 4], claps: [0, 4, 12], wave: 8 },
  Dhamar: { name: 'Dhamar', beats: 14, divisions: [5, 2, 3, 4], claps: [0, 5, 10], wave: 7 },
  Chautaal: { name: 'Chautaal', beats: 12, divisions: [2, 2, 2, 2, 2, 2], claps: [0, 4, 8], wave: 2 }
};
```

## Valid Bols

Case-insensitive matching:
```
dha, dhin, ta, tin, na, tun, ge, ke, ti, te, ra, ka, tete, gadi, trkt, -
```

Special characters mapped to rest: `x`, `.`
