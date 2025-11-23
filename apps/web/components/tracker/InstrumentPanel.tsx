'use client';

import React, { useState } from 'react';
import { useTrackerStore } from '@echoflux/tracker';
import type { Instrument } from '@echoflux/tracker';

// Available SuperSonic synths (from music-engine package)
const AVAILABLE_SYNTHS = [
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
];

export function InstrumentPanel() {
  const { song, selectedInstrument, selectInstrument, addInstrument, updateInstrument } =
    useTrackerStore();
  const [isAddingInstrument, setIsAddingInstrument] = useState(false);
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [newInstrumentSynth, setNewInstrumentSynth] = useState('beep');

  const handleAddInstrument = () => {
    if (!newInstrumentName.trim()) return;

    const newInstrument: Instrument = {
      id: song.instruments.length,
      name: newInstrumentName,
      synthName: newInstrumentSynth,
      params: { amp: 0.8, release: 0.3 },
    };

    addInstrument(newInstrument);
    setIsAddingInstrument(false);
    setNewInstrumentName('');
    setNewInstrumentSynth('beep');
  };

  const selectedInst = song.instruments[selectedInstrument];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 font-mono border-l border-gray-700">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h2 className="text-sm font-bold">Instruments</h2>
      </div>

      {/* Instrument list */}
      <div className="flex-1 overflow-y-auto">
        {song.instruments.map((inst, index) => (
          <div
            key={inst.id}
            onClick={() => selectInstrument(index)}
            className={`px-4 py-2 cursor-pointer border-b border-gray-800 hover:bg-gray-800 ${
              selectedInstrument === index ? 'bg-blue-900' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">
                  {inst.id.toString().padStart(2, '0')}
                </span>
                <span className="text-sm">{inst.name}</span>
              </div>
              <span className="text-xs text-gray-400">{inst.synthName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add instrument section */}
      <div className="border-t border-gray-700">
        {isAddingInstrument ? (
          <div className="p-4 space-y-3">
            <input
              type="text"
              placeholder="Instrument name"
              value={newInstrumentName}
              onChange={(e) => setNewInstrumentName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <select
              value={newInstrumentSynth}
              onChange={(e) => setNewInstrumentSynth(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              {AVAILABLE_SYNTHS.map((synth) => (
                <option key={synth} value={synth}>
                  {synth}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddInstrument}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingInstrument(false);
                  setNewInstrumentName('');
                }}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingInstrument(true)}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 border-t border-gray-700 text-sm font-medium text-center"
          >
            + Add Instrument
          </button>
        )}
      </div>

      {/* Selected instrument details */}
      {selectedInst && (
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <h3 className="text-xs font-bold text-gray-400 mb-2">
            {selectedInst.id.toString().padStart(2, '0')} - {selectedInst.name}
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Synth:</span>
              <span className="text-cyan-400">{selectedInst.synthName}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-gray-400">Amp</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedInst.params.amp || 0.8}
                  onChange={(e) =>
                    updateInstrument(selectedInstrument, {
                      params: { ...selectedInst.params, amp: parseFloat(e.target.value) },
                    })
                  }
                  className="w-32"
                />
                <span className="text-gray-300 w-12 text-right">
                  {(selectedInst.params.amp || 0.8).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-400">Release</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={selectedInst.params.release || 0.3}
                  onChange={(e) =>
                    updateInstrument(selectedInstrument, {
                      params: { ...selectedInst.params, release: parseFloat(e.target.value) },
                    })
                  }
                  className="w-32"
                />
                <span className="text-gray-300 w-12 text-right">
                  {(selectedInst.params.release || 0.3).toFixed(2)}
                </span>
              </div>
              {selectedInst.params.cutoff !== undefined && (
                <div className="flex items-center justify-between">
                  <label className="text-gray-400">Cutoff</label>
                  <input
                    type="range"
                    min="20"
                    max="130"
                    step="1"
                    value={selectedInst.params.cutoff}
                    onChange={(e) =>
                      updateInstrument(selectedInstrument, {
                        params: { ...selectedInst.params, cutoff: parseFloat(e.target.value) },
                      })
                    }
                    className="w-32"
                  />
                  <span className="text-gray-300 w-12 text-right">
                    {selectedInst.params.cutoff}
                  </span>
                </div>
              )}
              {selectedInst.params.res !== undefined && (
                <div className="flex items-center justify-between">
                  <label className="text-gray-400">Resonance</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedInst.params.res}
                    onChange={(e) =>
                      updateInstrument(selectedInstrument, {
                        params: { ...selectedInst.params, res: parseFloat(e.target.value) },
                      })
                    }
                    className="w-32"
                  />
                  <span className="text-gray-300 w-12 text-right">
                    {selectedInst.params.res.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
