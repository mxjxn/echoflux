import { create } from 'zustand';

// Simplified types for the web app (mirroring music-engine types)
export interface Note {
  step: number;
  pitch: number;
  velocity: number;
  duration: number;
}

export interface SynthParams {
  [key: string]: number;
}

export interface Sequence {
  id?: string;
  name: string;
  synthName: string;
  bpm: number;
  notes: Note[];
  synthParams: SynthParams;
  authorId?: string;
  parentId?: string;
}

interface SequencerState {
  sequence: Sequence;
  isPlaying: boolean;
  currentStep: number;
  selectedPitch: number;
  selectedVelocity: number;
  setSequence: (sequence: Partial<Sequence>) => void;
  toggleNote: (step: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentStep: (step: number) => void;
  setSelectedPitch: (pitch: number) => void;
  setSelectedVelocity: (velocity: number) => void;
  updateSynthParam: (key: string, value: number) => void;
  setBpm: (bpm: number) => void;
  setSynthName: (name: string) => void;
  clearSequence: () => void;
}

const defaultSequence: Sequence = {
  name: 'Untitled',
  synthName: 'beep',
  bpm: 120,
  notes: [],
  synthParams: { amp: 0.8, release: 0.3 },
};

export const useSequencerStore = create<SequencerState>((set) => ({
  sequence: defaultSequence,
  isPlaying: false,
  currentStep: 0,
  selectedPitch: 60, // Middle C
  selectedVelocity: 100,

  setSequence: (sequence) =>
    set((state) => ({
      sequence: { ...state.sequence, ...sequence },
    })),

  toggleNote: (step) =>
    set((state) => {
      const existingNoteIndex = state.sequence.notes.findIndex((n) => n.step === step);

      if (existingNoteIndex >= 0) {
        // Remove note
        return {
          sequence: {
            ...state.sequence,
            notes: state.sequence.notes.filter((_, i) => i !== existingNoteIndex),
          },
        };
      } else {
        // Add note
        return {
          sequence: {
            ...state.sequence,
            notes: [
              ...state.sequence.notes,
              {
                step,
                pitch: state.selectedPitch,
                velocity: state.selectedVelocity,
                duration: 1,
              },
            ],
          },
        };
      }
    }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedPitch: (pitch) => set({ selectedPitch: pitch }),
  setSelectedVelocity: (velocity) => set({ selectedVelocity: velocity }),

  updateSynthParam: (key, value) =>
    set((state) => ({
      sequence: {
        ...state.sequence,
        synthParams: {
          ...state.sequence.synthParams,
          [key]: value,
        },
      },
    })),

  setBpm: (bpm) =>
    set((state) => ({
      sequence: { ...state.sequence, bpm },
    })),

  setSynthName: (name) =>
    set((state) => ({
      sequence: { ...state.sequence, synthName: name },
    })),

  clearSequence: () =>
    set({
      sequence: { ...defaultSequence, notes: [] },
      isPlaying: false,
      currentStep: 0,
    }),
}));
