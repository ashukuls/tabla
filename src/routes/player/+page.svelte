<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { getTablaPlayer, unlockAudio } from '$lib/audio';
	import { playback } from '$lib/stores/playback';
	import { parseComposition, rowsToText } from '$lib/utils/bolParser';
	import { getCompositions, getComposition, createComposition } from '$lib/firebase/db';
	import BolGrid from '$lib/components/BolGrid.svelte';
	import PlaybackControls from '$lib/components/PlaybackControls.svelte';
	import TaalSelector from '$lib/components/TaalSelector.svelte';
	import type { Row, Composition } from '$lib/types';
	import * as Tone from 'tone';

	// State
	let bolInput = $state('Dha Dhin Dhin Dha | Dha Dhin Dhin Dha\nDha Tin Tin Ta | Ta Dhin Dhin Dha');
	let rows = $state<Row[]>([]);
	let audioReady = $state(false);
	let compositions = $state<Composition[]>([]);
	let saveTitle = $state('');
	let saveTaal = $state('Teentaal');
	let isSaving = $state(false);
	let saveMessage = $state('');
	let loadedCompositionId = $state<string | null>(null);

	// Derived from store
	let isPlaying = $state(false);
	let currentBeat = $state(0);
	let currentRow = $state(0);
	let tempo = $state(60);

	// Subscribe to playback store
	const unsubscribe = playback.subscribe((state) => {
		isPlaying = state.isPlaying;
		currentBeat = state.currentBeat;
		currentRow = state.currentRow;
		tempo = state.tempo;
	});

	// Scheduler variables
	let schedulerInterval: ReturnType<typeof setInterval> | null = null;
	let nextNoteTime = 0;
	const scheduleAheadTime = 0.1; // Schedule 100ms ahead
	const lookahead = 25; // Check every 25ms

	// Parse bols when input changes
	$effect(() => {
		rows = parseComposition(bolInput);
	});

	// Handle playback scheduling
	function scheduler() {
		const tabla = getTablaPlayer();
		if (!tabla.ready || rows.length === 0) return;

		const beatDuration = 60 / tempo;

		while (nextNoteTime < Tone.now() + scheduleAheadTime) {
			// Get current beat
			const row = rows[currentRow];
			if (row && row.beats[currentBeat]) {
				const beat = row.beats[currentBeat];
				const numBols = beat.bols.length;
				const subdivDuration = beatDuration / numBols;

				// Schedule each bol evenly across the beat
				beat.bols.forEach((bol, index) => {
					if (bol !== '-') {
						const bolTime = nextNoteTime + index * subdivDuration;
						tabla.playBol(bol, bolTime);
					}
				});
			}

			// Advance position
			const totalBeats = rows[currentRow]?.beats.length || 1;
			playback.advance(totalBeats, rows.length);

			// Calculate next note time (move to next beat)
			nextNoteTime += beatDuration;
		}
	}

	async function handlePlay() {
		if (!audioReady) {
			await initAudio();
		}

		if (rows.length === 0) return;

		nextNoteTime = Tone.now() + 0.05;
		playback.play();
		schedulerInterval = setInterval(scheduler, lookahead);
	}

	function handlePause() {
		playback.pause();
		if (schedulerInterval) {
			clearInterval(schedulerInterval);
			schedulerInterval = null;
		}
	}

	function handleStop() {
		handlePause();
		playback.stop();
	}

	function handleTempoChange(newTempo: number) {
		playback.setTempo(newTempo);
	}

	async function initAudio() {
		await unlockAudio();
		const tabla = getTablaPlayer();
		await tabla.init();
		audioReady = true;
	}

	async function loadCompositions() {
		try {
			compositions = await getCompositions();
		} catch (e) {
			console.error('Failed to load compositions:', e);
		}
	}

	function loadComposition(comp: Composition) {
		bolInput = rowsToText(comp.rows);
		playback.setTempo(comp.meta.tempo);
		handleStop();
	}

	async function saveComposition() {
		if (!saveTitle.trim()) {
			saveMessage = 'Please enter a title';
			return;
		}

		isSaving = true;
		saveMessage = '';

		try {
			await createComposition({
				meta: {
					title: saveTitle,
					taal: saveTaal,
					tempo: tempo
				},
				rows: rows
			});
			saveMessage = 'Saved!';
			saveTitle = '';
			await loadCompositions();
		} catch (e) {
			console.error('Failed to save:', e);
			saveMessage = 'Failed to save. Check Firebase config.';
		} finally {
			isSaving = false;
		}
	}

	onMount(async () => {
		loadCompositions();

		// Check for composition ID in URL
		const loadId = $page.url.searchParams.get('load');
		if (loadId) {
			try {
				const comp = await getComposition(loadId);
				if (comp) {
					loadComposition(comp);
					loadedCompositionId = comp.id;
				}
			} catch (e) {
				console.error('Failed to load composition:', e);
			}
		}
	});

	onDestroy(() => {
		unsubscribe();
		handleStop();
	});
</script>

<svelte:head>
	<title>Tabla Player - Play Compositions</title>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<nav class="mb-8">
			<a href="/" class="text-amber-600 hover:text-amber-800">&larr; Back to Home</a>
		</nav>

		<h1 class="text-4xl font-bold text-amber-900 mb-8">Tabla Player</h1>

		<!-- Audio unlock prompt -->
		{#if !audioReady}
			<button
				onclick={initAudio}
				class="w-full mb-6 p-4 bg-amber-100 border-2 border-amber-300 rounded-xl text-amber-800 hover:bg-amber-200 transition-colors"
			>
				Tap to Enable Audio
			</button>
		{/if}

		<!-- Playback Controls -->
		<div class="mb-6">
			<PlaybackControls
				{isPlaying}
				{tempo}
				onPlay={handlePlay}
				onPause={handlePause}
				onStop={handleStop}
				onTempoChange={handleTempoChange}
				disabled={rows.length === 0}
			/>
		</div>

		<!-- Bol Grid Display -->
		<div class="mb-6 p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
			<h2 class="text-xl font-semibold text-amber-900 mb-4">Composition</h2>
			<BolGrid {rows} {currentRow} {currentBeat} beatsPerRow={4} />
		</div>

		<!-- Bol Input -->
		<div class="mb-6 p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
			<h2 class="text-xl font-semibold text-amber-900 mb-4">Enter Bols</h2>
			<textarea
				bind:value={bolInput}
				rows="4"
				placeholder="Enter bols separated by spaces. Use | for visual grouping. New line for new row.&#10;Example: Dha Dhin Dhin Dha | Dha Dhin Dhin Dha"
				class="w-full p-3 border-2 border-amber-200 rounded-lg font-mono text-amber-900 focus:border-amber-400 focus:outline-none resize-none"
			></textarea>
			<p class="mt-2 text-sm text-amber-600">
				Supported bols: Dha, Dhin, Ta, Tin, Na, Tun, Ge, Ke, Ti, Te, Ra, Ka, Tete, Gadi, Trkt, - (rest)
			</p>
		</div>

		<!-- Save Section -->
		<div class="mb-6 p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
			<h2 class="text-xl font-semibold text-amber-900 mb-4">Save Composition</h2>
			<div class="flex flex-col sm:flex-row gap-3">
				<input
					type="text"
					bind:value={saveTitle}
					placeholder="Composition title"
					class="flex-1 p-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
				/>
				<TaalSelector bind:value={saveTaal} />
				<button
					onclick={saveComposition}
					disabled={isSaving || rows.length === 0}
					class="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors"
				>
					{isSaving ? 'Saving...' : 'Save'}
				</button>
			</div>
			{#if saveMessage}
				<p class="mt-2 text-sm" class:text-green-600={saveMessage === 'Saved!'} class:text-red-600={saveMessage !== 'Saved!'}>
					{saveMessage}
				</p>
			{/if}
		</div>

		<!-- Saved Compositions -->
		{#if compositions.length > 0}
			<div class="p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
				<h2 class="text-xl font-semibold text-amber-900 mb-4">Saved Compositions</h2>
				<div class="space-y-2">
					{#each compositions as comp}
						<button
							onclick={() => loadComposition(comp)}
							class="w-full p-3 text-left bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
						>
							<span class="font-semibold text-amber-900">{comp.meta.title || 'Untitled'}</span>
							<span class="text-amber-600 ml-2">{comp.meta.taal} - {comp.meta.tempo} BPM</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</main>
