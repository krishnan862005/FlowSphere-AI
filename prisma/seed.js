import { PrismaClient, UserRole, OrgPlan, WorkflowStatus } from '@prisma/client';
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
//# sourceMappingURL=seed.js.map