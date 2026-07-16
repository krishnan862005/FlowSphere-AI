import 'dotenv/config';
import { PrismaClient, UserRole, OrgPlan, WorkflowStatus, NodeCategory } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Seeding FlowSphere AI database...');

  // ─── Super Admin ──────────────────────────────────────────────
  const adminPassword = await hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flowsphere.ai' },
    update: {},
    create: {
      id: 'cadmin0000000000000000001',
      email: 'admin@flowsphere.ai',
      name: 'FlowSphere Admin',
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
    },
  });
  console.info('✅ Admin user created:', admin.email);

  // ─── Demo User ─────────────────────────────────────────────────
  const demoPassword = await hash('Demo@123456', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@flowsphere.ai' },
    update: {},
    create: {
      id: 'cdemouser000000000000001',
      email: 'demo@flowsphere.ai',
      name: 'Demo User',
      username: 'demouser',
      passwordHash: demoPassword,
      role: UserRole.MEMBER,
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
    },
  });
  console.info('✅ Demo user created:', demoUser.email);

  // ─── Organization ──────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'flowsphere-demo' },
    update: {},
    create: {
      id: 'cdemoorg0000000000000001',
      name: 'FlowSphere Demo Org',
      slug: 'flowsphere-demo',
      description: 'Demo organization for FlowSphere AI',
      plan: OrgPlan.PROFESSIONAL,
      ownerId: admin.id,
      maxWorkflows: 100,
      maxExecutions: 10000,
      maxMembers: 25,
      maxApiKeys: 20,
    },
  });
  console.info('✅ Organization created:', org.name);

  // ─── Org Members ──────────────────────────────────────────────
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: admin.id } },
    update: {},
    create: { organizationId: org.id, userId: admin.id, role: UserRole.ADMIN, joinedAt: new Date() },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: demoUser.id } },
    update: {},
    create: { organizationId: org.id, userId: demoUser.id, role: UserRole.MEMBER, joinedAt: new Date() },
  });

  // ─── Workspace ────────────────────────────────────────────────
  const workspace = await prisma.workspace.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'default' } },
    update: {},
    create: {
      id: 'cworkspace00000000000001',
      organizationId: org.id,
      name: 'Default Workspace',
      slug: 'default',
      description: 'The default workspace',
      isDefault: true,
      color: '#5B5FFF',
      icon: 'layout-dashboard',
    },
  });
  console.info('✅ Workspace created:', workspace.name);

  // ─── Sample Workflows ─────────────────────────────────────────
  const sampleWorkflows = [
    {
      name: 'Customer Onboarding Automation',
      description: 'Automatically onboard new customers with personalized emails and Slack notifications',
      status: WorkflowStatus.ACTIVE,
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
    },
    {
      name: 'AI Content Generator',
      description: 'Generate and publish social media content using GPT-4o on a daily schedule',
      status: WorkflowStatus.ACTIVE,
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
    },
    {
      name: 'Data Sync Pipeline',
      description: 'Sync data from PostgreSQL to Google Sheets every hour',
      status: WorkflowStatus.PAUSED,
      tags: ['database', 'sheets', 'sync'],
      canvasData: { nodes: [], edges: [] },
    },
    {
      name: 'Sales Customer Insights Automation',
      description: 'Retrieve customer reviews from Qdrant, apply K-Means clustering, run OpenAI Agent analysis, and append results to Google Sheets.',
      status: WorkflowStatus.ACTIVE,
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
    },
    {
      name: 'Dev Ops API Conversion Automation',
      description: 'Convert natural language descriptions of API requests into executable API calls using an AI agent.',
      status: WorkflowStatus.ACTIVE,
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
      status: WorkflowStatus.ACTIVE,
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
      status: WorkflowStatus.ACTIVE,
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
    },
  ];

  for (const wf of sampleWorkflows) {
    await prisma.workflow.create({
      data: {
        ...wf,
        organizationId: org.id,
        workspaceId: workspace.id,
        createdById: demoUser.id,
        triggerType: 'WEBHOOK',
        totalExecutions: Math.floor(Math.random() * 500),
        successExecutions: Math.floor(Math.random() * 450),
        failedExecutions: Math.floor(Math.random() * 50),
      },
    });
  }
  console.info('✅ Sample workflows created');

  // ─── Feature Flags ────────────────────────────────────────────
  const featureFlags = [
    { key: 'ai_assistant', enabled: true, description: 'AI Assistant panel in workflow builder' },
    { key: 'template_marketplace', enabled: true, description: 'Browse and use workflow templates' },
    { key: 'real_time_collaboration', enabled: false, description: 'Live collaborative editing (beta)' },
    { key: 'advanced_analytics', enabled: true, description: 'Advanced execution analytics dashboard' },
    { key: 'git_sync', enabled: false, description: 'Sync workflows with GitHub (alpha)' },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { ...flag, rolloutPct: flag.enabled ? 100 : 0 },
    });
  }
  console.info('✅ Feature flags seeded');

  // ─── System Settings ──────────────────────────────────────────
  const systemSettings = [
    { key: 'smtp_configured', value: false },
    { key: 'maintenance_mode', value: false },
    { key: 'max_execution_timeout_ms', value: 300000 },
    { key: 'default_retry_count', value: 3 },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value },
    });
  }
  console.info('✅ System settings seeded');

  console.info('\n🚀 Database seeded successfully!');
  console.info('\n📋 Credentials:');
  console.info('   Admin: admin@flowsphere.ai / Admin@123456');
  console.info('   Demo:  demo@flowsphere.ai  / Demo@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
