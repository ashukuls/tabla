<script lang="ts">
	import type { PolyrhythmPattern } from '$lib/types';

	interface Props {
		pattern: PolyrhythmPattern;
		currentBlock: number;
		beats: number;
	}

	let { pattern, currentBlock, beats }: Props = $props();

	// Check if a block is a bol position
	function isBolBlock(index: number): boolean {
		return pattern.bolBlocks.includes(index);
	}

	// Check if a block is a beat position
	function isBeatBlock(index: number): boolean {
		return pattern.beatBlocks.includes(index);
	}

	// Get cell classes based on state
	function getCellClasses(index: number): string {
		const bolNum = Math.floor(index / pattern.bolInterval);
		const isActive = index === currentBlock;
		const isBol = isBolBlock(index);
		const isBeat = isBeatBlock(index);

		let classes = 'grid-cell relative flex items-center justify-center transition-colors duration-50 ';

		// Background based on bol grouping (alternating)
		if (isActive) {
			classes += 'bg-yellow-400 ';
		} else if (bolNum % 2 === 0) {
			classes += 'bg-gray-700 ';
		} else {
			classes += 'bg-gray-600 ';
		}

		return classes;
	}

	// Get dot indicator for events
	function getDotClass(index: number): string | null {
		const isBol = isBolBlock(index);
		const isBeat = isBeatBlock(index);

		if (isBol && isBeat) {
			return 'w-3 h-3 bg-purple-500 rounded-full'; // Coincidence
		} else if (isBol) {
			return 'w-3 h-3 bg-teal-500 rounded-full'; // Bol only
		}
		return null;
	}

	// Get blocks for a specific beat row (for mobile layout)
	function getBlocksForBeat(beatIndex: number): number[] {
		const blocksPerBeat = pattern.beatInterval;
		const start = beatIndex * blocksPerBeat;
		const end = Math.min(start + blocksPerBeat, pattern.totalBlocks);
		const blocks: number[] = [];
		for (let i = start; i < end; i++) {
			blocks.push(i);
		}
		return blocks;
	}
</script>

<div class="polyrhythm-grid">
	<!-- Desktop: horizontal single row -->
	<div class="hidden md:block overflow-x-auto pb-2">
		<div class="inline-flex">
			{#each Array(pattern.totalBlocks) as _, i}
				<div
					class={getCellClasses(i)}
					style="width: 60px; height: 60px; border-left: {isBeatBlock(i) ? '4px solid rgb(59, 130, 246)' : '1px solid rgb(75, 85, 99)'}; border-top: 1px solid rgb(75, 85, 99); border-bottom: 1px solid rgb(75, 85, 99); border-right: 1px solid rgb(75, 85, 99);"
				>
					<!-- Event dot -->
					{#if getDotClass(i)}
						<div class="absolute top-1 left-1/2 -translate-x-1/2">
							<div class={getDotClass(i)}></div>
						</div>
					{/if}
					<!-- Box number -->
					<span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-300">
						{pattern.boxNumbers[i]}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Mobile: one row per beat -->
	<div class="md:hidden space-y-3">
		{#each Array(beats) as _, beatIdx}
			<div class="flex flex-col gap-1">
				<div class="text-center text-xs text-gray-400">Beat {beatIdx + 1}</div>
				<div class="flex gap-0 justify-center">
					{#each getBlocksForBeat(beatIdx) as blockIdx}
						<div
							class={getCellClasses(blockIdx)}
							style="width: 50px; height: 50px; border-left: {isBeatBlock(blockIdx) ? '4px solid rgb(59, 130, 246)' : '1px solid rgb(75, 85, 99)'}; border-top: 1px solid rgb(75, 85, 99); border-bottom: 1px solid rgb(75, 85, 99); border-right: 1px solid rgb(75, 85, 99);"
						>
							{#if getDotClass(blockIdx)}
								<div class="absolute top-1 left-1/2 -translate-x-1/2">
									<div class={getDotClass(blockIdx)}></div>
								</div>
							{/if}
							<span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-300">
								{pattern.boxNumbers[blockIdx]}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Legend -->
	<div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-300">
		<div class="flex items-center gap-2">
			<div class="w-4 h-4 bg-teal-500 rounded-full"></div>
			<span>Bol</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-4 h-4 bg-purple-500 rounded-full"></div>
			<span>Beat + Bol</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-4 h-4 border-4 border-blue-500"></div>
			<span>Beat Start</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-4 h-4 bg-yellow-400"></div>
			<span>Current</span>
		</div>
	</div>
</div>
