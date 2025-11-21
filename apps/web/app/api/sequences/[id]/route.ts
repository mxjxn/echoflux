import { NextRequest, NextResponse } from 'next/server';

// This would normally use the database package
// For prototype, we'll just return mock data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock sequence fetch
    return NextResponse.json({
      id: params.id,
      name: 'Example Sequence',
      synthName: 'beep',
      bpm: 120,
      notes: [],
      synthParams: { amp: 0.8, release: 0.3 },
      authorId: 'demo',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { playCount } = body;

    // Mock update - in production would update database
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sequence' }, { status: 500 });
  }
}
