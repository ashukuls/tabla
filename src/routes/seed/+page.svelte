<script lang="ts">
	import { SAMPLE_COMPOSITIONS } from '$lib/data/sampleCompositions';
	import { createComposition, getCompositions } from '$lib/firebase/db';
	import type { Composition } from '$lib/types';

	let status = $state('');
	let isSeeding = $state(false);
	let existingCompositions = $state<Composition[]>([]);
	let seededCount = $state(0);

	async function checkExisting() {
		try {
			existingCompositions = await getCompositions();
			status = `Found ${existingCompositions.length} existing compositions`;
		} catch (e) {
			status = 'Error checking existing compositions: ' + (e as Error).message;
		}
	}

	async function seedDatabase() {
		isSeeding = true;
		seededCount = 0;
		status = 'Seeding...';

		try {
			const existingTitles = new Set(existingCompositions.map(c => c.meta.title));

			for (const comp of SAMPLE_COMPOSITIONS) {
				if (existingTitles.has(comp.meta.title)) {
					status = `Skipping "${comp.meta.title}" (already exists)`;
					continue;
				}

				await createComposition(comp);
				seededCount++;
				status = `Added "${comp.meta.title}"`;
			}

			status = `Done! Added ${seededCount} new compositions.`;
			await checkExisting();
		} catch (e) {
			status = 'Error: ' + (e as Error).message;
		} finally {
			isSeeding = false;
		}
	}

	checkExisting();
</script>

<svelte:head>
	<title>Seed Database - Admin</title>
</svelte:head>

<main class="min-h-screen bg-gray-900 text-white font-sans p-8">
	<div class="max-w-2xl mx-auto">
		<nav class="mb-8">
			<a href="/" class="text-amber-400 hover:text-amber-300">&larr; Back to Home</a>
		</nav>

		<h1 class="text-3xl font-bold text-amber-400 mb-6">Seed Database</h1>

		<div class="bg-gray-800 rounded-xl p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">Sample Compositions</h2>
			<p class="text-gray-400 mb-4">
				This will add {SAMPLE_COMPOSITIONS.length} sample compositions to Firestore.
				Existing compositions with the same title will be skipped.
			</p>

			<ul class="space-y-2 mb-6 text-sm">
				{#each SAMPLE_COMPOSITIONS as comp}
					<li class="flex items-center gap-2">
						<span class="text-amber-400">{comp.meta.title}</span>
						<span class="text-gray-500">({comp.meta.taal})</span>
						{#if existingCompositions.some(e => e.meta.title === comp.meta.title)}
							<span class="text-green-400 text-xs">(exists)</span>
						{/if}
					</li>
				{/each}
			</ul>

			<button
				onclick={seedDatabase}
				disabled={isSeeding}
				class="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
			>
				{isSeeding ? 'Seeding...' : 'Seed Database'}
			</button>
		</div>

		{#if status}
			<div class="bg-gray-800 rounded-xl p-4">
				<p class="text-gray-300">{status}</p>
			</div>
		{/if}

		{#if existingCompositions.length > 0}
			<div class="bg-gray-800 rounded-xl p-6 mt-6">
				<h2 class="text-xl font-semibold mb-4">Existing Compositions ({existingCompositions.length})</h2>
				<ul class="space-y-2 text-sm">
					{#each existingCompositions as comp}
						<li class="flex items-center gap-2">
							<span class="text-white">{comp.meta.title}</span>
							<span class="text-gray-500">({comp.meta.taal} - {comp.meta.tempo} BPM)</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</main>
