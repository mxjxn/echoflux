'use client';

import { useEffect, useRef } from 'react';
import { useSequencerStore, Note } from '@/lib/store';
import { useSuperSonic } from '@/hooks/useSuperSonic';

/**
 * Hook to manage audio playback using SuperSonic
 */
export function useAudioEngine() {
  const { sonic, loading, error } = useSuperSonic();
  const { sequence, isPlaying, currentStep, setCurrentStep } = useSequencerStore();
  const intervalRef = useRef<number | null>(null);

  // Convert synth name to Sonic Pi format
  const getSynthDefName = (synthName: string) => {
    return `sonic-pi-${synthName.replace('_', '_')}`;
  };

  // Convert MIDI note to frequency
  const midiToFreq = (midi: number) => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  };

  // Play a single note
  const playNote = (note: Note) => {
    if (!sonic) return;

    try {
      const synthDef = getSynthDefName(sequence.synthName);
      const freq = midiToFreq(note.pitch);
      const amp = (note.velocity / 127) * (sequence.synthParams.amp || 0.8);
      const release = sequence.synthParams.release || 0.3;

      // Send OSC message to create synth
      sonic.send('/s_new', synthDef, -1, 0, 0, 'note', note.pitch, 'amp', amp, 'release', release);
    } catch (err) {
      console.error('Error playing note:', err);
    }
  };

  // Handle playback
  useEffect(() => {
    if (!sonic || !isPlaying) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const stepDuration = (60 / sequence.bpm) * 1000 / 4; // 16th notes

    intervalRef.current = window.setInterval(() => {
      const nextStep = (currentStep + 1) % 16;

      // Play notes at current step
      const notesAtStep = sequence.notes.filter((note) => note.step === currentStep);
      notesAtStep.forEach(playNote);

      setCurrentStep(nextStep);
    }, stepDuration);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sonic, isPlaying, sequence, currentStep]);

  return {
    ready: !loading && !error && !!sonic,
    loading,
    error,
    playNote,
  };
}
