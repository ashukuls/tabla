#!/usr/bin/env python3
"""
Analyze tabla WAV samples to extract synthesis parameters.
Outputs frequency, harmonics, decay time for Tone.js tuning.
"""

import numpy as np
from scipy.io import wavfile
from scipy.fft import fft, fftfreq
from scipy.signal import find_peaks
import os
import json

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), '..', 'samples')

def analyze_wav(filepath):
    """Analyze a WAV file and return synthesis parameters."""
    sample_rate, data = wavfile.read(filepath)

    # Convert to mono if stereo
    if len(data.shape) > 1:
        data = data.mean(axis=1)

    # Normalize
    data = data / np.max(np.abs(data))

    # Get duration
    duration = len(data) / sample_rate

    # FFT analysis (first 50ms for attack characteristics)
    attack_samples = int(0.05 * sample_rate)
    attack_data = data[:attack_samples]

    # Zero-pad for better frequency resolution
    n = len(attack_data)
    fft_data = fft(attack_data, n=n*4)
    freqs = fftfreq(n*4, 1/sample_rate)

    # Get magnitude spectrum (positive frequencies only)
    pos_mask = freqs > 0
    freqs = freqs[pos_mask]
    magnitude = np.abs(fft_data[pos_mask])

    # Find peaks (fundamental and harmonics)
    peaks, properties = find_peaks(magnitude, height=np.max(magnitude)*0.1, distance=20)

    # Sort by magnitude
    peak_mags = magnitude[peaks]
    sorted_indices = np.argsort(peak_mags)[::-1]
    top_peaks = peaks[sorted_indices[:5]]  # Top 5 peaks

    fundamental_freq = freqs[top_peaks[0]] if len(top_peaks) > 0 else 0

    # Calculate harmonics ratios
    harmonics = []
    for p in top_peaks[1:]:
        ratio = freqs[p] / fundamental_freq if fundamental_freq > 0 else 0
        harmonics.append(round(ratio, 2))

    # Estimate decay time (time to reach 10% of peak)
    peak_idx = np.argmax(np.abs(data))
    peak_val = np.abs(data[peak_idx])
    decay_threshold = peak_val * 0.1

    decay_samples = 0
    for i in range(peak_idx, len(data)):
        if np.abs(data[i]) < decay_threshold:
            decay_samples = i - peak_idx
            break
    else:
        decay_samples = len(data) - peak_idx

    decay_time = decay_samples / sample_rate

    # Estimate attack time (time to reach peak)
    attack_time = peak_idx / sample_rate

    return {
        'fundamental_freq': round(fundamental_freq, 1),
        'harmonics': harmonics,
        'attack_time': round(attack_time, 4),
        'decay_time': round(decay_time, 3),
        'duration': round(duration, 3),
        'sample_rate': sample_rate
    }

def main():
    results = {}

    for filename in sorted(os.listdir(SAMPLES_DIR)):
        if filename.endswith('.wav'):
            filepath = os.path.join(SAMPLES_DIR, filename)
            bol_name = filename.replace('.wav', '').replace('01', '')
            print(f"\nAnalyzing {filename}...")

            params = analyze_wav(filepath)
            results[bol_name] = params

            print(f"  Fundamental: {params['fundamental_freq']} Hz")
            print(f"  Harmonics: {params['harmonics']}")
            print(f"  Attack: {params['attack_time']*1000:.1f}ms")
            print(f"  Decay: {params['decay_time']*1000:.0f}ms")

    # Output as JSON for easy use
    print("\n" + "="*50)
    print("JSON output for Tone.js parameters:")
    print("="*50)
    print(json.dumps(results, indent=2))

    return results

if __name__ == '__main__':
    main()
