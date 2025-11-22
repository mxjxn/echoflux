/**
 * Custom Next.js server with Socket.IO
 *
 * This replaces `next dev` and `next start` to add WebSocket support
 * Run with: node server.js
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://${hostname}:${port}`,
      methods: ['GET', 'POST'],
    },
  });

  // Import and initialize collaboration server
  // Note: We need to transpile the TypeScript file or convert it to JS
  // For now, we'll inline the server logic
  const sessions = new Map();
  const userSessions = new Map();

  const getUserColor = (index) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
      '#10b981', '#3b82f6', '#ef4444', '#06b6d4',
    ];
    return colors[index % colors.length];
  };

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Create session
    socket.on('session:create', (username, callback) => {
      const { nanoid } = require('nanoid');
      const sessionId = nanoid(10);
      const userId = socket.id;

      const user = {
        id: userId,
        username,
        color: getUserColor(0),
      };

      const session = {
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

    // Join session
    socket.on('session:join', (sessionId, username, callback) => {
      const session = sessions.get(sessionId);

      if (!session) {
        callback(false);
        socket.emit('error', 'Session not found');
        return;
      }

      const userId = socket.id;
      const user = {
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

    // Note toggle
    socket.on('pattern:note_toggle', (step, pitch, velocity) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      const existingIndex = session.pattern.notes.findIndex(
        n => n.step === step && n.pitch === pitch
      );

      if (existingIndex >= 0) {
        session.pattern.notes.splice(existingIndex, 1);
      } else {
        session.pattern.notes.push({ step, pitch, velocity, duration: 1 });
      }

      session.lastActivity = Date.now();
      io.to(sessionId).emit('pattern:note_toggled', step, pitch, velocity, socket.id);
    });

    // Synth change
    socket.on('pattern:synth_change', (synthName) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.pattern.synthName = synthName;
      session.lastActivity = Date.now();
      io.to(sessionId).emit('pattern:synth_changed', synthName, socket.id);
    });

    // Parameter change
    socket.on('pattern:param_change', (key, value) => {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.pattern.synthParams[key] = value;
      session.lastActivity = Date.now();
      io.to(sessionId).emit('pattern:param_changed', key, value, socket.id);
    });

    // BPM change
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

    // Playback start
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

    // Playback stop
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

      socket.to(sessionId).emit('cursor:moved', socket.id, step);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      leaveSession(socket.id);
    });

    // Helper
    function leaveSession(userId) {
      const sessionId = userSessions.get(userId);
      if (!sessionId) return;

      const session = sessions.get(sessionId);
      if (!session) return;

      session.users = session.users.filter(u => u.id !== userId);
      userSessions.delete(userId);

      socket.to(sessionId).emit('session:user_left', userId);

      if (session.users.length === 0) {
        sessions.delete(sessionId);
        console.log(`[Session] Deleted empty session: ${sessionId}`);
      }
    }
  });

  // Cleanup
  setInterval(() => {
    const now = Date.now();
    const timeout = 30 * 60 * 1000;

    sessions.forEach((session, id) => {
      if (now - session.lastActivity > timeout) {
        sessions.delete(id);
        console.log(`[Session] Cleaned up inactive session: ${id}`);
      }
    });
  }, 5 * 60 * 1000);

  // Start server
  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO ready for connections`);
    });
});
