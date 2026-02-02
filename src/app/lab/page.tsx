'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as Tone from 'tone';
import AudioUnlockButton from '@/components/AudioUnlockButton';

const BOLS = ['Dha', 'Dhin', 'Ta', 'Tin', 'Na', 'Tun', 'Ge', 'Ke', 'Ti', 'Te', 'Ra', 'Ka'];

export default function LabPage() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Dayan (treble) params
  const [dayanFreq, setDayanFreq] = useState(800);
  const [dayanDecay, setDayanDecay] = useState(0.1);
  const [dayanHarmonicity, setDayanHarmonicity] = useState(5.1);
  const [dayanModIndex, setDayanModIndex] = useState(16);

  // Bayan (bass) params
  const [bayanFreq, setBayanFreq] = useState(120);
  const [bayanDecay, setBayanDecay] = useState(0.4);
  const [bayanPitchDecay, setBayanPitchDecay] = useState(0.1);
  const [bayanOctaves, setBayanOctaves] = useState(3);

  const dayanRef = useRef<Tone.MetalSynth | null>(null);
  const bayanRef = useRef<Tone.MembraneSynth | null>(null);

  // Initialize synths
  useEffect(() => {
    if (!audioUnlocked) return;

    dayanRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: dayanDecay, release: 0.2 },
      harmonicity: dayanHarmonicity,
      modulationIndex: dayanModIndex,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();

    bayanRef.current = new Tone.MembraneSynth({
      pitchDecay: bayanPitchDecay,
      octaves: bayanOctaves,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: bayanDecay, sustain: 0, release: 1 },
    }).toDestination();

    return () => {
      dayanRef.current?.dispose();
      bayanRef.current?.dispose();
    };
  }, [audioUnlocked]);

  // Update dayan params
  useEffect(() => {
    if (dayanRef.current) {
      dayanRef.current.envelope.decay = dayanDecay;
      dayanRef.current.harmonicity = dayanHarmonicity;
      dayanRef.current.modulationIndex = dayanModIndex;
    }
  }, [dayanDecay, dayanHarmonicity, dayanModIndex]);

  // Update bayan params
  useEffect(() => {
    if (bayanRef.current) {
      bayanRef.current.pitchDecay = bayanPitchDecay;
      bayanRef.current.octaves = bayanOctaves;
      bayanRef.current.envelope.decay = bayanDecay;
    }
  }, [bayanDecay, bayanPitchDecay, bayanOctaves]);

  const playDayan = () => {
    if (dayanRef.current) {
      dayanRef.current.frequency.value = dayanFreq;
      dayanRef.current.triggerAttackRelease('32n', Tone.now());
    }
  };

  const playBayan = () => {
    if (bayanRef.current) {
      bayanRef.current.triggerAttackRelease(bayanFreq, '8n');
    }
  };

  const playBoth = () => {
    playDayan();
    playBayan();
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
          <h1 className="text-2xl font-bold text-amber-900">Sound Lab</h1>
          <div className="w-16" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dayan (Treble) */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">
              Dayan (Treble)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Frequency</span>
                  <span>{dayanFreq} Hz</span>
                </label>
                <input
                  type="range"
                  min={400}
                  max={1200}
                  value={dayanFreq}
                  onChange={(e) => setDayanFreq(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Decay</span>
                  <span>{dayanDecay.toFixed(2)}s</span>
                </label>
                <input
                  type="range"
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={dayanDecay}
                  onChange={(e) => setDayanDecay(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Harmonicity</span>
                  <span>{dayanHarmonicity.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.1}
                  value={dayanHarmonicity}
                  onChange={(e) => setDayanHarmonicity(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Mod Index</span>
                  <span>{dayanModIndex}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={dayanModIndex}
                  onChange={(e) => setDayanModIndex(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <button
                onClick={playDayan}
                className="w-full p-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 transition-all"
              >
                Play Dayan
              </button>
            </div>
          </div>

          {/* Bayan (Bass) */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">
              Bayan (Bass)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Frequency</span>
                  <span>{bayanFreq} Hz</span>
                </label>
                <input
                  type="range"
                  min={40}
                  max={200}
                  value={bayanFreq}
                  onChange={(e) => setBayanFreq(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Decay</span>
                  <span>{bayanDecay.toFixed(2)}s</span>
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={bayanDecay}
                  onChange={(e) => setBayanDecay(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Pitch Decay</span>
                  <span>{bayanPitchDecay.toFixed(2)}s</span>
                </label>
                <input
                  type="range"
                  min={0.01}
                  max={0.3}
                  step={0.01}
                  value={bayanPitchDecay}
                  onChange={(e) => setBayanPitchDecay(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-amber-700 text-sm mb-1">
                  <span>Octaves</span>
                  <span>{bayanOctaves}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={bayanOctaves}
                  onChange={(e) => setBayanOctaves(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <button
                onClick={playBayan}
                className="w-full p-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 transition-all"
              >
                Play Bayan
              </button>
            </div>
          </div>
        </div>

        {/* Combined */}
        <div className="mt-6">
          <button
            onClick={playBoth}
            className="w-full p-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 active:scale-[0.98] transition-all shadow-lg"
          >
            Play Both (Dha)
          </button>
        </div>

        {/* Quick Bol Buttons */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mt-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Quick Bols</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {BOLS.map((bol) => (
              <button
                key={bol}
                onClick={() => {
                  // Simple mapping for demo
                  const bass = ['Dha', 'Dhin', 'Ge'].includes(bol);
                  const treble = ['Dha', 'Dhin', 'Ta', 'Tin', 'Na', 'Ti', 'Te', 'Ra', 'Ka'].includes(bol);
                  if (bass) playBayan();
                  if (treble) playDayan();
                  if (!bass && !treble) playDayan();
                }}
                className="p-3 bg-amber-100 text-amber-900 rounded-xl font-semibold hover:bg-amber-200 active:scale-95 transition-all"
              >
                {bol}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
