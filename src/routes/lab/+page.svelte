<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { unlockAudio } from '$lib/audio';
	import * as Tone from 'tone';

	// Audio state
	let audioReady = $state(false);
	let dayanSynth: Tone.MetalSynth | null = $state(null);
	let bayanSynth: Tone.MembraneSynth | null = $state(null);

	// Dayan (MetalSynth) parameters
	let dayanFrequency = $state(800);
	let dayanDecay = $state(0.1);
	let dayanHarmonicity = $state(5.1);
	let dayanModulationIndex = $state(16);
	let dayanResonance = $state(4000);
	let dayanOctaves = $state(1.5);
	let dayanAttack = $state(0.001);
	let dayanRelease = $state(0.2);

	// Bayan (MembraneSynth) parameters
	let bayanFrequency = $state(120);
	let bayanDecay = $state(0.4);
	let bayanPitchDecay = $state(0.08);
	let bayanOctaves = $state(4);
	let bayanAttack = $state(0.001);
	let bayanSustain = $state(0.01);
	let bayanRelease = $state(0.4);
	let bayanOscType = $state<'sine' | 'triangle' | 'square' | 'sawtooth'>('sine');

	// Presets
	const DAYAN_PRESETS = {
		'Ta (open)': { frequency: 850, decay: 0.12, harmonicity: 5.1, modulationIndex: 16, resonance: 4000, octaves: 1.5 },
		'Tin (closed)': { frequency: 650, decay: 0.15, harmonicity: 5.1, modulationIndex: 16, resonance: 4000, octaves: 1.5 },
		'Te (sharp)': { frequency: 1000, decay: 0.05, harmonicity: 5.1, modulationIndex: 16, resonance: 4000, octaves: 1.5 },
		'Bell-like': { frequency: 1200, decay: 0.3, harmonicity: 12, modulationIndex: 32, resonance: 6000, octaves: 2 },
		'Muted': { frequency: 400, decay: 0.05, harmonicity: 2, modulationIndex: 8, resonance: 2000, octaves: 0.5 },
	};

	const BAYAN_PRESETS = {
		'Ghe (open)': { frequency: 120, decay: 0.25, pitchDecay: 0.08, octaves: 4, oscType: 'sine' as const },
		'Ke (muted)': { frequency: 80, decay: 0.08, pitchDecay: 0.05, octaves: 2, oscType: 'sine' as const },
		'Deep bass': { frequency: 60, decay: 0.5, pitchDecay: 0.15, octaves: 6, oscType: 'sine' as const },
		'Punchy': { frequency: 100, decay: 0.15, pitchDecay: 0.03, octaves: 3, oscType: 'triangle' as const },
		'Tight': { frequency: 150, decay: 0.1, pitchDecay: 0.02, octaves: 2, oscType: 'sine' as const },
	};

	async function initAudio() {
		await unlockAudio();
		await Tone.start();

		dayanSynth = new Tone.MetalSynth({
			envelope: {
				attack: dayanAttack,
				decay: dayanDecay,
				release: dayanRelease,
			},
			harmonicity: dayanHarmonicity,
			modulationIndex: dayanModulationIndex,
			resonance: dayanResonance,
			octaves: dayanOctaves,
		}).toDestination();
		dayanSynth.volume.value = -6;

		bayanSynth = new Tone.MembraneSynth({
			pitchDecay: bayanPitchDecay,
			octaves: bayanOctaves,
			oscillator: { type: bayanOscType },
			envelope: {
				attack: bayanAttack,
				decay: bayanDecay,
				sustain: bayanSustain,
				release: bayanRelease,
			},
		}).toDestination();
		bayanSynth.volume.value = -3;

		audioReady = true;
	}

	function playDayan() {
		// Dispose old synth and create new one with current parameters
		dayanSynth?.dispose();
		dayanSynth = new Tone.MetalSynth({
			envelope: {
				attack: dayanAttack,
				decay: dayanDecay,
				release: dayanRelease,
			},
			harmonicity: dayanHarmonicity,
			modulationIndex: dayanModulationIndex,
			resonance: dayanResonance,
			octaves: dayanOctaves,
		}).toDestination();
		dayanSynth.volume.value = -6;
		dayanSynth.frequency.value = dayanFrequency;

		dayanSynth.triggerAttackRelease('16n', Tone.now());
	}

	function playBayan() {
		// Dispose old synth and create new one with current parameters
		bayanSynth?.dispose();
		bayanSynth = new Tone.MembraneSynth({
			pitchDecay: bayanPitchDecay,
			octaves: bayanOctaves,
			oscillator: { type: bayanOscType },
			envelope: {
				attack: bayanAttack,
				decay: bayanDecay,
				sustain: bayanSustain,
				release: bayanRelease,
			},
		}).toDestination();
		bayanSynth.volume.value = -3;

		bayanSynth.triggerAttackRelease(bayanFrequency, '8n');
	}

	function playCombined() {
		playDayan();
		playBayan();
	}

	function loadDayanPreset(name: string) {
		const preset = DAYAN_PRESETS[name as keyof typeof DAYAN_PRESETS];
		if (!preset) return;
		dayanFrequency = preset.frequency;
		dayanDecay = preset.decay;
		dayanHarmonicity = preset.harmonicity;
		dayanModulationIndex = preset.modulationIndex;
		dayanResonance = preset.resonance;
		dayanOctaves = preset.octaves;
	}

	function loadBayanPreset(name: string) {
		const preset = BAYAN_PRESETS[name as keyof typeof BAYAN_PRESETS];
		if (!preset) return;
		bayanFrequency = preset.frequency;
		bayanDecay = preset.decay;
		bayanPitchDecay = preset.pitchDecay;
		bayanOctaves = preset.octaves;
		bayanOscType = preset.oscType;
	}

	function exportSettings() {
		const settings = {
			dayan: {
				frequency: dayanFrequency,
				decay: dayanDecay,
				harmonicity: dayanHarmonicity,
				modulationIndex: dayanModulationIndex,
				resonance: dayanResonance,
				octaves: dayanOctaves,
				attack: dayanAttack,
				release: dayanRelease,
			},
			bayan: {
				frequency: bayanFrequency,
				decay: bayanDecay,
				pitchDecay: bayanPitchDecay,
				octaves: bayanOctaves,
				attack: bayanAttack,
				sustain: bayanSustain,
				release: bayanRelease,
				oscType: bayanOscType,
			}
		};
		navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
		alert('Settings copied to clipboard!');
	}

	onDestroy(() => {
		dayanSynth?.dispose();
		bayanSynth?.dispose();
	});
</script>

<svelte:head>
	<title>Sound Lab - Tabla Synthesis Tuning</title>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 font-sans text-white">
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<nav class="mb-8">
			<a href="/" class="text-amber-400 hover:text-amber-300">&larr; Back to Home</a>
		</nav>

		<h1 class="text-4xl font-bold text-amber-400 mb-2">Sound Lab</h1>
		<p class="text-gray-400 mb-8">Experiment with Tone.js synthesis parameters for tabla sounds</p>

		<!-- Audio unlock -->
		{#if !audioReady}
			<button
				onclick={initAudio}
				class="w-full mb-8 p-6 bg-amber-500 hover:bg-amber-600 rounded-xl text-white text-xl font-semibold transition-colors"
			>
				Tap to Enable Audio
			</button>
		{:else}
			<div class="grid lg:grid-cols-2 gap-8">
				<!-- DAYAN (Treble) -->
				<div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
					<div class="flex justify-between items-center mb-6">
						<h2 class="text-2xl font-semibold text-amber-400">Dayan (Treble)</h2>
						<button
							onclick={playDayan}
							class="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold transition-colors"
						>
							Play
						</button>
					</div>

					<!-- Presets -->
					<div class="mb-6">
						<label class="block text-sm text-gray-400 mb-2">Presets</label>
						<div class="flex flex-wrap gap-2">
							{#each Object.keys(DAYAN_PRESETS) as preset}
								<button
									onclick={() => loadDayanPreset(preset)}
									class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
								>
									{preset}
								</button>
							{/each}
						</div>
					</div>

					<!-- Frequency -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Frequency</span>
							<span class="text-amber-400">{dayanFrequency} Hz</span>
						</label>
						<input
							type="range"
							bind:value={dayanFrequency}
							min="200"
							max="2000"
							step="10"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Decay -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Decay</span>
							<span class="text-amber-400">{dayanDecay.toFixed(3)}s</span>
						</label>
						<input
							type="range"
							bind:value={dayanDecay}
							min="0.01"
							max="1"
							step="0.01"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Harmonicity -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Harmonicity</span>
							<span class="text-amber-400">{dayanHarmonicity.toFixed(1)}</span>
						</label>
						<input
							type="range"
							bind:value={dayanHarmonicity}
							min="0.1"
							max="20"
							step="0.1"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Modulation Index -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Modulation Index</span>
							<span class="text-amber-400">{dayanModulationIndex}</span>
						</label>
						<input
							type="range"
							bind:value={dayanModulationIndex}
							min="1"
							max="100"
							step="1"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Resonance -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Resonance</span>
							<span class="text-amber-400">{dayanResonance} Hz</span>
						</label>
						<input
							type="range"
							bind:value={dayanResonance}
							min="500"
							max="10000"
							step="100"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Octaves -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Octaves</span>
							<span class="text-amber-400">{dayanOctaves.toFixed(1)}</span>
						</label>
						<input
							type="range"
							bind:value={dayanOctaves}
							min="0.1"
							max="4"
							step="0.1"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Attack -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Attack</span>
							<span class="text-amber-400">{dayanAttack.toFixed(3)}s</span>
						</label>
						<input
							type="range"
							bind:value={dayanAttack}
							min="0.001"
							max="0.1"
							step="0.001"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Release -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Release</span>
							<span class="text-amber-400">{dayanRelease.toFixed(2)}s</span>
						</label>
						<input
							type="range"
							bind:value={dayanRelease}
							min="0.01"
							max="1"
							step="0.01"
							class="w-full accent-amber-500"
						/>
					</div>
				</div>

				<!-- BAYAN (Bass) -->
				<div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
					<div class="flex justify-between items-center mb-6">
						<h2 class="text-2xl font-semibold text-amber-400">Bayan (Bass)</h2>
						<button
							onclick={playBayan}
							class="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold transition-colors"
						>
							Play
						</button>
					</div>

					<!-- Presets -->
					<div class="mb-6">
						<label class="block text-sm text-gray-400 mb-2">Presets</label>
						<div class="flex flex-wrap gap-2">
							{#each Object.keys(BAYAN_PRESETS) as preset}
								<button
									onclick={() => loadBayanPreset(preset)}
									class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
								>
									{preset}
								</button>
							{/each}
						</div>
					</div>

					<!-- Frequency -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Frequency</span>
							<span class="text-amber-400">{bayanFrequency} Hz</span>
						</label>
						<input
							type="range"
							bind:value={bayanFrequency}
							min="30"
							max="300"
							step="1"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Decay -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Decay</span>
							<span class="text-amber-400">{bayanDecay.toFixed(2)}s</span>
						</label>
						<input
							type="range"
							bind:value={bayanDecay}
							min="0.05"
							max="1.5"
							step="0.01"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Pitch Decay -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Pitch Decay (glissando)</span>
							<span class="text-amber-400">{bayanPitchDecay.toFixed(3)}s</span>
						</label>
						<input
							type="range"
							bind:value={bayanPitchDecay}
							min="0.01"
							max="0.5"
							step="0.005"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Octaves -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Octaves (pitch drop range)</span>
							<span class="text-amber-400">{bayanOctaves}</span>
						</label>
						<input
							type="range"
							bind:value={bayanOctaves}
							min="0.5"
							max="8"
							step="0.5"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Oscillator Type -->
					<div class="mb-4">
						<label class="block text-sm text-gray-400 mb-2">Oscillator Type</label>
						<div class="flex gap-2">
							{#each ['sine', 'triangle', 'square', 'sawtooth'] as oscType}
								<button
									onclick={() => bayanOscType = oscType as typeof bayanOscType}
									class="px-3 py-1 rounded text-sm transition-colors {bayanOscType === oscType ? 'bg-amber-500' : 'bg-gray-700 hover:bg-gray-600'}"
								>
									{oscType}
								</button>
							{/each}
						</div>
					</div>

					<!-- Attack -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Attack</span>
							<span class="text-amber-400">{bayanAttack.toFixed(3)}s</span>
						</label>
						<input
							type="range"
							bind:value={bayanAttack}
							min="0.001"
							max="0.1"
							step="0.001"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Sustain -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Sustain</span>
							<span class="text-amber-400">{bayanSustain.toFixed(2)}</span>
						</label>
						<input
							type="range"
							bind:value={bayanSustain}
							min="0"
							max="1"
							step="0.01"
							class="w-full accent-amber-500"
						/>
					</div>

					<!-- Release -->
					<div class="mb-4">
						<label class="flex justify-between text-sm text-gray-400 mb-1">
							<span>Release</span>
							<span class="text-amber-400">{bayanRelease.toFixed(2)}s</span>
						</label>
						<input
							type="range"
							bind:value={bayanRelease}
							min="0.05"
							max="2"
							step="0.05"
							class="w-full accent-amber-500"
						/>
					</div>
				</div>
			</div>

			<!-- Combined Play & Export -->
			<div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
				<button
					onclick={playCombined}
					class="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-xl font-bold transition-colors"
				>
					Play Combined (Dha)
				</button>
				<button
					onclick={exportSettings}
					class="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
				>
					Export Settings to Clipboard
				</button>
			</div>

			<!-- Tips -->
			<div class="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700">
				<h3 class="text-lg font-semibold text-amber-400 mb-4">Synthesis Tips</h3>
				<div class="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
					<div>
						<h4 class="font-semibold text-white mb-2">Dayan (MetalSynth)</h4>
						<ul class="list-disc list-inside space-y-1">
							<li><strong>Harmonicity</strong> - ratio of modulator to carrier frequency</li>
							<li><strong>Modulation Index</strong> - amount of FM modulation (brightness)</li>
							<li><strong>Resonance</strong> - bandpass filter center frequency</li>
							<li><strong>Octaves</strong> - frequency multiplier spread</li>
						</ul>
					</div>
					<div>
						<h4 class="font-semibold text-white mb-2">Bayan (MembraneSynth)</h4>
						<ul class="list-disc list-inside space-y-1">
							<li><strong>Pitch Decay</strong> - how fast the pitch drops (tabla characteristic)</li>
							<li><strong>Octaves</strong> - how far the pitch drops</li>
							<li><strong>Oscillator</strong> - sine is pure, triangle adds harmonics</li>
							<li><strong>Decay</strong> - sustain length of the bass tone</li>
						</ul>
					</div>
				</div>
			</div>
		{/if}
	</div>
</main>
