'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSequencerStore, Note, Sequence } from '@/lib/store';
import { useSuperSonic } from '@/hooks/useSuperSonic';

/**
 * Scheduled note event with precise timing
 */
interface ScheduledNote {
  time: number;
  note: Note;
}

/**
 * Hook to manage audio playback using SuperSonic with bundle-based scheduling
 *
 * Instead of triggering notes in real-time with setInterval, this approach:
 * 1. Pre-calculates all note times for the entire sequence
 * 2. Schedules them as a bundle with precise timestamps
 * 3. Only re-schedules when pattern changes (not every step)
 * 4. Uses high-precision timing for sync
 */
export function useAudioEngine() {
  const { sonic, loading, error } = useSuperSonic();
  const { sequence, isPlaying, currentStep, setCurrentStep, setIsPlaying } = useSequencerStore();

  const schedulerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastScheduledPatternRef = useRef<string>('');
  const currentLoopRef = useRef<number>(0);

  // Convert synth name to Sonic Pi format
  const getSynthDefName = (synthName: string) => {
    return `sonic-pi-${synthName.replace('_', '_')}`;
  };

  /**
   * Calculate exact playback times for all notes in the sequence
   * Returns an array of {time, note} objects with precise timestamps
   */
  const calculateSchedule = useCallback((
    sequence: Sequence,
    startTime: number
  ): ScheduledNote[] => {
    const schedule: ScheduledNote[] = [];
    const stepDuration = 60 / sequence.bpm / 4; // Quarter note = 4 steps

    // Pre-calculate all 16 steps
    for (let step = 0; step < 16; step++) {
      const notesAtStep = sequence.notes.filter(n => n.step === step);
      const stepTime = startTime + (step * stepDuration);

      notesAtStep.forEach(note => {
        schedule.push({
          time: stepTime,
          note
        });
      });
    }

    return schedule;
  }, []);

  /**
   * Schedule a single note with SuperSonic
   */
  const scheduleNote = useCallback((
    time: number,
    note: Note,
    synthName: string,
    synthParams: any
  ) => {
    if (!sonic) return;

    try {
      const synthDef = getSynthDefName(synthName);
      const amp = (note.velocity / 127) * (synthParams.amp || 0.8);
      const release = synthParams.release || 0.3;

      // Schedule note at precise time
      // Note: SuperSonic's send() might not support timetags yet
      // For now we'll use setTimeout with high precision
      const now = performance.now() / 1000;
      const delay = Math.max(0, time - now);

      setTimeout(() => {
        sonic.send('/s_new', synthDef, -1, 0, 0, 'note', note.pitch, 'amp', amp, 'release', release);
      }, delay * 1000);
    } catch (err) {
      console.error('Error scheduling note:', err);
    }
  }, [sonic]);

  /**
   * Schedule entire pattern as a bundle
   */
  const schedulePattern = useCallback((sequence: Sequence, startTime: number) => {
    const schedule = calculateSchedule(sequence, startTime);

    // Schedule all notes
    schedule.forEach(({ time, note }) => {
      scheduleNote(time, note, sequence.synthName, sequence.synthParams);
    });

    // Calculate loop duration (16 steps)
    const loopDuration = (60 / sequence.bpm / 4) * 16;

    return loopDuration;
  }, [calculateSchedule, scheduleNote]);

  /**
   * Visual step indicator update loop (runs independently of audio)
   */
  const updateStepIndicator = useCallback(() => {
    if (!isPlaying) return;

    const now = performance.now() / 1000;
    const elapsed = now - startTimeRef.current;
    const stepDuration = 60 / sequence.bpm / 4;
    const currentStepCalc = Math.floor(elapsed / stepDuration) % 16;

    setCurrentStep(currentStepCalc);

    schedulerRef.current = requestAnimationFrame(updateStepIndicator);
  }, [isPlaying, sequence.bpm, setCurrentStep]);

  /**
   * Main playback effect
   */
  useEffect(() => {
    if (!sonic || !isPlaying) {
      if (schedulerRef.current !== null) {
        cancelAnimationFrame(schedulerRef.current);
        schedulerRef.current = null;
      }
      return;
    }

    // Get pattern fingerprint to detect changes
    const patternFingerprint = JSON.stringify({
      notes: sequence.notes,
      synth: sequence.synthName,
      params: sequence.synthParams,
      bpm: sequence.bpm
    });

    // Check if this is a new playback or pattern changed
    const isNewPattern = patternFingerprint !== lastScheduledPatternRef.current;

    if (isNewPattern) {
      // Reset and schedule from beginning
      startTimeRef.current = performance.now() / 1000;
      currentLoopRef.current = 0;
      lastScheduledPatternRef.current = patternFingerprint;

      // Schedule initial loop
      const loopDuration = schedulePattern(sequence, startTimeRef.current);

      // Schedule future loops
      const scheduleNextLoop = () => {
        currentLoopRef.current++;
        const nextLoopStart = startTimeRef.current + (loopDuration * currentLoopRef.current);
        const now = performance.now() / 1000;

        // Schedule ahead by 1 loop
        if (nextLoopStart - now < loopDuration * 2) {
          schedulePattern(sequence, nextLoopStart);
          setTimeout(scheduleNextLoop, loopDuration * 1000 * 0.5); // Check halfway through loop
        }
      };

      // Start scheduling future loops
      setTimeout(scheduleNextLoop, loopDuration * 1000 * 0.5);
    }

    // Start visual update loop
    updateStepIndicator();

    return () => {
      if (schedulerRef.current !== null) {
        cancelAnimationFrame(schedulerRef.current);
      }
    };
  }, [sonic, isPlaying, sequence, schedulePattern, updateStepIndicator]);

  /**
   * Play a single note immediately (for preview/testing)
   */
  const playNote = useCallback((note: Note) => {
    if (!sonic) return;

    try {
      const synthDef = getSynthDefName(sequence.synthName);
      const amp = (note.velocity / 127) * (sequence.synthParams.amp || 0.8);
      const release = sequence.synthParams.release || 0.3;

      sonic.send('/s_new', synthDef, -1, 0, 0, 'note', note.pitch, 'amp', amp, 'release', release);
    } catch (err) {
      console.error('Error playing note:', err);
    }
  }, [sonic, sequence.synthName, sequence.synthParams]);

  return {
    ready: !loading && !error && !!sonic,
    loading,
    error,
    playNote,
    schedulePattern, // Exposed for collaborative sessions
  };
}
