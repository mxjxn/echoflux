'use client';

import React from 'react';
import { useTrackerStore } from '@echoflux/tracker';

interface TrackerTransportProps {
  onPlay: () => void;
  onStop: () => void;
  onPlayFromCursor: () => void;
}

export function TrackerTransport({ onPlay, onStop, onPlayFromCursor }: TrackerTransportProps) {
  const { song, isPlaying, currentPattern, setBpm, setSongName } = useTrackerStore();

  const pattern = song.patterns[currentPattern];

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
      {/* Song info */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={song.name}
          onChange={(e) => setSongName(e.target.value)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
          placeholder="Song name"
        />
        <div className="text-xs text-gray-400">
          Pattern: <span className="text-white">{pattern.name}</span>
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-3">
        {/* Play/Stop */}
        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>

        {/* Play from cursor */}
        <button
          onClick={onPlayFromCursor}
          disabled={isPlaying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded font-medium text-sm text-white transition-colors"
        >
          ▶ From Cursor
        </button>

        {/* BPM control */}
        <div className="flex items-center gap-2 ml-4">
          <label className="text-xs text-gray-400 font-mono">BPM</label>
          <input
            type="number"
            min="60"
            max="240"
            value={song.bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
            className="w-16 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm font-mono text-center focus:outline-none focus:border-blue-500"
          />
          <input
            type="range"
            min="60"
            max="240"
            value={song.bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      {/* Pattern info */}
      <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
        <div>
          Length: <span className="text-white">{pattern.length}</span>
        </div>
        <div>
          Instruments: <span className="text-white">{song.instruments.length}</span>
        </div>
      </div>
    </div>
  );
}
