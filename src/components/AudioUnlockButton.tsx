'use client';

import { useState } from 'react';
import { unlockAudio } from '@/lib/audio/tabla';

interface AudioUnlockButtonProps {
  onUnlock?: () => void;
}

export default function AudioUnlockButton({ onUnlock }: AudioUnlockButtonProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      await unlockAudio();
      setIsUnlocked(true);
      onUnlock?.();
    } catch (error) {
      console.error('Failed to unlock audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnlocked) return null;

  return (
    <button
      onClick={handleUnlock}
      disabled={isLoading}
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/80 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm mx-4">
        <div className="text-4xl mb-4">🔊</div>
        <h2 className="text-xl font-semibold text-amber-900 mb-2">
          {isLoading ? 'Enabling...' : 'Tap to Enable Audio'}
        </h2>
        <p className="text-amber-600 text-sm">
          Required for sound playback on mobile devices
        </p>
      </div>
    </button>
  );
}
