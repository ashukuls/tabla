/**
 * Playback state store using Svelte 5 runes
 */
import { writable, derived } from 'svelte/store';
import type { PlaybackState } from '$lib/types';

function createPlaybackStore() {
	const { subscribe, set, update } = writable<PlaybackState>({
		isPlaying: false,
		currentBeat: 0,
		currentRow: 0,
		tempo: 60
	});

	return {
		subscribe,
		play: () => update((s) => ({ ...s, isPlaying: true })),
		pause: () => update((s) => ({ ...s, isPlaying: false })),
		stop: () => update((s) => ({ ...s, isPlaying: false, currentBeat: 0, currentRow: 0 })),
		setTempo: (tempo: number) => update((s) => ({ ...s, tempo: Math.max(30, Math.min(300, tempo)) })),
		setBeat: (beat: number) => update((s) => ({ ...s, currentBeat: beat })),
		setRow: (row: number) => update((s) => ({ ...s, currentRow: row })),
		advance: (totalBeats: number, totalRows: number) =>
			update((s) => {
				let nextBeat = s.currentBeat + 1;
				let nextRow = s.currentRow;
				if (nextBeat >= totalBeats) {
					nextBeat = 0;
					nextRow = (s.currentRow + 1) % totalRows;
				}
				return { ...s, currentBeat: nextBeat, currentRow: nextRow };
			}),
		reset: () => set({ isPlaying: false, currentBeat: 0, currentRow: 0, tempo: 60 })
	};
}

export const playback = createPlaybackStore();

// Derived store for display (1-indexed)
export const currentPosition = derived(playback, ($p) => ({
	beat: $p.currentBeat + 1,
	row: $p.currentRow + 1
}));
