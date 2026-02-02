<script lang="ts">
	interface Props {
		isPlaying: boolean;
		tempo: number;
		onPlay: () => void;
		onPause: () => void;
		onStop: () => void;
		onTempoChange: (tempo: number) => void;
		disabled?: boolean;
	}

	let {
		isPlaying,
		tempo,
		onPlay,
		onPause,
		onStop,
		onTempoChange,
		disabled = false
	}: Props = $props();

	function handleTempoInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onTempoChange(parseInt(target.value, 10));
	}
</script>

<div class="playback-controls flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-xl shadow-md">
	<!-- Play/Pause/Stop buttons -->
	<div class="flex gap-2">
		{#if isPlaying}
			<button
				onclick={onPause}
				{disabled}
				class="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
				</svg>
				Pause
			</button>
		{:else}
			<button
				onclick={onPlay}
				{disabled}
				class="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
				</svg>
				Play
			</button>
		{/if}
		<button
			onclick={onStop}
			{disabled}
			class="px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
				<rect x="4" y="4" width="12" height="12" rx="1" />
			</svg>
			Stop
		</button>
	</div>

	<!-- Tempo slider -->
	<div class="flex items-center gap-3 flex-1 max-w-md">
		<label for="tempo" class="text-amber-800 font-medium whitespace-nowrap">
			Tempo:
		</label>
		<input
			type="range"
			id="tempo"
			min="30"
			max="300"
			value={tempo}
			oninput={handleTempoInput}
			class="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
		/>
		<span class="text-amber-900 font-mono w-16 text-right">{tempo} BPM</span>
	</div>
</div>
