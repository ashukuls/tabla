'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as Tone from 'tone';
import AudioUnlockButton from '@/components/AudioUnlockButton';
import BolGrid from '@/components/BolGrid';
import PlaybackControls from '@/components/PlaybackControls';
import TempoInput from '@/components/TempoInput';
import { getTablaPlayer } from '@/lib/audio/tabla';
import { getCompositions, getComposition } from '@/lib/firebase/db';
import { parseComposition, getAllBols } from '@/lib/parser';
import type { Row, Composition } from '@/lib/types';

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

  // Composition selector
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [showSelector, setShowSelector] = useState(false);

  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBolIndexRef = useRef(0);

  // Load all compositions for selector
  useEffect(() => {
    getCompositions().then(setCompositions);
  }, []);

  // Load composition if ID provided via URL or selector
  useEffect(() => {
    const idToLoad = loadId || selectedId;
    if (idToLoad) {
      setLoading(true);
      getComposition(idToLoad)
        .then((comp) => {
          if (comp) {
            setRows(comp.rows);
            setTitle(comp.meta.title || '');
            setTempo(comp.meta.tempo || 60);
            setBolInput('');
            setShowSelector(false);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loadId, selectedId]);

  // Parse bol input
  useEffect(() => {
    if (bolInput.trim()) {
      const parsed = parseComposition(bolInput);
      setRows(parsed);
      setTitle('');
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

  const clearComposition = () => {
    setRows([]);
    setTitle('');
    setBolInput('');
    setSelectedId('');
    stopPlayback();
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
            {/* Composition Selector */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowSelector(!showSelector)}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 active:scale-95 transition-all"
                >
                  {showSelector ? 'Hide List' : 'Load Composition'}
                </button>
                {title && (
                  <>
                    <span className="text-amber-600">Playing: <strong className="text-amber-900">{title}</strong></span>
                    <button
                      onClick={clearComposition}
                      className="text-amber-500 hover:text-amber-700 text-sm"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>

              {showSelector && (
                <div className="mt-4 max-h-60 overflow-y-auto border-t border-amber-100 pt-4">
                  {compositions.length === 0 ? (
                    <p className="text-amber-500 text-sm">No compositions found</p>
                  ) : (
                    <div className="space-y-2">
                      {compositions.map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => setSelectedId(comp.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedId === comp.id
                              ? 'bg-amber-500 text-white'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                          }`}
                        >
                          <div className="font-medium">{comp.meta.title || 'Untitled'}</div>
                          <div className={`text-sm ${selectedId === comp.id ? 'text-amber-100' : 'text-amber-500'}`}>
                            {comp.meta.taal} · {comp.meta.tempo} BPM
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bol Input (manual entry) */}
            {!title && (
              <div className="mb-6">
                <label className="block text-amber-700 font-medium mb-2">
                  Or enter bols manually
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
                  Select a composition or enter bols above
                </p>
              )}
            </div>

            {/* Tempo Input */}
            <div className="flex justify-center mb-8">
              <TempoInput tempo={tempo} onChange={setTempo} />
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
