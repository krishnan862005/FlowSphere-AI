'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { useAuth } from './AuthContext';
import type { WsServerToClient } from '@flowsphere/types';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  subscribeToExecution: (executionId: string) => void;
  unsubscribeFromExecution: (executionId: string) => void;
  joinWorkflow: (workflowId: string) => void;
  leaveWorkflow: (workflowId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [accessToken, isAuthenticated]);

  const subscribeToExecution = (executionId: string) => {
    socketRef.current?.emit('execution:subscribe', { executionId });
  };

  const unsubscribeFromExecution = (executionId: string) => {
    socketRef.current?.emit('execution:unsubscribe', { executionId });
  };

  const joinWorkflow = (workflowId: string) => {
    socketRef.current?.emit('workflow:join', { workflowId });
  };

  const leaveWorkflow = (workflowId: string) => {
    socketRef.current?.emit('workflow:leave', { workflowId });
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      subscribeToExecution,
      unsubscribeFromExecution,
      joinWorkflow,
      leaveWorkflow,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
