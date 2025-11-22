# Collaborative Architecture Design

## Pattern-Based Synchronization

### Core Principles

1. **Patterns are Data** - Sequences are JSON objects, not streams
2. **Schedule Locally** - Each client runs SuperSonic independently
3. **Sync on Change** - Only broadcast when pattern changes
4. **Timestamp Coordination** - Shared clock for synchronized playback

## Event Types

### High-Level Events (Efficient)
```javascript
// Pattern Changed (sent once)
{
  type: 'PATTERN_UPDATE',
  pattern: { notes: [...], synth: 'tb303', bpm: 120 },
  timestamp: 1234567890
}

// Playback Control (sent once)
{
  type: 'PLAYBACK_START',
  startTime: 1234567900,  // Future timestamp
  bpm: 120
}

// User Edit (delta only)
{
  type: 'NOTE_TOGGLE',
  step: 5,
  pitch: 60,
  userId: 'user-123'
}
```

### Low-Level OSC (Local Only)
```javascript
// These happen CLIENT-SIDE, not over network
sonic.sendBundle(scheduledTime, [
  [time + 0.0, '/s_new', 'sonic-pi-tb303', ...],
  [time + 0.5, '/s_new', 'sonic-pi-tb303', ...],
  // ... all 16 steps pre-scheduled
])
```

## Sync Flow

```
┌─────────────┐
│   Client A  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. User clicks step 5
       │
       ▼
  ┌────────────────┐
  │ Local State    │
  │ Update         │
  └────────┬───────┘
           │
           │ 2. Emit delta event
           │
           ▼
    ┌──────────────┐
    │  Socket.io   │◄────────┐
    │   Server     │         │
    └──────┬───────┘         │
           │                  │
           │ 3. Broadcast     │
           │                  │
    ┌──────▼───────┐   ┌──────┴──────┐
    │   Client B   │   │   Client C  │
    └──────┬───────┘   └──────┬──────┘
           │                  │
           │ 4. Apply delta   │
           │                  │
    ┌──────▼──────────────────▼──────┐
    │  Regenerate OSC Bundles        │
    │  (only if currently playing)   │
    └────────────────────────────────┘
```

## Bundle Scheduling Strategy

### Pre-scheduling (Sonic Pi approach)
1. Calculate all note times for next 4 bars
2. Send as single OSC bundle with timestamps
3. SuperSonic executes precisely on time
4. Re-schedule every 4 bars (or on pattern change)

### Advantages
- **Low latency** - No network delays during playback
- **Precise timing** - SuperSonic handles scheduling
- **Bandwidth efficient** - 1 message per pattern, not per note
- **Resilient** - Works even if network lags

## Session State

```typescript
interface CollaborativeSession {
  id: string
  pattern: Sequence  // Current canonical state
  users: User[]      // Who's connected
  playback: {
    isPlaying: boolean
    startTime: number | null  // Unix timestamp
    bpm: number
  }
  history: ChangeEvent[]  // For undo/redo
}
```

## Conflict Resolution

**Last-Write-Wins** (for MVP)
- Timestamp-based ordering
- Simple, works for small groups

**CRDT** (for production)
- Yjs or Automerge
- True conflict-free editing
- Supports offline editing

## Performance Targets

| Metric | Target |
|--------|--------|
| Pattern sync latency | < 50ms |
| Playback sync accuracy | < 10ms |
| Messages per user edit | 1 |
| Messages during playback | 0 |
| Max simultaneous users | 8-16 |

## Implementation Phases

### Phase 1: Bundle Scheduler
- Implement OSC bundle scheduling in useAudioEngine
- Pre-calculate all note times
- Test local playback accuracy

### Phase 2: Session State
- WebSocket server with room management
- Broadcast pattern changes only
- Shared playback control

### Phase 3: Time Sync
- NTP-like clock synchronization
- Coordinated playback start
- Drift compensation

### Phase 4: Optimizations
- Operational transforms for edits
- Predictive conflict resolution
- Compression for pattern deltas
