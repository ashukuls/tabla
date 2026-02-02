'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as Tone from 'tone';
import AudioUnlockButton from '@/components/AudioUnlockButton';

// All available bol types and their variations
const BOL_TYPES = ['Dha', 'Dhin', 'Dhit', 'Dhun', 'Ga', 'Ge', 'Ke', 'Na', 'Ta', 'Ti', 'Tin', 'Tun'];
const VARIATIONS = ['01', '02', '03', '04', '05', '06', '07', '08'];

// Default sample selection (can be saved to localStorage)
const DEFAULT_SAMPLES: Record<string, string> = {
  Dha: '01',
  Dhin: '01',
  Dhit: '01',
  Dhun: '01',
  Ga: '01',
  Ge: '01',
  Ke: '01',
  Na: '01',
  Ta: '01',
  Ti: '01',
  Tin: '01',
  Tun: '01',
};

export default function LabPage() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [selectedBol, setSelectedBol] = useState('Dha');
  const [samples, setSamples] = useState<Record<string, string>>(DEFAULT_SAMPLES);
  const [loading, setLoading] = useState<string | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);

  // Load saved samples from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tablaSamples');
    if (saved) {
      try {
        setSamples(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save samples to localStorage when changed
  useEffect(() => {
    localStorage.setItem('tablaSamples', JSON.stringify(samples));
  }, [samples]);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  const playSample = async (bol: string, variation: string) => {
    if (!audioUnlocked) return;

    const samplePath = `/samples/${bol}${variation}.mp3`;
    setLoading(`${bol}${variation}`);

    try {
      // Dispose previous player
      playerRef.current?.dispose();

      // Create and play new player
      playerRef.current = new Tone.Player(samplePath).toDestination();
      await Tone.loaded();
      playerRef.current.start();
    } catch (err) {
      console.error('Failed to play sample:', err);
    } finally {
      setLoading(null);
    }
  };

  const selectVariation = (bol: string, variation: string) => {
    setSamples((prev) => ({ ...prev, [bol]: variation }));
    playSample(bol, variation);
  };

  const playSelected = (bol: string) => {
    playSample(bol, samples[bol] || '01');
  };

  const applyToPlayer = () => {
    // Save to localStorage - the tabla player will read from here
    localStorage.setItem('tablaSamples', JSON.stringify(samples));
    alert('Sample selection saved! The player will use these samples.');
  };

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {!audioUnlocked && <AudioUnlockButton onUnlock={() => setAudioUnlocked(true)} />}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">Sample Picker</h1>
          <div className="w-16" />
        </header>

        {/* Bol Type Selector */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-3">Select Bol Type</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {BOL_TYPES.map((bol) => (
              <button
                key={bol}
                onClick={() => setSelectedBol(bol)}
                className={`p-3 rounded-xl font-semibold transition-all active:scale-95 ${
                  selectedBol === bol
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {bol}
              </button>
            ))}
          </div>
        </div>

        {/* Variation Selector */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-1">
            {selectedBol} Variations
          </h2>
          <p className="text-amber-600 text-sm mb-4">
            Tap to audition, selected: <strong>{selectedBol}{samples[selectedBol]}</strong>
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {VARIATIONS.map((variation) => {
              const isSelected = samples[selectedBol] === variation;
              const isLoading = loading === `${selectedBol}${variation}`;
              return (
                <button
                  key={variation}
                  onClick={() => selectVariation(selectedBol, variation)}
                  disabled={isLoading}
                  className={`p-4 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500 text-white ring-4 ring-amber-300'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  } ${isLoading ? 'opacity-50' : ''}`}
                >
                  {isLoading ? '...' : variation}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Selection Summary */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-3">Current Selection</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {BOL_TYPES.map((bol) => (
              <button
                key={bol}
                onClick={() => playSelected(bol)}
                className="p-2 bg-amber-50 rounded-lg text-center hover:bg-amber-100 active:scale-95 transition-all"
              >
                <div className="font-semibold text-amber-900">{bol}</div>
                <div className="text-xs text-amber-600">{samples[bol]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyToPlayer}
          className="w-full p-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 active:scale-[0.98] transition-all shadow-lg"
        >
          Save Selection
        </button>

        <p className="text-center text-amber-500 text-sm mt-4">
          Selection is saved to browser. Refresh Player page to use new samples.
        </p>
      </div>
    </main>
  );
}
