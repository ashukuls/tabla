<script lang="ts">
	// Landing page for Tabla app
</script>

<svelte:head>
	<title>Tabla - Indian Classical Rhythm Trainer</title>
	<meta
		name="description"
		content="Learn and practice tabla rhythms with interactive tools for polyrhythm training and taal exploration."
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
	<div class="container mx-auto px-4 py-16">
		<header class="text-center mb-16">
			<h1 class="text-5xl font-bold text-amber-900 mb-4">Tabla</h1>
			<p class="text-xl text-amber-700">Indian Classical Rhythm Trainer</p>
		</header>

		<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
			<a
				href="/player"
				class="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-200 hover:border-amber-400"
			>
				<h2 class="text-2xl font-semibold text-amber-800 mb-3">Tabla Player</h2>
				<p class="text-amber-600">
					Browse and play tabla compositions. Learn thekas, kaydas, and more with synchronized audio
					and visual feedback.
				</p>
			</a>

			<a
				href="/polyrhythm"
				class="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-200 hover:border-amber-400"
			>
				<h2 class="text-2xl font-semibold text-amber-800 mb-3">Polyrhythm Trainer</h2>
				<p class="text-amber-600">
					Practice complex polyrhythms. Define N bols over D beats and train with audio-visual
					synchronization.
				</p>
			</a>

			<a
				href="/metronome"
				class="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-200 hover:border-amber-400"
			>
				<h2 class="text-2xl font-semibold text-amber-800 mb-3">Taal Metronome</h2>
				<p class="text-amber-600">
					Practice with taal-aware metronome. Supports multiple taals with proper sam, taali, and
					khaali indicators.
				</p>
			</a>

			<a
				href="/upload"
				class="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-200 hover:border-amber-400"
			>
				<h2 class="text-2xl font-semibold text-amber-800 mb-3">Upload Composition</h2>
				<p class="text-amber-600">
					Contribute your own tabla compositions. Share thekas, kaydas, and practice pieces with the
					community.
				</p>
			</a>
		</div>

		<footer class="text-center mt-16 text-amber-600">
			<p>Built for tabla enthusiasts and students</p>
		</footer>
	</div>
</main>
