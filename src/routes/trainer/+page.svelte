<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getPolyrhythmSynth, unlockAudio } from '$lib/audio';
	import { getPolyrhythmPresets, createPolyrhythmPreset, deletePolyrhythmPreset } from '$lib/firebase/db';
	import PolyrhythmGrid from '$lib/components/PolyrhythmGrid.svelte';
	import type { PolyrhythmPattern, PolyrhythmPreset } from '$lib/types';
	import * as Tone from 'tone';

	// Parameters
	let bols = $state(4);
	let beats = $state(3);
	let tempo = $state(30);

	// Volume controls (0-100)
	let beatVol = $state(50);
	let bolVol = $state(0);
	let subdivVol = $state(20);

	// Playback state
	let isPlaying = $state(false);
	let currentBlock = $state(-1);
	let audioReady = $state(false);

	// Presets
	let presets = $state<PolyrhythmPreset[]>([]);
	let presetName = $state('');
	let isSaving = $state(false);
	let saveMessage = $state('');

	// Pattern calculation
	let pattern = $derived.by(() => calculatePattern(bols, beats));

	// Scheduler variables
	let schedulerInterval: ReturnType<typeof setInterval> | null = null;
	let animationId: number | null = null;
	let nextNoteTime = 0;
	let startTime = 0;
	let blockDuration = 0;
	const scheduleAheadTime = 0.1;
	const lookahead = 25;

	function calculatePattern(n: number, d: number): PolyrhythmPattern {
		const totalBlocks = n * d;
		const bolInterval = totalBlocks / n;
		const beatInterval = totalBlocks / d;

		const bolBlocks: number[] = [];
		const beatBlocks: number[] = [];

		for (let i = 0; i < totalBlocks; i++) {
			if (i % bolInterval === 0) bolBlocks.push(i);
			if (i % beatInterval === 0) beatBlocks.push(i);
		}

		// Calculate box numbers (repeating bol number pattern)
		const boxNumbers: number[] = [];
		for (let bolNum = 1; bolNum <= n; bolNum++) {
			const blocksInThisBol = Math.floor(totalBlocks / n);
			const extraBlocks = bolNum <= totalBlocks % n ? 1 : 0;
			const totalBlocksForBol = blocksInThisBol + extraBlocks;
			for (let j = 0; j < totalBlocksForBol; j++) {
				boxNumbers.push(bolNum);
			}
		}

		return { totalBlocks, bolInterval, beatInterval, bolBlocks, beatBlocks, boxNumbers };
	}

	function scheduler() {
		const synth = getPolyrhythmSynth();
		if (!synth.ready) return;

		while (nextNoteTime < Tone.now() + scheduleAheadTime) {
			scheduleNote(currentBlock, nextNoteTime);
			advanceNote();
		}
	}

	function scheduleNote(blockIndex: number, time: number) {
		const synth = getPolyrhythmSynth();

		// Always play subdivision
		synth.playSubdivision(time);

		// Play beat if this is a beat block
		if (pattern.beatBlocks.includes(blockIndex)) {
			synth.playBeat(time);
		}

		// Play bol if this is a bol block
		if (pattern.bolBlocks.includes(blockIndex)) {
			synth.playBol(time);
		}
	}

	function advanceNote() {
		const secondsPerBeat = 60.0 / tempo;
		blockDuration = secondsPerBeat / (pattern.totalBlocks / beats);
		nextNoteTime += blockDuration;
		currentBlock = (currentBlock + 1) % pattern.totalBlocks;
	}

	function animate() {
		if (!isPlaying) return;

		const currentTime = Tone.now();
		const elapsedTime = currentTime - startTime;
		const visualBlock = Math.floor(elapsedTime / blockDuration) % pattern.totalBlocks;
		currentBlock = visualBlock;

		animationId = requestAnimationFrame(animate);
	}

	async function initAudio() {
		await unlockAudio();
		const synth = getPolyrhythmSynth();
		await synth.init();
		synth.setVolumes({ beat: beatVol, bol: bolVol, subdivision: subdivVol });
		audioReady = true;
	}

	async function handlePlay() {
		if (isPlaying) return;

		if (!audioReady) {
			await initAudio();
		}

		// Calculate block duration before starting
		const secondsPerBeat = 60.0 / tempo;
		blockDuration = secondsPerBeat / (pattern.totalBlocks / beats);

		isPlaying = true;
		currentBlock = 0;
		startTime = Tone.now();
		nextNoteTime = Tone.now();

		schedulerInterval = setInterval(scheduler, lookahead);
		animate();
	}

	function handleStop() {
		if (!isPlaying) return;

		isPlaying = false;
		currentBlock = -1;

		if (schedulerInterval) {
			clearInterval(schedulerInterval);
			schedulerInterval = null;
		}

		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
	}

	function handleTogglePlay() {
		if (isPlaying) {
			handleStop();
		} else {
			handlePlay();
		}
	}

	function updateVolumes() {
		const synth = getPolyrhythmSynth();
		if (synth.ready) {
			synth.setVolumes({ beat: beatVol, bol: bolVol, subdivision: subdivVol });
		}
	}

	function handleParamChange() {
		if (isPlaying) {
			handleStop();
		}
	}

	// Clamp values
	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	function handleBolsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		bols = clamp(parseInt(target.value) || 1, 1, 10);
		handleParamChange();
	}

	function handleBeatsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		beats = clamp(parseInt(target.value) || 1, 1, 10);
		handleParamChange();
	}

	function handleTempoChange(e: Event) {
		const target = e.target as HTMLInputElement;
		tempo = clamp(parseInt(target.value) || 30, 10, 300);
	}

	// Preset management
	async function loadPresets() {
		try {
			presets = await getPolyrhythmPresets();
		} catch (e) {
			console.error('Failed to load presets:', e);
		}
	}

	function loadPreset(preset: PolyrhythmPreset) {
		handleStop();
		bols = preset.bols;
		beats = preset.beats;
		tempo = preset.tempo;
		beatVol = preset.volumes.beat;
		bolVol = preset.volumes.bol;
		subdivVol = preset.volumes.subdivision;
		updateVolumes();
	}

	async function savePreset() {
		if (!presetName.trim()) {
			saveMessage = 'Please enter a name';
			return;
		}

		isSaving = true;
		saveMessage = '';

		try {
			await createPolyrhythmPreset({
				name: presetName,
				bols,
				beats,
				tempo,
				volumes: { beat: beatVol, bol: bolVol, subdivision: subdivVol }
			});
			saveMessage = 'Saved!';
			presetName = '';
			await loadPresets();
		} catch (e) {
			console.error('Failed to save preset:', e);
			saveMessage = 'Failed to save';
		} finally {
			isSaving = false;
		}
	}

	async function handleDeletePreset(id: string) {
		try {
			await deletePolyrhythmPreset(id);
			await loadPresets();
		} catch (e) {
			console.error('Failed to delete preset:', e);
		}
	}

	onMount(() => {
		loadPresets();
	});

	onDestroy(() => {
		handleStop();
	});

	// Update volumes when sliders change
	$effect(() => {
		beatVol;
		bolVol;
		subdivVol;
		updateVolumes();
	});
</script>

<svelte:head>
	<title>Layakari Polyrhythm Trainer</title>
</svelte:head>

<main class="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
	<div class="max-w-7xl mx-auto">
		<nav class="mb-6">
			<a href="/" class="text-blue-400 hover:text-blue-300">&larr; Back to Home</a>
		</nav>

		<h1 class="text-3xl md:text-4xl font-bold mb-2 text-center">Layakari Polyrhythm Trainer</h1>

		<!-- Audio unlock prompt -->
		{#if !audioReady}
			<div class="text-center mb-6">
				<button
					onclick={initAudio}
					class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg"
				>
					Tap to Enable Audio
				</button>
			</div>
		{/if}

		<!-- Controls Section -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6 space-y-6">
			<!-- Rhythm Parameters -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label for="bols" class="block text-sm font-medium mb-2">Bols (N)</label>
					<input
						type="number"
						id="bols"
						min="1"
						max="10"
						value={bols}
						onchange={handleBolsChange}
						class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="beats" class="block text-sm font-medium mb-2">Beats (D)</label>
					<input
						type="number"
						id="beats"
						min="1"
						max="10"
						value={beats}
						onchange={handleBeatsChange}
						class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="tempo" class="block text-sm font-medium mb-2">Tempo (BPM)</label>
					<input
						type="number"
						id="tempo"
						min="10"
						max="300"
						value={tempo}
						onchange={handleTempoChange}
						class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
					/>
				</div>
			</div>

			<!-- Volume Controls -->
			<div class="space-y-3">
				<h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wide">Volume Mix</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="beatVol" class="block text-sm mb-1 flex justify-between">
							<span>Beat</span>
							<span class="text-gray-400">{beatVol}%</span>
						</label>
						<input
							type="range"
							id="beatVol"
							min="0"
							max="100"
							bind:value={beatVol}
							class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
						/>
					</div>
					<div>
						<label for="bolVol" class="block text-sm mb-1 flex justify-between">
							<span>Bol</span>
							<span class="text-gray-400">{bolVol}%</span>
						</label>
						<input
							type="range"
							id="bolVol"
							min="0"
							max="100"
							bind:value={bolVol}
							class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
						/>
					</div>
					<div>
						<label for="subdivVol" class="block text-sm mb-1 flex justify-between">
							<span>Laghu</span>
							<span class="text-gray-400">{subdivVol}%</span>
						</label>
						<input
							type="range"
							id="subdivVol"
							min="0"
							max="100"
							bind:value={subdivVol}
							class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
						/>
					</div>
				</div>
			</div>

			<!-- Play Button -->
			<div class="flex justify-center">
				<button
					onclick={handleTogglePlay}
					class="px-8 py-3 rounded-lg font-semibold transition-colors text-lg {isPlaying
						? 'bg-red-600 hover:bg-red-700'
						: 'bg-green-600 hover:bg-green-700'}"
				>
					{isPlaying ? '■ Stop' : '▶ Play'}
				</button>
			</div>
		</div>

		<!-- Visualizer Section -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">Rhythm Visualizer</h2>
			<PolyrhythmGrid {pattern} {currentBlock} {beats} />
		</div>

		<!-- Preset Save Section -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">Save Preset</h2>
			<div class="flex flex-col sm:flex-row gap-3">
				<input
					type="text"
					bind:value={presetName}
					placeholder="Preset name"
					class="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
				/>
				<button
					onclick={savePreset}
					disabled={isSaving}
					class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
				>
					{isSaving ? 'Saving...' : 'Save'}
				</button>
			</div>
			{#if saveMessage}
				<p
					class="mt-2 text-sm"
					class:text-green-400={saveMessage === 'Saved!'}
					class:text-red-400={saveMessage !== 'Saved!'}
				>
					{saveMessage}
				</p>
			{/if}
		</div>

		<!-- Saved Presets -->
		{#if presets.length > 0}
			<div class="bg-gray-800 rounded-lg p-6 mb-6">
				<h2 class="text-xl font-semibold mb-4">Saved Presets</h2>
				<div class="space-y-2">
					{#each presets as preset}
						<div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
							<button
								onclick={() => loadPreset(preset)}
								class="flex-1 text-left hover:text-blue-400 transition-colors"
							>
								<span class="font-semibold">{preset.name}</span>
								<span class="text-gray-400 ml-2">{preset.bols} over {preset.beats} @ {preset.tempo} BPM</span>
							</button>
							<button
								onclick={() => handleDeletePreset(preset.id)}
								class="ml-3 px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
							>
								Delete
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- iPhone Silent Mode Warning -->
		<div class="bg-orange-900/50 border-2 border-orange-500 rounded-lg p-4 text-center mb-6">
			<p class="text-orange-200 font-semibold">iPhone/iPad: No audio? Turn OFF Silent Mode</p>
		</div>

		<!-- Practice Instructions -->
		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">How to Practice</h2>
			<div class="space-y-4 text-gray-300">
				<div class="flex gap-3">
					<span class="text-blue-400 font-bold flex-shrink-0">Step 1:</span>
					<p>Start with Bol volume at 0. Practice <span class="font-semibold text-white">Tali</span> (clap) on the beat.</p>
				</div>
				<div class="flex gap-3">
					<span class="text-blue-400 font-bold flex-shrink-0">Step 2:</span>
					<p>Practice saying the repeating number pattern (1, 1, 1, 2, 2, 2, ...) on laghu (tick), while clapping on the beat.</p>
				</div>
				<div class="flex gap-3">
					<span class="text-blue-400 font-bold flex-shrink-0">Step 3:</span>
					<p>Now increase the Bol sound. Say only the <span class="font-semibold text-white">first number</span> of each repetition along with the Bol sound. Continue clapping on beats. This is the layakari pattern!</p>
				</div>
				<div class="flex gap-3">
					<span class="text-blue-400 font-bold flex-shrink-0">Step 4:</span>
					<p>Replace the numbers with actual tabla bols (e.g., <span class="font-semibold text-white">Ti R Ki T</span> or <span class="font-semibold text-white">Dha Ge Na Tin</span>). Recite the bol sequence with repetition or first Bol only while maintaining the layakari pattern.</p>
				</div>
			</div>
		</div>

		<!-- Teacher Credit -->
		<div class="text-center pb-6">
			<p class="text-gray-400 text-sm">
				Inspired by my tabla teacher Shri Satish Tare
				<a href="https://tablaniketan.com" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">tablaniketan.com</a>
			</p>
		</div>
	</div>
</main>
