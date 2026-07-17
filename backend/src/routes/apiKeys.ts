import { Router } from 'express';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { generateApiKey } from '../lib/encryption';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate as RequestHandler);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { organizationId: req.user!.orgId, isActive: true },
      select: { id: true, name: true, keyPrefix: true, permissions: true, expiresAt: true, lastUsedAt: true, usageCount: true, createdAt: true },
    });
    res.json({ success: true, data: keys });
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name, permissions, expiresAt } = z.object({
      name: z.string().min(1).max(100),
      permissions: z.array(z.enum(['READ', 'WRITE', 'ADMIN', 'EXECUTE'])),
      expiresAt: z.string().optional(),
    }).parse(req.body);

    const { key, prefix, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId: req.user!.orgId,
        userId: req.user!.id,
        name,
        keyHash: hash,
        keyPrefix: prefix,
        permissions,
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      },
    });

    res.status(201).json({ success: true, data: { ...apiKey, key } });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const key = await prisma.apiKey.findUnique({ where: { id: req.params['id'] } });
    if (!key || key.organizationId !== req.user!.orgId) throw new AppError('Not found', 404, 'NOT_FOUND');
    await prisma.apiKey.update({ where: { id: req.params['id'] }, data: { isActive: false } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
