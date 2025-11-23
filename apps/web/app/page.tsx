'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-surfaceLight bg-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EchoFlux
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/sequencer"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 transition"
              >
                Sequencer
              </Link>
              <Link
                href="/tracker"
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surfaceLight transition"
              >
                Tracker
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

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Create. Share. Remix.
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            A collaborative music creation demo powered by SuperSonic WebAssembly audio synthesis.
            This is a prototype showcasing different approaches to web-based music production.
          </p>
          <div className="px-6 py-3 rounded-lg bg-yellow-900/20 border border-yellow-600/50 text-yellow-200 text-sm inline-block mb-12">
            ⚡ Demo Application - Explore different music creation tools below
          </div>
        </div>

        {/* Feature Sections */}
        <div className="max-w-6xl mx-auto space-y-20 mt-20">
          
          {/* Sequencer Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-5xl mb-4">🎹</div>
              <h3 className="text-3xl font-bold mb-4">Step Sequencer</h3>
              <p className="text-gray-400 mb-6">
                Create beats and melodies with an intuitive 16-step sequencer. Perfect for building 4-bar loops
                with visual step programming. Great for beginners and quick idea sketching.
              </p>
              <ul className="space-y-2 mb-6 text-gray-300">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>16-step grid sequencer for rhythm and melody</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>120+ Sonic Pi synthdefs (beep, saw, tb303, prophet, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Real-time parameter control (BPM, pitch, velocity)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Save and share your sequences to the community feed</span>
                </li>
              </ul>
              <Link
                href="/sequencer"
                className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition text-lg font-semibold"
              >
                Try the Sequencer →
              </Link>
            </div>
            <div className="p-8 rounded-lg bg-surface border border-surfaceLight">
              <div className="aspect-video bg-background rounded flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎵</div>
                  <p>Visual step sequencer interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracker Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="text-5xl mb-4">🎼</div>
              <h3 className="text-3xl font-bold mb-4">Music Tracker</h3>
              <p className="text-gray-400 mb-6">
                Professional tracker-style editor with vim-like navigation for advanced users.
                Compose patterns with keyboard-driven workflow and modal editing.
              </p>
              <ul className="space-y-2 mb-6 text-gray-300">
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Vim-style navigation (h/j/k/l) and modal editing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Pattern-based composition with rows and channels</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Normal and Insert modes for efficient workflow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>QWERTY keyboard as piano input (z-m, q-u octaves)</span>
                </li>
              </ul>
              <Link
                href="/tracker"
                className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-secondary to-primary hover:opacity-90 transition text-lg font-semibold"
              >
                Try the Tracker →
              </Link>
            </div>
            <div className="md:order-1 p-8 rounded-lg bg-surface border border-surfaceLight">
              <div className="aspect-video bg-background rounded flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p>Tracker-style pattern editor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jam Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-3xl font-bold mb-4">Collaborative Jam Sessions</h3>
              <p className="text-gray-400 mb-6">
                Create or join live jam sessions to make music together in real-time with friends.
                Pattern-based synchronization ensures low latency across all participants.
              </p>
              <ul className="space-y-2 mb-6 text-gray-300">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Real-time collaboration with up to 8 users simultaneously</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Low-latency pattern-based sync ({"<"}50ms)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>User presence indicators with color-coded badges</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Coordinated playback across all connected clients</span>
                </li>
              </ul>
              <Link
                href="/jam"
                className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition text-lg font-semibold"
              >
                Start a Jam Session →
              </Link>
            </div>
            <div className="p-8 rounded-lg bg-surface border border-surfaceLight">
              <div className="aspect-video bg-background rounded flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <p>Real-time collaborative interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-3xl font-bold mb-4">Social Feed & Remixing</h3>
              <p className="text-gray-400 mb-6">
                Browse sequences shared by the community. Play, remix, and build upon others&apos; creations
                to create collaborative musical conversations.
              </p>
              <ul className="space-y-2 mb-6 text-gray-300">
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Browse and play community-created sequences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>One-click remix system with provenance tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Engagement metrics (plays, remixes)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Share your creations with the world</span>
                </li>
              </ul>
              <Link
                href="/feed"
                className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-secondary to-primary hover:opacity-90 transition text-lg font-semibold"
              >
                Browse the Feed →
              </Link>
            </div>
            <div className="md:order-1 p-8 rounded-lg bg-surface border border-surfaceLight">
              <div className="aspect-video bg-background rounded flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📡</div>
                  <p>Community feed interface</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tech Info */}
        <div className="max-w-4xl mx-auto mt-20 p-8 rounded-lg bg-surface/50 border border-surfaceLight">
          <h3 className="text-2xl font-bold mb-4 text-center">Powered by SuperSonic</h3>
          <p className="text-gray-400 text-center mb-4">
            All audio synthesis runs entirely in your browser using SuperSonic (SuperCollider compiled to WebAssembly).
            No plugins, no downloads - just pure web audio technology.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <span>Next.js 14</span>
            <span>•</span>
            <span>WebAssembly</span>
            <span>•</span>
            <span>Socket.IO</span>
            <span>•</span>
            <span>AudioWorklet</span>
          </div>
        </div>
      </div>
    </main>
  );
}
