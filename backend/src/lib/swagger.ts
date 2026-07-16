import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlowSphere AI API',
      version: '1.0.0',
      description: 'Production-ready REST API for FlowSphere AI workflow automation platform',
      contact: {
        name: 'FlowSphere AI Team',
        url: 'https://flowsphere.ai',
        email: 'api@flowsphere.ai',
      },
      license: { name: 'MIT' },
    },
    servers: [
      { url: 'http://localhost:4000/api', description: 'Development' },
      { url: 'https://api.flowsphere.ai/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            username: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'MEMBER', 'VIEWER', 'GUEST'] },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] },
            twoFactorEnabled: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Workflow: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED', 'ERROR'] },
            triggerType: { type: 'string', enum: ['WEBHOOK', 'SCHEDULE', 'MANUAL', 'EVENT', 'API'] },
            tags: { type: 'array', items: { type: 'string' } },
            totalExecutions: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Execution: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            workflowId: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT', 'RETRYING'] },
            trigger: { type: 'string' },
            startedAt: { type: 'string', format: 'date-time', nullable: true },
            duration: { type: 'number', nullable: true },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Organizations', description: 'Organization management' },
      { name: 'Workflows', description: 'Workflow CRUD and management' },
      { name: 'Executions', description: 'Workflow execution management' },
      { name: 'AI', description: 'AI assistant endpoints' },
      { name: 'Integrations', description: 'Third-party integrations' },
      { name: 'API Keys', description: 'API key management' },
      { name: 'Admin', description: 'Admin-only endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
