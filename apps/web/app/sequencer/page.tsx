'use client';

import Link from 'next/link';
import { StepSequencer } from '@/components/StepSequencer';
import { SynthControls } from '@/components/SynthControls';
import { TransportControls } from '@/components/TransportControls';
import { useSequencerStore } from '@/lib/store';
import { useAudioEngine } from '@/hooks/useAudioEngine';

export default function SequencerPage() {
  const { sequence } = useSequencerStore();
  const { ready, loading, error } = useAudioEngine();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-surfaceLight bg-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer">
                EchoFlux
              </h1>
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/sequencer"
                className="px-4 py-2 rounded-lg bg-primary text-white"
              >
                Sequencer
              </Link>
              <Link
                href="/feed"
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surfaceLight transition"
              >
                Feed
              </Link>
              <Link
                href="/jam"
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surfaceLight transition"
              >
                Jam
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Sequence Name */}
        <div className="mb-6">
          <input
            type="text"
            value={sequence.name}
            onChange={(e) =>
              useSequencerStore.setState((state) => ({
                sequence: { ...state.sequence, name: e.target.value },
              }))
            }
            className="text-3xl font-bold bg-transparent border-b-2 border-transparent hover:border-surfaceLight focus:border-primary focus:outline-none transition"
            placeholder="Untitled Sequence"
          />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sequencer and Transport */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg bg-surface border border-surfaceLight">
              <StepSequencer />
            </div>

            <div className="p-6 rounded-lg bg-surface border border-surfaceLight">
              <TransportControls
                audioReady={ready}
                audioLoading={loading}
                audioError={error}
              />
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-lg bg-surface border border-surfaceLight sticky top-4">
              <SynthControls />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
