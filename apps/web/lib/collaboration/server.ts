import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { nanoid } from 'nanoid';
import type { CollaborativeSession, User, ClientToServerEvents, ServerToClientEvents } from './types';
import { getUserColor } from './types';

/**
 * In-memory session storage
 * For production, use Redis or a database
 */
const sessions = new Map<string, CollaborativeSession>();

/**
 * User to session mapping
 */
const userSessions = new Map<string, string>();

/**
 * Initialize Socket.IO server
 */
export function initSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Create new session
    socket.on('session:create', (username, callback) => {
      const sessionId = nanoid(10);
      const userId = socket.id;

      const user: User = {
        id: userId,
        username,
        color: getUserColor(0),
      };

      const session: CollaborativeSession = {
        id: sessionId,
        pattern: {
          name: 'Collaborative Jam',
          synthName: 'beep',
          bpm: 120,
          notes: [],
          synthParams: { amp: 0.8, release: 0.3 },
        },
        users: [user],
        playback: {
          isPlaying: false,
          startTime: null,
          bpm: 120,
        },
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      sessions.set(sessionId, session);
      userSessions.set(userId, sessionId);

      socket.join(sessionId);
      socket.emit('session:created', session);
      callback(sessionId);

      console.log(`[Session] Created: ${sessionId} by ${username}`);
    });

    // Join existing session
    socket.on('session:join', (sessionId, username, callback) => {
      const session = sessions.get(sessionId);

      if (!session) {
        callback(false);
        socket.emit('error', 'Session not found');
        return;
      }

      const userId = socket.id;
      const user: User = {
        id: userId,
        username,
        color: getUserColor(session.users.length),
      };

      session.users.push(user);
      session.lastActivity = Date.now();
      userSessions.set(userId, sessionId);

      socket.join(sessionId);
      socket.emit('session:joined', session);
      socket.to(sessionId).emit('session:user_joined', user);
      callback(true, session);

      console.log(`[Session] ${username} joined: ${sessionId}`);
    });

    // Leave session
    socket.on('session:leave', () => {
      leaveSession(socket.id);
    });

    // Pattern: Note toggle
    socket.on('pattern:note_toggle', (step, pitch, velocity) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      // Toggle note in pattern
      const existingIndex = session.pattern.notes.findIndex(
        n => n.step === step && n.pitch === pitch
      );

      if (existingIndex >= 0) {
        session.pattern.notes.splice(existingIndex, 1);
      } else {
        session.pattern.notes.push({ step, pitch, velocity, duration: 1 });
      }

      session.lastActivity = Date.now();

      // Broadcast to all clients in session
      io.to(sessionId).emit('pattern:note_toggled', step, pitch, velocity, socket.id);
    });

    // Pattern: Synth change
    socket.on('pattern:synth_change', (synthName) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.pattern.synthName = synthName;
      session.lastActivity = Date.now();

      io.to(sessionId).emit('pattern:synth_changed', synthName, socket.id);
    });

    // Pattern: Parameter change
    socket.on('pattern:param_change', (key, value) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.pattern.synthParams[key] = value;
      session.lastActivity = Date.now();

      io.to(sessionId).emit('pattern:param_changed', key, value, socket.id);
    });

    // Pattern: BPM change
    socket.on('pattern:bpm_change', (bpm) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.pattern.bpm = bpm;
      session.playback.bpm = bpm;
      session.lastActivity = Date.now();

      io.to(sessionId).emit('pattern:bpm_changed', bpm, socket.id);
    });

    // Playback: Start
    socket.on('playback:start', (startTime) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.playback.isPlaying = true;
      session.playback.startTime = startTime;
      session.lastActivity = Date.now();

      io.to(sessionId).emit('playback:started', startTime, socket.id);
    });

    // Playback: Stop
    socket.on('playback:stop', () => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.playback.isPlaying = false;
      session.playback.startTime = null;
      session.lastActivity = Date.now();

      io.to(sessionId).emit('playback:stopped', socket.id);
    });

    // Cursor movement
    socket.on('cursor:move', (step) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      const user = session.users.find(u => u.id === socket.id);
      if (user) {
        user.cursor = step ?? undefined;
      }

      socket.to(sessionId).emit('cursor:moved', socket.id, step);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      leaveSession(socket.id);
    });

    // Helper: Remove user from session
    function leaveSession(userId: string) {
      const sessionId = userSessions.get(userId);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      // Remove user
      session.users = session.users.filter(u => u.id !== userId);
      userSessions.delete(userId);

      // Notify others
      socket.to(sessionId).emit('session:user_left', userId);

      // Delete empty sessions
      if (session.users.length === 0) {
        sessions.delete(sessionId);
        console.log(`[Session] Deleted empty session: ${sessionId}`);
      }
    }
  });

  // Cleanup old sessions (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    sessions.forEach((session, id) => {
      if (now - session.lastActivity > timeout) {
        sessions.delete(id);
        console.log(`[Session] Cleaned up inactive session: ${id}`);
      }
    });
  }, 5 * 60 * 1000);

  return io;
}
