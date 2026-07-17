import 'dotenv/config';
import type Bull from 'bull';

import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { connectRedis } from '../lib/redis';
import { getExecutionQueue } from '../queues/executionQueue';

interface ExecutionJobData {
  executionId: string;
  workflowId: string;
}

async function bootstrap() {
  await prisma.$connect();
  await connectRedis();
  logger.info('🔧 Execution worker started');

  const queue = getExecutionQueue();

  queue.process('execute', 5, async (job: Bull.Job<ExecutionJobData>) => {
    const { executionId, workflowId } = job.data;
    logger.info(`Processing execution ${executionId} for workflow ${workflowId}`);

    // Update status to RUNNING
    await prisma.execution.update({
      where: { id: executionId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    const startTime = Date.now();

    try {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true, edges: true },
      });

      if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

      // Log start
      await prisma.executionLog.create({
        data: {
          executionId,
          level: 'INFO',
          message: `Starting execution of workflow "${workflow.name}"`,
        },
      });

      // Get canvas data
      const canvasData = workflow.canvasData as { nodes: Array<{id: string; type: string; data: Record<string, unknown>}>; edges: Array<{source: string; target: string}> } | null;
      const nodes = canvasData?.nodes ?? [];

      // Execute nodes in order (topological sort)
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const executed = new Set<string>();
      const outputs = new Map<string, unknown>();

      // Find root nodes (no incoming edges)
      const hasIncoming = new Set((canvasData?.edges ?? []).map((e) => e.target));
      const rootNodes = nodes.filter((n) => !hasIncoming.has(n.id));

      // Simple BFS execution
      const queue: typeof nodes = [...rootNodes];
      while (queue.length > 0) {
        const node = queue.shift();
        if (!node || executed.has(node.id)) continue;

        // Update progress
        await job.progress(Math.round((executed.size / nodes.length) * 100));

        const nodeExec = await prisma.nodeExecution.create({
          data: {
            executionId,
            nodeId: node.id,
            nodeType: node.type,
            status: 'RUNNING',
            startedAt: new Date(),
            inputData: { input: outputs.get(node.id) ?? {} } as any,
          },
        });

        try {
          // Execute node (stub — real implementation per node type)
          const output = await executeNode(node.type, node.data, outputs);

          await prisma.nodeExecution.update({
            where: { id: nodeExec.id },
            data: {
              status: 'SUCCESS',
              completedAt: new Date(),
              duration: Date.now() - startTime,
              outputData: output as any,
            },
          });

          outputs.set(node.id, output);
          executed.add(node.id);

          await prisma.executionLog.create({
            data: {
              executionId,
              nodeId: node.id,
              level: 'INFO',
              message: `Node "${node.data['label'] ?? node.type}" completed successfully`,
              data: output as any,
            },
          });

          // Queue connected nodes
          const nextNodeIds = (canvasData?.edges ?? [])
            .filter((e) => e.source === node.id)
            .map((e) => e.target);
          for (const nextId of nextNodeIds) {
            const nextNode = nodeMap.get(nextId);
            if (nextNode && !executed.has(nextId)) queue.push(nextNode);
          }
        } catch (nodeError) {
          const errMsg = nodeError instanceof Error ? nodeError.message : 'Unknown error';
          await prisma.nodeExecution.update({
            where: { id: nodeExec.id },
            data: { status: 'FAILED', completedAt: new Date(), errorMessage: errMsg },
          });
          await prisma.executionLog.create({
            data: {
              executionId,
              nodeId: node.id,
              level: 'ERROR',
              message: `Node "${node.data['label'] ?? node.type}" failed: ${errMsg}`,
            },
          });
          throw nodeError;
        }
      }

      const duration = Date.now() - startTime;
      await prisma.execution.update({
        where: { id: executionId },
        data: { status: 'SUCCESS', completedAt: new Date(), duration },
      });

      await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          totalExecutions: { increment: 1 },
          successExecutions: { increment: 1 },
          lastExecutedAt: new Date(),
          avgExecutionTime: duration,
        },
      });

      await prisma.executionLog.create({
        data: {
          executionId,
          level: 'INFO',
          message: `Workflow completed successfully in ${duration}ms`,
        },
      });

      logger.info(`✅ Execution ${executionId} completed in ${duration}ms`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Execution failed';
      const duration = Date.now() - startTime;

      await prisma.execution.update({
        where: { id: executionId },
        data: { status: 'FAILED', completedAt: new Date(), duration, errorMessage: errMsg },
      });

      await prisma.workflow.update({
        where: { id: workflowId },
        data: { totalExecutions: { increment: 1 }, failedExecutions: { increment: 1 } },
      });

      logger.error(`❌ Execution ${executionId} failed:`, error);
      throw error;
    }
  });

  queue.on('failed', async (job, err) => {
    logger.error(`Job ${job.id} failed after ${job.opts.attempts} attempts:`, err.message);
  });

  queue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });
}

// ─── Node executor stubs ──────────────────────────────────────────────────────

async function executeNode(
  type: string,
  data: Record<string, unknown>,
  inputs: Map<string, unknown>
): Promise<unknown> {
  // Simulate some processing time
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

  switch (type) {
    case 'webhookTrigger':
    case 'scheduleTrigger':
    case 'manualTrigger':
      return { triggered: true, timestamp: new Date().toISOString() };

    case 'httpRequest': {
      const config = data['config'] as { url?: string; method?: string } | undefined;
      if (config?.url) {
        const res = await fetch(config.url, { method: config.method ?? 'GET' });
        return { status: res.status, ok: res.ok };
      }
      return { status: 200, ok: true };
    }

    case 'conditionNode': {
      const value = inputs.values().next().value;
      return { result: Boolean(value), branch: value ? 'true' : 'false' };
    }

    case 'delayNode': {
      const ms = (data['config'] as { delayMs?: number } | undefined)?.delayMs ?? 1000;
      await new Promise((r) => setTimeout(r, Math.min(ms, 30000)));
      return { delayed: true, ms };
    }

    case 'emailNode':
      return { sent: true, to: (data['config'] as { to?: string } | undefined)?.to };

    case 'slackNode': {
      const config = data['config'] as any;
      if (!config?.webhookUrl) throw new Error('Slack Webhook URL is required');
      
      const payload: any = {
        text: config.message || 'Empty message'
      };
      if (config.channel) payload.channel = config.channel;
      if (config.username) payload.username = config.username;

      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Slack API Error: ${res.status} - ${await res.text()}`);
      }
      
      return { sent: true, channel: config.channel };
    }

    case 'openaiNode': {
      const config = data['config'] as any;
      if (!config?.apiKey) throw new Error('OpenAI API Key is required');
      
      const messages = [];
      if (config.systemPrompt) {
        messages.push({ role: 'system', content: config.systemPrompt });
      }
      if (config.userPrompt) {
        let prompt = config.userPrompt;
        // Basic variable substitution from inputs
        for (const value of inputs.values()) {
          if (value && typeof value === 'object') {
             const v = value as any;
             if (v.text) prompt = prompt.replace(/\{\{input\.text\}\}/g, String(v.text));
             if (v.body) prompt = prompt.replace(/\{\{input\.body\}\}/g, String(v.body));
             if (v.role) prompt = prompt.replace(/\{\{input\.role\}\}/g, String(v.role));
          }
        }
        messages.push({ role: 'user', content: prompt });
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o',
          messages,
          max_tokens: config.maxTokens || 1024,
          temperature: config.temperature || 0.7
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API Error: ${res.status} - ${errorText}`);
      }
      const result = await res.json();
      return { response: result.choices?.[0]?.message?.content, raw: result };
    }

    case 'githubNode': {
      const config = data['config'] as any;
      if (!config?.token) throw new Error('GitHub Personal Access Token is required');
      if (!config?.owner || !config?.repo) throw new Error('Repository owner and name are required');
      
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${config.token}`,
        'User-Agent': 'FlowSphere-AI'
      };

      if (config.action === 'create_issue') {
        const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/issues`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: config.title || 'New Issue from FlowSphere',
            body: config.body || ''
          })
        });
        if (!res.ok) throw new Error(`GitHub API Error: ${res.status} - ${await res.text()}`);
        return { issue: await res.json() };
      } else {
        const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
          method: 'GET',
          headers
        });
        if (!res.ok) throw new Error(`GitHub API Error: ${res.status} - ${await res.text()}`);
        return { repository: await res.json() };
      }
    }

    default:
      return { executed: true, type, label: data['label'] };
  }
}

bootstrap().catch((e) => {
  logger.error('Worker bootstrap failed:', e);
  process.exit(1);
});
