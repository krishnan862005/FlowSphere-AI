'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch, Play, CheckCircle, XCircle, TrendingUp,
  Clock, ArrowRight, Zap, Activity, Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl border border-white/10 p-3 shadow-card">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="text-white font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

function StatCard({ title, value, change, positive, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
            <TrendingUp className={`h-3.5 w-3.5 ${!positive ? 'rotate-180' : ''}`} />
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </motion.div>
  );
}

// ─── Recent Workflow Card ─────────────────────────────────────────────────────

function WorkflowCard({ workflow, delay }: { workflow: Record<string, unknown>; delay: number }) {
  const statusColors: Record<string, string> = {
    ACTIVE: '#22C55E',
    PAUSED: '#F59E0B',
    DRAFT: '#6B7280',
    ERROR: '#FF4D6D',
  };
  const status = String(workflow['status'] ?? 'DRAFT');
  const color = statusColors[status] ?? '#6B7280';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
        <GitBranch className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{String(workflow['name'])}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {String(workflow['totalExecutions'] ?? 0)} executions
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: `${color}15` }}>
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs font-medium" style={{ color }}>{status}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

// ─── Execution Row ────────────────────────────────────────────────────────────

function ExecutionRow({ exec, delay }: { exec: Record<string, unknown>; delay: number }) {
  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    SUCCESS: { color: '#22C55E', icon: CheckCircle },
    FAILED: { color: '#FF4D6D', icon: XCircle },
    RUNNING: { color: '#5B5FFF', icon: Activity },
    PENDING: { color: '#F59E0B', icon: Clock },
  };
  const status = String(exec['status'] ?? 'PENDING');
  const cfg = statusConfig[status] ?? statusConfig['PENDING']!;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
    >
      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: cfg.color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white truncate">
          {(exec['workflow'] as Record<string, string> | undefined)?.['name'] ?? 'Unknown'}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {exec['duration'] ? `${exec['duration']}ms` : '—'} · {String(exec['trigger'])}
        </div>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {exec['createdAt'] ? new Date(String(exec['createdAt'])).toLocaleTimeString() : ''}
      </span>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/workflows/dashboard/stats'),
  });

  const { data: workflows, isLoading: wfLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient.get<Array<Record<string, unknown>>>('/workflows', { params: { limit: '6', sortBy: 'updatedAt', sortOrder: 'desc' } }),
  });

  const { data: chartData } = useQuery({
    queryKey: ['execution-chart'],
    queryFn: () => apiClient.get<Array<Record<string, unknown>>>('/executions/analytics/chart', { params: { days: '14' } }),
  });

  const statsData = stats?.data as Record<string, unknown> | undefined;
  const wfList = (workflows?.data ?? []) as Array<Record<string, unknown>>;
  const chart = (chartData?.data ?? []) as Array<Record<string, number | string>>;
  const executions = ((statsData?.['recentExecutions'] ?? []) as Array<Record<string, unknown>>);

  // Mock chart data for demo
  const demoChart = chart.length > 0 ? chart : Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    success: Math.floor(Math.random() * 80 + 20),
    failed: Math.floor(Math.random() * 10),
    total: 0,
  })).map((d) => ({ ...d, total: Number(d.success) + Number(d.failed) }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your automations today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/workflows/new"
            className="btn-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Workflows"
          value={statsLoading ? '—' : String(statsData?.['totalWorkflows'] ?? 0)}
          change="+12%"
          positive
          icon={GitBranch}
          color="#5B5FFF"
          delay={0}
        />
        <StatCard
          title="Active Workflows"
          value={statsLoading ? '—' : String(statsData?.['activeWorkflows'] ?? 0)}
          change="+3"
          positive
          icon={Zap}
          color="#8A5CFF"
          delay={0.05}
        />
        <StatCard
          title="Total Executions"
          value={statsLoading ? '—' : String(statsData?.['totalExecutions'] ?? 0)}
          change="+24%"
          positive
          icon={Play}
          color="#32D9FF"
          delay={0.1}
        />
        <StatCard
          title="Success Rate"
          value={statsLoading ? '—' : `${statsData?.['successRate'] ?? 0}%`}
          change="+2.1%"
          positive
          icon={CheckCircle}
          color="#22C55E"
          delay={0.15}
        />
      </div>

      {/* Charts + Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Execution trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Execution Trends</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 14 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" />Success</div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-destructive" />Failed</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={demoChart} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B5FFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5B5FFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="success" stroke="#5B5FFF" strokeWidth={2} fill="url(#successGrad)" />
              <Area type="monotone" dataKey="failed" stroke="#FF4D6D" strokeWidth={2} fill="url(#failedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent executions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Executions</h2>
            <Link href="/dashboard/executions" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div>
            {executions.length > 0
              ? executions.slice(0, 8).map((exec, i) => (
                  <ExecutionRow key={String(exec['id'])} exec={exec} delay={0.05 * i} />
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-xl mb-2" />
                ))
            }
          </div>
        </motion.div>
      </div>

      {/* Workflows + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent workflows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Workflows</h2>
            <Link href="/dashboard/workflows" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-1">
            {wfLoading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)
              : wfList.map((wf, i) => <WorkflowCard key={String(wf['id'])} workflow={wf} delay={i * 0.05} />)
            }
            {!wfLoading && wfList.length === 0 && (
              <div className="text-center py-8">
                <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No workflows yet</p>
                <Link href="/dashboard/workflows/new" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Create your first workflow →
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/dashboard/workflows/new', label: 'Create Workflow', icon: Plus, color: '#5B5FFF' },
              { href: '/dashboard/workflows/new?ai=true', label: 'Generate with AI', icon: Zap, color: '#8A5CFF' },
              { href: '/dashboard/integrations', label: 'Connect Integration', icon: GitBranch, color: '#32D9FF' },
              { href: '/dashboard/analytics', label: 'View Analytics', icon: Activity, color: '#22C55E' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors group"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: `${action.color}15` }}
                >
                  <action.icon className="h-4.5 w-4.5" style={{ color: action.color }} />
                </div>
                <span className="text-sm font-medium text-white">{action.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Usage stats */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Executions used</span>
              <span className="text-xs text-white">
                {String(statsData?.['totalExecutions'] ?? 0)} / 50,000
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(Number(statsData?.['totalExecutions'] ?? 0) / 500, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
