import { Router } from 'express';

import { prisma } from '../lib/prisma';
import { getRedis } from '../lib/redis';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     security: []
 */
router.get('/', async (_req, res) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks['database'] = 'healthy';
  } catch {
    checks['database'] = 'unhealthy';
    allHealthy = false;
  }

  // Redis check
  try {
    const redis = getRedis();
    await redis.ping();
    checks['redis'] = 'healthy';
  } catch {
    checks['redis'] = 'unhealthy';
    allHealthy = false;
  }

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '1.0.0',
    uptime: Math.floor(process.uptime()),
    checks,
  });
});

export default router;
