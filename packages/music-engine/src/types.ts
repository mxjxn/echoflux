/**
 * Represents a single note in a sequence
 */
export interface Note {
  step: number; // 0-15 for 16-step sequencer (4 bars of 4 steps each)
  pitch: number; // MIDI note number
  velocity: number; // 0-127
  duration: number; // in steps
}

/**
 * Synth parameter configuration
 */
export interface SynthParams {
  [key: string]: number;
}

/**
 * Complete sequence configuration
 */
export interface Sequence {
  id?: string;
  name: string;
  synthName: string;
  bpm: number;
  notes: Note[];
  synthParams: SynthParams;
  createdAt?: Date;
  authorId?: string;
  parentId?: string; // For remix tracking
}

/**
 * Available synthdefs from Sonic Pi
 */
export const AVAILABLE_SYNTHS = [
  'beep',
  'saw',
  'sine',
  'square',
  'tri',
  'pulse',
  'subpulse',
  'dsaw',
  'dtri',
  'dpulse',
  'fm',
  'mod_fm',
  'mod_saw',
  'mod_dsaw',
  'mod_sine',
  'mod_tri',
  'mod_pulse',
  'tb303',
  'supersaw',
  'hoover',
  'prophet',
  'zawa',
  'dark_ambience',
  'growl',
  'hollow',
  'pretty_bell',
  'dull_bell',
] as const;

export type SynthName = typeof AVAILABLE_SYNTHS[number];

/**
 * Audio engine state
 */
export type EngineState = 'uninitialized' | 'initializing' | 'ready' | 'error';
