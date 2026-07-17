import type { JwtPayload, UserRole } from '@flowsphere/types';
import type { Request, Response, NextFunction } from 'express';

import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/redis';

import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    orgId?: string;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (apiKey) {
    authenticateApiKey(apiKey, req, next);
    return;
  }

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId,
    };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'TOKEN_INVALID'));
  }
}

async function authenticateApiKey(
  apiKey: string,
  req: AuthRequest,
  next: NextFunction
): Promise<void> {
  try {
    const { hashString } = await import('../lib/encryption');
    const keyHash = hashString(apiKey);

    // Check cache first
    const cacheKey = `apikey:${keyHash}`;
    const cached = await cacheGet<{ userId: string; orgId: string; role: UserRole }>(cacheKey);

    if (cached) {
      req.user = { id: cached.userId, email: '', role: cached.role, orgId: cached.orgId };
      next();
      return;
    }

    const key = await prisma.apiKey.findUnique({
      where: { keyHash, isActive: true },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    if (!key || (key.expiresAt && key.expiresAt < new Date())) {
      next(new AppError('Invalid API key', 401, 'API_KEY_INVALID'));
      return;
    }

    // Update usage stats (non-blocking)
    prisma.apiKey
      .update({
        where: { id: key.id },
        data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
      })
      .catch(() => {});

    const userData = {
      userId: key.userId,
      orgId: key.organizationId,
      role: key.user.role as UserRole,
    };

    await cacheSet(cacheKey, userData, 300);
    req.user = { id: key.userId, email: key.user.email, role: key.user.role as UserRole, orgId: key.organizationId };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
      return;
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }
  const token = authHeader.substring(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role, orgId: payload.orgId };
  } catch {
    // Silently fail for optional auth
  }
  next();
}
