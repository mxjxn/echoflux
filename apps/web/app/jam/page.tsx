'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCollaboration } from '@/hooks/useCollaboration';

export default function JamLobbyPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const { createSession, connected } = useCollaboration();

  const handleCreate = () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    createSession(username);
  };

  const handleJoin = () => {
    if (!username.trim() || !sessionId.trim()) {
      alert('Please enter both username and session ID');
      return;
    }
    router.push(`/session/${sessionId}?username=${encodeURIComponent(username)}`);
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
            <nav className="flex gap-4">
              <Link
                href="/sequencer"
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surfaceLight transition"
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
                className="px-4 py-2 rounded-lg bg-primary text-white"
              >
                Jam
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Collaborative Jam Session</h2>
            <p className="text-gray-400">
              Create or join a live session to make music together in real-time
            </p>
            {!connected && (
              <div className="mt-4 px-4 py-2 rounded bg-yellow-900/20 border border-yellow-600/50 text-yellow-200 text-sm inline-block">
                ⚡ Connecting to server...
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition ${
                mode === 'create'
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-surfaceLight'
              }`}
            >
              Create Session
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition ${
                mode === 'join'
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-surfaceLight'
              }`}
            >
              Join Session
            </button>
          </div>

          {/* Form */}
          <div className="p-8 rounded-lg bg-surface border border-surfaceLight">
            {mode === 'create' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username..."
                    className="w-full px-4 py-3 bg-background border border-surfaceLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!connected}
                  className={`w-full px-6 py-4 rounded-lg bg-gradient-to-r from-primary to-secondary font-semibold text-lg transition ${
                    !connected ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                >
                  🎵 Create Jam Session
                </button>

                <div className="text-sm text-gray-400 text-center">
                  A unique session code will be generated that you can share with others
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username..."
                    className="w-full px-4 py-3 bg-background border border-surfaceLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Session ID</label>
                  <input
                    type="text"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Enter session ID..."
                    className="w-full px-4 py-3 bg-background border border-surfaceLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  />
                </div>

                <button
                  onClick={handleJoin}
                  disabled={!connected}
                  className={`w-full px-6 py-4 rounded-lg bg-gradient-to-r from-primary to-secondary font-semibold text-lg transition ${
                    !connected ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                >
                  🚀 Join Jam Session
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎹</div>
              <h3 className="font-semibold mb-1">Real-time Sync</h3>
              <p className="text-sm text-gray-400">
                See changes instantly as others edit
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-1">Up to 8 Users</h3>
              <p className="text-sm text-gray-400">
                Jam together with friends
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Low Latency</h3>
              <p className="text-sm text-gray-400">
                Pattern-based sync, not message streaming
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
