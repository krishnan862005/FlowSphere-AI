import 'dotenv/config';
import { createServer } from 'http';

import { app } from './app';
import { initializeSocketIO } from './socket/socketServer';
import { logger } from './lib/logger';
import { connectRedis } from './lib/redis';
import { prisma } from './lib/prisma';

const PORT = process.env['PORT'] ?? 4000;

async function bootstrap() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected');

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocketIO(httpServer);
    logger.info('✅ Socket.IO initialized');

    // Start listening
    httpServer.listen(PORT, () => {
      logger.info(`🚀 FlowSphere AI Server running on port ${PORT}`);
      logger.info(`📄 API Docs: http://localhost:${PORT}/api/docs`);
      logger.info(`🌍 Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully...`);
      httpServer.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
