'use client';

import { useEffect, useRef } from 'react';
import { useSequencerStore } from '@/lib/store';

export function TransportControls() {
  const { sequence, isPlaying, setIsPlaying, setCurrentStep, currentStep, clearSequence } =
    useSequencerStore();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const stepDuration = (60 / sequence.bpm) * 1000 / 4; // 16th notes

      intervalRef.current = window.setInterval(() => {
        setCurrentStep((currentStep + 1) % 16);
      }, stepDuration);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, sequence.bpm, currentStep, setCurrentStep]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      setIsPlaying(true);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sequence,
          authorId: 'demo', // For prototype, using demo user
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        alert(`Sequence "${saved.name}" saved successfully!`);
      }
    } catch (error) {
      console.error('Failed to save sequence:', error);
      alert('Failed to save sequence');
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        className={`
          px-6 py-3 rounded-lg font-semibold transition
          ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-primary hover:bg-primary/80'
          }
        `}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>

      {/* Clear */}
      <button
        onClick={clearSequence}
        className="px-6 py-3 rounded-lg bg-surface hover:bg-surfaceLight transition"
      >
        Clear
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        className="px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition font-semibold"
      >
        Save to Feed
      </button>

      {/* Info */}
      <div className="ml-auto text-sm text-gray-400">
        Notes: {sequence.notes.length}
      </div>
    </div>
  );
}
