import { Router } from 'express';
import type { RequestHandler } from 'express';

import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';


const router = Router();
router.use(authenticate as RequestHandler);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

export default router;
