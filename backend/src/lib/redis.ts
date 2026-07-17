import Redis from 'ioredis';

import { logger } from './logger';

let redisClient: any = null;
let useMock = false;

// Simple Mock Redis client
class MockRedis {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, value);
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, value);
    return 'OK';
  }

  async del(...keys: any[]): Promise<number> {
    let deleted = 0;
    // Flatten keys in case array is passed
    const flatKeys = keys.flat();
    for (const key of flatKeys) {
      if (typeof key === 'string' && this.store.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  async keys(pattern: string): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  async connect(): Promise<void> {}

  on(event: string, callback: any) {}
}

export function getRedis(): any {
  if (!redisClient) {
    logger.warn('Redis client not initialized, returning mock Redis client.');
    redisClient = new MockRedis();
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  try {
    redisClient = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
      password: process.env['REDIS_PASSWORD'] || undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // Fast fail to trigger mock fallback
        return Math.min(times * 100, 1000);
      },
    });

    redisClient.on('error', (err: any) => {
      if (!useMock) {
        logger.warn('Redis error occurred. Falling back to IN-MEMORY MOCK Redis.');
        useMock = true;
        redisClient = new MockRedis();
      }
    });

    await redisClient.connect();
  } catch (err) {
    logger.warn('⚠️ Could not connect to Redis server. Falling back to IN-MEMORY MOCK Redis.');
    useMock = true;
    redisClient = new MockRedis();
  }
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const val = await redis.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  const redis = getRedis();
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

// ─── Pub/Sub helpers ──────────────────────────────────────────────────────────

export function createSubscriber(): any {
  if (useMock) {
    return new MockRedis();
  }
  return new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    password: process.env['REDIS_PASSWORD'] || undefined,
    maxRetriesPerRequest: null,
  });
}
