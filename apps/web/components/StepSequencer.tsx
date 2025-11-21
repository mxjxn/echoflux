'use client';

import { useSequencerStore } from '@/lib/store';

const STEPS = 16; // 4 bars of 4 steps each

export function StepSequencer() {
  const { sequence, currentStep, isPlaying, toggleNote } = useSequencerStore();

  const hasNoteAt = (step: number) => {
    return sequence.notes.some((note) => note.step === step);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Step Sequencer</h3>
        <div className="text-sm text-gray-400">16 steps • 4 bars</div>
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-16 gap-1">
        {Array.from({ length: STEPS }).map((_, step) => {
          const isActive = hasNoteAt(step);
          const isCurrent = isPlaying && currentStep === step;
          const isBarStart = step % 4 === 0;

          return (
            <button
              key={step}
              onClick={() => toggleNote(step)}
              className={`
                aspect-square rounded transition-all
                ${isActive ? 'bg-primary hover:bg-primary/80' : 'bg-surface hover:bg-surfaceLight'}
                ${isCurrent ? 'ring-2 ring-white' : ''}
                ${isBarStart ? 'border-l-2 border-gray-600' : ''}
              `}
              title={`Step ${step + 1}`}
            />
          );
        })}
      </div>

      {/* Bar markers */}
      <div className="grid grid-cols-4 gap-1 text-center text-xs text-gray-500">
        <div>Bar 1</div>
        <div>Bar 2</div>
        <div>Bar 3</div>
        <div>Bar 4</div>
      </div>
    </div>
  );
}
