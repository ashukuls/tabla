'use client';

import { TAALS } from '@/lib/types';

interface TaalSelectorProps {
  value: string;
  onChange: (taal: string) => void;
  disabled?: boolean;
}

export default function TaalSelector({
  value,
  onChange,
  disabled = false,
}: TaalSelectorProps) {
  const taalNames = Object.keys(TAALS);

  return (
    <div className="w-full">
      <label className="block text-amber-700 font-medium mb-2">Taal</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl text-amber-900 font-medium focus:border-amber-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {taalNames.map((taal) => (
          <option key={taal} value={taal}>
            {taal} ({TAALS[taal].beats} beats)
          </option>
        ))}
      </select>
    </div>
  );
}
