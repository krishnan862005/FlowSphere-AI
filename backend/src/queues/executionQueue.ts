import Bull from 'bull';

import { getRedis } from '../lib/redis';

let _executionQueue: Bull.Queue | null = null;

export function getExecutionQueue(): Bull.Queue {
  if (!_executionQueue) {
    _executionQueue = new Bull('execution', {
      redis: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return _executionQueue;
}

export const executionQueue = getExecutionQueue();
