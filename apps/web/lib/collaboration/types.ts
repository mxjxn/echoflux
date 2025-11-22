import { Sequence } from '../store';

/**
 * Collaborative session types
 */

export interface User {
  id: string;
  username: string;
  color: string; // Hex color for UI differentiation
  cursor?: number; // Current step they're hovering over
}

export interface CollaborativeSession {
  id: string;
  pattern: Sequence;
  users: User[];
  playback: {
    isPlaying: boolean;
    startTime: number | null; // Unix timestamp in seconds
    bpm: number;
  };
  createdAt: number;
  lastActivity: number;
}

/**
 * WebSocket Events (Client → Server → Clients)
 */

export type ClientToServerEvents = {
  // Session management
  'session:create': (username: string, callback: (sessionId: string) => void) => void;
  'session:join': (sessionId: string, username: string, callback: (success: boolean, session?: CollaborativeSession) => void) => void;
  'session:leave': () => void;

  // Pattern updates
  'pattern:update': (pattern: Partial<Sequence>) => void;
  'pattern:note_toggle': (step: number, pitch: number, velocity: number) => void;
  'pattern:synth_change': (synthName: string) => void;
  'pattern:param_change': (key: string, value: number) => void;
  'pattern:bpm_change': (bpm: number) => void;

  // Playback control
  'playback:start': (startTime: number) => void;
  'playback:stop': () => void;

  // Presence
  'cursor:move': (step: number | null) => void;
  'user:typing': (message: string) => void;
};

export type ServerToClientEvents = {
  // Session events
  'session:created': (session: CollaborativeSession) => void;
  'session:joined': (session: CollaborativeSession) => void;
  'session:user_joined': (user: User) => void;
  'session:user_left': (userId: string) => void;
  'session:sync': (session: CollaborativeSession) => void;

  // Pattern events
  'pattern:updated': (pattern: Sequence, userId: string) => void;
  'pattern:note_toggled': (step: number, pitch: number, velocity: number, userId: string) => void;
  'pattern:synth_changed': (synthName: string, userId: string) => void;
  'pattern:param_changed': (key: string, value: number, userId: string) => void;
  'pattern:bpm_changed': (bpm: number, userId: string) => void;

  // Playback events
  'playback:started': (startTime: number, userId: string) => void;
  'playback:stopped': (userId: string) => void;

  // Presence events
  'cursor:moved': (userId: string, step: number | null) => void;
  'user:is_typing': (userId: string, message: string) => void;

  // Errors
  'error': (message: string) => void;
};

/**
 * Helper to generate user colors
 */
const USER_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

export function getUserColor(index: number): string {
  return USER_COLORS[index % USER_COLORS.length];
}
