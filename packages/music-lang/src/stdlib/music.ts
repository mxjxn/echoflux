/**
 * Music-specific standard library functions
 * Similar to Overtone's music theory helpers
 */

import { RuntimeValue, Environment, NOTE_TO_MIDI, CHORD_PATTERNS, SCALE_PATTERNS } from '../types';
import { MusicEngine } from '@echoflux/music-engine';

export function setupMusicStdlib(env: Environment, engine: MusicEngine): void {
  /**
   * (note :C4) => 60
   * Convert note name to MIDI number
   */
  env.set('note', {
    type: 'function',
    params: ['note-name'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'note',
    __native__: (noteName: RuntimeValue): RuntimeValue => {
      if (noteName.type !== 'keyword' && noteName.type !== 'string') {
        throw new Error('note requires a keyword or string');
      }

      const noteStr = noteName.value.toUpperCase();
      const match = noteStr.match(/^([A-G][#b]?)(\d+)$/);

      if (!match) {
        throw new Error(`Invalid note format: ${noteStr}`);
      }

      const [, note, octave] = match;
      const octaveNum = parseInt(octave, 10);

      if (!(note in NOTE_TO_MIDI)) {
        throw new Error(`Invalid note: ${note}`);
      }

      const midiNote = NOTE_TO_MIDI[note] + (octaveNum + 1) * 12;
      return { type: 'number', value: midiNote };
    },
  } as any);

  /**
   * (midi->freq 60) => 261.63
   * Convert MIDI note number to frequency
   */
  env.set('midi->freq', {
    type: 'function',
    params: ['midi'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'midi->freq',
    __native__: (midi: RuntimeValue): RuntimeValue => {
      if (midi.type !== 'number') {
        throw new Error('midi->freq requires a number');
      }

      const freq = 440 * Math.pow(2, (midi.value - 69) / 12);
      return { type: 'number', value: freq };
    },
  } as any);

  /**
   * (chord :C4 :maj7) => [60 64 67 71]
   * Generate chord notes
   */
  env.set('chord', {
    type: 'function',
    params: ['root', 'type'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'chord',
    __native__: (root: RuntimeValue, chordType: RuntimeValue): RuntimeValue => {
      // Parse root note
      let rootMidi: number;
      if (root.type === 'number') {
        rootMidi = root.value;
      } else if (root.type === 'keyword' || root.type === 'string') {
        const noteStr = root.value.toUpperCase();
        const match = noteStr.match(/^([A-G][#b]?)(\d+)$/);
        if (!match) {
          throw new Error(`Invalid note format: ${noteStr}`);
        }
        const [, note, octave] = match;
        rootMidi = NOTE_TO_MIDI[note] + (parseInt(octave, 10) + 1) * 12;
      } else {
        throw new Error('chord root must be a note keyword or MIDI number');
      }

      // Get chord pattern
      if (chordType.type !== 'keyword' && chordType.type !== 'string') {
        throw new Error('chord type must be a keyword or string');
      }

      const pattern = CHORD_PATTERNS[chordType.value];
      if (!pattern) {
        throw new Error(`Unknown chord type: ${chordType.value}`);
      }

      // Generate chord notes
      const notes = pattern.map(interval => ({
        type: 'number' as const,
        value: rootMidi + interval,
      }));

      return { type: 'vector', elements: notes };
    },
  } as any);

  /**
   * (scale :C4 :major) => [60 62 64 65 67 69 71]
   * Generate scale notes
   */
  env.set('scale', {
    type: 'function',
    params: ['root', 'type'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'scale',
    __native__: (root: RuntimeValue, scaleType: RuntimeValue): RuntimeValue => {
      // Parse root note
      let rootMidi: number;
      if (root.type === 'number') {
        rootMidi = root.value;
      } else if (root.type === 'keyword' || root.type === 'string') {
        const noteStr = root.value.toUpperCase();
        const match = noteStr.match(/^([A-G][#b]?)(\d+)$/);
        if (!match) {
          throw new Error(`Invalid note format: ${noteStr}`);
        }
        const [, note, octave] = match;
        rootMidi = NOTE_TO_MIDI[note] + (parseInt(octave, 10) + 1) * 12;
      } else {
        throw new Error('scale root must be a note keyword or MIDI number');
      }

      // Get scale pattern
      if (scaleType.type !== 'keyword' && scaleType.type !== 'string') {
        throw new Error('scale type must be a keyword or string');
      }

      const pattern = SCALE_PATTERNS[scaleType.value];
      if (!pattern) {
        throw new Error(`Unknown scale type: ${scaleType.value}`);
      }

      // Generate scale notes
      const notes = pattern.map(interval => ({
        type: 'number' as const,
        value: rootMidi + interval,
      }));

      return { type: 'vector', elements: notes };
    },
  } as any);

  /**
   * (bpm) => current BPM
   * (bpm 120) => set BPM to 120
   */
  env.set('bpm', {
    type: 'function',
    params: [],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'bpm',
    __native__: (...args: RuntimeValue[]): RuntimeValue => {
      if (args.length === 0) {
        const seq = engine.getCurrentSequence();
        return { type: 'number', value: seq?.bpm || 120 };
      }

      if (args.length === 1 && args[0].type === 'number') {
        const seq = engine.getCurrentSequence();
        if (seq) {
          seq.bpm = args[0].value;
        }
        return args[0];
      }

      throw new Error('bpm requires 0 or 1 number argument');
    },
  } as any);

  /**
   * (play-note note-or-freq)
   * Play a single note immediately via OSC
   */
  env.set('play-note', {
    type: 'function',
    params: ['note'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'play-note',
    __native__: (note: RuntimeValue): RuntimeValue => {
      if (note.type !== 'number') {
        throw new Error('play-note requires a number (MIDI note or frequency)');
      }

      // Trigger synth via OSC using the engine
      const nodeId = engine.triggerSynth('sonic-pi-beep', {
        note: note.value,
        amp: 0.5,
        pan: 0,
      });

      return { type: 'number', value: nodeId };
    },
  } as any);

  /**
   * (synth synth-name {params})
   * Trigger a synth with parameters via OSC
   * Example: (synth :beep {:note 60 :amp 0.5})
   */
  env.set('synth', {
    type: 'function',
    params: ['name', 'params'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'synth',
    __native__: (name: RuntimeValue, params?: RuntimeValue): RuntimeValue => {
      if (name.type !== 'keyword' && name.type !== 'string') {
        throw new Error('synth requires a keyword or string as synth name');
      }

      // Default synth name mapping
      let synthName = name.value;
      if (!synthName.startsWith('sonic-pi-')) {
        synthName = `sonic-pi-${synthName}`;
      }

      // Extract parameters from map
      const synthParams: { [key: string]: number } = {};

      if (params) {
        if (params.type === 'map') {
          for (const [key, value] of params.pairs.entries()) {
            // Remove ':' prefix from keyword keys
            const paramName = key.startsWith(':') ? key.substring(1) : key;

            if (value.type === 'number') {
              synthParams[paramName] = value.value;
            }
          }
        } else {
          throw new Error('synth params must be a map');
        }
      }

      // Trigger synth via OSC
      const nodeId = engine.triggerSynth(synthName, synthParams);

      return { type: 'number', value: nodeId };
    },
  } as any);

  /**
   * (free node-id)
   * Free a synth node via OSC
   */
  env.set('free', {
    type: 'function',
    params: ['node-id'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'free',
    __native__: (nodeId: RuntimeValue): RuntimeValue => {
      if (nodeId.type !== 'number') {
        throw new Error('free requires a number (node ID)');
      }

      engine.freeSynth(nodeId.value);

      return { type: 'nil' };
    },
  } as any);

  /**
   * (set-param node-id param-name value)
   * Set a parameter on a running synth via OSC
   */
  env.set('set-param', {
    type: 'function',
    params: ['node-id', 'param', 'value'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'set-param',
    __native__: (nodeId: RuntimeValue, param: RuntimeValue, value: RuntimeValue): RuntimeValue => {
      if (nodeId.type !== 'number') {
        throw new Error('set-param requires a number as node ID');
      }

      if (param.type !== 'keyword' && param.type !== 'string') {
        throw new Error('set-param requires a keyword or string as param name');
      }

      if (value.type !== 'number') {
        throw new Error('set-param requires a number as value');
      }

      const paramName = param.value;
      engine.setSynthParam(nodeId.value, paramName, value.value);

      return { type: 'nil' };
    },
  } as any);

  /**
   * (osc address ...args)
   * Send raw OSC message to scsynth
   * Example: (osc "/s_new" "sonic-pi-beep" -1 0 0 "note" 60)
   */
  env.set('osc', {
    type: 'function',
    params: [],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'osc',
    __native__: (...args: RuntimeValue[]): RuntimeValue => {
      if (args.length === 0) {
        throw new Error('osc requires at least an address argument');
      }

      const address = args[0];
      if (address.type !== 'string' && address.type !== 'keyword') {
        throw new Error('osc address must be a string or keyword');
      }

      // Convert runtime values to native types for OSC
      const oscArgs: any[] = [address.value];

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        switch (arg.type) {
          case 'number':
            oscArgs.push(arg.value);
            break;
          case 'string':
            oscArgs.push(arg.value);
            break;
          case 'keyword':
            oscArgs.push(arg.value);
            break;
          default:
            throw new Error(`Cannot convert ${arg.type} to OSC argument`);
        }
      }

      // Send raw OSC message
      const [addr, ...rest] = oscArgs;
      engine.sendOSC(addr, ...rest);

      return { type: 'nil' };
    },
  } as any);

  /**
   * (sleep seconds)
   * Sleep for given duration (useful for patterns)
   */
  env.set('sleep', {
    type: 'function',
    params: ['duration'],
    body: { type: 'symbol', value: '__native__' },
    closure: env,
    name: 'sleep',
    __native__: (duration: RuntimeValue): RuntimeValue => {
      if (duration.type !== 'number') {
        throw new Error('sleep requires a number');
      }

      // Note: This is a placeholder - real scheduling would need a proper scheduler
      console.log(`Sleep for ${duration.value} seconds`);

      return { type: 'nil' };
    },
  } as any);
}
