import { Router } from 'express';

import { prisma } from '../lib/prisma';
import { executionQueue } from '../queues/executionQueue';

const router = Router();

// Incoming webhook trigger endpoint
router.post('/:workflowId', async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId, status: 'ACTIVE' } });
    if (!workflow) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found or not active' } });
      return;
    }

    const execution = await prisma.execution.create({
      data: {
        workflowId,
        status: 'PENDING',
        trigger: 'webhook',
        triggerData: req.body,
        inputData: req.body,
      },
    });

    await executionQueue.add('execute', { executionId: execution.id, workflowId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    res.status(202).json({ success: true, data: { executionId: execution.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
