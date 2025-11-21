'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SequenceCard } from '@/components/SequenceCard';
import { useSequencerStore } from '@/lib/store';

export default function FeedPage() {
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      const response = await fetch('/api/sequences');
      const data = await response.json();
      setSequences(data);
    } catch (error) {
      console.error('Failed to fetch sequences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (sequence: any) => {
    setPlayingId(sequence.id);

    // Increment play count
    await fetch(`/api/sequences/${sequence.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playCount: sequence.playCount + 1 }),
    });

    // TODO: Actually play the sequence with the music engine
    alert(`Playing "${sequence.name}"... (Audio playback will be implemented with SuperSonic)`);

    setTimeout(() => setPlayingId(null), 2000);
  };

  const handleRemix = (sequence: any) => {
    // Load sequence into the sequencer store
    useSequencerStore.setState({
      sequence: {
        ...sequence,
        name: `${sequence.name} (Remix)`,
        parentId: sequence.id,
        id: undefined, // Clear ID so it creates a new sequence
      },
    });

    // Navigate to sequencer
    router.push('/sequencer');
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
                className="px-4 py-2 rounded-lg bg-primary text-white"
              >
                Feed
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Community Feed</h2>
          <p className="text-gray-400">
            Discover and remix sequences from the community
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : sequences.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No sequences yet</p>
            <Link
              href="/sequencer"
              className="inline-block px-6 py-3 rounded-lg bg-primary hover:bg-primary/80 transition"
            >
              Create the first one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sequences.map((sequence) => (
              <SequenceCard
                key={sequence.id}
                sequence={sequence}
                onPlay={handlePlay}
                onRemix={handleRemix}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
