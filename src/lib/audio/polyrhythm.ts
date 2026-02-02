/**
 * Polyrhythm Trainer audio using Tone.js
 *
 * Three layers: Beat (downbeat), Bol (accent), Subdivision (laghu tick)
 */
import * as Tone from 'tone';

export interface PolyrhythmVolumes {
	beat: number; // 0-100
	bol: number;
	subdivision: number;
}

export class PolyrhythmSynth {
	private beatSynth: Tone.Synth | null = null;
	private bolSynth: Tone.MembraneSynth | null = null;
	private subdivSynth: Tone.Synth | null = null;

	private beatGain: Tone.Gain | null = null;
	private bolGain: Tone.Gain | null = null;
	private subdivGain: Tone.Gain | null = null;

	private isInitialized = false;

	/**
	 * Initialize synths. Must be called after user gesture.
	 */
	async init(): Promise<void> {
		if (this.isInitialized) return;

		await Tone.start();

		// Beat sound - high pitch sweep (like original 900→700Hz)
		this.beatGain = new Tone.Gain(0.5).toDestination();
		this.beatSynth = new Tone.Synth({
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.001,
				decay: 0.15,
				sustain: 0,
				release: 0.05
			}
		}).connect(this.beatGain);

		// Bol sound - low pitch sweep (like original 150→80Hz)
		this.bolGain = new Tone.Gain(0).toDestination();
		this.bolSynth = new Tone.MembraneSynth({
			pitchDecay: 0.1,
			octaves: 2,
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.001,
				decay: 0.2,
				sustain: 0,
				release: 0.1
			}
		}).connect(this.bolGain);

		// Subdivision/Laghu sound - high short tick (1800Hz)
		this.subdivGain = new Tone.Gain(0.2).toDestination();
		this.subdivSynth = new Tone.Synth({
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.001,
				decay: 0.015,
				sustain: 0,
				release: 0.01
			}
		}).connect(this.subdivGain);

		this.isInitialized = true;
	}

	get ready(): boolean {
		return this.isInitialized;
	}

	/**
	 * Play beat sound (downbeat accent)
	 */
	playBeat(time?: number): void {
		if (!this.beatSynth) return;
		const t = time ?? Tone.now();
		// Frequency sweep from 900 to 700Hz
		this.beatSynth.frequency.setValueAtTime(900, t);
		this.beatSynth.frequency.exponentialRampToValueAtTime(700, t + 0.1);
		this.beatSynth.triggerAttackRelease('32n', t);
	}

	/**
	 * Play bol sound (polyrhythm accent)
	 */
	playBol(time?: number): void {
		if (!this.bolSynth) return;
		const t = time ?? Tone.now();
		this.bolSynth.triggerAttackRelease(150, '8n', t);
	}

	/**
	 * Play subdivision/laghu tick
	 */
	playSubdivision(time?: number): void {
		if (!this.subdivSynth) return;
		const t = time ?? Tone.now();
		this.subdivSynth.triggerAttackRelease(1800, '128n', t);
	}

	/**
	 * Set volumes (0-100 scale)
	 */
	setVolumes(volumes: Partial<PolyrhythmVolumes>): void {
		if (volumes.beat !== undefined && this.beatGain) {
			this.beatGain.gain.value = volumes.beat / 100;
		}
		if (volumes.bol !== undefined && this.bolGain) {
			this.bolGain.gain.value = volumes.bol / 100;
		}
		if (volumes.subdivision !== undefined && this.subdivGain) {
			this.subdivGain.gain.value = volumes.subdivision / 100;
		}
	}

	/**
	 * Get current volumes
	 */
	getVolumes(): PolyrhythmVolumes {
		return {
			beat: (this.beatGain?.gain.value ?? 0.5) * 100,
			bol: (this.bolGain?.gain.value ?? 0) * 100,
			subdivision: (this.subdivGain?.gain.value ?? 0.2) * 100
		};
	}

	dispose(): void {
		this.beatSynth?.dispose();
		this.bolSynth?.dispose();
		this.subdivSynth?.dispose();
		this.beatGain?.dispose();
		this.bolGain?.dispose();
		this.subdivGain?.dispose();
		this.beatSynth = null;
		this.bolSynth = null;
		this.subdivSynth = null;
		this.beatGain = null;
		this.bolGain = null;
		this.subdivGain = null;
		this.isInitialized = false;
	}
}

// Singleton instance
let instance: PolyrhythmSynth | null = null;

export function getPolyrhythmSynth(): PolyrhythmSynth {
	if (!instance) {
		instance = new PolyrhythmSynth();
	}
	return instance;
}
