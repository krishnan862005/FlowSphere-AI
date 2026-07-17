import { Router } from 'express';
import type { RequestHandler } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';


const router = Router();
router.use(authenticate as RequestHandler);

const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] || 'mock-key' });

const SYSTEM_PROMPT = `You are FlowSphere AI Assistant — an expert in workflow automation.
You help users:
1. Generate automation workflows from natural language descriptions
2. Explain how existing workflows work
3. Detect errors and misconfigurations in workflows
4. Optimize workflows for performance and reliability
5. Suggest improvements and best practices
6. Generate documentation

When generating workflows, output valid JSON with this structure:
{
  "workflow": { "name": "...", "description": "...", "tags": [...] },
  "canvasData": {
    "nodes": [{ "id": "...", "type": "...", "position": {"x":..., "y":...}, "data": {"label":"...", "category":"...", "config": {...}} }],
    "edges": [{ "id": "...", "source": "...", "target": "...", "animated": true }]
  },
  "explanation": "..."
}

Available node types: webhookTrigger, scheduleTrigger, manualTrigger, httpRequest, databaseQuery, databaseInsert, databaseUpdate, openaiNode, geminiNode, claudeNode, emailNode, slackNode, discordNode, telegramNode, conditionNode, switchNode, loopNode, delayNode, mergeNode, codeNode, csvNode, pdfNode, imageGenerateNode, ocrNode.`;

// ─── POST /ai/chat ────────────────────────────────────────────────────────────

router.post('/chat', async (req: AuthRequest, res, next) => {
  try {
    const { messages, context } = z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })).max(50),
      context: z.string().optional(),
    }).parse(req.body);

    const systemMsg = context
      ? `${SYSTEM_PROMPT}\n\nCurrent workflow context:\n${context}`
      : SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMsg },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const reply = completion.choices[0]?.message?.content ?? 'No response generated.';

    res.json({ success: true, data: { message: reply, usage: completion.usage } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /ai/generate-workflow ───────────────────────────────────────────────

router.post('/generate-workflow', async (req: AuthRequest, res, next) => {
  try {
    const { prompt } = z.object({ prompt: z.string().min(10).max(2000) }).parse(req.body);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate a complete workflow automation for this requirement:\n\n${prompt}\n\nReturn only valid JSON matching the required structure.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const result = JSON.parse(raw);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /ai/explain-workflow ────────────────────────────────────────────────

router.post('/explain-workflow', async (req: AuthRequest, res, next) => {
  try {
    const { workflowId } = z.object({ workflowId: z.string() }).parse(req.body);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow) throw new AppError('Workflow not found', 404, 'NOT_FOUND');
    if (workflow.organizationId !== req.user!.orgId) throw new AppError('Access denied', 403, 'FORBIDDEN');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Explain this workflow in plain language. Be clear and concise.\n\nWorkflow: ${JSON.stringify({ name: workflow.name, description: workflow.description, canvasData: workflow.canvasData })}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });

    res.json({ success: true, data: { explanation: completion.choices[0]?.message?.content } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /ai/detect-errors ───────────────────────────────────────────────────

router.post('/detect-errors', async (req: AuthRequest, res, next) => {
  try {
    const { workflowId } = z.object({ workflowId: z.string() }).parse(req.body);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow) throw new AppError('Workflow not found', 404, 'NOT_FOUND');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this workflow for errors, misconfigurations, and potential issues. Return JSON with: { "errors": [...], "warnings": [...], "suggestions": [...] }\n\nWorkflow: ${JSON.stringify(workflow.canvasData)}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    res.json({ success: true, data: JSON.parse(raw) });
  } catch (err) {
    next(err);
  }
});

// ─── POST /ai/optimize ────────────────────────────────────────────────────────

router.post('/optimize', async (req: AuthRequest, res, next) => {
  try {
    const { workflowId } = z.object({ workflowId: z.string() }).parse(req.body);

    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new AppError('Workflow not found', 404, 'NOT_FOUND');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Suggest performance optimizations for this workflow. Focus on reducing latency, improving reliability, and eliminating redundancy.\n\nWorkflow: ${JSON.stringify(workflow.canvasData)}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    res.json({ success: true, data: { suggestions: completion.choices[0]?.message?.content } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /ai/generate-docs ───────────────────────────────────────────────────

router.post('/generate-docs', async (req: AuthRequest, res, next) => {
  try {
    const { workflowId } = z.object({ workflowId: z.string() }).parse(req.body);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true },
    });
    if (!workflow) throw new AppError('Workflow not found', 404, 'NOT_FOUND');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate comprehensive Markdown documentation for this workflow, including: overview, prerequisites, how it works (step by step), configuration options, error handling, and examples.\n\nWorkflow: ${JSON.stringify({ name: workflow.name, description: workflow.description, canvasData: workflow.canvasData })}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 4096,
    });

    res.json({ success: true, data: { documentation: completion.choices[0]?.message?.content } });
  } catch (err) {
    next(err);
  }
});

export default router;
