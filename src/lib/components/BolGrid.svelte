<script lang="ts">
	import type { Row } from '$lib/types';

	interface Props {
		rows: Row[];
		currentRow?: number;
		currentBeat?: number;
		beatsPerRow?: number;
	}

	let { rows, currentRow = -1, currentBeat = -1, beatsPerRow = 4 }: Props = $props();

	// Group beats into vibhags (visual groupings)
	function groupBeats(beats: { bols: string[] }[], groupSize: number) {
		const groups: { bols: string[] }[][] = [];
		for (let i = 0; i < beats.length; i += groupSize) {
			groups.push(beats.slice(i, i + groupSize));
		}
		return groups;
	}
</script>

<div class="bol-grid space-y-1">
	{#each rows as row, rowIdx}
		<div
			class="row flex flex-wrap gap-1 p-2 rounded-lg transition-colors duration-150"
			class:bg-amber-100={currentRow === rowIdx}
			class:bg-white={currentRow !== rowIdx}
		>
			{#each groupBeats(row.beats, beatsPerRow) as group, groupIdx}
				<div class="vibhag flex gap-0.5 px-1.5 py-0.5 border-l-2 border-amber-300 first:border-l-0">
					{#each group as beat, beatIdx}
						{@const globalBeatIdx = groupIdx * beatsPerRow + beatIdx}
						<div
							class="beat flex items-center justify-center min-w-[2rem] px-1 py-1 rounded font-mono text-sm transition-all duration-100"
							class:bg-amber-500={currentRow === rowIdx && currentBeat === globalBeatIdx}
							class:text-white={currentRow === rowIdx && currentBeat === globalBeatIdx}
							class:scale-105={currentRow === rowIdx && currentBeat === globalBeatIdx}
							class:bg-amber-50={!(currentRow === rowIdx && currentBeat === globalBeatIdx)}
							class:text-amber-900={!(currentRow === rowIdx && currentBeat === globalBeatIdx)}
						>
							{#each beat.bols as bol, bolIdx}
								<span class:ml-0.5={bolIdx > 0}>{bol}</span>
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/each}
</div>

{#if rows.length === 0}
	<div class="text-center text-amber-600 py-8">
		No composition loaded. Enter bols above or load a saved composition.
	</div>
{/if}
