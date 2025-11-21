'use client';

import { useSequencerStore } from '@/lib/store';

const AVAILABLE_SYNTHS = [
  'beep',
  'saw',
  'sine',
  'square',
  'tri',
  'pulse',
  'tb303',
  'prophet',
  'pretty_bell',
  'dull_bell',
  'dark_ambience',
];

const NOTES = [
  { name: 'C3', midi: 48 },
  { name: 'D3', midi: 50 },
  { name: 'E3', midi: 52 },
  { name: 'F3', midi: 53 },
  { name: 'G3', midi: 55 },
  { name: 'A3', midi: 57 },
  { name: 'B3', midi: 59 },
  { name: 'C4', midi: 60 },
  { name: 'D4', midi: 62 },
  { name: 'E4', midi: 64 },
  { name: 'F4', midi: 65 },
  { name: 'G4', midi: 67 },
];

export function SynthControls() {
  const {
    sequence,
    selectedPitch,
    selectedVelocity,
    setSelectedPitch,
    setSelectedVelocity,
    updateSynthParam,
    setBpm,
    setSynthName,
  } = useSequencerStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Synth Controls</h3>
      </div>

      {/* Synth Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Synthesizer</label>
        <select
          value={sequence.synthName}
          onChange={(e) => setSynthName(e.target.value)}
          className="w-full px-3 py-2 bg-surface border border-surfaceLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {AVAILABLE_SYNTHS.map((synth) => (
            <option key={synth} value={synth}>
              {synth}
            </option>
          ))}
        </select>
      </div>

      {/* BPM Control */}
      <div>
        <label className="block text-sm font-medium mb-2">
          BPM: {sequence.bpm}
        </label>
        <input
          type="range"
          min="60"
          max="180"
          value={sequence.bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Pitch Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Note Pitch</label>
        <div className="grid grid-cols-4 gap-2">
          {NOTES.map((note) => (
            <button
              key={note.midi}
              onClick={() => setSelectedPitch(note.midi)}
              className={`
                px-3 py-2 rounded transition
                ${
                  selectedPitch === note.midi
                    ? 'bg-primary text-white'
                    : 'bg-surface hover:bg-surfaceLight'
                }
              `}
            >
              {note.name}
            </button>
          ))}
        </div>
      </div>

      {/* Velocity */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Velocity: {selectedVelocity}
        </label>
        <input
          type="range"
          min="0"
          max="127"
          value={selectedVelocity}
          onChange={(e) => setSelectedVelocity(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Synth Parameters */}
      <div className="space-y-4 pt-4 border-t border-surfaceLight">
        <h4 className="font-medium">Synth Parameters</h4>

        <div>
          <label className="block text-sm font-medium mb-2">
            Amplitude: {sequence.synthParams.amp?.toFixed(2) || 0.8}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sequence.synthParams.amp || 0.8}
            onChange={(e) => updateSynthParam('amp', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Release: {sequence.synthParams.release?.toFixed(2) || 0.3}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={sequence.synthParams.release || 0.3}
            onChange={(e) => updateSynthParam('release', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
