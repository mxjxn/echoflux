'use client';

import { useRouter } from 'next/navigation';

interface SequenceCardProps {
  sequence: {
    id: string;
    name: string;
    synthName: string;
    bpm: number;
    authorId: string;
    playCount: number;
    remixCount: number;
    createdAt: string;
  };
  onPlay: (sequence: any) => void;
  onRemix: (sequence: any) => void;
}

export function SequenceCard({ sequence, onPlay, onRemix }: SequenceCardProps) {
  const router = useRouter();
  const timeAgo = getTimeAgo(new Date(sequence.createdAt));

  return (
    <div className="p-6 rounded-lg bg-surface border border-surfaceLight hover:border-primary/50 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{sequence.name}</h3>
          <p className="text-sm text-gray-400">by @{sequence.authorId}</p>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>{timeAgo}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="px-3 py-1 rounded bg-surfaceLight">
          {sequence.synthName}
        </div>
        <div className="text-gray-400">{sequence.bpm} BPM</div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <div>▶ {sequence.playCount} plays</div>
        <div>🔄 {sequence.remixCount} remixes</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPlay(sequence)}
          className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 transition font-semibold"
        >
          ▶ Play
        </button>
        <button
          onClick={() => onRemix(sequence)}
          className="flex-1 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition font-semibold"
        >
          🔄 Remix
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
