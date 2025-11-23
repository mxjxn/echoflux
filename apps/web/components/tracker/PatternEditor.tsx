'use client';

import React, { useEffect, useRef } from 'react';
import { useTrackerStore } from '@echoflux/tracker';
import { parseNormalModeKey, parseInsertModeKey, KEY_TO_NOTE } from '@echoflux/tracker';
import type { TrackCell } from '@echoflux/tracker';

export function PatternEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastKeyRef = useRef<string>('');
  const {
    song,
    mode,
    cursor,
    currentPattern,
    currentPlayRow,
    isPlaying,
    selectedInstrument,
    currentOctave,
    collapsedColumns,
    editStep,
    moveCursor,
    setMode,
    setCurrentNote,
    setCurrentInstrument,
    setCurrentVolume,
    setCurrentPanning,
    setCurrentDelay,
    clearRow,
    copyRow,
    pasteRow,
    insertRow,
    deleteRow,
    incrementOctave,
    decrementOctave,
    addTrack,
    removeTrack,
    toggleColumnCollapse,
    isColumnCollapsed,
    exportSong,
    importSong,
    incrementEditStep,
    decrementEditStep,
  } = useTrackerStore();

  // Helper to move cursor by edit step
  const moveByEditStep = () => {
    for (let i = 0; i < editStep; i++) {
      moveCursor({ type: 'MOVE_DOWN' });
    }
  };

  const handleExport = () => {
    const json = exportSong();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            importSong(json);
          } catch (err) {
            alert('Failed to import song: ' + (err as Error).message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

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
        // Handle double-key sequences (yy, dd)
        if (e.key === 'y' && lastKeyRef.current === 'y') {
          // yy - copy row
          copyRow(cursor.row);
          lastKeyRef.current = '';
          return;
        } else if (e.key === 'y') {
          lastKeyRef.current = 'y';
          return;
        } else if (e.key === 'd' && lastKeyRef.current === 'd') {
          // dd - delete row
          deleteRow(cursor.row);
          lastKeyRef.current = '';
          return;
        } else if (e.key === 'd') {
          lastKeyRef.current = 'd';
          return;
        } else {
          lastKeyRef.current = '';
        }

        // p - paste row
        if (e.key === 'p') {
          pasteRow(cursor.row);
          moveCursor({ type: 'MOVE_DOWN' });
          return;
        }

        // o - insert row
        if (e.key === 'o') {
          insertRow(cursor.row + 1);
          moveCursor({ type: 'MOVE_DOWN' });
          return;
        }

        // * - octave up
        if (e.key === '*') {
          incrementOctave();
          return;
        }

        // / - octave down
        if (e.key === '/') {
          decrementOctave();
          return;
        }

        // + - increase edit step
        if (e.key === '+' || e.key === '=') {
          incrementEditStep();
          return;
        }

        // - - decrease edit step
        if (e.key === '-' || e.key === '_') {
          decrementEditStep();
          return;
        }

        const action = parseNormalModeKey(e.key, e.shiftKey);
        if (action) {
          if (action.type === 'ENTER_INSERT') {
            setMode('insert');
          } else {
            moveCursor(action);
          }
        }
        // 'x' or Delete key clears current row
        if (e.key === 'x' || e.key === 'Delete' || e.key === 'Backspace') {
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
          // Shift+1 for note off
          if (e.shiftKey && e.key === '!') {
            setCurrentNote({ note: 'OFF', octave: 0 });
            moveByEditStep();
            return;
          }

          const noteMapping = KEY_TO_NOTE[e.key.toLowerCase()];
          if (noteMapping) {
            setCurrentNote({
              note: noteMapping.note,
              octave: currentOctave + noteMapping.octave,
            });
            // Auto-set current instrument if not set
            const currentTrackCell = pattern.rows[cursor.row].tracks[cursor.track];
            if (currentTrackCell.instrument === null) {
              setCurrentInstrument(selectedInstrument);
            }
            moveByEditStep();
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentNote(null);
          }
        }

        // Handle instrument input
        if (cursor.column === 'instrument') {
          const num = parseInt(e.key);
          if (!isNaN(num) && num < song.instruments.length) {
            setCurrentInstrument(num);
            moveByEditStep();
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentInstrument(null);
          }
        }

        // Handle volume input
        if (cursor.column === 'volume') {
          const num = parseInt(e.key);
          if (!isNaN(num)) {
            const currentTrackCell = pattern.rows[cursor.row].tracks[cursor.track];
            const currentVol = currentTrackCell.volume || 0;
            const newVol = Math.min(127, (currentVol * 10 + num) % 1000);
            setCurrentVolume(newVol);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentVolume(null);
          }
        }

        // Handle panning input (hex: 00-FF, 80=center)
        if (cursor.column === 'panning') {
          const hexChars = '0123456789abcdefABCDEF';
          if (hexChars.includes(e.key)) {
            const currentTrackCell = pattern.rows[cursor.row].tracks[cursor.track];
            const currentPan = currentTrackCell.panning || 0;
            const currentHex = currentPan.toString(16).toUpperCase().padStart(2, '0');
            const newHex = (currentHex.slice(1) + e.key.toUpperCase()).slice(0, 2);
            const newPan = parseInt(newHex, 16);
            setCurrentPanning(newPan);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentPanning(null);
          }
        }

        // Handle delay input (hex: 00-FF)
        if (cursor.column === 'delay') {
          const hexChars = '0123456789abcdefABCDEF';
          if (hexChars.includes(e.key)) {
            const currentTrackCell = pattern.rows[cursor.row].tracks[cursor.track];
            const currentDel = currentTrackCell.delay || 0;
            const currentHex = currentDel.toString(16).toUpperCase().padStart(2, '0');
            const newHex = (currentHex.slice(1) + e.key.toUpperCase()).slice(0, 2);
            const newDel = parseInt(newHex, 16);
            setCurrentDelay(newDel);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            setCurrentDelay(null);
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
    currentOctave,
    editStep,
    song.instruments.length,
    moveCursor,
    setMode,
    setCurrentNote,
    setCurrentInstrument,
    setCurrentVolume,
    setCurrentPanning,
    setCurrentDelay,
    clearRow,
    copyRow,
    pasteRow,
    insertRow,
    deleteRow,
    incrementOctave,
    decrementOctave,
    addTrack,
    removeTrack,
    toggleColumnCollapse,
    isColumnCollapsed,
    exportSong,
    importSong,
    incrementEditStep,
    decrementEditStep,
    moveByEditStep,
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

  const formatNote = (cell: TrackCell) => {
    if (!cell.note) return '---';
    return `${cell.note.note}${cell.note.octave}`;
  };

  const formatInstrument = (cell: TrackCell) => {
    if (cell.instrument === null) return '--';
    return cell.instrument.toString().padStart(2, '0');
  };

  const formatVolume = (cell: TrackCell) => {
    if (cell.volume === null) return '---';
    return cell.volume.toString().padStart(3, '0');
  };

  const formatPanning = (cell: TrackCell) => {
    if (cell.panning === null) return '--';
    return cell.panning.toString(16).toUpperCase().padStart(2, '0');
  };

  const formatDelay = (cell: TrackCell) => {
    if (cell.delay === null) return '--';
    return cell.delay.toString(16).toUpperCase().padStart(2, '0');
  };

  const formatEffect = (cell: TrackCell) => {
    return cell.effect || '----';
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold">Pattern {pattern.id}</h2>
          <span className="text-xs text-gray-400">{pattern.name}</span>
          <button
            onClick={() => addTrack(currentPattern)}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            + Track
          </button>
          <button
            onClick={handleExport}
            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Export
          </button>
          <button
            onClick={handleImport}
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            Import
          </button>
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
          <span className="text-gray-400">
            Track: {cursor.track + 1} / {pattern.numTracks}
          </span>
          <span className="text-gray-400">
            Octave: {currentOctave}
          </span>
          <span className="text-gray-400">
            Step: {editStep}
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex gap-1 px-4 py-2 bg-gray-800 border-b border-gray-600 text-xs text-gray-400 overflow-x-auto">
        <div className="w-8 flex-shrink-0">ROW</div>
        {Array.from({ length: pattern.numTracks }).map((_, trackIdx) => (
          <div key={trackIdx} className="flex gap-1 border-l border-gray-700 pl-1">
            <div className="w-14 cursor-pointer hover:text-white" onClick={() => toggleColumnCollapse(trackIdx, 'note')}>
              {isColumnCollapsed(trackIdx, 'note') ? '> NOTE' : 'v NOTE'}
            </div>
            <div className="w-10 cursor-pointer hover:text-white" onClick={() => toggleColumnCollapse(trackIdx, 'instrument')}>
              {isColumnCollapsed(trackIdx, 'instrument') ? '>' : 'v'} INST
            </div>
            <div className="w-12 cursor-pointer hover:text-white" onClick={() => toggleColumnCollapse(trackIdx, 'volume')}>
              {isColumnCollapsed(trackIdx, 'volume') ? '>' : 'v'} VOL
            </div>
            <div className="w-10 cursor-pointer hover:text-white" onClick={() => toggleColumnCollapse(trackIdx, 'panning')}>
              {isColumnCollapsed(trackIdx, 'panning') ? '>' : 'v'} PAN
            </div>
            <div className="w-10 cursor-pointer hover:text-white" onClick={() => toggleColumnCollapse(trackIdx, 'delay')}>
              {isColumnCollapsed(trackIdx, 'delay') ? '>' : 'v'} DLY
            </div>
            <div className="w-16 cursor-pointer hover:text-white" onClick={() => toggleColumnCollapse(trackIdx, 'effect')}>
              {isColumnCollapsed(trackIdx, 'effect') ? '>' : 'v'} FX
            </div>
          </div>
        ))}
      </div>

      {/* Pattern rows */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto px-4 py-2"
      >
        {pattern.rows.map((row, rowIdx) => {
          const isCursorRow = cursor.row === rowIdx;
          const isPlayRow = isPlaying && currentPlayRow === rowIdx;

          return (
            <div
              key={rowIdx}
              data-row={rowIdx}
              className={`flex gap-1 py-0.5 text-sm ${
                isCursorRow ? 'bg-gray-700' : ''
              } ${isPlayRow ? 'bg-blue-900' : ''}`}
            >
              {/* Row number */}
              <div
                className={`w-8 flex-shrink-0 text-right ${
                  rowIdx % 16 === 0 ? 'text-yellow-400' : 'text-gray-500'
                }`}
              >
                {rowIdx.toString(16).toUpperCase().padStart(2, '0')}
              </div>

              {/* Track cells */}
              {row.tracks.map((cell, trackIdx) => {
                const isCursorTrack = isCursorRow && cursor.track === trackIdx;
                return (
                  <div key={trackIdx} className="flex gap-1 border-l border-gray-800 pl-1">
                    {/* Note */}
                    {!isColumnCollapsed(trackIdx, 'note') && (
                      <div
                        className={`w-14 ${
                          isCursorTrack && cursor.column === 'note'
                            ? 'bg-blue-600 text-white'
                            : cell.note
                              ? 'text-green-400'
                              : 'text-gray-600'
                        }`}
                      >
                        {formatNote(cell)}
                      </div>
                    )}

                    {/* Instrument */}
                    {!isColumnCollapsed(trackIdx, 'instrument') && (
                      <div
                        className={`w-10 ${
                          isCursorTrack && cursor.column === 'instrument'
                            ? 'bg-blue-600 text-white'
                            : cell.instrument !== null
                              ? 'text-cyan-400'
                              : 'text-gray-600'
                        }`}
                      >
                        {formatInstrument(cell)}
                      </div>
                    )}

                    {/* Volume */}
                    {!isColumnCollapsed(trackIdx, 'volume') && (
                      <div
                        className={`w-12 ${
                          isCursorTrack && cursor.column === 'volume'
                            ? 'bg-blue-600 text-white'
                            : cell.volume !== null
                              ? 'text-yellow-400'
                              : 'text-gray-600'
                        }`}
                      >
                        {formatVolume(cell)}
                      </div>
                    )}

                    {/* Panning */}
                    {!isColumnCollapsed(trackIdx, 'panning') && (
                      <div
                        className={`w-10 ${
                          isCursorTrack && cursor.column === 'panning'
                            ? 'bg-blue-600 text-white'
                            : cell.panning !== null
                              ? 'text-purple-400'
                              : 'text-gray-600'
                        }`}
                      >
                        {formatPanning(cell)}
                      </div>
                    )}

                    {/* Delay */}
                    {!isColumnCollapsed(trackIdx, 'delay') && (
                      <div
                        className={`w-10 ${
                          isCursorTrack && cursor.column === 'delay'
                            ? 'bg-blue-600 text-white'
                            : cell.delay !== null
                              ? 'text-orange-400'
                              : 'text-gray-600'
                        }`}
                      >
                        {formatDelay(cell)}
                      </div>
                    )}

                    {/* Effect */}
                    {!isColumnCollapsed(trackIdx, 'effect') && (
                      <div
                        className={`w-16 ${
                          isCursorTrack && cursor.column === 'effect'
                            ? 'bg-blue-600 text-white'
                            : cell.effect
                              ? 'text-magenta-400'
                              : 'text-gray-600'
                        }`}
                      >
                        {formatEffect(cell)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        {mode === 'normal' ? (
          <span>
            <kbd>h/j/k/l</kbd> move • <kbd>Shift+H/L</kbd> track • <kbd>i</kbd> insert • <kbd>x</kbd> delete • <kbd>yy</kbd> copy • <kbd>p</kbd> paste • <kbd>o</kbd> insert row • <kbd>dd</kbd> delete row • <kbd>*//</kbd> octave • <kbd>+/-</kbd> step
          </span>
        ) : (
          <span>
            Type notes (QWERTY keys) • <kbd>Shift+1</kbd> note off • <kbd>Esc</kbd> to exit • <kbd>Tab</kbd> next column
          </span>
        )}
      </div>
    </div>
  );
}
