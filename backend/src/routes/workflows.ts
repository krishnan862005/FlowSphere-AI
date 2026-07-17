import { Router } from 'express';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All workflow routes require auth
router.use(authenticate as RequestHandler);

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  workspaceId: z.string().optional(),
  triggerType: z.enum(['WEBHOOK', 'SCHEDULE', 'MANUAL', 'EVENT', 'API']).default('MANUAL'),
  triggerConfig: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).default([]),
  canvasData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }).optional(),
});

const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  cronExpression: z.string().optional(),
  cronTimezone: z.string().optional(),
  viewportData: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).optional(),
});

// ─── GET /workflows ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /workflows:
 *   get:
 *     tags: [Workflows]
 *     summary: List workflows for the authenticated user's organization
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: workspaceId
 *         schema: { type: string }
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query['page'] as string ?? '1');
    const limit = Math.min(parseInt(req.query['limit'] as string ?? '20'), 100);
    const search = req.query['search'] as string | undefined;
    const status = req.query['status'] as string | undefined;
    const workspaceId = req.query['workspaceId'] as string | undefined;

    const orgId = req.user!.orgId;
    if (!orgId) throw new AppError('Organization required', 400, 'NO_ORG');

    const count = await prisma.workflow.count({
      where: { organizationId: orgId, deletedAt: null }
    });

    if (count === 0 && !search && !status) {
      // Find default workspace
      const defaultWorkspace = await prisma.workspace.findFirst({
        where: { organizationId: orgId, isDefault: true }
      }) || await prisma.workspace.findFirst({
        where: { organizationId: orgId }
      });
      const workspaceIdToUse = defaultWorkspace?.id;
      const createdByIdToUse = req.user!.id;

      // Seed default workflows
      const defaultWorkflows = [
        salesInsightsWorkflow,
        {
          name: 'Dev Ops API Conversion Automation',
          description: 'Convert natural language descriptions of API requests into executable API calls using an AI agent.',
          triggerType: 'MANUAL',
          tags: ['devops', 'ai', 'api', 'agent'],
          canvasData: {
            nodes: [
              { id: 'webhook', type: 'flowNode', position: { x: 100, y: 300 }, data: { label: 'Webhook', nodeType: 'webhookTrigger', icon: '🪝', color: '#5B5FFF', config: { method: 'POST', path: '/devops-webhook' } } },
              { id: 'ai-agent', type: 'flowNode', position: { x: 350, y: 300 }, data: { label: 'AI Agent', nodeType: 'openaiNode', icon: '🤖', color: '#10B981', config: { model: 'gpt-4o', systemPrompt: 'Convert user prompt into API command. Out: JSON {method, url, body}', userPrompt: 'Prompt: {{input.body}}' } } },
              { id: 'switch', type: 'flowNode', position: { x: 600, y: 300 }, data: { label: 'Switch', nodeType: 'switchNode', icon: '🔀', color: '#8A5CFF', config: { field: '{{input.method}}' } } },
              { id: 'get-properties', type: 'flowNode', position: { x: 850, y: 150 }, data: { label: 'Get properties', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: '{{input.url}}', method: 'GET' } } },
              { id: 'post-url', type: 'flowNode', position: { x: 850, y: 300 }, data: { label: 'Post URL', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: '{{input.url}}', method: 'POST', body: '{{input.body}}' } } },
              { id: 'delete-return', type: 'flowNode', position: { x: 850, y: 450 }, data: { label: 'Delete/Return', nodeType: 'conditionNode', icon: '❔', color: '#8A5CFF', config: { expression: '{{input.confirm}} === true' } } },
              { id: 'delete-url', type: 'flowNode', position: { x: 1100, y: 400 }, data: { label: 'Delete URL', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: '{{input.url}}', method: 'DELETE' } } },
              { id: 'return-output', type: 'flowNode', position: { x: 1100, y: 550 }, data: { label: 'Return output', nodeType: 'codeNode', icon: '💻', color: '#7C3AED', config: { code: 'return { status: "skipped" };' } } }
            ],
            edges: [
              { id: 'e1-2', source: 'webhook', target: 'ai-agent', animated: true },
              { id: 'e2-3', source: 'ai-agent', target: 'switch', animated: true },
              { id: 'e3-4', source: 'switch', target: 'get-properties', sourceHandle: 'case1', animated: true },
              { id: 'e3-5', source: 'switch', target: 'post-url', sourceHandle: 'case2', animated: true },
              { id: 'e3-6', source: 'switch', target: 'delete-return', sourceHandle: 'default', animated: true },
              { id: 'e6-7', source: 'delete-return', target: 'delete-url', sourceHandle: 'true', animated: true },
              { id: 'e6-8', source: 'delete-return', target: 'return-output', sourceHandle: 'false', animated: true }
            ]
          }
        },
        {
          name: 'Sec Ops Incident Ticket Enrichment',
          description: 'Analyze incoming security issues, scan suspicious domains via VirusTotal/urlscan, and notify Slack.',
          triggerType: 'MANUAL',
          tags: ['security', 'secops', 'slack', 'virustotal'],
          canvasData: {
            nodes: [
              { id: 'new-issue', type: 'flowNode', position: { x: 100, y: 300 }, data: { label: 'On new issue', nodeType: 'webhookTrigger', icon: '🪝', color: '#5B5FFF', config: { path: '/security-issue' } } },
              { id: 'extract-ips', type: 'flowNode', position: { x: 300, y: 300 }, data: { label: 'Extract IPs and domains', nodeType: 'codeNode', icon: '💻', color: '#7C3AED', config: { code: '// Extract domains/IPs\nconst text = input.body.description || "";\nconst domains = text.match(/\\b[a-z0-9.-]+\\.[a-z]{2,}\\b/gi) || [];\nreturn { domain: domains[0] || "example.com" };' } } },
              { id: 'vt-scan', type: 'flowNode', position: { x: 550, y: 150 }, data: { label: 'VirusTotal: Scan URL', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: 'https://www.virustotal.com/api/v3/urls', method: 'POST' } } },
              { id: 'vt-report', type: 'flowNode', position: { x: 800, y: 150 }, data: { label: 'VirusTotal: Get Report', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: 'https://www.virustotal.com/api/v3/urls/{{input.id}}', method: 'GET' } } },
              { id: 'urlscan', type: 'flowNode', position: { x: 550, y: 450 }, data: { label: 'urlscan.io', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: 'https://urlscan.io/api/v1/scan/', method: 'POST' } } },
              { id: 'merge', type: 'flowNode', position: { x: 1050, y: 300 }, data: { label: 'Merge reports', nodeType: 'mergeNode', icon: '🔗', color: '#8A5CFF', config: { mode: 'all' } } },
              { id: 'post-results', type: 'flowNode', position: { x: 1250, y: 300 }, data: { label: 'Post results', nodeType: 'slackNode', icon: '💬', color: '#E01E5A', config: { channel: '#security-alerts', message: 'Incident scan results:\nVT: {{input.a.result}}\nurlscan: {{input.b.result}}' } } }
            ],
            edges: [
              { id: 'e1-2', source: 'new-issue', target: 'extract-ips', animated: true },
              { id: 'e2-3', source: 'extract-ips', target: 'vt-scan', animated: true },
              { id: 'e2-5', source: 'extract-ips', target: 'urlscan', animated: true },
              { id: 'e3-4', source: 'vt-scan', target: 'vt-report', animated: true },
              { id: 'e4-6', source: 'vt-report', target: 'merge', targetHandle: 'a', animated: true },
              { id: 'e5-6', source: 'urlscan', target: 'merge', targetHandle: 'b', animated: true },
              { id: 'e6-7', source: 'merge', target: 'post-results', animated: true }
            ]
          }
        },
        {
          name: 'IT Ops Employee Onboarding Automation',
          description: 'Automate employee onboarding: check role using AI Agent and configure Slack and email access.',
          triggerType: 'MANUAL',
          tags: ['itops', 'onboarding', 'slack', 'email'],
          canvasData: {
            nodes: [
              { id: 'form-submission', type: 'flowNode', position: { x: 100, y: 300 }, data: { label: 'On Create User form submission', nodeType: 'webhookTrigger', icon: '🪝', color: '#5B5FFF', config: { path: '/employee-onboarding' } } },
              { id: 'ai-agent', type: 'flowNode', position: { x: 350, y: 300 }, data: { label: 'AI Agent', nodeType: 'openaiNode', icon: '🤖', color: '#10B981', config: { model: 'gpt-4o', systemPrompt: 'Analyze user role and return metadata.', userPrompt: 'Role: {{input.role}}' } } },
              { id: 'is-manager', type: 'flowNode', position: { x: 600, y: 300 }, data: { label: 'Is a manager?', nodeType: 'conditionNode', icon: '❔', color: '#8A5CFF', config: { expression: '{{input.isManager}} === true' } } },
              { id: 'add-to-channel', type: 'flowNode', position: { x: 850, y: 200 }, data: { label: 'Add to channel', nodeType: 'slackNode', icon: '💬', color: '#E01E5A', config: { channel: '#managers', message: 'Welcome new manager: {{input.name}}' } } },
              { id: 'update-profile', type: 'flowNode', position: { x: 850, y: 400 }, data: { label: 'Update profile', nodeType: 'emailNode', icon: '✉️', color: '#22C55E', config: { to: '{{input.email}}', subject: 'Your onboarding info', body: 'Welcome to the team!' } } }
            ],
            edges: [
              { id: 'e1-2', source: 'form-submission', target: 'ai-agent', animated: true },
              { id: 'e2-3', source: 'ai-agent', target: 'is-manager', animated: true },
              { id: 'e3-4', source: 'is-manager', target: 'add-to-channel', sourceHandle: 'true', animated: true },
              { id: 'e3-5', source: 'is-manager', target: 'update-profile', sourceHandle: 'false', animated: true }
            ]
          }
        }
      ];

      for (const dwf of defaultWorkflows) {
        await prisma.workflow.create({
          data: {
            name: dwf.name,
            description: dwf.description,
            status: 'ACTIVE',
            organizationId: orgId,
            workspaceId: workspaceIdToUse,
            createdById: createdByIdToUse,
            triggerType: dwf.triggerType as any,
            tags: dwf.tags,
            canvasData: dwf.canvasData,
          }
        });
      }
    }

    const where = {
      organizationId: orgId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { tags: { has: search } },
        ],
      }),
      ...(status && { status: status as never }),
      ...(workspaceId && { workspaceId }),
    };

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { executions: true } },
        },
      }),
      prisma.workflow.count({ where }),
    ]);

    res.json({
      success: true,
      data: workflows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /workflows ──────────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createWorkflowSchema.parse(req.body);
    const orgId = req.user!.orgId;
    if (!orgId) throw new AppError('Organization required', 400, 'NO_ORG');

    // Check workflow limit
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    const count = await prisma.workflow.count({ where: { organizationId: orgId, deletedAt: null } });
    if (org && count >= org.maxWorkflows) {
      throw new AppError(`Workflow limit reached (${org.maxWorkflows})`, 402, 'LIMIT_REACHED');
    }

    const workflow = await prisma.workflow.create({
      data: {
        ...data,
        organizationId: orgId,
        createdById: req.user!.id,
        canvasData: data.canvasData ?? { nodes: [], edges: [] },
      },
    });

    // Create initial version
    await prisma.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        version: 1,
        name: 'Initial version',
        canvasData: workflow.canvasData ?? { nodes: [], edges: [] },
        createdById: req.user!.id,
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, organizationId: orgId, action: 'workflow.create', resourceType: 'Workflow', resourceId: workflow.id },
    });

    res.status(201).json({ success: true, data: workflow });
  } catch (err) {
    next(err);
  }
});

// ─── GET /workflows/templates/sales-insights ───────────────────────────────────

router.get('/templates/sales-insights', async (req: AuthRequest, res, next) => {
  try {
    res.json({ success: true, data: salesInsightsWorkflow });
  } catch (err) {
    next(err);
  }
});

// ─── GET /workflows/templates/devops ───────────────────────────────────

router.get('/templates/devops', async (req: AuthRequest, res, next) => {
  try {
    res.json({ success: true, data: devopsWorkflow });
  } catch (err) {
    next(err);
  }
});

// ─── GET /workflows/templates/secops ───────────────────────────────────

router.get('/templates/secops', async (req: AuthRequest, res, next) => {
  try {
    res.json({ success: true, data: secopsWorkflow });
  } catch (err) {
    next(err);
  }
});

// ─── GET /workflows/templates/itops ───────────────────────────────────

router.get('/templates/itops', async (req: AuthRequest, res, next) => {
  try {
    res.json({ success: true, data: itopsWorkflow });
  } catch (err) {
    next(err);
  }
});

// ─── GET /workflows/:id ───────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params['id'], deletedAt: null },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        nodes: true,
        edges: true,
        collaborators: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        _count: { select: { executions: true, versions: true } },
      },
    });

    if (!workflow) throw new AppError('Workflow not found', 404, 'NOT_FOUND');

    // Access check: must be same org or collaborator
    const orgId = req.user!.orgId;
    if (workflow.organizationId !== orgId && !workflow.isPublic) {
      const isCollab = workflow.collaborators.some((c) => c.userId === req.user!.id);
      if (!isCollab) throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    res.json({ success: true, data: workflow });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /workflows/:id ─────────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateWorkflowSchema.parse(req.body);
    const existing = await prisma.workflow.findUnique({ where: { id: req.params['id'] } });
    if (!existing) throw new AppError('Workflow not found', 404, 'NOT_FOUND');
    if (existing.organizationId !== req.user!.orgId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    // If canvas changed, bump version
    let newVersion = existing.version;
    if (data.canvasData) {
      newVersion = existing.version + 1;
      await prisma.workflowVersion.create({
        data: {
          workflowId: existing.id,
          version: newVersion,
          canvasData: data.canvasData,
          createdById: req.user!.id,
        },
      });
    }

    const updated = await prisma.workflow.update({
      where: { id: req.params['id'] },
      data: { ...data, version: newVersion },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /workflows/:id ────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.workflow.findUnique({ where: { id: req.params['id'] } });
    if (!existing) throw new AppError('Workflow not found', 404, 'NOT_FOUND');
    if (existing.organizationId !== req.user!.orgId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    await prisma.workflow.update({
      where: { id: req.params['id'] },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, organizationId: req.user!.orgId, action: 'workflow.delete', resourceType: 'Workflow', resourceId: req.params['id'] },
    });

    res.json({ success: true, data: { message: 'Workflow deleted.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /workflows/:id/execute ─────────────────────────────────────────────

router.post('/:id/execute', async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.findUnique({ where: { id: req.params['id'] } });
    if (!workflow) throw new AppError('Workflow not found', 404, 'NOT_FOUND');
    if (workflow.organizationId !== req.user!.orgId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: 'PENDING',
        trigger: 'manual',
        inputData: req.body.inputData ?? {},
      },
    });

    // Queue the execution (import from queue module)
    const { executionQueue } = await import('../queues/executionQueue');
    await executionQueue.add('execute', { executionId: execution.id, workflowId: workflow.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    res.status(202).json({ success: true, data: { executionId: execution.id, status: 'PENDING' } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /workflows/:id/versions ─────────────────────────────────────────────

router.get('/:id/versions', async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.findUnique({ where: { id: req.params['id'] } });
    if (!workflow) throw new AppError('Workflow not found', 404, 'NOT_FOUND');
    if (workflow.organizationId !== req.user!.orgId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    const versions = await prisma.workflowVersion.findMany({
      where: { workflowId: req.params['id'] },
      orderBy: { version: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: versions });
  } catch (err) {
    next(err);
  }
});

// ─── GET /workflows/dashboard/stats ──────────────────────────────────────────

router.get('/dashboard/stats', async (req: AuthRequest, res, next) => {
  try {
    const orgId = req.user!.orgId;
    if (!orgId) throw new AppError('Organization required', 400, 'NO_ORG');

    const [total, active, paused, execStats, recentExecutions] = await Promise.all([
      prisma.workflow.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.workflow.count({ where: { organizationId: orgId, status: 'ACTIVE', deletedAt: null } }),
      prisma.workflow.count({ where: { organizationId: orgId, status: 'PAUSED', deletedAt: null } }),
      prisma.execution.aggregate({
        where: {
          workflow: { organizationId: orgId },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: true,
        _avg: { duration: true },
      }),
      prisma.execution.findMany({
        where: { workflow: { organizationId: orgId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { workflow: { select: { id: true, name: true } } },
      }),
    ]);

    const successCount = await prisma.execution.count({
      where: {
        workflow: { organizationId: orgId },
        status: 'SUCCESS',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    res.json({
      success: true,
      data: {
        totalWorkflows: total,
        activeWorkflows: active,
        pausedWorkflows: paused,
        totalExecutions: execStats._count,
        successRate: execStats._count > 0 ? Math.round((successCount / execStats._count) * 100) : 0,
        avgExecutionTime: Math.round(execStats._avg.duration ?? 0),
        recentExecutions,
      },
    });
  } catch (err) {
    next(err);
  }
});

export const salesInsightsWorkflow = {
  name: 'Sales Customer Insights Automation',
  description: 'Retrieve customer reviews from Qdrant, apply K-Means clustering, run OpenAI Agent analysis, and append results to Google Sheets.',
  triggerType: 'MANUAL',
  tags: ['sales', 'insights', 'ai', 'qdrant'],
  canvasData: {
    nodes: [
      {
        id: 'get-reviews',
        type: 'flowNode',
        position: { x: 100, y: 200 },
        data: {
          label: 'Get reviews',
          nodeType: 'httpRequest',
          icon: '🌐',
          color: '#32D9FF',
          config: {
            url: 'http://qdrant:6333/collections/reviews/points/search',
            method: 'POST',
            headers: '{\n  "Content-Type": "application/json"\n}',
            body: '{}'
          }
        }
      },
      {
        id: 'apply-kmeans',
        type: 'flowNode',
        position: { x: 350, y: 200 },
        data: {
          label: 'Apply K-means Algorithm',
          nodeType: 'codeNode',
          icon: '💻',
          color: '#7C3AED',
          config: {
            code: '// Apply K-Means clustering on the retrieved reviews\nconst reviews = input.response || [];\nconst clustered = reviews.map((r, i) => ({ ...r, clusterId: i % 3 }));\nreturn { clusters: clustered };'
          }
        }
      },
      {
        id: 'clusters-to-list',
        type: 'flowNode',
        position: { x: 600, y: 200 },
        data: {
          label: 'Clusters To List',
          nodeType: 'codeNode',
          icon: '💻',
          color: '#7C3AED',
          config: {
            code: '// Group clustered data into lists\nconst clusters = input.clusters || [];\nreturn { list: clusters };'
          }
        }
      },
      {
        id: 'customer-insights-agent',
        type: 'flowNode',
        position: { x: 850, y: 200 },
        data: {
          label: 'Customer Insights Agent',
          nodeType: 'openaiNode',
          icon: '🤖',
          color: '#10B981',
          config: {
            model: 'gpt-4o',
            systemPrompt: 'You are an advanced Customer Insights AI Agent. Analyze customer review clusters and extract key pain points.',
            userPrompt: 'Review Clusters:\n{{input.list}}\nExtract insights:'
          }
        }
      },
      {
        id: 'insights-to-gsheets',
        type: 'flowNode',
        position: { x: 1100, y: 200 },
        data: {
          label: 'Insights to GSheets',
          nodeType: 'httpRequest',
          icon: '🌐',
          color: '#32D9FF',
          config: {
            url: 'https://sheets.googleapis.com/v4/spreadsheets/ENV_SPREADSHEET_ID/values/Sheet1!A1:append',
            method: 'POST',
            headers: '{\n  "Content-Type": "application/json"\n}',
            body: '{\n  "values": [["{{input.output}}"]]\n}'
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'get-reviews', target: 'apply-kmeans', animated: true },
      { id: 'e2-3', source: 'apply-kmeans', target: 'clusters-to-list', animated: true },
      { id: 'e3-4', source: 'clusters-to-list', target: 'customer-insights-agent', animated: true },
      { id: 'e4-5', source: 'customer-insights-agent', target: 'insights-to-gsheets', animated: true }
    ]
  }
};

export const devopsWorkflow = {
  name: 'Dev Ops API Conversion Automation',
  description: 'Convert natural language descriptions of API requests into executable API calls using an AI agent.',
  triggerType: 'MANUAL',
  tags: ['devops', 'ai', 'api', 'agent'],
  canvasData: {
    nodes: [
      { id: 'webhook', type: 'flowNode', position: { x: 100, y: 300 }, data: { label: 'Webhook', nodeType: 'webhookTrigger', icon: '🪝', color: '#5B5FFF', config: { method: 'POST', path: '/devops-webhook' } } },
      { id: 'ai-agent', type: 'flowNode', position: { x: 350, y: 300 }, data: { label: 'AI Agent', nodeType: 'openaiNode', icon: '🤖', color: '#10B981', config: { model: 'gpt-4o', systemPrompt: 'Convert user prompt into API command. Out: JSON {method, url, body}', userPrompt: 'Prompt: {{input.body}}' } } },
      { id: 'switch', type: 'flowNode', position: { x: 600, y: 300 }, data: { label: 'Switch', nodeType: 'switchNode', icon: '🔀', color: '#8A5CFF', config: { field: '{{input.method}}' } } },
      { id: 'get-properties', type: 'flowNode', position: { x: 850, y: 150 }, data: { label: 'Get properties', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: '{{input.url}}', method: 'GET' } } },
      { id: 'post-url', type: 'flowNode', position: { x: 850, y: 300 }, data: { label: 'Post URL', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: '{{input.url}}', method: 'POST', body: '{{input.body}}' } } },
      { id: 'delete-return', type: 'flowNode', position: { x: 850, y: 450 }, data: { label: 'Delete/Return', nodeType: 'conditionNode', icon: '❔', color: '#8A5CFF', config: { expression: '{{input.confirm}} === true' } } },
      { id: 'delete-url', type: 'flowNode', position: { x: 1100, y: 400 }, data: { label: 'Delete URL', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: '{{input.url}}', method: 'DELETE' } } },
      { id: 'return-output', type: 'flowNode', position: { x: 1100, y: 550 }, data: { label: 'Return output', nodeType: 'codeNode', icon: '💻', color: '#7C3AED', config: { code: 'return { status: "skipped" };' } } }
    ],
    edges: [
      { id: 'e1-2', source: 'webhook', target: 'ai-agent', animated: true },
      { id: 'e2-3', source: 'ai-agent', target: 'switch', animated: true },
      { id: 'e3-4', source: 'switch', target: 'get-properties', sourceHandle: 'case1', animated: true },
      { id: 'e3-5', source: 'switch', target: 'post-url', sourceHandle: 'case2', animated: true },
      { id: 'e3-6', source: 'switch', target: 'delete-return', sourceHandle: 'default', animated: true },
      { id: 'e6-7', source: 'delete-return', target: 'delete-url', sourceHandle: 'true', animated: true },
      { id: 'e6-8', source: 'delete-return', target: 'return-output', sourceHandle: 'false', animated: true }
    ]
  }
};

export const secopsWorkflow = {
  name: 'Sec Ops Incident Ticket Enrichment',
  description: 'Analyze incoming security issues, scan suspicious domains via VirusTotal/urlscan, and notify Slack.',
  triggerType: 'MANUAL',
  tags: ['security', 'secops', 'slack', 'virustotal'],
  canvasData: {
    nodes: [
      { id: 'new-issue', type: 'flowNode', position: { x: 100, y: 300 }, data: { label: 'On new issue', nodeType: 'webhookTrigger', icon: '🪝', color: '#5B5FFF', config: { path: '/security-issue' } } },
      { id: 'extract-ips', type: 'flowNode', position: { x: 300, y: 300 }, data: { label: 'Extract IPs and domains', nodeType: 'codeNode', icon: '💻', color: '#7C3AED', config: { code: '// Extract domains/IPs\nconst text = input.body.description || "";\nconst domains = text.match(/\\b[a-z0-9.-]+\\.[a-z]{2,}\\b/gi) || [];\nreturn { domain: domains[0] || "example.com" };' } } },
      { id: 'vt-scan', type: 'flowNode', position: { x: 550, y: 150 }, data: { label: 'VirusTotal: Scan URL', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: 'https://www.virustotal.com/api/v3/urls', method: 'POST' } } },
      { id: 'vt-report', type: 'flowNode', position: { x: 800, y: 150 }, data: { label: 'VirusTotal: Get Report', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: 'https://www.virustotal.com/api/v3/urls/{{input.id}}', method: 'GET' } } },
      { id: 'urlscan', type: 'flowNode', position: { x: 550, y: 450 }, data: { label: 'urlscan.io', nodeType: 'httpRequest', icon: '🌐', color: '#32D9FF', config: { url: 'https://urlscan.io/api/v1/scan/', method: 'POST' } } },
      { id: 'merge', type: 'flowNode', position: { x: 1050, y: 300 }, data: { label: 'Merge reports', nodeType: 'mergeNode', icon: '🔗', color: '#8A5CFF', config: { mode: 'all' } } },
      { id: 'post-results', type: 'flowNode', position: { x: 1250, y: 300 }, data: { label: 'Post results', nodeType: 'slackNode', icon: '💬', color: '#E01E5A', config: { channel: '#security-alerts', message: 'Incident scan results:\nVT: {{input.a.result}}\nurlscan: {{input.b.result}}' } } }
    ],
    edges: [
      { id: 'e1-2', source: 'new-issue', target: 'extract-ips', animated: true },
      { id: 'e2-3', source: 'extract-ips', target: 'vt-scan', animated: true },
      { id: 'e2-5', source: 'extract-ips', target: 'urlscan', animated: true },
      { id: 'e3-4', source: 'vt-scan', target: 'vt-report', animated: true },
      { id: 'e4-6', source: 'vt-report', target: 'merge', targetHandle: 'a', animated: true },
      { id: 'e5-6', source: 'urlscan', target: 'merge', targetHandle: 'b', animated: true },
      { id: 'e6-7', source: 'merge', target: 'post-results', animated: true }
    ]
  }
};

export const itopsWorkflow = {
  name: 'IT Ops Employee Onboarding Automation',
  description: 'Automate employee onboarding: check role using AI Agent and configure Slack and email access.',
  triggerType: 'MANUAL',
  tags: ['itops', 'onboarding', 'slack', 'email'],
  canvasData: {
    nodes: [
      { id: 'form-submission', type: 'flowNode', position: { x: 100, y: 300 }, data: { label: 'On Create User form submission', nodeType: 'webhookTrigger', icon: '🪝', color: '#5B5FFF', config: { path: '/employee-onboarding' } } },
      { id: 'ai-agent', type: 'flowNode', position: { x: 350, y: 300 }, data: { label: 'AI Agent', nodeType: 'openaiNode', icon: '🤖', color: '#10B981', config: { model: 'gpt-4o', systemPrompt: 'Analyze user role and return metadata.', userPrompt: 'Role: {{input.role}}' } } },
      { id: 'is-manager', type: 'flowNode', position: { x: 600, y: 300 }, data: { label: 'Is a manager?', nodeType: 'conditionNode', icon: '❔', color: '#8A5CFF', config: { expression: '{{input.isManager}} === true' } } },
      { id: 'add-to-channel', type: 'flowNode', position: { x: 850, y: 200 }, data: { label: 'Add to channel', nodeType: 'slackNode', icon: '💬', color: '#E01E5A', config: { channel: '#managers', message: 'Welcome new manager: {{input.name}}' } } },
      { id: 'update-profile', type: 'flowNode', position: { x: 850, y: 400 }, data: { label: 'Update profile', nodeType: 'emailNode', icon: '✉️', color: '#22C55E', config: { to: '{{input.email}}', subject: 'Your onboarding info', body: 'Welcome to the team!' } } }
    ],
    edges: [
      { id: 'e1-2', source: 'form-submission', target: 'ai-agent', animated: true },
      { id: 'e2-3', source: 'ai-agent', target: 'is-manager', animated: true },
      { id: 'e3-4', source: 'is-manager', target: 'add-to-channel', sourceHandle: 'true', animated: true },
      { id: 'e3-5', source: 'is-manager', target: 'update-profile', sourceHandle: 'false', animated: true }
    ]
  }
};

export default router;

