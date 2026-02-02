'use client';

import type { Row } from '@/lib/types';

interface BolGridProps {
  rows: Row[];
  currentBeat?: number;
  currentRow?: number;
  beatsPerRow?: number;
}

export default function BolGrid({
  rows,
  currentBeat = -1,
  currentRow = -1,
  beatsPerRow = 4,
}: BolGridProps) {
  let globalBeatIndex = 0;

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex flex-wrap gap-1 sm:gap-2"
        >
          {row.beats.map((beat, beatIndex) => {
            const isCurrentBeat =
              rowIndex === currentRow && beatIndex === currentBeat;
            const beatGlobalIndex = globalBeatIndex++;
            const isFirstBeatOfGroup = beatGlobalIndex % beatsPerRow === 0;

            return (
              <div
                key={beatIndex}
                className={`
                  flex-1 min-w-[3rem] sm:min-w-[4rem] p-2 sm:p-3
                  rounded-lg text-center font-semibold
                  transition-all duration-100
                  ${isCurrentBeat
                    ? 'bg-amber-500 text-white scale-105 shadow-lg'
                    : 'bg-white border-2 border-amber-200 text-amber-900'
                  }
                  ${isFirstBeatOfGroup && beatIndex > 0 ? 'ml-2 sm:ml-4' : ''}
                `}
              >
                {beat.bols.map((bol, bolIndex) => (
                  <span
                    key={bolIndex}
                    className={`${beat.bols.length > 1 ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                  >
                    {bol}
                    {bolIndex < beat.bols.length - 1 && (
                      <span className="text-amber-400 mx-0.5">·</span>
                    )}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
