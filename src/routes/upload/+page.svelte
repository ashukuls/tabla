<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createComposition, getComposition, updateComposition } from '$lib/firebase/db';
	import { parseComposition, rowsToText } from '$lib/utils/bolParser';
	import TaalSelector from '$lib/components/TaalSelector.svelte';
	import BolGrid from '$lib/components/BolGrid.svelte';
	import type { Row } from '$lib/types';

	// Edit mode
	let editId = $state<string | null>(null);
	let isEditMode = $derived(!!editId);
	let isLoading = $state(false);

	// Form state
	let title = $state('');
	let taal = $state('Teentaal');
	let tempo = $state(60);
	let description = $state('');
	let author = $state('');
	let tagsInput = $state('');
	let bolInput = $state('');

	// UI state
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	// Parsed preview
	let rows = $state<Row[]>([]);
	let parseError = $state('');

	// Parse bols when input changes
	$effect(() => {
		if (bolInput.trim()) {
			try {
				rows = parseComposition(bolInput);
				parseError = rows.length === 0 ? 'No valid bols found' : '';
			} catch (e) {
				parseError = 'Failed to parse composition';
				rows = [];
			}
		} else {
			rows = [];
			parseError = '';
		}
	});

	// Load composition for editing
	async function loadComposition(id: string) {
		isLoading = true;
		errorMessage = '';

		try {
			const comp = await getComposition(id);
			if (comp) {
				title = comp.meta.title || '';
				taal = comp.meta.taal || 'Teentaal';
				tempo = comp.meta.tempo || 60;
				description = comp.meta.description || '';
				author = comp.meta.author || '';
				tagsInput = comp.meta.tags?.join(', ') || '';
				bolInput = rowsToText(comp.rows);
				editId = id;
			} else {
				errorMessage = 'Composition not found';
			}
		} catch (e) {
			console.error('Failed to load composition:', e);
			errorMessage = 'Failed to load composition';
		} finally {
			isLoading = false;
		}
	}

	// Check for edit param on mount
	onMount(() => {
		const currentPage = get(page);
		const id = currentPage.url.searchParams.get('edit');
		if (id) {
			loadComposition(id);
		}
	});

	// Validation
	function validate(): string | null {
		if (!title.trim()) return 'Title is required';
		if (title.trim().length < 3) return 'Title must be at least 3 characters';
		if (!bolInput.trim()) return 'Composition bols are required';
		if (rows.length === 0) return 'Could not parse any valid bols';
		if (tempo < 20 || tempo > 300) return 'Tempo must be between 20 and 300 BPM';
		return null;
	}

	async function handleSubmit() {
		errorMessage = '';
		successMessage = '';

		const validationError = validate();
		if (validationError) {
			errorMessage = validationError;
			return;
		}

		isSubmitting = true;

		try {
			// Parse tags from comma-separated input
			const tags = tagsInput
				.split(',')
				.map((t) => t.trim().toLowerCase())
				.filter((t) => t.length > 0);

			const compositionData = {
				meta: {
					title: title.trim(),
					taal,
					tempo,
					description: description.trim() || undefined,
					author: author.trim() || undefined,
					tags: tags.length > 0 ? tags : undefined
				},
				rows
			};

			if (isEditMode && editId) {
				await updateComposition(editId, compositionData);
				successMessage = 'Composition updated successfully!';
			} else {
				await createComposition(compositionData);
				successMessage = 'Composition uploaded successfully!';

				// Reset form only for new compositions
				title = '';
				bolInput = '';
				description = '';
				author = '';
				tagsInput = '';
				tempo = 60;
				taal = 'Teentaal';
			}

			// Redirect to browse page after short delay
			setTimeout(() => {
				goto('/browse');
			}, 1500);
		} catch (e) {
			console.error('Save failed:', e);
			errorMessage = 'Failed to save. Please check your connection and try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{isEditMode ? 'Edit' : 'Upload'} Composition - Tabla</title>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
	<div class="container mx-auto px-4 py-8 max-w-2xl">
		<nav class="mb-8">
			<a href="/browse" class="text-amber-600 hover:text-amber-800">&larr; Back to Browse</a>
		</nav>

		<h1 class="text-4xl font-bold text-amber-900 mb-8">
			{isEditMode ? 'Edit Composition' : 'Upload Composition'}
		</h1>

		{#if isLoading}
			<div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200 text-center">
				<p class="text-amber-700">Loading composition...</p>
			</div>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
				<!-- Title (required) -->
				<div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
					<label for="title" class="block text-lg font-semibold text-amber-900 mb-2">
						Title <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="title"
						bind:value={title}
						placeholder="e.g., Teentaal Theka, Kayda 1"
						class="w-full p-3 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
						required
					/>
				</div>

				<!-- Taal and Tempo -->
				<div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
					<div class="grid sm:grid-cols-2 gap-4">
						<div>
							<label for="taal" class="block text-lg font-semibold text-amber-900 mb-2">
								Taal <span class="text-red-500">*</span>
							</label>
							<TaalSelector bind:value={taal} class="w-full" />
						</div>
						<div>
							<label for="tempo" class="block text-lg font-semibold text-amber-900 mb-2">
								Tempo (BPM) <span class="text-red-500">*</span>
							</label>
							<input
								type="number"
								id="tempo"
								bind:value={tempo}
								min="20"
								max="300"
								class="w-full p-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				<!-- Composition Bols (required) -->
				<div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
					<label for="bols" class="block text-lg font-semibold text-amber-900 mb-2">
						Composition <span class="text-red-500">*</span>
					</label>
					<textarea
						id="bols"
						bind:value={bolInput}
						rows="6"
						placeholder="Enter bols separated by spaces. Use | for visual grouping. New line for new row.&#10;&#10;Example:&#10;Dha Dhin Dhin Dha | Dha Dhin Dhin Dha&#10;Dha Tin Tin Ta | Ta Dhin Dhin Dha"
						class="w-full p-3 border-2 border-amber-200 rounded-lg font-mono text-amber-900 focus:border-amber-400 focus:outline-none resize-none"
						required
					></textarea>
					<p class="mt-2 text-sm text-amber-600">
						Supported: Dha, Dhin, Ta, Tin, Na, Tun, Ge, Ke, Ti, Te, Ra, Ka, Tete, Gadi, Trkt, - (rest)
					</p>
					{#if parseError}
						<p class="mt-2 text-sm text-red-600">{parseError}</p>
					{/if}
				</div>

				<!-- Preview -->
				{#if rows.length > 0}
					<div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
						<h2 class="text-lg font-semibold text-amber-900 mb-4">Preview</h2>
						<BolGrid {rows} currentRow={-1} currentBeat={-1} beatsPerRow={4} />
					</div>
				{/if}

				<!-- Author (optional) -->
				<div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
					<label for="author" class="block text-lg font-semibold text-amber-900 mb-2">
						Author / Attribution
					</label>
					<input
						type="text"
						id="author"
						bind:value={author}
						placeholder="Your name or source"
						class="w-full p-3 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
					/>
				</div>

				<!-- Description (optional) -->
				<div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
					<label for="description" class="block text-lg font-semibold text-amber-900 mb-2">
						Description
					</label>
					<textarea
						id="description"
						bind:value={description}
						rows="3"
						placeholder="Notes about this composition, how to practice it, etc."
						class="w-full p-3 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none resize-none"
					></textarea>
				</div>

				<!-- Tags (optional) -->
				<div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
					<label for="tags" class="block text-lg font-semibold text-amber-900 mb-2">
						Tags
					</label>
					<input
						type="text"
						id="tags"
						bind:value={tagsInput}
						placeholder="kayda, beginner, fast (comma-separated)"
						class="w-full p-3 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
					/>
					<p class="mt-2 text-sm text-amber-600">
						Separate tags with commas. Helps others find your composition.
					</p>
				</div>

				<!-- Error/Success Messages -->
				{#if errorMessage}
					<div class="p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-800">
						{errorMessage}
					</div>
				{/if}
				{#if successMessage}
					<div class="p-4 bg-green-100 border-2 border-green-300 rounded-xl text-green-800">
						{successMessage}
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full p-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-xl font-semibold text-lg transition-colors"
				>
					{#if isSubmitting}
						{isEditMode ? 'Saving...' : 'Uploading...'}
					{:else}
						{isEditMode ? 'Save Changes' : 'Upload Composition'}
					{/if}
				</button>
			</form>
		{/if}
	</div>
</main>
