import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';
import type { RequestHandler } from 'express';

const router = Router();
router.use(authenticate as RequestHandler);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (err) { next(err); }
});

export default router;
