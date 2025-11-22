'use client';

import { useState } from 'react';
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
          <p className="text-xl text-gray-400 mb-12">
            A collaborative music sequencer powered by SuperSonic WebAssembly audio synthesis.
            Build 4-bar loops, share them with the community, and remix others&apos; creations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sequencer"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition text-lg font-semibold"
            >
              Start Creating
            </Link>
            <Link
              href="/feed"
              className="px-8 py-4 rounded-lg bg-surface hover:bg-surfaceLight transition text-lg font-semibold"
            >
              Browse Feed
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 rounded-lg bg-surface border border-surfaceLight">
            <div className="text-4xl mb-4">🎹</div>
            <h3 className="text-xl font-semibold mb-2">Step Sequencer</h3>
            <p className="text-gray-400">
              Create beats and melodies with an intuitive 4-bar step sequencer using SuperCollider synthdefs.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-surface border border-surfaceLight">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Synth Control</h3>
            <p className="text-gray-400">
              Modulate synth parameters in real-time to craft your unique sound.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-surface border border-surfaceLight">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Social Remixing</h3>
            <p className="text-gray-400">
              Share your sequences and remix others&apos; work to create collaborative musical conversations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
