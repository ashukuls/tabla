/**
 * Mobile audio unlock utility for iOS Safari
 *
 * iOS requires a user gesture to start audio playback.
 * This module provides a simple way to unlock audio on first interaction.
 */
import * as Tone from 'tone';

let audioUnlocked = false;

/**
 * Check if audio is unlocked
 */
export function isAudioUnlocked(): boolean {
	return audioUnlocked;
}

/**
 * Unlock audio context. Call this from a user gesture handler (click/tap).
 * Returns true if audio was unlocked, false if already unlocked.
 */
export async function unlockAudio(): Promise<boolean> {
	if (audioUnlocked) {
		return false;
	}

	try {
		// Start Tone.js context
		await Tone.start();

		// Play a silent buffer to fully unlock on iOS
		const ctx = Tone.getContext().rawContext;
		if (ctx.state === 'suspended') {
			await ctx.resume();
		}

		// Create and play a silent buffer (iOS Safari workaround)
		const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(ctx.destination);
		source.start(0);

		audioUnlocked = true;
		return true;
	} catch (e) {
		console.error('Failed to unlock audio:', e);
		return false;
	}
}

/**
 * Create a handler that unlocks audio on first call, then runs the callback.
 * Useful for wrapping event handlers.
 *
 * @example
 * button.onclick = withAudioUnlock(async () => {
 *   await tablaPlayer.init();
 *   tablaPlayer.playBol('dha');
 * });
 */
export function withAudioUnlock<T extends (...args: unknown[]) => unknown>(
	callback: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
	return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		await unlockAudio();
		return callback(...args) as ReturnType<T>;
	};
}
