'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import * as Tone from 'tone';
import AudioUnlockButton from '@/components/AudioUnlockButton';
import PlaybackControls from '@/components/PlaybackControls';
import TempoInput from '@/components/TempoInput';

interface PolyrhythmPattern {
  totalBlocks: number;
  bolBlocks: number[];
  beatBlocks: number[];
}

function calculatePattern(bols: number, beats: number): PolyrhythmPattern {
  const totalBlocks = bols * beats;
  const bolInterval = beats;
  const beatInterval = bols;

  const bolBlocks: number[] = [];
  const beatBlocks: number[] = [];

  for (let i = 0; i < totalBlocks; i++) {
    if (i % bolInterval === 0) bolBlocks.push(i);
    if (i % beatInterval === 0) beatBlocks.push(i);
  }

  return { totalBlocks, bolBlocks, beatBlocks };
}

export default function TrainerPage() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [bols, setBols] = useState(3);
  const [beats, setBeats] = useState(4);
  const [tempo, setTempo] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(-1);
  const [volumes, setVolumes] = useState({ beat: 80, bol: 80, subdivision: 30 });

  const pattern = calculatePattern(bols, beats);

  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBlockRef = useRef(0);
  const synthsRef = useRef<{
    beat: Tone.Synth | null;
    bol: Tone.MembraneSynth | null;
    subdivision: Tone.Synth | null;
  }>({ beat: null, bol: null, subdivision: null });

  // Initialize synths
  useEffect(() => {
    if (!audioUnlocked) return;

    synthsRef.current.beat = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();

    synthsRef.current.bol = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    }).toDestination();

    synthsRef.current.subdivision = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 },
    }).toDestination();

    return () => {
      synthsRef.current.beat?.dispose();
      synthsRef.current.bol?.dispose();
      synthsRef.current.subdivision?.dispose();
    };
  }, [audioUnlocked]);

  const stopPlayback = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBlock(-1);
    currentBlockRef.current = 0;
  }, []);

  const startPlayback = useCallback(async () => {
    await Tone.start();

    const subdivisionDuration = 60 / tempo / bols;
    const scheduleAheadTime = 0.1;
    const lookahead = 25;

    currentBlockRef.current = 0;
    nextNoteTimeRef.current = Tone.now() + 0.1;

    const scheduler = () => {
      while (nextNoteTimeRef.current < Tone.now() + scheduleAheadTime) {
        const block = currentBlockRef.current;
        const time = nextNoteTimeRef.current;

        // Play beat sound
        if (pattern.beatBlocks.includes(block) && synthsRef.current.beat) {
          synthsRef.current.beat.volume.value = Tone.gainToDb(volumes.beat / 100);
          synthsRef.current.beat.triggerAttackRelease(900, '32n', time);
        }

        // Play bol sound
        if (pattern.bolBlocks.includes(block) && synthsRef.current.bol) {
          synthsRef.current.bol.volume.value = Tone.gainToDb(volumes.bol / 100);
          synthsRef.current.bol.triggerAttackRelease(150, '8n', time);
        }

        // Play subdivision tick
        if (synthsRef.current.subdivision && volumes.subdivision > 0) {
          synthsRef.current.subdivision.volume.value = Tone.gainToDb(volumes.subdivision / 100);
          synthsRef.current.subdivision.triggerAttackRelease(1800, '128n', time);
        }

        setCurrentBlock(block);

        nextNoteTimeRef.current += subdivisionDuration;
        currentBlockRef.current = (block + 1) % pattern.totalBlocks;
      }
    };

    schedulerRef.current = setInterval(scheduler, lookahead);
    setIsPlaying(true);
  }, [tempo, bols, pattern, volumes]);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {!audioUnlocked && <AudioUnlockButton onUnlock={() => setAudioUnlocked(true)} />}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">Polyrhythm Trainer</h1>
          <div className="w-16" />
        </header>

        {/* Config */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <div className="text-center mb-6">
            <span className="text-4xl sm:text-5xl font-bold text-amber-900">
              {bols} over {beats}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-amber-700 font-medium mb-2">Bols (N)</label>
              <input
                type="number"
                min={2}
                max={9}
                value={bols}
                onChange={(e) => setBols(Math.max(2, Math.min(9, Number(e.target.value))))}
                className="w-full p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-900 text-center text-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-amber-700 font-medium mb-2">Beats (D)</label>
              <input
                type="number"
                min={2}
                max={9}
                value={beats}
                onChange={(e) => setBeats(Math.max(2, Math.min(9, Number(e.target.value))))}
                className="w-full p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-900 text-center text-xl font-bold"
              />
            </div>
          </div>

          <div className="flex justify-center">
              <TempoInput tempo={tempo} onChange={setTempo} />
            </div>
        </div>

        {/* Pattern Grid */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
            {Array.from({ length: pattern.totalBlocks }).map((_, i) => {
              const isBol = pattern.bolBlocks.includes(i);
              const isBeat = pattern.beatBlocks.includes(i);
              const isCurrent = i === currentBlock;

              return (
                <div
                  key={i}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-bold
                    transition-all duration-75
                    ${isCurrent ? 'scale-110 shadow-lg' : ''}
                    ${isBol && isBeat
                      ? 'bg-purple-500 text-white'
                      : isBol
                      ? 'bg-amber-500 text-white'
                      : isBeat
                      ? 'bg-blue-500 text-white'
                      : 'bg-amber-100 text-amber-400'
                    }
                  `}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-amber-500 rounded" /> Bol
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-500 rounded" /> Beat
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-purple-500 rounded" /> Both
            </span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <h3 className="text-amber-700 font-medium mb-4">Volumes</h3>
          <div className="space-y-4">
            {(['beat', 'bol', 'subdivision'] as const).map((key) => (
              <div key={key} className="flex items-center gap-4">
                <span className="w-24 text-amber-700 capitalize">{key}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volumes[key]}
                  onChange={(e) =>
                    setVolumes((v) => ({ ...v, [key]: Number(e.target.value) }))
                  }
                  className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none accent-amber-500"
                />
                <span className="w-12 text-right text-amber-600">{volumes[key]}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          onPlay={startPlayback}
          onPause={stopPlayback}
          onStop={stopPlayback}
        />
      </div>
    </main>
  );
}
