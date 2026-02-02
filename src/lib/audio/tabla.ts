/**
 * Tabla synthesis using Tone.js
 *
 * Two synths: MembraneSynth (bayan/bass) + MetalSynth (dayan/treble)
 */
import * as Tone from 'tone';

// Bol synthesis parameters
interface BolParams {
	frequency: number;
	decay: number;
	pitchDecay?: number;
	octaves?: number;
}

// Dayan (treble) parameters for each bol
const DAYAN_PARAMS: Record<string, BolParams> = {
	ta:  { frequency: 850, decay: 0.12 },
	na:  { frequency: 850, decay: 0.12 },
	tin: { frequency: 650, decay: 0.15 },
	tun: { frequency: 650, decay: 0.15 },
	te:  { frequency: 1000, decay: 0.05 },
	ti:  { frequency: 1000, decay: 0.05 },
};

// Bayan (bass) parameters for each bol
const BAYAN_PARAMS: Record<string, BolParams> = {
	ghe: { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
	ga:  { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
	ge:  { frequency: 120, decay: 0.5, pitchDecay: 0.1, octaves: 3 },
	ke:  { frequency: 80, decay: 0.08, pitchDecay: 0.05, octaves: 2 },
	kat: { frequency: 80, decay: 0.08, pitchDecay: 0.05, octaves: 2 },
};

// Combined bols that trigger both drums
const COMBINED_BOLS: Record<string, { bass: string; treble: string }> = {
	dha:  { bass: 'ghe', treble: 'ta' },
	dhin: { bass: 'ghe', treble: 'tin' },
	dhit: { bass: 'ghe', treble: 'ti' },
	tete: { bass: 'ke', treble: 'te' },
};

export class TablaPlayer {
	private dayanSynth: Tone.MetalSynth | null = null;
	private bayanSynth: Tone.MembraneSynth | null = null;
	private isInitialized = false;

	/**
	 * Initialize synths. Must be called after user gesture (click/tap).
	 */
	async init(): Promise<void> {
		if (this.isInitialized) return;

		// Start audio context (required for iOS Safari)
		await Tone.start();

		// Dayan (treble) - metallic overtones and bell-like tones
		this.dayanSynth = new Tone.MetalSynth({
			envelope: {
				attack: 0.001,
				decay: 0.1,
				release: 0.2,
			},
			harmonicity: 5.1,
			modulationIndex: 16,
			resonance: 4000,
			octaves: 1.5,
		}).toDestination();
		this.dayanSynth.frequency.value = 800;

		// Bayan (bass) - membrane with pitch glissando (meend effect)
		this.bayanSynth = new Tone.MembraneSynth({
			pitchDecay: 0.1,           // Slower slide for the "Meend" effect
			octaves: 3,                // Reduced range for a more natural thud
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.02,          // Softer attack (fingertip vs hard slap)
				decay: 0.5,            // Long resonance
				sustain: 0,            // Drums naturally decay, they don't sustain
				release: 1,
			},
		}).toDestination();

		this.isInitialized = true;
	}

	/**
	 * Check if player is ready
	 */
	get ready(): boolean {
		return this.isInitialized;
	}

	/**
	 * Play a single bol
	 * @param bol - The bol name (e.g., 'dha', 'ta', 'ghe')
	 * @param time - Optional scheduled time (Tone.js time)
	 */
	playBol(bol: string, time?: number): void {
		if (!this.isInitialized || !this.dayanSynth || !this.bayanSynth) {
			console.warn('TablaPlayer not initialized. Call init() first.');
			return;
		}

		const normalizedBol = bol.toLowerCase().trim();
		const t = time ?? Tone.now();

		// Check for combined bol
		const combo = COMBINED_BOLS[normalizedBol];
		if (combo) {
			this.playBayan(combo.bass, t);
			this.playDayan(combo.treble, t);
			return;
		}

		// Check for dayan bol
		if (DAYAN_PARAMS[normalizedBol]) {
			this.playDayan(normalizedBol, t);
			return;
		}

		// Check for bayan bol
		if (BAYAN_PARAMS[normalizedBol]) {
			this.playBayan(normalizedBol, t);
			return;
		}

		console.warn(`Unknown bol: ${bol}`);
	}

	/**
	 * Play a dayan (treble) stroke
	 */
	private playDayan(bol: string, time: number): void {
		if (!this.dayanSynth) return;

		const params = DAYAN_PARAMS[bol];
		if (!params) return;

		this.dayanSynth.frequency.setValueAtTime(params.frequency, time);
		this.dayanSynth.envelope.decay = params.decay;
		this.dayanSynth.triggerAttackRelease('16n', time);
	}

	/**
	 * Play a bayan (bass) stroke
	 */
	private playBayan(bol: string, time: number): void {
		if (!this.bayanSynth) return;

		const params = BAYAN_PARAMS[bol];
		if (!params) return;

		if (params.pitchDecay !== undefined) {
			this.bayanSynth.pitchDecay = params.pitchDecay;
		}
		if (params.octaves !== undefined) {
			this.bayanSynth.octaves = params.octaves;
		}
		this.bayanSynth.envelope.decay = params.decay;
		this.bayanSynth.triggerAttackRelease(params.frequency, '8n', time);
	}

	/**
	 * Schedule a sequence of bols at a given tempo
	 * @param bols - Array of bol names
	 * @param bpm - Tempo in beats per minute
	 * @param startTime - Optional start time
	 * @returns Cancel function
	 */
	scheduleSequence(bols: string[], bpm: number, startTime?: number): () => void {
		const interval = 60 / bpm;
		const start = startTime ?? Tone.now();

		const events = bols.map((bol, i) => {
			const time = start + (i * interval);
			return Tone.getTransport().schedule(() => {
				this.playBol(bol, time);
			}, time);
		});

		return () => {
			events.forEach(id => Tone.getTransport().clear(id));
		};
	}

	/**
	 * Get list of all supported bols
	 */
	static getSupportedBols(): string[] {
		return [
			...Object.keys(DAYAN_PARAMS),
			...Object.keys(BAYAN_PARAMS),
			...Object.keys(COMBINED_BOLS),
		];
	}

	/**
	 * Dispose of synths
	 */
	dispose(): void {
		this.dayanSynth?.dispose();
		this.bayanSynth?.dispose();
		this.dayanSynth = null;
		this.bayanSynth = null;
		this.isInitialized = false;
	}
}

// Singleton instance for convenience
let instance: TablaPlayer | null = null;

export function getTablaPlayer(): TablaPlayer {
	if (!instance) {
		instance = new TablaPlayer();
	}
	return instance;
}
