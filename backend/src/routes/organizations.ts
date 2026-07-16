import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/authenticate';
import type { RequestHandler } from 'express';

const router = Router();
router.use(authenticate as RequestHandler);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const orgId = req.user!.orgId;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        workspaces: true,
        teams: true,
      },
    });
    if (!org) throw new AppError('Organization not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: org });
  } catch (err) { next(err); }
});

export default router;
