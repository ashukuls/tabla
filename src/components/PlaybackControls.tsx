'use client';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  disabled = false,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Stop Button */}
      <button
        onClick={onStop}
        disabled={disabled}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-2xl"
        aria-label="Stop"
      >
        ⏹
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 text-white hover:bg-amber-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center text-3xl"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Placeholder for symmetry or future controls */}
      <div className="w-14 h-14 sm:w-16 sm:h-16" />
    </div>
  );
}
