'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  CollaborativeSession,
  User,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/lib/collaboration/types';
import { useSequencerStore } from '@/lib/store';

type CollabSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Collaborative session hook
 *
 * Connects to Socket.IO server and syncs pattern changes across clients
 */
export function useCollaboration(sessionId?: string) {
  const [socket, setSocket] = useState<CollabSocket | null>(null);
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const { sequence, setSequence, setIsPlaying, setBpm, setSynthName, updateSynthParam, toggleNote } =
    useSequencerStore();

  const socketRef = useRef<CollabSocket | null>(null);
  const isLocalUpdate = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[Collab] Connected to server');
      setConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Collab] Disconnected from server');
      setConnected(false);
    });

    socketInstance.on('error', (message) => {
      console.error('[Collab] Error:', message);
      setError(message);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join session when sessionId is provided
  useEffect(() => {
    if (!socket || !sessionId) return;

    // For demo, use a simple username
    const username = `User-${Math.floor(Math.random() * 1000)}`;

    socket.emit('session:join', sessionId, username, (success, sessionData) => {
      if (success && sessionData) {
        setSession(sessionData);
        setUsers(sessionData.users);

        // Sync local state with session
        isLocalUpdate.current = true;
        setSequence(sessionData.pattern);
        isLocalUpdate.current = false;

        console.log('[Collab] Joined session:', sessionId);
      } else {
        setError('Failed to join session');
      }
    });
  }, [socket, sessionId, setSequence]);

  // Listen for session events
  useEffect(() => {
    if (!socket) return;

    // User joined
    socket.on('session:user_joined', (user) => {
      console.log('[Collab] User joined:', user.username);
      setUsers(prev => [...prev, user]);
    });

    // User left
    socket.on('session:user_left', (userId) => {
      console.log('[Collab] User left:', userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    });

    // Pattern events
    socket.on('pattern:note_toggled', (step, pitch, velocity, userId) => {
      if (userId === socket.id) return; // Ignore own events

      isLocalUpdate.current = true;
      toggleNote(step);
      isLocalUpdate.current = false;
    });

    socket.on('pattern:synth_changed', (synthName, userId) => {
      if (userId === socket.id) return;

      isLocalUpdate.current = true;
      setSynthName(synthName);
      isLocalUpdate.current = false;
    });

    socket.on('pattern:param_changed', (key, value, userId) => {
      if (userId === socket.id) return;

      isLocalUpdate.current = true;
      updateSynthParam(key, value);
      isLocalUpdate.current = false;
    });

    socket.on('pattern:bpm_changed', (bpm, userId) => {
      if (userId === socket.id) return;

      isLocalUpdate.current = true;
      setBpm(bpm);
      isLocalUpdate.current = false;
    });

    // Playback events
    socket.on('playback:started', (startTime, userId) => {
      console.log('[Collab] Playback started at:', startTime);
      // TODO: Sync playback with startTime
      isLocalUpdate.current = true;
      setIsPlaying(true);
      isLocalUpdate.current = false;
    });

    socket.on('playback:stopped', (userId) => {
      console.log('[Collab] Playback stopped');
      isLocalUpdate.current = true;
      setIsPlaying(false);
      isLocalUpdate.current = false;
    });

    return () => {
      socket.off('session:user_joined');
      socket.off('session:user_left');
      socket.off('pattern:note_toggled');
      socket.off('pattern:synth_changed');
      socket.off('pattern:param_changed');
      socket.off('pattern:bpm_changed');
      socket.off('playback:started');
      socket.off('playback:stopped');
    };
  }, [socket, toggleNote, setSynthName, updateSynthParam, setBpm, setIsPlaying]);

  // Emit local changes to server (only if not from remote)
  const emitNoteToggle = useCallback((step: number, pitch: number, velocity: number) => {
    if (!socket || isLocalUpdate.current) return;
    socket.emit('pattern:note_toggle', step, pitch, velocity);
  }, [socket]);

  const emitSynthChange = useCallback((synthName: string) => {
    if (!socket || isLocalUpdate.current) return;
    socket.emit('pattern:synth_change', synthName);
  }, [socket]);

  const emitParamChange = useCallback((key: string, value: number) => {
    if (!socket || isLocalUpdate.current) return;
    socket.emit('pattern:param_change', key, value);
  }, [socket]);

  const emitBpmChange = useCallback((bpm: number) => {
    if (!socket || isLocalUpdate.current) return;
    socket.emit('pattern:bpm_change', bpm);
  }, [socket]);

  const emitPlaybackStart = useCallback(() => {
    if (!socket || isLocalUpdate.current) return;
    const startTime = performance.now() / 1000 + 0.1; // 100ms in future
    socket.emit('playback:start', startTime);
  }, [socket]);

  const emitPlaybackStop = useCallback(() => {
    if (!socket || isLocalUpdate.current) return;
    socket.emit('playback:stop');
  }, [socket]);

  // Create new session
  const createSession = useCallback((username: string) => {
    if (!socket) return;

    socket.emit('session:create', username, (sessionId) => {
      console.log('[Collab] Session created:', sessionId);
      window.location.href = `/session/${sessionId}`;
    });
  }, [socket]);

  return {
    socket,
    session,
    connected,
    error,
    users,
    createSession,
    emitNoteToggle,
    emitSynthChange,
    emitParamChange,
    emitBpmChange,
    emitPlaybackStart,
    emitPlaybackStop,
  };
}
