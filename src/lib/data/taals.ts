import type { TaalDefinition } from '$lib/types';

// Common taal definitions used throughout the app
export const TAALS: Record<string, TaalDefinition> = {
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

export const TAAL_NAMES = Object.keys(TAALS);
