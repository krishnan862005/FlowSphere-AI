import { randomBytes } from 'crypto';

import type { Request, Response, NextFunction } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers['x-request-id'] as string ?? randomBytes(8).toString('hex');
  res.setHeader('X-Request-ID', id);
  (req as Request & { requestId: string }).requestId = id;
  next();
}
