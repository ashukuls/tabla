'use client';

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
  const handleChange = (value: number) => {
    const clamped = Math.max(min, Math.min(max, value));
    onChange(clamped);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-amber-700 font-medium">Tempo</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleChange(tempo - 5)}
          disabled={disabled || tempo <= min}
          className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={tempo}
          onChange={(e) => handleChange(Number(e.target.value))}
          disabled={disabled}
          className="w-20 p-2 bg-white border-2 border-amber-200 rounded-xl text-amber-900 text-center font-bold text-lg focus:border-amber-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => handleChange(tempo + 5)}
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
