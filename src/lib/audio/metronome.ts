/**
 * Metronome sounds using Tone.js
 *
 * Provides beat clicks, subdivision ticks, and downbeat accents.
 */
import * as Tone from 'tone';

type ClickType = 'beat' | 'subdivision' | 'downbeat';

interface MetronomeOptions {
	beatVolume?: number;      // -60 to 0 dB
	subdivVolume?: number;
	downbeatVolume?: number;
}

export class Metronome {
	private beatSynth: Tone.Synth | null = null;
	private subdivSynth: Tone.Synth | null = null;
	private downbeatSynth: Tone.Synth | null = null;
	private isInitialized = false;

	private beatGain: Tone.Gain | null = null;
	private subdivGain: Tone.Gain | null = null;
	private downbeatGain: Tone.Gain | null = null;

	/**
	 * Initialize synths. Must be called after user gesture.
	 */
	async init(options: MetronomeOptions = {}): Promise<void> {
		if (this.isInitialized) return;

		await Tone.start();

		// Beat click - mid-pitch "tick"
		this.beatGain = new Tone.Gain(Tone.dbToGain(options.beatVolume ?? -6)).toDestination();
		this.beatSynth = new Tone.Synth({
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.001,
				decay: 0.1,
				sustain: 0,
				release: 0.05,
			},
		}).connect(this.beatGain);

		// Subdivision click - high-pitch short tick
		this.subdivGain = new Tone.Gain(Tone.dbToGain(options.subdivVolume ?? -12)).toDestination();
		this.subdivSynth = new Tone.Synth({
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.001,
				decay: 0.02,
				sustain: 0,
				release: 0.01,
			},
		}).connect(this.subdivGain);

		// Downbeat click - accented beat
		this.downbeatGain = new Tone.Gain(Tone.dbToGain(options.downbeatVolume ?? -3)).toDestination();
		this.downbeatSynth = new Tone.Synth({
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.001,
				decay: 0.15,
				sustain: 0,
				release: 0.1,
			},
		}).connect(this.downbeatGain);

		this.isInitialized = true;
	}

	/**
	 * Check if metronome is ready
	 */
	get ready(): boolean {
		return this.isInitialized;
	}

	/**
	 * Play a click
	 * @param type - Type of click
	 * @param time - Optional scheduled time
	 */
	click(type: ClickType = 'beat', time?: number): void {
		if (!this.isInitialized) {
			console.warn('Metronome not initialized. Call init() first.');
			return;
		}

		const t = time ?? Tone.now();

		switch (type) {
			case 'beat':
				this.beatSynth?.triggerAttackRelease(900, '32n', t);
				break;
			case 'subdivision':
				this.subdivSynth?.triggerAttackRelease(1800, '64n', t);
				break;
			case 'downbeat':
				this.downbeatSynth?.triggerAttackRelease(700, '16n', t);
				break;
		}
	}

	/**
	 * Set volume for a click type
	 * @param type - Click type
	 * @param db - Volume in dB (-60 to 0)
	 */
	setVolume(type: ClickType, db: number): void {
		const gain = Tone.dbToGain(Math.max(-60, Math.min(0, db)));
		switch (type) {
			case 'beat':
				this.beatGain?.gain.setValueAtTime(gain, Tone.now());
				break;
			case 'subdivision':
				this.subdivGain?.gain.setValueAtTime(gain, Tone.now());
				break;
			case 'downbeat':
				this.downbeatGain?.gain.setValueAtTime(gain, Tone.now());
				break;
		}
	}

	/**
	 * Dispose of synths
	 */
	dispose(): void {
		this.beatSynth?.dispose();
		this.subdivSynth?.dispose();
		this.downbeatSynth?.dispose();
		this.beatGain?.dispose();
		this.subdivGain?.dispose();
		this.downbeatGain?.dispose();
		this.beatSynth = null;
		this.subdivSynth = null;
		this.downbeatSynth = null;
		this.beatGain = null;
		this.subdivGain = null;
		this.downbeatGain = null;
		this.isInitialized = false;
	}
}

// Singleton instance
let instance: Metronome | null = null;

export function getMetronome(): Metronome {
	if (!instance) {
		instance = new Metronome();
	}
	return instance;
}
