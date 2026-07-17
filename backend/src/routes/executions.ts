import { Router } from 'express';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate as RequestHandler);

// ─── GET /executions ──────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query['page'] as string ?? '1');
    const limit = Math.min(parseInt(req.query['limit'] as string ?? '20'), 100);
    const status = req.query['status'] as string | undefined;
    const workflowId = req.query['workflowId'] as string | undefined;
    const orgId = req.user!.orgId;

    const where = {
      workflow: { organizationId: orgId },
      ...(status && { status: status as never }),
      ...(workflowId && { workflowId }),
    };

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { workflow: { select: { id: true, name: true } } },
      }),
      prisma.execution.count({ where }),
    ]);

    res.json({
      success: true,
      data: executions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /executions/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const execution = await prisma.execution.findUnique({
      where: { id: req.params['id'] },
      include: {
        workflow: { select: { id: true, name: true, organizationId: true } },
        nodeExecutions: { orderBy: { startedAt: 'asc' } },
        logs: { orderBy: { timestamp: 'asc' }, take: 500 },
      },
    });

    if (!execution) throw new AppError('Execution not found', 404, 'NOT_FOUND');
    if (execution.workflow.organizationId !== req.user!.orgId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    res.json({ success: true, data: execution });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /executions/:id (cancel) ─────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const execution = await prisma.execution.findUnique({
      where: { id: req.params['id'] },
      include: { workflow: { select: { organizationId: true } } },
    });

    if (!execution) throw new AppError('Execution not found', 404, 'NOT_FOUND');
    if (execution.workflow.organizationId !== req.user!.orgId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    if (!['PENDING', 'RUNNING', 'RETRYING'].includes(execution.status)) {
      throw new AppError('Execution cannot be cancelled in its current state', 400, 'CANNOT_CANCEL');
    }

    await prisma.execution.update({
      where: { id: req.params['id'] },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Execution cancelled.' } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /executions/analytics/chart ─────────────────────────────────────────
router.get('/analytics/chart', async (req: AuthRequest, res, next) => {
  try {
    const days = parseInt(req.query['days'] as string ?? '30');
    const orgId = req.user!.orgId;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const executions = await prisma.execution.findMany({
      where: {
        workflow: { organizationId: orgId },
        createdAt: { gte: startDate },
      },
      select: { status: true, createdAt: true },
    });

    // Group by date
    const chartData: Record<string, { date: string; success: number; failed: number; total: number }> = {};

    for (const exec of executions) {
      const date = exec.createdAt.toISOString().split('T')[0] ?? '';
      if (!chartData[date]) {
        chartData[date] = { date, success: 0, failed: 0, total: 0 };
      }
      chartData[date].total++;
      if (exec.status === 'SUCCESS') chartData[date].success++;
      if (exec.status === 'FAILED') chartData[date].failed++;
    }

    res.json({ success: true, data: Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date)) });
  } catch (err) {
    next(err);
  }
});

export default router;
