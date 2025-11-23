'use client';

import React, { useEffect, useRef } from 'react';
import { useTrackerStore } from '@echoflux/tracker';
import { parseNormalModeKey, parseInsertModeKey, KEY_TO_NOTE } from '@echoflux/tracker';
import type { PatternRow } from '@echoflux/tracker';

export function PatternEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    song,
    mode,
    cursor,
    currentPattern,
    currentPlayRow,
    isPlaying,
    selectedInstrument,
    moveCursor,
    setMode,
    setCurrentNote,
    setCurrentInstrument,
    setCurrentVolume,
    clearRow,
  } = useTrackerStore();

  const pattern = song.patterns[currentPattern];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for navigation keys
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'PageUp', 'PageDown'].includes(
          e.key
        )
      ) {
        e.preventDefault();
      }

      if (mode === 'normal') {
        const action = parseNormalModeKey(e.key, e.shiftKey);
        if (action) {
          if (action.type === 'ENTER_INSERT') {
            setMode('insert');
          } else {
            moveCursor(action);
          }
        }
        // Delete key clears current row
        if (e.key === 'Delete' || e.key === 'Backspace') {
          clearRow(cursor.row);
        }
      } else if (mode === 'insert') {
        const action = parseInsertModeKey(e.key);
        if (action) {
          if (action.type === 'EXIT_INSERT') {
            setMode('normal');
          } else {
            moveCursor(action);
          }
          return;
        }

        // Handle note input in insert mode
        if (cursor.column === 'note') {
          const noteMapping = KEY_TO_NOTE[e.key.toLowerCase()];
          if (noteMapping) {
            setCurrentNote({
              note: noteMapping.note,
              octave: 4 + noteMapping.octave,
            });
            // Auto-set current instrument if not set
            const currentRow = pattern.rows[cursor.row];
            if (currentRow.instrument === null) {
              setCurrentInstrument(selectedInstrument);
            }
            moveCursor({ type: 'MOVE_DOWN' });
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentNote(null);
          }
        }

        // Handle instrument input
        if (cursor.column === 'instrument') {
          const num = parseInt(e.key);
          if (!isNaN(num) && num < song.instruments.length) {
            setCurrentInstrument(num);
            moveCursor({ type: 'MOVE_DOWN' });
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentInstrument(null);
          }
        }

        // Handle volume input
        if (cursor.column === 'volume') {
          const num = parseInt(e.key);
          if (!isNaN(num)) {
            const currentRow = pattern.rows[cursor.row];
            const currentVol = currentRow.volume || 0;
            const newVol = Math.min(127, (currentVol * 10 + num) % 1000);
            setCurrentVolume(newVol);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentVolume(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    mode,
    cursor,
    pattern,
    selectedInstrument,
    song.instruments.length,
    moveCursor,
    setMode,
    setCurrentNote,
    setCurrentInstrument,
    setCurrentVolume,
    clearRow,
  ]);

  // Auto-scroll to keep cursor visible
  useEffect(() => {
    if (containerRef.current) {
      const rowElement = containerRef.current.querySelector(
        `[data-row="${cursor.row}"]`
      ) as HTMLElement;
      if (rowElement) {
        rowElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [cursor.row]);

  const formatNote = (row: PatternRow) => {
    if (!row.note) return '---';
    return `${row.note.note}${row.note.octave}`;
  };

  const formatInstrument = (row: PatternRow) => {
    if (row.instrument === null) return '--';
    return row.instrument.toString().padStart(2, '0');
  };

  const formatVolume = (row: PatternRow) => {
    if (row.volume === null) return '---';
    return row.volume.toString().padStart(3, '0');
  };

  const formatEffect = (row: PatternRow) => {
    return row.effect || '----';
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold">Pattern {pattern.id}</h2>
          <span className="text-xs text-gray-400">{pattern.name}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span
            className={`px-2 py-1 rounded ${
              mode === 'normal'
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white'
            }`}
          >
            {mode === 'normal' ? 'NORMAL' : 'INSERT'}
          </span>
          <span className="text-gray-400">
            Row: {cursor.row.toString().padStart(2, '0')} / {pattern.length}
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex gap-2 px-4 py-2 bg-gray-800 border-b border-gray-600 text-xs text-gray-400">
        <div className="w-8">ROW</div>
        <div className="w-16">NOTE</div>
        <div className="w-12">INST</div>
        <div className="w-16">VOL</div>
        <div className="w-20">EFFECT</div>
      </div>

      {/* Pattern rows */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2"
      >
        {pattern.rows.map((row, index) => {
          const isCursorRow = cursor.row === index;
          const isPlayRow = isPlaying && currentPlayRow === index;

          return (
            <div
              key={index}
              data-row={index}
              className={`flex gap-2 py-0.5 text-sm ${
                isCursorRow ? 'bg-gray-700' : ''
              } ${isPlayRow ? 'bg-blue-900' : ''}`}
            >
              {/* Row number */}
              <div
                className={`w-8 text-right ${
                  index % 16 === 0 ? 'text-yellow-400' : 'text-gray-500'
                }`}
              >
                {index.toString(16).toUpperCase().padStart(2, '0')}
              </div>

              {/* Note */}
              <div
                className={`w-16 ${
                  isCursorRow && cursor.column === 'note'
                    ? 'bg-blue-600 text-white'
                    : row.note
                      ? 'text-green-400'
                      : 'text-gray-600'
                }`}
              >
                {formatNote(row)}
              </div>

              {/* Instrument */}
              <div
                className={`w-12 ${
                  isCursorRow && cursor.column === 'instrument'
                    ? 'bg-blue-600 text-white'
                    : row.instrument !== null
                      ? 'text-cyan-400'
                      : 'text-gray-600'
                }`}
              >
                {formatInstrument(row)}
              </div>

              {/* Volume */}
              <div
                className={`w-16 ${
                  isCursorRow && cursor.column === 'volume'
                    ? 'bg-blue-600 text-white'
                    : row.volume !== null
                      ? 'text-yellow-400'
                      : 'text-gray-600'
                }`}
              >
                {formatVolume(row)}
              </div>

              {/* Effect */}
              <div
                className={`w-20 ${
                  isCursorRow && cursor.column === 'effect'
                    ? 'bg-blue-600 text-white'
                    : row.effect
                      ? 'text-magenta-400'
                      : 'text-gray-600'
                }`}
              >
                {formatEffect(row)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        {mode === 'normal' ? (
          <span>
            <kbd>h/j/k/l</kbd> or arrows to move • <kbd>i</kbd> to insert • <kbd>Del</kbd> to clear
          </span>
        ) : (
          <span>
            Type notes (QWERTY keys) • <kbd>Esc</kbd> to exit insert mode • <kbd>Tab</kbd> to next
            column
          </span>
        )}
      </div>
    </div>
  );
}
