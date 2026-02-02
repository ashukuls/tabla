'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as Tone from 'tone';
import AudioUnlockButton from '@/components/AudioUnlockButton';
import BolGrid from '@/components/BolGrid';
import PlaybackControls from '@/components/PlaybackControls';
import TempoSlider from '@/components/TempoSlider';
import { getTablaPlayer } from '@/lib/audio/tabla';
import { getComposition } from '@/lib/firebase/db';
import { parseComposition, getAllBols } from '@/lib/parser';
import type { Row } from '@/lib/types';

function PlayerContent() {
  const searchParams = useSearchParams();
  const loadId = searchParams.get('load');

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(60);
  const [currentRow, setCurrentRow] = useState(-1);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [rows, setRows] = useState<Row[]>([]);
  const [bolInput, setBolInput] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBolIndexRef = useRef(0);

  // Load composition if ID provided
  useEffect(() => {
    if (loadId) {
      setLoading(true);
      getComposition(loadId)
        .then((comp) => {
          if (comp) {
            setRows(comp.rows);
            setTitle(comp.meta.title || '');
            setTempo(comp.meta.tempo || 60);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loadId]);

  // Parse bol input
  useEffect(() => {
    if (bolInput.trim()) {
      const parsed = parseComposition(bolInput);
      setRows(parsed);
    }
  }, [bolInput]);

  const stopPlayback = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentRow(-1);
    setCurrentBeat(-1);
    currentBolIndexRef.current = 0;
  }, []);

  const startPlayback = useCallback(async () => {
    if (rows.length === 0) return;

    const player = getTablaPlayer();
    if (!player.ready) {
      await player.init();
    }

    const allBols = getAllBols(rows);
    if (allBols.length === 0) return;

    const beatDuration = 60 / tempo;
    const scheduleAheadTime = 0.1;
    const lookahead = 25;

    currentBolIndexRef.current = 0;
    nextNoteTimeRef.current = Tone.now() + 0.1;

    const scheduler = () => {
      while (nextNoteTimeRef.current < Tone.now() + scheduleAheadTime) {
        const bolIndex = currentBolIndexRef.current;
        const bol = allBols[bolIndex];

        // Calculate row and beat position
        let remaining = bolIndex;
        let rowIdx = 0;
        let beatIdx = 0;
        for (let r = 0; r < rows.length; r++) {
          if (remaining < rows[r].beats.length) {
            rowIdx = r;
            beatIdx = remaining;
            break;
          }
          remaining -= rows[r].beats.length;
        }

        // Schedule the sound
        player.playBol(bol, nextNoteTimeRef.current);

        // Update UI
        setCurrentRow(rowIdx);
        setCurrentBeat(beatIdx);

        // Advance
        nextNoteTimeRef.current += beatDuration;
        currentBolIndexRef.current = (bolIndex + 1) % allBols.length;
      }
    };

    schedulerRef.current = setInterval(scheduler, lookahead);
    setIsPlaying(true);
  }, [rows, tempo]);

  const handlePlay = () => {
    if (!isPlaying) startPlayback();
  };

  const handlePause = () => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {!audioUnlocked && <AudioUnlockButton onUnlock={() => setAudioUnlocked(true)} />}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-amber-600 hover:text-amber-800 font-medium"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">
            {title || 'Player'}
          </h1>
          <div className="w-16" />
        </header>

        {loading ? (
          <div className="text-center text-amber-600 py-12">Loading...</div>
        ) : (
          <>
            {/* Bol Input (when no composition loaded) */}
            {!loadId && (
              <div className="mb-6">
                <label className="block text-amber-700 font-medium mb-2">
                  Enter Bols
                </label>
                <textarea
                  value={bolInput}
                  onChange={(e) => setBolInput(e.target.value)}
                  placeholder="Dha Dhin Dhin Dha | Dha Dhin Dhin Dha&#10;Dha Tin Tin Ta | Ta Dhin Dhin Dha"
                  className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 focus:border-amber-400 focus:outline-none min-h-[100px] font-mono"
                />
              </div>
            )}

            {/* Bol Grid */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-6">
              {rows.length > 0 ? (
                <BolGrid
                  rows={rows}
                  currentRow={currentRow}
                  currentBeat={currentBeat}
                />
              ) : (
                <p className="text-center text-amber-500 py-8">
                  Enter bols above or load a composition
                </p>
              )}
            </div>

            {/* Tempo Slider */}
            <div className="mb-8">
              <TempoSlider tempo={tempo} onChange={setTempo} />
            </div>

            {/* Playback Controls */}
            <PlaybackControls
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={stopPlayback}
              disabled={rows.length === 0}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-amber-600">Loading...</div>}>
      <PlayerContent />
    </Suspense>
  );
}
