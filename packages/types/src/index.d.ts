export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: PaginationMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    username?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    role: UserRole;
    status: UserStatus;
    twoFactorEnabled: boolean;
    timezone: string;
    locale: string;
    theme: string;
    onboardingCompleted: boolean;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface PublicUser {
    id: string;
    name: string;
    username?: string | null;
    avatarUrl?: string | null;
}
export interface LoginPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RegisterPayload {
    email: string;
    password: string;
    name: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
    requiresTwoFactor?: boolean;
    twoFactorToken?: string;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    orgId?: string;
    iat?: number;
    exp?: number;
}
export type OrgPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    plan: OrgPlan;
    ownerId: string;
    maxWorkflows: number;
    maxExecutions: number;
    maxMembers: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrganizationMember {
    id: string;
    organizationId: string;
    userId: string;
    role: UserRole;
    joinedAt?: Date | null;
    user?: PublicUser;
}
export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'ERROR';
export type TriggerType = 'WEBHOOK' | 'SCHEDULE' | 'MANUAL' | 'EVENT' | 'API';
export interface Workflow {
    id: string;
    organizationId: string;
    workspaceId?: string | null;
    createdById: string;
    name: string;
    description?: string | null;
    status: WorkflowStatus;
    triggerType: TriggerType;
    triggerConfig?: Record<string, unknown> | null;
    tags: string[];
    isTemplate: boolean;
    isPublic: boolean;
    version: number;
    canvasData?: CanvasData | null;
    viewportData?: ViewportData | null;
    totalExecutions: number;
    successExecutions: number;
    failedExecutions: number;
    lastExecutedAt?: Date | null;
    avgExecutionTime?: number | null;
    cronExpression?: string | null;
    nextRunAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CanvasData {
    nodes: FlowNode[];
    edges: FlowEdge[];
}
export interface ViewportData {
    x: number;
    y: number;
    zoom: number;
}
export type NodeCategory = 'TRIGGER' | 'WEBHOOK' | 'TIMER' | 'HTTP' | 'DATABASE' | 'STORAGE' | 'AI' | 'MESSAGING' | 'EMAIL' | 'SOCIAL' | 'LOGIC' | 'FILES' | 'UTILITIES' | 'CUSTOM';
export interface FlowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: NodeData;
    width?: number;
    height?: number;
    selected?: boolean;
}
export interface NodeData {
    label: string;
    category: NodeCategory;
    config?: Record<string, unknown>;
    inputHandles?: HandleDef[];
    outputHandles?: HandleDef[];
    description?: string;
    isValid?: boolean;
    errors?: string[];
}
export interface HandleDef {
    id: string;
    label: string;
    type: 'data' | 'trigger' | 'error';
    required?: boolean;
}
export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    type?: string;
    animated?: boolean;
    label?: string;
    data?: Record<string, unknown>;
}
export interface NodeDefinition {
    type: string;
    category: NodeCategory;
    label: string;
    description: string;
    icon: string;
    color: string;
    inputs: HandleDef[];
    outputs: HandleDef[];
    configSchema: NodeConfigField[];
    keywords: string[];
}
export interface NodeConfigField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json' | 'code' | 'secret';
    required?: boolean;
    placeholder?: string;
    defaultValue?: unknown;
    options?: {
        label: string;
        value: string;
    }[];
    description?: string;
}
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' | 'RETRYING';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export interface Execution {
    id: string;
    workflowId: string;
    status: ExecutionStatus;
    trigger: string;
    triggerData?: unknown;
    outputData?: unknown;
    errorMessage?: string | null;
    retryCount: number;
    startedAt?: Date | null;
    completedAt?: Date | null;
    duration?: number | null;
    createdAt: Date;
}
export interface ExecutionLog {
    id: string;
    executionId: string;
    nodeId?: string | null;
    level: LogLevel;
    message: string;
    data?: unknown;
    timestamp: Date;
}
export interface ExecutionUpdate {
    executionId: string;
    status: ExecutionStatus;
    nodeId?: string;
    nodeStatus?: ExecutionStatus;
    log?: ExecutionLog;
    progress?: number;
}
export interface WsClientToServer {
    'execution:subscribe': {
        executionId: string;
    };
    'execution:unsubscribe': {
        executionId: string;
    };
    'workflow:join': {
        workflowId: string;
    };
    'workflow:leave': {
        workflowId: string;
    };
}
export interface WsServerToClient {
    'execution:update': ExecutionUpdate;
    'execution:log': ExecutionLog;
    'notification:new': Notification;
    'workflow:updated': {
        workflowId: string;
        userId: string;
    };
}
export type NotificationType = 'EXECUTION_SUCCESS' | 'EXECUTION_FAILED' | 'WORKFLOW_SHARED' | 'TEAM_INVITE' | 'BILLING_UPDATE' | 'SYSTEM_ALERT' | 'MENTION';
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: unknown;
    readAt?: Date | null;
    createdAt: Date;
}
export interface AiMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface AiGenerateWorkflowRequest {
    prompt: string;
    context?: string;
}
export interface AiGenerateWorkflowResponse {
    workflow: Partial<Workflow>;
    canvasData: CanvasData;
    explanation: string;
}
export interface AiAnalyzeWorkflowRequest {
    workflowId: string;
    action: 'explain' | 'detect_errors' | 'optimize' | 'document';
}
export interface AiAnalyzeWorkflowResponse {
    result: string;
    suggestions?: string[];
}
export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING';
export interface Integration {
    id: string;
    organizationId: string;
    userId: string;
    provider: string;
    name: string;
    status: IntegrationStatus;
    scopes: string[];
    expiresAt?: Date | null;
    lastUsedAt?: Date | null;
    createdAt: Date;
}
export interface DashboardStats {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    avgExecutionTime: number;
    executionsThisMonth: number;
    executionsLastMonth: number;
    growthRate: number;
}
export interface ExecutionChartData {
    date: string;
    success: number;
    failed: number;
    total: number;
}
export type HandleType = 'data' | 'trigger' | 'error' | 'control';
export interface NodeHandle {
    id: string;
    label: string;
    type: HandleType;
}
export interface NodeConfigField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'code' | 'json' | 'select' | 'boolean' | 'secret';
    required?: boolean;
    placeholder?: string;
    defaultValue?: unknown;
    options?: Array<{
        label: string;
        value: string;
    }>;
}
export interface NodeDefinition {
    type: string;
    category: NodeCategory;
    label: string;
    description: string;
    icon: string;
    color: string;
    inputs: NodeHandle[];
    outputs: NodeHandle[];
    configSchema: NodeConfigField[];
    keywords: string[];
}
export interface CanvasNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        label?: string;
        nodeType?: string;
        category?: string;
        config?: Record<string, unknown>;
    };
}
export interface CanvasEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    animated?: boolean;
    type?: string;
}
export interface BuilderCanvasData {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
}
export interface WsServerToClient {
    'execution:update': {
        executionId: string;
        status: string;
        progress: number;
    };
    'execution:log': {
        executionId: string;
        level: string;
        message: string;
        timestamp: string;
    };
    'notification:new': {
        id: string;
        type: string;
        title: string;
        message: string;
    };
    'workflow:user_joined': {
        userId: string;
        socketId: string;
    };
    'workflow:user_left': {
        userId: string;
        socketId: string;
    };
}
export interface WsClientToServer {
    'execution:subscribe': {
        executionId: string;
    };
    'execution:unsubscribe': {
        executionId: string;
    };
    'workflow:join': {
        workflowId: string;
    };
    'workflow:leave': {
        workflowId: string;
    };
}
//# sourceMappingURL=index.d.ts.map