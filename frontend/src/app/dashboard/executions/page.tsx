'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Play, CheckCircle2, XCircle, Loader2, Clock3, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ExecutionItem {
  id: string;
  status: string;
  trigger: string;
  startedAt?: string | null;
  completedAt?: string | null;
  duration?: number | null;
  createdAt: string;
  workflow?: { id: string; name: string };
}

const STATUS_META: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  SUCCESS: { label: 'Success', className: 'text-success border-success/20 bg-success/10', icon: CheckCircle2 },
  FAILED: { label: 'Failed', className: 'text-destructive border-destructive/20 bg-destructive/10', icon: XCircle },
  RUNNING: { label: 'Running', className: 'text-secondary border-secondary/20 bg-secondary/10', icon: Loader2 },
  PENDING: { label: 'Pending', className: 'text-warning border-warning/20 bg-warning/10', icon: Clock3 },
  CANCELLED: { label: 'Cancelled', className: 'text-muted-foreground border-white/10 bg-white/5', icon: RefreshCw },
};

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadExecutions = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setLoading(true);

    try {
      const response = await apiClient.get<{ data: ExecutionItem[]; meta?: { total: number } }>('/executions', {
        params: status ? { status } : {},
      });
      setExecutions(response.data?.data ?? []);
    } catch (error) {
      console.error('Failed to load executions', error);
      setExecutions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadExecutions();
  }, [status]);

  const stats = useMemo(() => ({
    total: executions.length,
    success: executions.filter((e) => e.status === 'SUCCESS').length,
    failed: executions.filter((e) => e.status === 'FAILED').length,
    running: executions.filter((e) => e.status === 'RUNNING').length,
  }), [executions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Executions</h1>
          <p className="text-muted-foreground mt-1">Monitor workflow runs, status changes, and execution health.</p>
        </div>
        <button
          onClick={() => void loadExecutions(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, tone: 'text-white' },
          { label: 'Success', value: stats.success, tone: 'text-success' },
          { label: 'Failed', value: stats.failed, tone: 'text-destructive' },
          { label: 'Running', value: stats.running, tone: 'text-secondary' },
        ].map((card) => (
          <div key={card.label} className="glass rounded-2xl border border-white/10 p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{card.label}</div>
            <div className={`mt-2 text-2xl font-semibold ${card.tone}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl border border-white/10 p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filter executions
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-sm text-white"
          >
            <option value="">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="RUNNING">Running</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading executions...
          </div>
        ) : executions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-muted-foreground">
            No executions found for the selected filter.
          </div>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => {
              const meta = STATUS_META[execution.status] ?? STATUS_META.PENDING;
              const Icon = meta.icon;
              return (
                <div key={execution.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-xl border p-2 ${meta.className}`}>
                        <Icon className={`h-4 w-4 ${execution.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold text-white">{execution.workflow?.name ?? 'Untitled Workflow'}</div>
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.className}`}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Trigger: <span className="text-white">{execution.trigger}</span> • Started {new Date(execution.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                        <Play className="h-4 w-4" />
                        {execution.duration ? `${execution.duration}ms` : 'Pending'}
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{execution.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
