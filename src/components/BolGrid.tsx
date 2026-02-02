'use client';

import type { Row } from '@/lib/types';

interface BolGridProps {
  rows: Row[];
  currentBeat?: number;
  currentRow?: number;
}

export default function BolGrid({
  rows,
  currentBeat = -1,
  currentRow = -1,
}: BolGridProps) {
  return (
    <div className="space-y-2 font-mono">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap gap-x-4 gap-y-1">
          {row.beats.map((beat, beatIndex) => {
            const isCurrentBeat =
              rowIndex === currentRow && beatIndex === currentBeat;

            return (
              <span
                key={beatIndex}
                className={`
                  px-1 py-0.5 rounded transition-all
                  ${isCurrentBeat
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-amber-900'
                  }
                `}
              >
                {beat.bols.join('')}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
