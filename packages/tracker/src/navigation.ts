/**
 * Vim-like navigation system for the tracker
 */

import type { CursorPosition, ColumnType, EditorMode } from './types';

export const COLUMNS: ColumnType[] = ['note', 'instrument', 'volume', 'panning', 'delay', 'effect'];

export interface NavigationAction {
  type:
    | 'MOVE_UP'
    | 'MOVE_DOWN'
    | 'MOVE_LEFT'
    | 'MOVE_RIGHT'
    | 'MOVE_NEXT_COLUMN'
    | 'MOVE_PREV_COLUMN'
    | 'MOVE_NEXT_TRACK'
    | 'MOVE_PREV_TRACK'
    | 'PAGE_UP'
    | 'PAGE_DOWN'
    | 'HOME'
    | 'END'
    | 'ENTER_INSERT'
    | 'EXIT_INSERT';
}

export const PAGE_SIZE = 16; // Rows to jump with Page Up/Down

export function handleNavigation(
  cursor: CursorPosition,
  action: NavigationAction,
  maxRows: number,
  maxPatterns: number,
  maxTracks: number
): CursorPosition {
  const newCursor = { ...cursor };

  switch (action.type) {
    case 'MOVE_UP':
      newCursor.row = Math.max(0, cursor.row - 1);
      break;

    case 'MOVE_DOWN':
      newCursor.row = Math.min(maxRows - 1, cursor.row + 1);
      break;

    case 'MOVE_LEFT':
    case 'MOVE_PREV_COLUMN':
      const currentColIndex = COLUMNS.indexOf(cursor.column);
      if (currentColIndex > 0) {
        newCursor.column = COLUMNS[currentColIndex - 1];
      }
      break;

    case 'MOVE_RIGHT':
    case 'MOVE_NEXT_COLUMN':
      const colIndex = COLUMNS.indexOf(cursor.column);
      if (colIndex < COLUMNS.length - 1) {
        newCursor.column = COLUMNS[colIndex + 1];
      }
      break;

    case 'MOVE_NEXT_TRACK':
      newCursor.track = Math.min(maxTracks - 1, cursor.track + 1);
      break;

    case 'MOVE_PREV_TRACK':
      newCursor.track = Math.max(0, cursor.track - 1);
      break;

    case 'PAGE_UP':
      newCursor.row = Math.max(0, cursor.row - PAGE_SIZE);
      break;

    case 'PAGE_DOWN':
      newCursor.row = Math.min(maxRows - 1, cursor.row + PAGE_SIZE);
      break;

    case 'HOME':
      newCursor.row = 0;
      break;

    case 'END':
      newCursor.row = maxRows - 1;
      break;
  }

  return newCursor;
}

export function parseNormalModeKey(
  key: string,
  shiftKey: boolean
): NavigationAction | null {
  // Track navigation with Shift+H/L or Shift+Arrow
  if (shiftKey && (key === 'H' || key === 'ArrowLeft')) {
    return { type: 'MOVE_PREV_TRACK' };
  }
  if (shiftKey && (key === 'L' || key === 'ArrowRight')) {
    return { type: 'MOVE_NEXT_TRACK' };
  }

  // Vim-style navigation
  if (key === 'h' || key === 'ArrowLeft') {
    return { type: 'MOVE_LEFT' };
  }
  if (key === 'j' || key === 'ArrowDown') {
    return { type: 'MOVE_DOWN' };
  }
  if (key === 'k' || key === 'ArrowUp') {
    return { type: 'MOVE_UP' };
  }
  if (key === 'l' || key === 'ArrowRight') {
    return { type: 'MOVE_RIGHT' };
  }
  if (key === 'i') {
    return { type: 'ENTER_INSERT' };
  }
  if (key === 'Tab') {
    return shiftKey ? { type: 'MOVE_PREV_COLUMN' } : { type: 'MOVE_NEXT_COLUMN' };
  }
  if (key === 'PageUp') {
    return { type: 'PAGE_UP' };
  }
  if (key === 'PageDown') {
    return { type: 'PAGE_DOWN' };
  }
  if (key === 'Home') {
    return { type: 'HOME' };
  }
  if (key === 'End') {
    return { type: 'END' };
  }

  return null;
}

export function parseInsertModeKey(key: string): NavigationAction | null {
  if (key === 'Escape') {
    return { type: 'EXIT_INSERT' };
  }
  if (key === 'ArrowUp') {
    return { type: 'MOVE_UP' };
  }
  if (key === 'ArrowDown') {
    return { type: 'MOVE_DOWN' };
  }
  if (key === 'Tab') {
    return { type: 'MOVE_NEXT_COLUMN' };
  }

  return null;
}

const NOTES = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'] as const;

// Map keyboard keys to notes (using 2 rows like piano roll)
export const KEY_TO_NOTE: Record<string, { note: typeof NOTES[number]; octave: number }> = {
  // Lower row (C to E)
  z: { note: 'C-', octave: 0 },
  s: { note: 'C#', octave: 0 },
  x: { note: 'D-', octave: 0 },
  d: { note: 'D#', octave: 0 },
  c: { note: 'E-', octave: 0 },
  v: { note: 'F-', octave: 0 },
  g: { note: 'F#', octave: 0 },
  b: { note: 'G-', octave: 0 },
  h: { note: 'G#', octave: 0 },
  n: { note: 'A-', octave: 0 },
  j: { note: 'A#', octave: 0 },
  m: { note: 'B-', octave: 0 },

  // Upper row (C to E, one octave higher)
  q: { note: 'C-', octave: 1 },
  '2': { note: 'C#', octave: 1 },
  w: { note: 'D-', octave: 1 },
  '3': { note: 'D#', octave: 1 },
  e: { note: 'E-', octave: 1 },
  r: { note: 'F-', octave: 1 },
  '5': { note: 'F#', octave: 1 },
  t: { note: 'G-', octave: 1 },
  '6': { note: 'G#', octave: 1 },
  y: { note: 'A-', octave: 1 },
  '7': { note: 'A#', octave: 1 },
  u: { note: 'B-', octave: 1 },
};
