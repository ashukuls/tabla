'use client';

import { useState, useEffect } from 'react';

interface TempoInputProps {
  tempo: number;
  onChange: (tempo: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function TempoInput({
  tempo,
  onChange,
  min = 20,
  max = 300,
  disabled = false,
}: TempoInputProps) {
  const [inputValue, setInputValue] = useState(String(tempo));

  // Sync input when tempo prop changes externally
  useEffect(() => {
    setInputValue(String(tempo));
  }, [tempo]);

  const applyValue = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(clamped);
      setInputValue(String(clamped));
    } else {
      // Reset to current tempo if invalid
      setInputValue(String(tempo));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyValue(inputValue);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleStep = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, tempo + delta));
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-amber-700 font-medium">Tempo</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleStep(-5)}
          disabled={disabled || tempo <= min}
          className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => applyValue(inputValue)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-20 p-2 bg-white border-2 border-amber-200 rounded-xl text-amber-900 text-center font-bold text-lg focus:border-amber-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => handleStep(5)}
          disabled={disabled || tempo >= max}
          className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>
      </div>
      <span className="text-amber-600 text-sm">BPM</span>
    </div>
  );
}
