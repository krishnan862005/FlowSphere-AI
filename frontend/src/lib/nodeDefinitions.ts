import type { NodeDefinition } from '@flowsphere/types';

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  // ─── Triggers ──────────────────────────────────────────────
  webhookTrigger: {
    type: 'webhookTrigger', category: 'TRIGGER', label: 'Webhook Trigger',
    description: 'Trigger workflow via HTTP webhook', icon: '🪝', color: '#5B5FFF',
    inputs: [], outputs: [{ id: 'output', label: 'Payload', type: 'data' }],
    configSchema: [
      { key: 'method', label: 'HTTP Method', type: 'select', options: [{ label: 'POST', value: 'POST' }, { label: 'GET', value: 'GET' }], defaultValue: 'POST' },
      { key: 'path', label: 'Webhook Path', type: 'text', placeholder: '/webhook/my-workflow', required: true },
      { key: 'secret', label: 'Webhook Secret', type: 'secret' },
    ],
    keywords: ['webhook', 'http', 'trigger', 'receive'],
  },
  scheduleTrigger: {
    type: 'scheduleTrigger', category: 'TIMER', label: 'Schedule Trigger',
    description: 'Run workflow on a cron schedule', icon: '⏰', color: '#F59E0B',
    inputs: [], outputs: [{ id: 'output', label: 'Trigger', type: 'trigger' }],
    configSchema: [
      { key: 'cron', label: 'Cron Expression', type: 'text', placeholder: '0 9 * * 1-5', required: true },
      { key: 'timezone', label: 'Timezone', type: 'select', options: [{ label: 'UTC', value: 'UTC' }, { label: 'US Eastern', value: 'America/New_York' }], defaultValue: 'UTC' },
    ],
    keywords: ['schedule', 'cron', 'timer', 'periodic'],
  },
  manualTrigger: {
    type: 'manualTrigger', category: 'TRIGGER', label: 'Manual Trigger',
    description: 'Manually trigger the workflow', icon: '▶️', color: '#22C55E',
    inputs: [], outputs: [{ id: 'output', label: 'Trigger', type: 'trigger' }],
    configSchema: [
      { key: 'inputSchema', label: 'Input Schema (JSON)', type: 'json' },
    ],
    keywords: ['manual', 'button', 'start'],
  },

  // ─── HTTP ─────────────────────────────────────────────────
  httpRequest: {
    type: 'httpRequest', category: 'HTTP', label: 'HTTP Request',
    description: 'Make an HTTP request to any URL', icon: '🌐', color: '#32D9FF',
    inputs: [{ id: 'input', label: 'Input', type: 'data' }],
    outputs: [{ id: 'response', label: 'Response', type: 'data' }, { id: 'error', label: 'Error', type: 'error' }],
    configSchema: [
      { key: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://api.example.com/data' },
      { key: 'method', label: 'Method', type: 'select', options: ['GET','POST','PUT','PATCH','DELETE'].map(v => ({ label: v, value: v })), defaultValue: 'GET' },
      { key: 'headers', label: 'Headers (JSON)', type: 'json' },
      { key: 'body', label: 'Body (JSON)', type: 'json' },
      { key: 'timeout', label: 'Timeout (ms)', type: 'number', defaultValue: 30000 },
    ],
    keywords: ['http', 'rest', 'api', 'request', 'fetch'],
  },

  // ─── Logic ─────────────────────────────────────────────────
  conditionNode: {
    type: 'conditionNode', category: 'LOGIC', label: 'Condition',
    description: 'Branch workflow based on a condition', icon: '❔', color: '#8A5CFF',
    inputs: [{ id: 'input', label: 'Input', type: 'data' }],
    outputs: [{ id: 'true', label: 'True', type: 'data' }, { id: 'false', label: 'False', type: 'data' }],
    configSchema: [
      { key: 'expression', label: 'Condition Expression', type: 'code', required: true, placeholder: '{{input.status}} === "active"' },
    ],
    keywords: ['if', 'condition', 'branch', 'logic'],
  },
  switchNode: {
    type: 'switchNode', category: 'LOGIC', label: 'Switch',
    description: 'Route to multiple branches', icon: '🔀', color: '#8A5CFF',
    inputs: [{ id: 'input', label: 'Input', type: 'data' }],
    outputs: [{ id: 'case1', label: 'Case 1', type: 'data' }, { id: 'case2', label: 'Case 2', type: 'data' }, { id: 'default', label: 'Default', type: 'data' }],
    configSchema: [
      { key: 'field', label: 'Switch on field', type: 'text', required: true, placeholder: '{{input.type}}' },
      { key: 'cases', label: 'Cases (JSON)', type: 'json' },
    ],
    keywords: ['switch', 'case', 'route', 'fork'],
  },
  loopNode: {
    type: 'loopNode', category: 'LOGIC', label: 'Loop',
    description: 'Iterate over an array', icon: '🔁', color: '#8A5CFF',
    inputs: [{ id: 'input', label: 'Array Input', type: 'data' }],
    outputs: [{ id: 'item', label: 'Each Item', type: 'data' }, { id: 'done', label: 'Done', type: 'trigger' }],
    configSchema: [
      { key: 'arrayPath', label: 'Array Path', type: 'text', required: true, placeholder: '{{input.items}}' },
      { key: 'batchSize', label: 'Batch Size', type: 'number', defaultValue: 10 },
    ],
    keywords: ['loop', 'foreach', 'iterate', 'array'],
  },
  delayNode: {
    type: 'delayNode', category: 'UTILITIES', label: 'Delay',
    description: 'Pause execution for a specified time', icon: '⏳', color: '#6B7280',
    inputs: [{ id: 'input', label: 'Input', type: 'data' }],
    outputs: [{ id: 'output', label: 'Output', type: 'data' }],
    configSchema: [
      { key: 'delayMs', label: 'Delay (ms)', type: 'number', required: true, defaultValue: 1000 },
    ],
    keywords: ['delay', 'wait', 'pause', 'sleep'],
  },
  mergeNode: {
    type: 'mergeNode', category: 'LOGIC', label: 'Merge',
    description: 'Merge multiple branches into one', icon: '🔗', color: '#8A5CFF',
    inputs: [{ id: 'a', label: 'Branch A', type: 'data' }, { id: 'b', label: 'Branch B', type: 'data' }],
    outputs: [{ id: 'output', label: 'Merged', type: 'data' }],
    configSchema: [
      { key: 'mode', label: 'Merge Mode', type: 'select', options: [{ label: 'Wait for all', value: 'all' }, { label: 'First wins', value: 'first' }], defaultValue: 'all' },
    ],
    keywords: ['merge', 'join', 'combine'],
  },

  // ─── AI ─────────────────────────────────────────────────
  openaiNode: {
    type: 'openaiNode', category: 'AI', label: 'OpenAI',
    description: 'Call OpenAI GPT models', icon: '🤖', color: '#10B981',
    inputs: [{ id: 'input', label: 'Prompt Input', type: 'data' }],
    outputs: [{ id: 'output', label: 'Response', type: 'data' }, { id: 'error', label: 'Error', type: 'error' }],
    configSchema: [
      { key: 'apiKey', label: 'API Key', type: 'secret', required: true },
      { key: 'model', label: 'Model', type: 'select', options: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'].map(v => ({ label: v, value: v })), defaultValue: 'gpt-4o' },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful assistant...' },
      { key: 'userPrompt', label: 'User Prompt', type: 'textarea', required: true, placeholder: 'Analyze this: {{input.text}}' },
      { key: 'maxTokens', label: 'Max Tokens', type: 'number', defaultValue: 1024 },
      { key: 'temperature', label: 'Temperature', type: 'number', defaultValue: 0.7 },
    ],
    keywords: ['openai', 'gpt', 'chatgpt', 'ai', 'llm', 'generate'],
  },
  geminiNode: {
    type: 'geminiNode', category: 'AI', label: 'Gemini',
    description: 'Call Google Gemini models', icon: '✨', color: '#4285F4',
    inputs: [{ id: 'input', label: 'Prompt', type: 'data' }],
    outputs: [{ id: 'output', label: 'Response', type: 'data' }],
    configSchema: [
      { key: 'model', label: 'Model', type: 'select', options: ['gemini-2.0-flash', 'gemini-1.5-pro'].map(v => ({ label: v, value: v })), defaultValue: 'gemini-2.0-flash' },
      { key: 'prompt', label: 'Prompt', type: 'textarea', required: true },
    ],
    keywords: ['gemini', 'google', 'ai', 'generate'],
  },
  claudeNode: {
    type: 'claudeNode', category: 'AI', label: 'Claude',
    description: 'Call Anthropic Claude models', icon: '🧠', color: '#D97706',
    inputs: [{ id: 'input', label: 'Prompt', type: 'data' }],
    outputs: [{ id: 'output', label: 'Response', type: 'data' }],
    configSchema: [
      { key: 'model', label: 'Model', type: 'select', options: ['claude-sonnet-4-5', 'claude-3-haiku'].map(v => ({ label: v, value: v })), defaultValue: 'claude-sonnet-4-5' },
      { key: 'prompt', label: 'Prompt', type: 'textarea', required: true },
      { key: 'maxTokens', label: 'Max Tokens', type: 'number', defaultValue: 1024 },
    ],
    keywords: ['claude', 'anthropic', 'ai', 'llm'],
  },
  imageGenerateNode: {
    type: 'imageGenerateNode', category: 'AI', label: 'Image Generation',
    description: 'Generate images with DALL-E 3', icon: '🎨', color: '#8B5CF6',
    inputs: [{ id: 'input', label: 'Prompt', type: 'data' }],
    outputs: [{ id: 'image', label: 'Image URL', type: 'data' }],
    configSchema: [
      { key: 'prompt', label: 'Image Prompt', type: 'textarea', required: true },
      { key: 'size', label: 'Size', type: 'select', options: ['1024x1024', '1792x1024', '1024x1792'].map(v => ({ label: v, value: v })), defaultValue: '1024x1024' },
      { key: 'quality', label: 'Quality', type: 'select', options: [{ label: 'Standard', value: 'standard' }, { label: 'HD', value: 'hd' }], defaultValue: 'standard' },
    ],
    keywords: ['image', 'dall-e', 'generate', 'picture'],
  },
  ocrNode: {
    type: 'ocrNode', category: 'AI', label: 'OCR',
    description: 'Extract text from images', icon: '🔍', color: '#0EA5E9',
    inputs: [{ id: 'image', label: 'Image URL', type: 'data' }],
    outputs: [{ id: 'text', label: 'Extracted Text', type: 'data' }],
    configSchema: [{ key: 'imageUrl', label: 'Image URL', type: 'text', required: true }],
    keywords: ['ocr', 'text extraction', 'image', 'scan'],
  },

  // ─── Messaging ─────────────────────────────────────────────
  emailNode: {
    type: 'emailNode', category: 'EMAIL', label: 'Send Email',
    description: 'Send an email via SMTP', icon: '✉️', color: '#22C55E',
    inputs: [{ id: 'input', label: 'Data', type: 'data' }],
    outputs: [{ id: 'output', label: 'Result', type: 'data' }],
    configSchema: [
      { key: 'to', label: 'To', type: 'text', required: true, placeholder: 'user@example.com or {{input.email}}' },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'body', label: 'Body (HTML)', type: 'textarea', required: true },
      { key: 'from', label: 'From Name', type: 'text' },
    ],
    keywords: ['email', 'smtp', 'send', 'mail', 'notify'],
  },
  slackNode: {
    type: 'slackNode', category: 'MESSAGING', label: 'Slack Message',
    description: 'Send a message to Slack', icon: '💬', color: '#E01E5A',
    inputs: [{ id: 'input', label: 'Data', type: 'data' }],
    outputs: [{ id: 'output', label: 'Result', type: 'data' }],
    configSchema: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'secret', required: true },
      { key: 'channel', label: 'Channel (Optional)', type: 'text', placeholder: '#general' },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'username', label: 'Bot Name', type: 'text', defaultValue: 'FlowSphere' },
    ],
    keywords: ['slack', 'message', 'chat', 'notify'],
  },
  discordNode: {
    type: 'discordNode', category: 'MESSAGING', label: 'Discord',
    description: 'Send a Discord webhook message', icon: '🎮', color: '#5865F2',
    inputs: [{ id: 'input', label: 'Data', type: 'data' }],
    outputs: [{ id: 'output', label: 'Result', type: 'data' }],
    configSchema: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'secret', required: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'username', label: 'Username', type: 'text' },
    ],
    keywords: ['discord', 'webhook', 'chat'],
  },
  telegramNode: {
    type: 'telegramNode', category: 'MESSAGING', label: 'Telegram',
    description: 'Send a Telegram message', icon: '✈️', color: '#26A5E4',
    inputs: [{ id: 'input', label: 'Data', type: 'data' }],
    outputs: [{ id: 'output', label: 'Result', type: 'data' }],
    configSchema: [
      { key: 'botToken', label: 'Bot Token', type: 'secret', required: true },
      { key: 'chatId', label: 'Chat ID', type: 'text', required: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
    ],
    keywords: ['telegram', 'bot', 'message'],
  },

  // ─── Database ──────────────────────────────────────────────
  databaseQuery: {
    type: 'databaseQuery', category: 'DATABASE', label: 'Database Query',
    description: 'Query a SQL database', icon: '🗃️', color: '#F59E0B',
    inputs: [{ id: 'input', label: 'Input', type: 'data' }],
    outputs: [{ id: 'rows', label: 'Rows', type: 'data' }, { id: 'error', label: 'Error', type: 'error' }],
    configSchema: [
      { key: 'connectionId', label: 'Database Connection', type: 'select', options: [], required: true },
      { key: 'query', label: 'SQL Query', type: 'code', required: true, placeholder: 'SELECT * FROM users WHERE id = {{input.userId}}' },
    ],
    keywords: ['sql', 'database', 'query', 'select', 'db'],
  },
  databaseInsert: {
    type: 'databaseInsert', category: 'DATABASE', label: 'Database Insert',
    description: 'Insert rows into a database', icon: '➕', color: '#F59E0B',
    inputs: [{ id: 'input', label: 'Data', type: 'data' }],
    outputs: [{ id: 'result', label: 'Result', type: 'data' }],
    configSchema: [
      { key: 'connectionId', label: 'Database Connection', type: 'select', options: [], required: true },
      { key: 'table', label: 'Table Name', type: 'text', required: true },
      { key: 'data', label: 'Data (JSON)', type: 'json', required: true },
    ],
    keywords: ['insert', 'database', 'write', 'create'],
  },

  // ─── Files ─────────────────────────────────────────────────
  csvNode: {
    type: 'csvNode', category: 'FILES', label: 'Parse CSV',
    description: 'Parse or generate CSV files', icon: '📊', color: '#059669',
    inputs: [{ id: 'input', label: 'CSV Data', type: 'data' }],
    outputs: [{ id: 'rows', label: 'Rows', type: 'data' }],
    configSchema: [
      { key: 'delimiter', label: 'Delimiter', type: 'text', defaultValue: ',' },
      { key: 'hasHeader', label: 'Has Header Row', type: 'boolean', defaultValue: true },
    ],
    keywords: ['csv', 'excel', 'spreadsheet', 'parse'],
  },
  pdfNode: {
    type: 'pdfNode', category: 'FILES', label: 'PDF',
    description: 'Generate or parse PDF documents', icon: '📄', color: '#DC2626',
    inputs: [{ id: 'input', label: 'Data', type: 'data' }],
    outputs: [{ id: 'pdf', label: 'PDF URL', type: 'data' }],
    configSchema: [
      { key: 'template', label: 'HTML Template', type: 'textarea', required: true },
      { key: 'filename', label: 'Filename', type: 'text', defaultValue: 'document.pdf' },
    ],
    keywords: ['pdf', 'document', 'generate', 'export'],
  },

  // ─── Utilities / Integrations ──────────────────────────────
  githubNode: {
    type: 'githubNode', category: 'UTILITIES', label: 'GitHub',
    description: 'Interact with GitHub API', icon: '🐙', color: '#181717',
    inputs: [{ id: 'input', label: 'Data', type: 'data' }],
    outputs: [{ id: 'output', label: 'Result', type: 'data' }, { id: 'error', label: 'Error', type: 'error' }],
    configSchema: [
      { key: 'token', label: 'Personal Access Token', type: 'secret', required: true },
      { key: 'action', label: 'Action', type: 'select', options: [{ label: 'Create Issue', value: 'create_issue' }, { label: 'Get Repository', value: 'get_repo' }], defaultValue: 'get_repo' },
      { key: 'owner', label: 'Repository Owner', type: 'text', required: true, placeholder: 'octocat' },
      { key: 'repo', label: 'Repository Name', type: 'text', required: true, placeholder: 'Hello-World' },
      { key: 'title', label: 'Issue Title (If Create Issue)', type: 'text', placeholder: 'Found a bug!' },
      { key: 'body', label: 'Issue Body', type: 'textarea' },
    ],
    keywords: ['github', 'repository', 'issue', 'git', 'developer'],
  },

  // ─── Custom ────────────────────────────────────────────────
  codeNode: {
    type: 'codeNode', category: 'CUSTOM', label: 'Custom Code',
    description: 'Run custom JavaScript code', icon: '💻', color: '#7C3AED',
    inputs: [{ id: 'input', label: 'Input', type: 'data' }],
    outputs: [{ id: 'output', label: 'Output', type: 'data' }, { id: 'error', label: 'Error', type: 'error' }],
    configSchema: [
      {
        key: 'code', label: 'JavaScript Code', type: 'code', required: true,
        defaultValue: `// Available: input, context, console
// Return your result
return {
  result: input
};`,
      },
      { key: 'timeout', label: 'Timeout (ms)', type: 'number', defaultValue: 10000 },
    ],
    keywords: ['code', 'javascript', 'custom', 'script', 'function'],
  },
};

// Grouped by category for the node panel
export const NODE_CATEGORIES = {
  'Triggers': ['webhookTrigger', 'scheduleTrigger', 'manualTrigger'],
  'HTTP': ['httpRequest'],
  'Logic': ['conditionNode', 'switchNode', 'loopNode', 'mergeNode', 'delayNode'],
  'AI': ['openaiNode', 'geminiNode', 'claudeNode', 'imageGenerateNode', 'ocrNode'],
  'Email': ['emailNode'],
  'Messaging': ['slackNode', 'discordNode', 'telegramNode'],
  'Database': ['databaseQuery', 'databaseInsert'],
  'Files': ['csvNode', 'pdfNode'],
  'Utilities': ['githubNode'],
  'Custom': ['codeNode'],
};
