/**
 * Tracker state management with Zustand
 */

import { create } from 'zustand';
import type {
  TrackerState,
  TrackerSong,
  Pattern,
  PatternRow,
  Instrument,
  EditorMode,
  CursorPosition,
  Note,
  ColumnType,
} from './types';
import { handleNavigation, NavigationAction } from './navigation';

interface TrackerActions {
  // Mode management
  setMode: (mode: EditorMode) => void;
  enterInsertMode: () => void;
  exitInsertMode: () => void;

  // Cursor movement
  moveCursor: (action: NavigationAction) => void;
  setCursor: (cursor: Partial<CursorPosition>) => void;

  // Pattern editing
  setNote: (row: number, note: Note | null) => void;
  setInstrument: (row: number, instrument: number | null) => void;
  setVolume: (row: number, volume: number | null) => void;
  setEffect: (row: number, effect: string | null) => void;
  clearRow: (row: number) => void;

  // Cell editing (at cursor position)
  setCurrentNote: (note: Note | null) => void;
  setCurrentInstrument: (instrument: number | null) => void;
  setCurrentVolume: (volume: number | null) => void;
  setCurrentEffect: (effect: string | null) => void;

  // Instrument management
  selectInstrument: (index: number) => void;
  addInstrument: (instrument: Instrument) => void;
  updateInstrument: (index: number, updates: Partial<Instrument>) => void;

  // Pattern management
  setCurrentPattern: (index: number) => void;
  addPattern: (pattern: Pattern) => void;

  // Playback
  setPlaying: (isPlaying: boolean) => void;
  setCurrentPlayRow: (row: number) => void;

  // Song management
  setBpm: (bpm: number) => void;
  setSongName: (name: string) => void;
}

const createEmptyPattern = (id: string, length: number = 64): Pattern => ({
  id,
  name: `Pattern ${id}`,
  length,
  rows: Array.from({ length }, () => ({
    note: null,
    instrument: null,
    volume: null,
    effect: null,
  })),
});

const createDefaultInstruments = (): Instrument[] => [
  {
    id: 0,
    name: 'Beep',
    synthName: 'beep',
    params: { amp: 0.8, release: 0.3 },
  },
  {
    id: 1,
    name: 'Saw',
    synthName: 'saw',
    params: { amp: 0.6, release: 0.5 },
  },
  {
    id: 2,
    name: 'TB-303',
    synthName: 'tb303',
    params: { amp: 0.7, release: 0.4, cutoff: 80, res: 0.7 },
  },
  {
    id: 3,
    name: 'Prophet',
    synthName: 'prophet',
    params: { amp: 0.8, release: 0.6 },
  },
];

const createDefaultSong = (): TrackerSong => ({
  id: 'default',
  name: 'Untitled',
  bpm: 125,
  patterns: [createEmptyPattern('0')],
  instruments: createDefaultInstruments(),
  patternOrder: [0],
});

export const useTrackerStore = create<TrackerState & TrackerActions>((set, get) => ({
  // Initial state
  song: createDefaultSong(),
  mode: 'normal' as EditorMode,
  cursor: {
    row: 0,
    pattern: 0,
    column: 'note' as ColumnType,
  },
  currentPattern: 0,
  isPlaying: false,
  currentPlayRow: 0,
  selectedInstrument: 0,

  // Mode actions
  setMode: (mode) => set({ mode }),
  enterInsertMode: () => set({ mode: 'insert' }),
  exitInsertMode: () => set({ mode: 'normal' }),

  // Cursor actions
  moveCursor: (action) => {
    const state = get();
    const pattern = state.song.patterns[state.currentPattern];
    const newCursor = handleNavigation(
      state.cursor,
      action,
      pattern.length,
      state.song.patterns.length
    );
    set({ cursor: newCursor });
  },

  setCursor: (cursor) =>
    set((state) => ({
      cursor: { ...state.cursor, ...cursor },
    })),

  // Pattern editing
  setNote: (row, note) =>
    set((state) => {
      const newSong = { ...state.song };
      const pattern = { ...newSong.patterns[state.currentPattern] };
      const rows = [...pattern.rows];
      rows[row] = { ...rows[row], note };
      pattern.rows = rows;
      newSong.patterns = [...newSong.patterns];
      newSong.patterns[state.currentPattern] = pattern;
      return { song: newSong };
    }),

  setInstrument: (row, instrument) =>
    set((state) => {
      const newSong = { ...state.song };
      const pattern = { ...newSong.patterns[state.currentPattern] };
      const rows = [...pattern.rows];
      rows[row] = { ...rows[row], instrument };
      pattern.rows = rows;
      newSong.patterns = [...newSong.patterns];
      newSong.patterns[state.currentPattern] = pattern;
      return { song: newSong };
    }),

  setVolume: (row, volume) =>
    set((state) => {
      const newSong = { ...state.song };
      const pattern = { ...newSong.patterns[state.currentPattern] };
      const rows = [...pattern.rows];
      rows[row] = { ...rows[row], volume };
      pattern.rows = rows;
      newSong.patterns = [...newSong.patterns];
      newSong.patterns[state.currentPattern] = pattern;
      return { song: newSong };
    }),

  setEffect: (row, effect) =>
    set((state) => {
      const newSong = { ...state.song };
      const pattern = { ...newSong.patterns[state.currentPattern] };
      const rows = [...pattern.rows];
      rows[row] = { ...rows[row], effect };
      pattern.rows = rows;
      newSong.patterns = [...newSong.patterns];
      newSong.patterns[state.currentPattern] = pattern;
      return { song: newSong };
    }),

  clearRow: (row) =>
    set((state) => {
      const newSong = { ...state.song };
      const pattern = { ...newSong.patterns[state.currentPattern] };
      const rows = [...pattern.rows];
      rows[row] = {
        note: null,
        instrument: null,
        volume: null,
        effect: null,
      };
      pattern.rows = rows;
      newSong.patterns = [...newSong.patterns];
      newSong.patterns[state.currentPattern] = pattern;
      return { song: newSong };
    }),

  // Current cell editing
  setCurrentNote: (note) => {
    const { cursor } = get();
    get().setNote(cursor.row, note);
  },

  setCurrentInstrument: (instrument) => {
    const { cursor } = get();
    get().setInstrument(cursor.row, instrument);
  },

  setCurrentVolume: (volume) => {
    const { cursor } = get();
    get().setVolume(cursor.row, volume);
  },

  setCurrentEffect: (effect) => {
    const { cursor } = get();
    get().setEffect(cursor.row, effect);
  },

  // Instrument management
  selectInstrument: (index) => set({ selectedInstrument: index }),

  addInstrument: (instrument) =>
    set((state) => ({
      song: {
        ...state.song,
        instruments: [...state.song.instruments, instrument],
      },
    })),

  updateInstrument: (index, updates) =>
    set((state) => {
      const instruments = [...state.song.instruments];
      instruments[index] = { ...instruments[index], ...updates };
      return {
        song: {
          ...state.song,
          instruments,
        },
      };
    }),

  // Pattern management
  setCurrentPattern: (index) =>
    set({
      currentPattern: index,
      cursor: { row: 0, pattern: index, column: 'note' },
    }),

  addPattern: (pattern) =>
    set((state) => ({
      song: {
        ...state.song,
        patterns: [...state.song.patterns, pattern],
      },
    })),

  // Playback
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentPlayRow: (row) => set({ currentPlayRow: row }),

  // Song management
  setBpm: (bpm) =>
    set((state) => ({
      song: { ...state.song, bpm },
    })),

  setSongName: (name) =>
    set((state) => ({
      song: { ...state.song, name },
    })),
}));
