import { hash } from 'bcryptjs';
import { Router } from 'express';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';


const router = Router();
router.use(authenticate as RequestHandler);

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(50).regex(/^[a-z0-9_-]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  theme: z.enum(['dark', 'light', 'system']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

// GET /users/me
router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, emailVerified: true, name: true, username: true,
        avatarUrl: true, bio: true, role: true, status: true, twoFactorEnabled: true,
        timezone: true, locale: true, theme: true, onboardingCompleted: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PATCH /users/me
router.patch('/me', async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    if (data.username) {
      const existing = await prisma.user.findUnique({ where: { username: data.username } });
      if (existing && existing.id !== req.user!.id) throw new AppError('Username taken', 409, 'USERNAME_TAKEN');
    }
    const updated = await prisma.user.update({ where: { id: req.user!.id }, data });
    const { passwordHash, twoFactorSecret, ...safe } = updated;
    void passwordHash; void twoFactorSecret;
    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
});

// POST /users/me/change-password
router.post('/me/change-password', async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const { compare } = await import('bcryptjs');
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.passwordHash) throw new AppError('Cannot change password', 400, 'NO_PASSWORD');
    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Current password incorrect', 400, 'WRONG_PASSWORD');
    const newHash = await hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    res.json({ success: true, data: { message: 'Password changed. Please log in again.' } });
  } catch (err) { next(err); }
});

// GET /users/me/notifications
router.get('/me/notifications', async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

// PATCH /users/me/notifications/:id/read
router.patch('/me/notifications/:id/read', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params['id'], userId: req.user!.id },
      data: { readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /users/me/notifications/read-all
router.post('/me/notifications/read-all', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
