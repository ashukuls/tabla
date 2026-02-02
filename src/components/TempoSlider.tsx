'use client';

interface TempoSliderProps {
  tempo: number;
  onChange: (tempo: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function TempoSlider({
  tempo,
  onChange,
  min = 20,
  max = 300,
  disabled = false,
}: TempoSliderProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <label className="text-amber-700 font-medium">Tempo</label>
        <span className="text-amber-900 font-bold text-lg">{tempo} BPM</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={tempo}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-amber-500"
      />
      <div className="flex justify-between text-xs text-amber-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
