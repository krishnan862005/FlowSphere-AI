import type { Server as HttpServer } from 'http';

import { Server as SocketIOServer } from 'socket.io';

import { verifyAccessToken } from '../lib/jwt';
import { logger } from '../lib/logger';

let io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000,http://localhost:3003').split(',').map((origin) => origin.trim()).filter(Boolean),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data['userId'] = payload.sub;
      socket.data['orgId'] = payload.orgId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string;
    logger.info(`WS connected: ${userId} (${socket.id})`);

    // Join user-specific room
    void socket.join(`user:${userId}`);
    if (socket.data['orgId']) {
      void socket.join(`org:${socket.data['orgId']}`);
    }

    // Subscribe to execution updates
    socket.on('execution:subscribe', ({ executionId }: { executionId: string }) => {
      void socket.join(`execution:${executionId}`);
      logger.info(`${userId} subscribed to execution ${executionId}`);
    });

    socket.on('execution:unsubscribe', ({ executionId }: { executionId: string }) => {
      void socket.leave(`execution:${executionId}`);
    });

    // Join workflow collaboration room
    socket.on('workflow:join', ({ workflowId }: { workflowId: string }) => {
      void socket.join(`workflow:${workflowId}`);
      socket.to(`workflow:${workflowId}`).emit('workflow:user_joined', { userId, socketId: socket.id });
    });

    socket.on('workflow:leave', ({ workflowId }: { workflowId: string }) => {
      void socket.leave(`workflow:${workflowId}`);
      socket.to(`workflow:${workflowId}`).emit('workflow:user_left', { userId, socketId: socket.id });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`WS disconnected: ${userId} — ${reason}`);
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

// ─── Emit helpers ─────────────────────────────────────────────────────────────

export function emitExecutionUpdate(executionId: string, data: unknown): void {
  getIO().to(`execution:${executionId}`).emit('execution:update', data);
}

export function emitExecutionLog(executionId: string, log: unknown): void {
  getIO().to(`execution:${executionId}`).emit('execution:log', log);
}

export function emitNotification(userId: string, notification: unknown): void {
  getIO().to(`user:${userId}`).emit('notification:new', notification);
}

export function emitToOrg(orgId: string, event: string, data: unknown): void {
  getIO().to(`org:${orgId}`).emit(event, data);
}
