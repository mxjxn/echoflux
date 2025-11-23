/**
 * Core types for the music tracker
 */

export type NoteValue =
  | 'C-'
  | 'C#'
  | 'D-'
  | 'D#'
  | 'E-'
  | 'F-'
  | 'F#'
  | 'G-'
  | 'G#'
  | 'A-'
  | 'A#'
  | 'B-'
  | '---' // Empty/rest
  | 'OFF'; // Note off

export interface Note {
  note: NoteValue;
  octave: number; // 0-8
}

export interface PatternRow {
  note: Note | null;
  instrument: number | null; // Index into instrument list
  volume: number | null; // 0-127
  panning: number | null; // 0-255, 128=center (00-FF in hex)
  delay: number | null; // 0-255 (00-FF in hex)
  effect: string | null; // Effect command (e.g., "0100" for arpeggio)
}

export interface Pattern {
  id: string;
  name: string;
  rows: PatternRow[];
  length: number; // Number of rows (typically 64)
}

export interface Instrument {
  id: number;
  name: string;
  synthName: string; // SuperSonic synth name
  params: {
    amp?: number;
    release?: number;
    cutoff?: number;
    res?: number;
    [key: string]: number | undefined;
  };
}

export interface TrackerSong {
  id: string;
  name: string;
  bpm: number;
  patterns: Pattern[];
  instruments: Instrument[];
  patternOrder: number[]; // Order to play patterns
}

export type EditorMode = 'normal' | 'insert';

export type ColumnType = 'note' | 'instrument' | 'volume' | 'panning' | 'delay' | 'effect';

export interface CursorPosition {
  row: number;
  pattern: number;
  column: ColumnType;
}

export interface TrackerState {
  song: TrackerSong;
  mode: EditorMode;
  cursor: CursorPosition;
  currentPattern: number;
  isPlaying: boolean;
  currentPlayRow: number;
  selectedInstrument: number;
}
