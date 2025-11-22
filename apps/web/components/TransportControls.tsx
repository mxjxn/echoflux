'use client';

import { useSequencerStore } from '@/lib/store';

interface TransportControlsProps {
  audioReady: boolean;
  audioLoading: boolean;
  audioError: string | null;
}

export function TransportControls({ audioReady, audioLoading, audioError }: TransportControlsProps) {
  const { sequence, isPlaying, setIsPlaying, setCurrentStep, clearSequence } =
    useSequencerStore();

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
    <div className="space-y-4">
      {/* Audio Engine Status */}
      {audioLoading && (
        <div className="px-4 py-2 rounded bg-yellow-900/20 border border-yellow-600/50 text-yellow-200 text-sm">
          ⚡ Loading audio engine...
        </div>
      )}

      {audioError && (
        <div className="px-4 py-2 rounded bg-red-900/20 border border-red-600/50 text-red-200 text-sm">
          ⚠️ Audio engine error: {audioError}
        </div>
      )}

      {audioReady && !isPlaying && (
        <div className="px-4 py-2 rounded bg-green-900/20 border border-green-600/50 text-green-200 text-sm">
          ✓ Audio engine ready
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={!audioReady}
          className={`
            px-6 py-3 rounded-lg font-semibold transition
            ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/80'
            }
            ${!audioReady ? 'opacity-50 cursor-not-allowed' : ''}
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
    </div>
  );
}
