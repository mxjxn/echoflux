import { useEffect, useRef } from 'react';
import { useTrackerStore } from '@echoflux/tracker';
import type { Pattern, Instrument } from '@echoflux/tracker';

interface SuperSonicInstance {
  send: (address: string, ...args: any[]) => Promise<void>;
  audioContext?: AudioContext;
}

interface UseTrackerEngineOptions {
  sonic: SuperSonicInstance | null;
  onRowChange?: (row: number) => void;
}

export function useTrackerEngine({ sonic, onRowChange }: UseTrackerEngineOptions) {
  const { song, currentPattern, isPlaying, setCurrentPlayRow, setPlaying } = useTrackerStore();
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const currentRowRef = useRef<number>(0);

  const pattern = song.patterns[currentPattern];

  useEffect(() => {
    if (!isPlaying || !sonic) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const bpm = song.bpm;
    const rowsPerBeat = 4; // Standard tracker: 4 rows per beat
    const rowDuration = (60 / bpm / rowsPerBeat) * 1000; // milliseconds per row

    startTimeRef.current = performance.now();
    currentRowRef.current = 0;

    const playNote = (
      note: string,
      octave: number,
      instrument: Instrument,
      velocity: number = 100
    ) => {
      if (!sonic) return;

      // Convert note to MIDI number
      const noteNames = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
      const noteIndex = noteNames.indexOf(note);
      if (noteIndex === -1) return;

      const midiNote = octave * 12 + noteIndex + 12; // +12 to start at C0 = 12

      const amp = (velocity / 127) * (instrument.params.amp || 0.8);
      const release = instrument.params.release || 0.3;

      // Build SuperSonic OSC message arguments
      // Format: send(address, ...args) where args are key-value pairs
      // SuperSonic expects full synthdef name like 'sonic-pi-beep'
      const synthDefName = `sonic-pi-${instrument.synthName}`;
      const args: any[] = [
        synthDefName, // synth def name (full name with sonic-pi- prefix)
        -1, // node ID (-1 = auto-assign)
        0,  // add action (0 = add to head)
        0,  // target node ID
        'note', midiNote,
        'amp', amp,
        'release', release,
      ];

      // Add additional params if available
      if (instrument.params.cutoff !== undefined) {
        args.push('cutoff', instrument.params.cutoff);
      }
      if (instrument.params.res !== undefined) {
        args.push('res', instrument.params.res);
      }

      // Send OSC message: /s_new with arguments
      console.log('[useTrackerEngine] Sending note:', {
        synthDefName,
        midiNote,
        amp,
        release,
        args,
      });
      sonic.send('/s_new', ...args).catch((err) => {
        console.error('[useTrackerEngine] Error sending OSC message:', err);
      });
    };

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const currentRow = Math.floor(elapsed / rowDuration);

      if (currentRow >= pattern.length) {
        // Loop pattern
        startTimeRef.current = performance.now();
        currentRowRef.current = 0;
        setCurrentPlayRow(0);
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (currentRow !== currentRowRef.current) {
        currentRowRef.current = currentRow;
        setCurrentPlayRow(currentRow);
        if (onRowChange) {
          onRowChange(currentRow);
        }

        // Play notes in current row
        const row = pattern.rows[currentRow];
        if (row.note && row.instrument !== null) {
          const instrument = song.instruments[row.instrument];
          if (instrument && row.note.note !== '---' && row.note.note !== 'OFF') {
            const velocity = row.volume || 100;
            playNote(row.note.note, row.note.octave, instrument, velocity);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, sonic, song, pattern, currentPattern, setCurrentPlayRow, onRowChange]);

  const play = async () => {
    // Resume audio context if suspended (browsers require user interaction)
    if (sonic) {
      // Access audioContext through the instance (it's a getter property)
      const audioCtx = (sonic as any).audioContext;
      if (audioCtx && audioCtx.state === 'suspended') {
        console.log('[useTrackerEngine] Resuming audio context...');
        try {
          await audioCtx.resume();
          console.log('[useTrackerEngine] Audio context resumed, state:', audioCtx.state);
        } catch (err) {
          console.error('[useTrackerEngine] Failed to resume audio context:', err);
        }
      } else if (audioCtx) {
        console.log('[useTrackerEngine] Audio context state:', audioCtx.state);
      } else {
        console.warn('[useTrackerEngine] Audio context not available');
      }
    }
    setPlaying(true);
    setCurrentPlayRow(0);
  };

  const stop = () => {
    setPlaying(false);
    setCurrentPlayRow(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const playFromRow = (startRow: number) => {
    currentRowRef.current = startRow;
    setCurrentPlayRow(startRow);
    setPlaying(true);
  };

  return {
    play,
    stop,
    playFromRow,
  };
}
