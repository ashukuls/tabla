<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getCompositions, deleteComposition } from '$lib/firebase/db';
	import { getTablaPlayer, unlockAudio } from '$lib/audio';
	import { playback } from '$lib/stores/playback';
	import TaalSelector from '$lib/components/TaalSelector.svelte';
	import { TAALS } from '$lib/data/taals';
	import BolGrid from '$lib/components/BolGrid.svelte';
	import PlaybackControls from '$lib/components/PlaybackControls.svelte';
	import type { Composition, Row } from '$lib/types';
	import * as Tone from 'tone';

	// Data state
	let compositions = $state<Composition[]>([]);
	let filteredCompositions = $state<Composition[]>([]);
	let isLoading = $state(true);
	let error = $state('');

	// Filter state
	let searchQuery = $state('');
	let taalFilter = $state('All');
	let sortBy = $state<'newest' | 'oldest' | 'title'>('newest');

	// Playback state
	let audioReady = $state(false);
	let activeComposition = $state<Composition | null>(null);
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

	// Scheduler
	let schedulerInterval: ReturnType<typeof setInterval> | null = null;
	let nextNoteTime = 0;
	const scheduleAheadTime = 0.1;
	const lookahead = 25;

	// Filter and sort compositions
	$effect(() => {
		let result = [...compositions];

		// Filter by taal
		if (taalFilter !== 'All') {
			result = result.filter((c) => c.meta.taal === taalFilter);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(c) =>
					c.meta.title?.toLowerCase().includes(query) ||
					c.meta.author?.toLowerCase().includes(query) ||
					c.meta.description?.toLowerCase().includes(query) ||
					c.meta.tags?.some((tag) => tag.toLowerCase().includes(query))
			);
		}

		// Sort
		switch (sortBy) {
			case 'newest':
				result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
				break;
			case 'oldest':
				result.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
				break;
			case 'title':
				result.sort((a, b) => (a.meta.title || '').localeCompare(b.meta.title || ''));
				break;
		}

		filteredCompositions = result;
	});

	async function loadCompositions() {
		isLoading = true;
		error = '';
		try {
			compositions = await getCompositions();
		} catch (e) {
			console.error('Failed to load compositions:', e);
			error = 'Failed to load compositions. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function initAudio() {
		await unlockAudio();
		const tabla = getTablaPlayer();
		await tabla.init();
		audioReady = true;
	}

	function scheduler() {
		if (!activeComposition) return;
		const tabla = getTablaPlayer();
		if (!tabla.ready) return;

		const rows = activeComposition.rows;

		while (nextNoteTime < Tone.now() + scheduleAheadTime) {
			const row = rows[currentRow];
			if (row && row.beats[currentBeat]) {
				const beat = row.beats[currentBeat];
				beat.bols.forEach((bol) => {
					if (bol !== '-') {
						tabla.playBol(bol, nextNoteTime);
					}
				});
			}

			const totalBeats = rows[currentRow]?.beats.length || 1;
			playback.advance(totalBeats, rows.length);
			nextNoteTime += 60 / tempo;
		}
	}

	async function playComposition(comp: Composition) {
		if (!audioReady) await initAudio();

		// Stop current playback
		stopPlayback();

		// Set up new composition
		activeComposition = comp;
		playback.setTempo(comp.meta.tempo);
		nextNoteTime = Tone.now() + 0.05;
		playback.play();
		schedulerInterval = setInterval(scheduler, lookahead);
	}

	function pausePlayback() {
		playback.pause();
		if (schedulerInterval) {
			clearInterval(schedulerInterval);
			schedulerInterval = null;
		}
	}

	function stopPlayback() {
		pausePlayback();
		playback.stop();
		activeComposition = null;
	}

	function resumePlayback() {
		if (!activeComposition) return;
		nextNoteTime = Tone.now() + 0.05;
		playback.play();
		schedulerInterval = setInterval(scheduler, lookahead);
	}

	function openInPlayer(comp: Composition) {
		// Store composition ID in URL
		goto(`/player?load=${comp.id}`);
	}

	onMount(() => {
		loadCompositions();
	});

	onDestroy(() => {
		unsubscribe();
		stopPlayback();
	});
</script>

<svelte:head>
	<title>Browse Compositions - Tabla Library</title>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<nav class="mb-8 flex justify-between items-center">
			<a href="/" class="text-amber-600 hover:text-amber-800">&larr; Back to Home</a>
			<a
				href="/upload"
				class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
			>
				+ Upload
			</a>
		</nav>

		<h1 class="text-4xl font-bold text-amber-900 mb-8">Browse Compositions</h1>

		<!-- Audio unlock -->
		{#if !audioReady}
			<button
				onclick={initAudio}
				class="w-full mb-6 p-4 bg-amber-100 border-2 border-amber-300 rounded-xl text-amber-800 hover:bg-amber-200 transition-colors"
			>
				Tap to Enable Audio
			</button>
		{/if}

		<!-- Filters -->
		<div class="bg-white rounded-2xl shadow-lg p-4 border-2 border-amber-200 mb-6">
			<div class="grid sm:grid-cols-3 gap-4">
				<!-- Search -->
				<div>
					<label for="search" class="block text-sm font-medium text-amber-700 mb-1">Search</label>
					<input
						type="text"
						id="search"
						bind:value={searchQuery}
						placeholder="Title, author, tags..."
						class="w-full p-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
					/>
				</div>

				<!-- Taal filter -->
				<div>
					<label for="taal" class="block text-sm font-medium text-amber-700 mb-1">Taal</label>
					<select
						id="taal"
						bind:value={taalFilter}
						class="w-full p-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none bg-white"
					>
						<option value="All">All Taals</option>
						{#each Object.keys(TAALS) as taal}
							<option value={taal}>{taal}</option>
						{/each}
					</select>
				</div>

				<!-- Sort -->
				<div>
					<label for="sort" class="block text-sm font-medium text-amber-700 mb-1">Sort by</label>
					<select
						id="sort"
						bind:value={sortBy}
						class="w-full p-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none bg-white"
					>
						<option value="newest">Newest first</option>
						<option value="oldest">Oldest first</option>
						<option value="title">Title A-Z</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Results count -->
		<p class="text-amber-700 mb-4">
			{#if isLoading}
				Loading...
			{:else if error}
				<span class="text-red-600">{error}</span>
			{:else}
				Showing {filteredCompositions.length} of {compositions.length} compositions
			{/if}
		</p>

		<!-- Composition list -->
		{#if !isLoading && !error}
			<div class="space-y-4">
				{#each filteredCompositions as comp (comp.id)}
					<div class="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden">
						<!-- Header -->
						<div class="p-4 border-b border-amber-100">
							<div class="flex justify-between items-start">
								<div>
									<h2 class="text-xl font-semibold text-amber-900">
										{comp.meta.title || 'Untitled'}
									</h2>
									<div class="flex flex-wrap gap-2 mt-1 text-sm text-amber-600">
										<span class="bg-amber-100 px-2 py-0.5 rounded">{comp.meta.taal}</span>
										<span>{comp.meta.tempo} BPM</span>
										{#if comp.meta.author}
											<span>by {comp.meta.author}</span>
										{/if}
									</div>
								</div>
								<div class="flex gap-2">
									{#if activeComposition?.id === comp.id && isPlaying}
										<button
											onclick={pausePlayback}
											class="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
											title="Pause"
										>
											<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
													clip-rule="evenodd"
												/>
											</svg>
										</button>
									{:else if activeComposition?.id === comp.id}
										<button
											onclick={resumePlayback}
											class="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
											title="Resume"
										>
											<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
													clip-rule="evenodd"
												/>
											</svg>
										</button>
									{:else}
										<button
											onclick={() => playComposition(comp)}
											class="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
											title="Play"
										>
											<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
													clip-rule="evenodd"
												/>
											</svg>
										</button>
									{/if}
									<button
										onclick={() => openInPlayer(comp)}
										class="p-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
										title="Open in Player"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</button>
								</div>
							</div>

							{#if comp.meta.description}
								<p class="mt-2 text-amber-700 text-sm">{comp.meta.description}</p>
							{/if}

							{#if comp.meta.tags && comp.meta.tags.length > 0}
								<div class="flex flex-wrap gap-1 mt-2">
									{#each comp.meta.tags as tag}
										<span class="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
											{tag}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Bol Grid Preview (collapsed) -->
						<div class="p-4 bg-amber-50">
							<BolGrid
								rows={comp.rows}
								currentRow={activeComposition?.id === comp.id ? currentRow : -1}
								currentBeat={activeComposition?.id === comp.id ? currentBeat : -1}
								beatsPerRow={4}
							/>
						</div>
					</div>
				{:else}
					<div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200 text-center">
						<p class="text-amber-700">No compositions found matching your filters.</p>
						<a href="/upload" class="inline-block mt-4 text-amber-600 hover:text-amber-800 underline">
							Be the first to upload one!
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
