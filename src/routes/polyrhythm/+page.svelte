<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Redirect to trainer route
	onMount(() => {
		goto('/trainer', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Redirecting...</title>
</svelte:head>

<main class="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
	<p>Redirecting to Polyrhythm Trainer...</p>
</main>
