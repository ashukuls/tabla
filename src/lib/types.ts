// Tabla bol syllables
export type Bol =
  | 'Dha' | 'Dhin' | 'Ta' | 'Tin' | 'Na' | 'Tun'
  | 'Ge' | 'Ke' | 'Ti' | 'Te' | 'Ra' | 'Ka'
  | 'Tete' | 'Gadi' | 'Trkt'
  | '-';

// A single beat containing one or more bols
export interface Beat {
  bols: string[];
}

// A row/line in a composition
export interface Row {
  beats: Beat[];
}

// Composition category
export type CompositionCategory = 'theka' | 'kaida' | 'rela' | 'tukda' | 'chakradar' | 'other';

export const CATEGORIES: { value: CompositionCategory; label: string }[] = [
  { value: 'theka', label: 'Theka' },
  { value: 'kaida', label: 'Kaida' },
  { value: 'rela', label: 'Rela' },
  { value: 'tukda', label: 'Tukda' },
  { value: 'chakradar', label: 'Chakradar' },
  { value: 'other', label: 'Other' },
];

// Composition stored in Firebase (simplified)
export interface Composition {
  id: string;
  title: string;
  taal: string;
  tempo: number;
  bols: string;           // raw text, parsed at runtime
  category?: CompositionCategory;
  description?: string;
  author?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Taal definition
export interface TaalDefinition {
  name: string;
  beats: number;
  divisions: number[];
  claps: number[];
  wave: number;
}

// Audio playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentBeat: number;
  currentRow: number;
  tempo: number;
}

// Polyrhythm preset
export interface PolyrhythmPreset {
  id: string;
  name: string;
  bols: number;
  beats: number;
  tempo: number;
  volumes: {
    beat: number;
    bol: number;
    subdivision: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Taal definitions
export const TAALS: Record<string, TaalDefinition> = {
  Teentaal: { name: 'Teentaal', beats: 16, divisions: [4, 4, 4, 4], claps: [0, 4, 12], wave: 8 },
  Jhaptaal: { name: 'Jhaptaal', beats: 10, divisions: [2, 3, 2, 3], claps: [0, 2, 7], wave: 5 },
  Ektaal: { name: 'Ektaal', beats: 12, divisions: [2, 2, 2, 2, 2, 2], claps: [0, 4, 8], wave: 2 },
  Rupak: { name: 'Rupak', beats: 7, divisions: [3, 2, 2], claps: [3, 5], wave: 0 },
  Dadra: { name: 'Dadra', beats: 6, divisions: [3, 3], claps: [0], wave: 3 },
  Keherwa: { name: 'Keherwa', beats: 8, divisions: [4, 4], claps: [0], wave: 4 },
  Tilwada: { name: 'Tilwada', beats: 16, divisions: [4, 4, 4, 4], claps: [0, 4, 12], wave: 8 },
  Dhamar: { name: 'Dhamar', beats: 14, divisions: [5, 2, 3, 4], claps: [0, 5, 10], wave: 7 },
  Chautaal: { name: 'Chautaal', beats: 12, divisions: [2, 2, 2, 2, 2, 2], claps: [0, 4, 8], wave: 2 },
};
