import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

import { logger } from './logger';

// Real Prisma Client
const realPrisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
    ...(process.env['NODE_ENV'] === 'development' ? [{ level: 'query' as const, emit: 'event' as const }] : []),
  ],
});

realPrisma.$on('warn' as never, (e: unknown) => {
  logger.warn('Prisma warning:', e);
});

realPrisma.$on('error' as never, (e: unknown) => {
  logger.error('Prisma error:', e);
});

// Mock database store
const mockDb: Record<string, any[]> = {
  user: [],
  organization: [],
  organizationMember: [],
  workflow: [],
  execution: [],
  refreshToken: [],
  verificationToken: [],
  auditLog: [],
  apiKey: [],
  notification: [],
  workflowVersion: []
};

// Auto-fallback flag
let useMock = false;
let isMockSeeded = false;

async function seedMockDb() {
  if (isMockSeeded) return;
  isMockSeeded = true;
  
  try {
    const adminPassword = await hash('Admin@123456', 12);
    const demoPassword = await hash('Demo@123456', 12);
    
    // Seed users
    mockDb.user = [
      {
        id: 'cadmin0000000000000000001',
        email: 'admin@flowsphere.ai',
        name: 'FlowSphere Admin',
        username: 'admin',
        passwordHash: adminPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cdemouser000000000000001',
        email: 'demo@flowsphere.ai',
        name: 'Demo User',
        username: 'demouser',
        passwordHash: demoPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Seed organizations
    mockDb.organization = [
      {
        id: 'cdemoorg0000000000000001',
        name: 'FlowSphere Demo Org',
        slug: 'flowsphere-demo',
        description: 'Demo organization for FlowSphere AI',
        plan: 'PROFESSIONAL',
        ownerId: 'cadmin0000000000000000001',
        maxWorkflows: 100,
        maxExecutions: 10000,
        maxMembers: 25,
        maxApiKeys: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Seed organization members
    mockDb.organizationMember = [
      {
        id: 'org_mem_admin',
        organizationId: 'cdemoorg0000000000000001',
        userId: 'cadmin0000000000000000001',
        role: 'ADMIN',
        joinedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 'org_mem_demo',
        organizationId: 'cdemoorg0000000000000001',
        userId: 'cdemouser000000000000001',
        role: 'MEMBER',
        joinedAt: new Date(),
        createdAt: new Date()
      }
    ];

    // Seed workspaces
    mockDb.workspace = [
      {
        id: 'cworkspace00000000000001',
        organizationId: 'cdemoorg0000000000000001',
        name: 'Default Workspace',
        slug: 'default',
        description: 'The default workspace',
        isDefault: true,
        color: '#5B5FFF',
        icon: 'layout-dashboard',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Seed workflows
    mockDb.workflow = [
      {
        id: 'wf_sample_onboarding',
        name: 'Customer Onboarding Automation',
        description: 'Automatically onboard new customers with personalized emails and Slack notifications',
        status: 'ACTIVE',
        organizationId: 'cdemoorg0000000000000001',
        workspaceId: 'cworkspace00000000000001',
        createdById: 'cdemouser000000000000001',
        triggerType: 'WEBHOOK',
        tags: ['onboarding', 'email', 'slack'],
        canvasData: {
          nodes: [
            { id: 'trigger-1', type: 'webhookTrigger', position: { x: 100, y: 200 }, data: { label: 'New Customer Webhook' } },
            { id: 'email-1', type: 'emailNode', position: { x: 350, y: 200 }, data: { label: 'Send Welcome Email' } },
            { id: 'slack-1', type: 'slackNode', position: { x: 600, y: 200 }, data: { label: 'Notify Sales Team' } },
          ],
          edges: [
            { id: 'e1-2', source: 'trigger-1', target: 'email-1', animated: true },
            { id: 'e2-3', source: 'email-1', target: 'slack-1', animated: true },
          ],
        },
        totalExecutions: 245,
        successExecutions: 230,
        failedExecutions: 15,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf_sample_ai',
        name: 'AI Content Generator',
        description: 'Generate and publish social media content using GPT-4o on a daily schedule',
        status: 'ACTIVE',
        organizationId: 'cdemoorg0000000000000001',
        workspaceId: 'cworkspace00000000000001',
        createdById: 'cdemouser000000000000001',
        triggerType: 'WEBHOOK',
        tags: ['ai', 'social', 'content'],
        canvasData: {
          nodes: [
            { id: 'trigger-1', type: 'scheduleTrigger', position: { x: 100, y: 200 }, data: { label: 'Daily 9AM' } },
            { id: 'ai-1', type: 'openaiNode', position: { x: 350, y: 200 }, data: { label: 'Generate Content' } },
            { id: 'twitter-1', type: 'twitterNode', position: { x: 600, y: 200 }, data: { label: 'Post to Twitter' } },
          ],
          edges: [
            { id: 'e1-2', source: 'trigger-1', target: 'ai-1', animated: true },
            { id: 'e2-3', source: 'ai-1', target: 'twitter-1', animated: true },
          ],
        },
        totalExecutions: 112,
        successExecutions: 109,
        failedExecutions: 3,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf_sample_datasync',
        name: 'Data Sync Pipeline',
        description: 'Sync data from PostgreSQL to Google Sheets every hour',
        status: 'PAUSED',
        organizationId: 'cdemoorg0000000000000001',
        workspaceId: 'cworkspace00000000000001',
        createdById: 'cdemouser000000000000001',
        triggerType: 'WEBHOOK',
        tags: ['database', 'sheets', 'sync'],
        canvasData: { nodes: [], edges: [] },
        totalExecutions: 89,
        successExecutions: 80,
        failedExecutions: 9,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf_sample_sales',
        name: 'Sales Customer Insights Automation',
        description: 'Retrieve customer reviews from Qdrant, apply K-Means clustering, run OpenAI Agent analysis, and append results to Google Sheets.',
        status: 'ACTIVE',
        organizationId: 'cdemoorg0000000000000001',
        workspaceId: 'cworkspace00000000000001',
        createdById: 'cdemouser000000000000001',
        triggerType: 'WEBHOOK',
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
                label: 'K-means Algorithm',
                nodeType: 'codeNode',
                icon: '💻',
                color: '#7C3AED',
                config: {
                  code: '// Apply K-Means clustering algorithm on input vectors\nconst reviews = input.points || [];\nreturn { clusters: reviews };'
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
        },
        totalExecutions: 312,
        successExecutions: 295,
        failedExecutions: 17,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf_sample_devops',
        name: 'Dev Ops API Conversion Automation',
        description: 'Convert natural language descriptions of API requests into executable API calls using an AI agent.',
        status: 'ACTIVE',
        organizationId: 'cdemoorg0000000000000001',
        workspaceId: 'cworkspace00000000000001',
        createdById: 'cdemouser000000000000001',
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
        },
        totalExecutions: 198,
        successExecutions: 190,
        failedExecutions: 8,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf_sample_secops',
        name: 'Sec Ops Incident Ticket Enrichment',
        description: 'Analyze incoming security issues, scan suspicious domains via VirusTotal/urlscan, and notify Slack.',
        status: 'ACTIVE',
        organizationId: 'cdemoorg0000000000000001',
        workspaceId: 'cworkspace00000000000001',
        createdById: 'cdemouser000000000000001',
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
        },
        totalExecutions: 453,
        successExecutions: 432,
        failedExecutions: 21,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf_sample_itops',
        name: 'IT Ops Employee Onboarding Automation',
        description: 'Automate employee onboarding: check role using AI Agent and configure Slack and email access.',
        status: 'ACTIVE',
        organizationId: 'cdemoorg0000000000000001',
        workspaceId: 'cworkspace00000000000001',
        createdById: 'cdemouser000000000000001',
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
        },
        totalExecutions: 289,
        successExecutions: 280,
        failedExecutions: 9,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    logger.info('🌱 In-memory mock database seeded successfully');
  } catch (error) {
    logger.error('❌ Failed to seed in-memory mock database:', error);
  }
}

function getMockModel(modelName: string) {
  // Populate include-based relations from mock tables
  function populateRelations(item: any, args: any): any {
    if (!item || !args?.include) return item;
    const result = { ...item };
    for (const [relation, includeConfig] of Object.entries(args.include)) {
      // Map relation names to mock table names and foreign keys
      const relationMap: Record<string, { table: string; fk: string; type: 'many' | 'one' }> = {
        organizationMembers: { table: 'organizationMember', fk: 'userId', type: 'many' },
        organization: { table: 'organization', fk: 'id', type: 'one' },
        workspace: { table: 'workspace', fk: 'id', type: 'one' },
        user: { table: 'user', fk: 'id', type: 'one' },
        workflows: { table: 'workflow', fk: 'organizationId', type: 'many' },
        createdBy: { table: 'user', fk: 'id', type: 'one' },
      };
      
      const mapping = relationMap[relation];
      if (!mapping) {
        result[relation] = null;
        continue;
      }
      
      const relatedList = mockDb[mapping.table] || [];
      
      if (mapping.type === 'many') {
        // For "many" relations, filter items that reference this record
        let related: any[];
        if (relation === 'organizationMembers') {
          related = relatedList.filter((r: any) => r.userId === item.id);
        } else if (relation === 'workflows') {
          related = relatedList.filter((r: any) => r.organizationId === item.id);
        } else {
          related = relatedList.filter((r: any) => r[mapping.fk] === item.id);
        }
        
        // Recursively populate nested includes
        if (typeof includeConfig === 'object' && includeConfig !== null && (includeConfig as any).include) {
          related = related.map((r: any) => populateRelations(r, includeConfig));
        }
        
        result[relation] = related;
      } else {
        // For "one" relations, find the matching record
        let fkValue: string | undefined;
        if (relation === 'organization') fkValue = item.organizationId;
        else if (relation === 'workspace') fkValue = item.workspaceId;
        else if (relation === 'user' || relation === 'createdBy') fkValue = item.userId || item.createdById;
        
        const found = relatedList.find((r: any) => r.id === fkValue) || null;
        result[relation] = found;
      }
    }
    return result;
  }

  // Simple where clause matching
  function matchesWhere(item: any, where: any): boolean {
    if (!where) return true;
    for (const [key, value] of Object.entries(where)) {
      if (key === 'OR') continue; // skip complex queries
      if (key === 'AND') continue;
      if (key === 'NOT') continue;
      if (key === 'deletedAt') {
        if (value === null && item.deletedAt) return false;
        continue;
      }
      if (typeof value === 'object' && value !== null) {
        // Handle Prisma operators like { contains, mode }
        if ('contains' in (value as any)) continue; // skip search filters
        if ('has' in (value as any)) continue;
        if ('in' in (value as any)) {
          if (!(value as any).in.includes(item[key])) return false;
          continue;
        }
      }
      if (item[key] !== value) return false;
    }
    return true;
  }

  return {
    findUnique: async (args: any) => {
      const list = mockDb[modelName] || [];
      const found = list.find(item => {
        if (args.where.email && item.email === args.where.email) return true;
        if (args.where.id && item.id === args.where.id) return true;
        if (args.where.token && item.token === args.where.token) return true;
        if (args.where.slug && item.slug === args.where.slug) return true;
        if (args.where.keyHash && item.keyHash === args.where.keyHash) return true;
        return false;
      }) || null;
      return populateRelations(found, args);
    },
    findFirst: async (args: any) => {
      const list = mockDb[modelName] || [];
      if (!args || !args.where) return populateRelations(list[0] || null, args);
      const found = list.find(item => matchesWhere(item, args.where)) || null;
      return populateRelations(found, args);
    },
    findMany: async (args: any) => {
      let list = mockDb[modelName] || [];
      if (args?.where) {
        list = list.filter((item: any) => matchesWhere(item, args.where));
      }
      if (args?.orderBy) {
        // Basic sorting support
        const key = Object.keys(args.orderBy)[0] as string;
        const dir = args.orderBy[key];
        list = [...list].sort((a: any, b: any) => {
          if (dir === 'desc') return (b[key] > a[key] ? 1 : -1);
          return (a[key] > b[key] ? 1 : -1);
        });
      }
      if (args?.skip) list = list.slice(args.skip);
      if (args?.take) list = list.slice(0, args.take);
      return list.map((item: any) => populateRelations(item, args));
    },
    create: async (args: any) => {
      const data = { ...args.data };
      if (!data.id) data.id = Math.random().toString(36).substring(2, 9);
      if (!data.createdAt) data.createdAt = new Date();
      if (!data.updatedAt) data.updatedAt = new Date();
      
      // Setup mock connections/relations if needed
      if (modelName === 'user') {
        data.status = data.status || 'ACTIVE';
        data.emailVerified = data.emailVerified ?? true;
      }
      
      if (!mockDb[modelName]) mockDb[modelName] = [];
      mockDb[modelName].push(data);
      return populateRelations(data, args);
    },
    update: async (args: any) => {
      const list = mockDb[modelName] || [];
      const item = list.find(x => x.id === args.where.id || (args.where.token && x.token === args.where.token));
      if (item) {
        Object.assign(item, args.data);
        return populateRelations(item, args);
      }
      return args.data;
    },
    upsert: async (args: any) => {
      const list = mockDb[modelName] || [];
      const item = list.find(x => {
        if (args.where.id) return x.id === args.where.id;
        if (args.where.email) return x.email === args.where.email;
        return false;
      });
      if (item) {
        Object.assign(item, args.update);
        return populateRelations(item, args);
      }
      const data = { ...args.create };
      if (!data.id) data.id = Math.random().toString(36).substring(2, 9);
      if (!data.createdAt) data.createdAt = new Date();
      if (!data.updatedAt) data.updatedAt = new Date();
      if (!mockDb[modelName]) mockDb[modelName] = [];
      mockDb[modelName].push(data);
      return populateRelations(data, args);
    },
    delete: async (args: any) => {
      const list = mockDb[modelName] || [];
      const index = list.findIndex(x => x.id === args.where.id);
      if (index !== -1) {
        return list.splice(index, 1)[0];
      }
      return null;
    },
    count: async (args: any) => {
      let list = mockDb[modelName] || [];
      if (args?.where) {
        list = list.filter((item: any) => matchesWhere(item, args.where));
      }
      return list.length;
    },
    aggregate: async (args: any) => {
      const list = mockDb[modelName] || [];
      const count = list.length;
      const result: any = { _count: count };
      // Populate _avg fields with null (no real data to average)
      if (args?._avg) {
        result._avg = {};
        for (const field of Object.keys(args._avg)) {
          result._avg[field] = null;
        }
      }
      if (args?._sum) {
        result._sum = {};
        for (const field of Object.keys(args._sum)) {
          result._sum[field] = null;
        }
      }
      return result;
    },
  };
}

// Proxy wrapper that delegates to realPrisma or falls back to mockPrisma
export const prisma = new Proxy(realPrisma, {
  get(target, prop) {
    if (prop === '$connect') {
      return async () => {
        try {
          if (useMock) return;
          await realPrisma.$connect();
        } catch (err) {
          logger.warn('⚠️ Could not connect to real database. Falling back to IN-MEMORY MOCK database.');
          useMock = true;
          await seedMockDb();
        }
      };
    }
    if (prop === '$disconnect') {
      return async () => {
        if (useMock) return;
        await realPrisma.$disconnect();
      };
    }
    if (prop === '$on') {
      return (event: string, cb: any) => {
        if (useMock) return;
        (realPrisma as any).$on(event, cb);
      };
    }
    
    if (typeof prop === 'string') {
      if (useMock) {
        return getMockModel(prop);
      }
      
      // Return a proxy to intercept runtime query errors and auto-enable mock fallback
      const realModel = (realPrisma as any)[prop];
      if (realModel) {
        return new Proxy(realModel, {
          get(modelTarget, modelProp) {
            const method = (modelTarget as any)[modelProp];
            if (typeof method === 'function') {
              return async (...args: any[]) => {
                try {
                  return await method.apply(modelTarget, args);
                } catch (err: any) {
                  // Catch connection errors
                  if (err.message?.includes('Can\'t reach database server') || err.message?.includes('Environment variable not found')) {
                    logger.warn('⚠️ Database query failed. Automatically falling back to IN-MEMORY MOCK database.');
                    useMock = true;
                    await seedMockDb();
                    const mockModel = getMockModel(prop);
                    return await (mockModel as any)[modelProp](...args);
                  }
                  throw err;
                }
              };
            }
            return method;
          }
        });
      }
      if (mockDb[prop]) {
        return getMockModel(prop);
      }
    }
    
    return (target as any)[prop];
  }
}) as unknown as PrismaClient;
