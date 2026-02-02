'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import * as Tone from 'tone';
import AudioUnlockButton from '@/components/AudioUnlockButton';
import PlaybackControls from '@/components/PlaybackControls';
import TempoSlider from '@/components/TempoSlider';
import TaalSelector from '@/components/TaalSelector';
import { TAALS } from '@/lib/types';

export default function MetronomePage() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [taal, setTaal] = useState('Teentaal');
  const [tempo, setTempo] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const taalDef = TAALS[taal];

  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const synthsRef = useRef<{
    click: Tone.Synth | null;
    accent: Tone.Synth | null;
  }>({ click: null, accent: null });

  // Initialize synths
  useEffect(() => {
    if (!audioUnlocked) return;

    synthsRef.current.click = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).toDestination();

    synthsRef.current.accent = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.08 },
    }).toDestination();

    return () => {
      synthsRef.current.click?.dispose();
      synthsRef.current.accent?.dispose();
    };
  }, [audioUnlocked]);

  const stopPlayback = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(-1);
    currentBeatRef.current = 0;
  }, []);

  const startPlayback = useCallback(async () => {
    await Tone.start();

    const beatDuration = 60 / tempo;
    const scheduleAheadTime = 0.1;
    const lookahead = 25;

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = Tone.now() + 0.1;

    const scheduler = () => {
      while (nextNoteTimeRef.current < Tone.now() + scheduleAheadTime) {
        const beat = currentBeatRef.current;
        const time = nextNoteTimeRef.current;

        const isSam = beat === 0;
        const isTaali = taalDef.claps.includes(beat);
        const isKhaali = beat === taalDef.wave;

        if (isSam && synthsRef.current.accent) {
          // Sam - strongest accent
          synthsRef.current.accent.triggerAttackRelease(700, '16n', time);
        } else if (isTaali && synthsRef.current.accent) {
          // Taali - accent
          synthsRef.current.accent.triggerAttackRelease(800, '32n', time);
        } else if (isKhaali && synthsRef.current.click) {
          // Khaali - softer
          synthsRef.current.click.volume.value = -6;
          synthsRef.current.click.triggerAttackRelease(600, '32n', time);
          synthsRef.current.click.volume.value = 0;
        } else if (synthsRef.current.click) {
          // Regular beat
          synthsRef.current.click.triggerAttackRelease(900, '32n', time);
        }

        setCurrentBeat(beat);

        nextNoteTimeRef.current += beatDuration;
        currentBeatRef.current = (beat + 1) % taalDef.beats;
      }
    };

    schedulerRef.current = setInterval(scheduler, lookahead);
    setIsPlaying(true);
  }, [tempo, taalDef]);

  // Get beat type for display
  const getBeatType = (beat: number): 'sam' | 'taali' | 'khaali' | 'regular' => {
    if (beat === 0) return 'sam';
    if (taalDef.claps.includes(beat)) return 'taali';
    if (beat === taalDef.wave) return 'khaali';
    return 'regular';
  };

  // Build vibhag groups
  const vibhags: number[][] = [];
  let beatIndex = 0;
  for (const divSize of taalDef.divisions) {
    const group: number[] = [];
    for (let i = 0; i < divSize; i++) {
      group.push(beatIndex++);
    }
    vibhags.push(group);
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {!audioUnlocked && <AudioUnlockButton onUnlock={() => setAudioUnlocked(true)} />}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="text-amber-600 hover:text-amber-800 font-medium">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">Metronome</h1>
          <div className="w-16" />
        </header>

        {/* Taal Selector */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <TaalSelector value={taal} onChange={setTaal} />
        </div>

        {/* Beat Grid */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {vibhags.map((group, groupIndex) => (
              <div key={groupIndex} className="flex gap-2 justify-center">
                {group.map((beat) => {
                  const type = getBeatType(beat);
                  const isCurrent = beat === currentBeat;

                  return (
                    <div
                      key={beat}
                      className={`
                        w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center
                        transition-all duration-75 font-bold
                        ${isCurrent ? 'scale-110 shadow-lg' : ''}
                        ${type === 'sam'
                          ? 'bg-red-500 text-white'
                          : type === 'taali'
                          ? 'bg-amber-500 text-white'
                          : type === 'khaali'
                          ? 'bg-blue-400 text-white'
                          : 'bg-amber-100 text-amber-700'
                        }
                      `}
                    >
                      <span className="text-lg">{beat + 1}</span>
                      <span className="text-[10px] opacity-80">
                        {type === 'sam' && 'X'}
                        {type === 'taali' && '+'}
                        {type === 'khaali' && '0'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-500 rounded" /> Sam (X)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-amber-500 rounded" /> Taali (+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-400 rounded" /> Khaali (0)
            </span>
          </div>
        </div>

        {/* Tempo */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
          <TempoSlider tempo={tempo} onChange={setTempo} />
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
