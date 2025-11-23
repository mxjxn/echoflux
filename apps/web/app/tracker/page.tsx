'use client';

import React from 'react';
import { PatternEditor } from '@/components/tracker/PatternEditor';
import { InstrumentPanel } from '@/components/tracker/InstrumentPanel';
import { TrackerTransport } from '@/components/tracker/TrackerTransport';
import { useSuperSonic } from '@/hooks/useSuperSonic';
import { useTrackerEngine } from '@/hooks/useTrackerEngine';
import { useTrackerStore } from '@echoflux/tracker';

export default function TrackerPage() {
  const { sonic, loading, error } = useSuperSonic();
  const { cursor } = useTrackerStore();
  const { play, stop, playFromRow } = useTrackerEngine({ sonic });

  const handlePlayFromCursor = () => {
    playFromRow(cursor.row);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Loading SuperSonic...</div>
          <div className="text-sm text-gray-400">Initializing audio engine</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Error loading audio engine</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">EchoFlux Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">
            Music tracker with vim-like navigation
          </p>
        </div>
      </header>

      {/* Transport controls */}
      <TrackerTransport
        onPlay={play}
        onStop={stop}
        onPlayFromCursor={handlePlayFromCursor}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pattern editor (main area) */}
        <div className="flex-1 overflow-hidden">
          <PatternEditor />
        </div>

        {/* Instrument panel (sidebar) */}
        <div className="w-80 overflow-hidden">
          <InstrumentPanel />
        </div>
      </div>

      {/* Footer with keyboard reference */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex gap-6">
            <div>
              <span className="text-gray-500">Navigation:</span> h/j/k/l or arrows
            </div>
            <div>
              <span className="text-gray-500">Insert:</span> i
            </div>
            <div>
              <span className="text-gray-500">Normal:</span> Esc
            </div>
            <div>
              <span className="text-gray-500">Play:</span> Space
            </div>
          </div>
          <div className="text-gray-500">
            SuperSonic {sonic ? 'ready' : 'loading'}
          </div>
        </div>
      </footer>
    </div>
  );
}
