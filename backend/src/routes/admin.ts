import { Router } from 'express';
import type { RequestHandler } from 'express';

import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';


const router = Router();
router.use(authenticate as RequestHandler, requireRole('SUPER_ADMIN', 'ADMIN') as RequestHandler);

router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const [users, orgs, workflows, executions] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.workflow.count({ where: { deletedAt: null } }),
      prisma.execution.count(),
    ]);
    res.json({ success: true, data: { users, orgs, workflows, executions } });
  } catch (err) { next(err); }
});

router.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

router.get('/feature-flags', async (_req, res, next) => {
  try {
    const flags = await prisma.featureFlag.findMany();
    res.json({ success: true, data: flags });
  } catch (err) { next(err); }
});

router.patch('/feature-flags/:key', async (req, res, next) => {
  try {
    const { enabled } = req.body as { enabled: boolean };
    const flag = await prisma.featureFlag.update({ where: { key: req.params['key'] }, data: { enabled } });
    res.json({ success: true, data: flag });
  } catch (err) { next(err); }
});

export default router;
