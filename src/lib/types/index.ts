// Tabla bol syllables
export type Bol =
	| 'Dha'
	| 'Dhin'
	| 'Ta'
	| 'Tin'
	| 'Na'
	| 'Tun'
	| 'Ge'
	| 'Ke'
	| 'Ti'
	| 'Te'
	| 'Ra'
	| 'Ka'
	| 'Tete'
	| 'Gadi'
	| 'Trkt'
	| '-'; // dash for rest/empty

// A single beat containing one or more bols
export interface Beat {
	bols: Bol[];
}

// A row/line in a composition (e.g., one row of a theka or kayda)
export interface Row {
	beats: Beat[];
}

// Composition metadata
export interface CompositionMeta {
	taal: string; // e.g., "Teentaal", "Jhaptaal"
	tempo: number; // BPM
	title?: string;
	description?: string;
	author?: string;
	tags?: string[];
}

// Full composition structure
export interface Composition {
	id: string;
	meta: CompositionMeta;
	rows: Row[];
	createdAt?: string;
	updatedAt?: string;
}

// Taal definitions
export interface TaalDefinition {
	name: string;
	beats: number;
	divisions: number[]; // beats per vibhag
	claps: number[]; // indices of clap (taali) positions
	wave: number; // index of wave (khaali) position, -1 if none
}

// Audio playback state
export interface PlaybackState {
	isPlaying: boolean;
	currentBeat: number;
	currentRow: number;
	tempo: number;
}

// Preset for metronome/practice
export interface Preset {
	id: string;
	name: string;
	taal: string;
	tempo: number;
	subdivisions: number;
	laghuEnabled: boolean;
}
