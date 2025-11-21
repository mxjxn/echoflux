import { NextRequest, NextResponse } from 'next/server';

// Mock database for prototype
// In production, this would use Prisma with the database package
let sequences: any[] = [
  {
    id: '1',
    name: 'House Beat',
    synthName: 'beep',
    bpm: 128,
    notes: [
      { step: 0, pitch: 60, velocity: 100, duration: 1 },
      { step: 4, pitch: 60, velocity: 80, duration: 1 },
      { step: 8, pitch: 60, velocity: 100, duration: 1 },
      { step: 12, pitch: 60, velocity: 80, duration: 1 },
    ],
    synthParams: { amp: 0.8, release: 0.3 },
    authorId: 'demo',
    playCount: 42,
    remixCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    name: 'Ambient Pad',
    synthName: 'dark_ambience',
    bpm: 90,
    notes: [
      { step: 0, pitch: 48, velocity: 60, duration: 4 },
      { step: 4, pitch: 52, velocity: 60, duration: 4 },
      { step: 8, pitch: 55, velocity: 60, duration: 4 },
      { step: 12, pitch: 52, velocity: 60, duration: 4 },
    ],
    synthParams: { amp: 0.6, release: 2.0 },
    authorId: 'demo',
    playCount: 28,
    remixCount: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // Return sequences sorted by creation date
    const sorted = [...sequences].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(sorted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newSequence = {
      id: String(sequences.length + 1),
      ...body,
      playCount: 0,
      remixCount: 0,
      createdAt: new Date().toISOString(),
    };

    sequences.push(newSequence);

    return NextResponse.json(newSequence);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 });
  }
}
