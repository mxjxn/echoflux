'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StepSequencer } from '@/components/StepSequencer';
import { SynthControls } from '@/components/SynthControls';
import { useSequencerStore } from '@/lib/store';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useEffect } from 'react';

function CollaborativeTransportControls({
  audioReady,
  audioLoading,
  audioError,
  onPlayPause,
  onClear,
}: {
  audioReady: boolean;
  audioLoading: boolean;
  audioError: string | null;
  onPlayPause: () => void;
  onClear: () => void;
}) {
  const { sequence, isPlaying } = useSequencerStore();

  return (
    <div className="space-y-4">
      {/* Audio Engine Status */}
      {audioLoading && (
        <div className="px-4 py-2 rounded bg-yellow-900/20 border border-yellow-600/50 text-yellow-200 text-sm">
          ⚡ Loading audio engine...
        </div>
      )}

      {audioError && (
        <div className="px-4 py-2 rounded bg-red-900/20 border border-red-600/50 text-red-200 text-sm">
          ⚠️ Audio engine error: {audioError}
        </div>
      )}

      {audioReady && !isPlaying && (
        <div className="px-4 py-2 rounded bg-green-900/20 border border-green-600/50 text-green-200 text-sm">
          ✓ Audio engine ready
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          disabled={!audioReady}
          className={`
            px-6 py-3 rounded-lg font-semibold transition
            ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/80'
            }
            ${!audioReady ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="px-6 py-3 rounded-lg bg-surface hover:bg-surfaceLight transition"
        >
          Clear
        </button>

        {/* Info */}
        <div className="ml-auto text-sm text-gray-400">
          Notes: {sequence.notes.length}
        </div>
      </div>
    </div>
  );
}

export default function CollaborativeSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const { sequence } = useSequencerStore();
  const { ready, loading, error } = useAudioEngine();
  const {
    connected,
    users,
    session,
    error: collabError,
    emitNoteToggle,
    emitPlaybackStart,
    emitPlaybackStop,
  } = useCollaboration(sessionId);

  // Sync note toggles
  useEffect(() => {
    // Listen for local note toggles and emit to server
    // This is handled in the useCollaboration hook
  }, []);

  const handlePlayPause = () => {
    const { isPlaying, setIsPlaying, setCurrentStep } = useSequencerStore.getState();

    if (isPlaying) {
      setIsPlaying(false);
      setCurrentStep(0);
      emitPlaybackStop();
    } else {
      setIsPlaying(true);
      emitPlaybackStart();
    }
  };

  const handleClear = () => {
    const { clearSequence } = useSequencerStore.getState();
    clearSequence();
    // TODO: Emit clear event
  };

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

            {/* Session Info */}
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="text-gray-400">Session ID:</div>
                <div className="font-mono font-semibold">{sessionId}</div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <Link
                href="/jam"
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surfaceLight transition"
              >
                Leave
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* User List Bar */}
      <div className="border-b border-surfaceLight bg-surface/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Users ({users.length}):</span>
            <div className="flex gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${user.color}20`,
                    borderColor: user.color,
                    borderWidth: '1px',
                    color: user.color,
                  }}
                >
                  {user.username}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {collabError && (
        <div className="container mx-auto px-4 py-4">
          <div className="px-4 py-3 rounded bg-red-900/20 border border-red-600/50 text-red-200">
            ⚠️ {collabError}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Sequence Name */}
        <div className="mb-6">
          <input
            type="text"
            value={session?.pattern.name || sequence.name}
            onChange={(e) =>
              useSequencerStore.setState((state) => ({
                sequence: { ...state.sequence, name: e.target.value },
              }))
            }
            className="text-3xl font-bold bg-transparent border-b-2 border-transparent hover:border-surfaceLight focus:border-primary focus:outline-none transition"
            placeholder="Collaborative Jam"
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
              <CollaborativeTransportControls
                audioReady={ready}
                audioLoading={loading}
                audioError={error}
                onPlayPause={handlePlayPause}
                onClear={handleClear}
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
