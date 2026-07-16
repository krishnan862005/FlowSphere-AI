'use client';

import { useState } from 'react';
import { Key, Plus, Trash2, ShieldAlert, Check, Copy } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  token: string;
  status: 'ACTIVE' | 'REVOKED';
  createdAt: string;
}

const INITIAL_KEYS: ApiKey[] = [
  { id: 'key1', name: 'Production Server Key', token: 'fs_live_••••••••••••••••3a9b', status: 'ACTIVE', createdAt: '2026-06-12' },
  { id: 'key2', name: 'Local Test Key', token: 'fs_test_••••••••••••••••7c2d', status: 'ACTIVE', createdAt: '2026-07-04' },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    const randomHex = Math.random().toString(16).slice(2, 6);
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: `API Key Generated ${keys.length + 1}`,
      token: `fs_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}••••••••${randomHex}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]!,
    };
    setKeys((prev) => [...prev, newKey]);
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'REVOKED' as const } : k))
    );
  };

  const handleCopy = (id: string, token: string) => {
    navigator.clipboard.writeText(token.replace(/•/g, 'x'));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" />
            API Keys
          </h1>
          <p className="text-muted-foreground mt-1">Authenticate external triggers and custom HTTP scripts securely.</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      {/* Warning */}
      <div className="glass rounded-2xl p-4 border-warning/20 bg-warning/2 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-semibold text-white">Security Reminder</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            API keys carry full write permissions to your active workflows and workspaces. Do not commit keys to GitHub repos or expose them in client-side client applications.
          </p>
        </div>
      </div>

      {/* Keys List */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4 font-semibold">Key Name</th>
              <th className="px-6 py-4 font-semibold">Token</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created At</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-white">
            {keys.map((key) => (
              <tr key={key.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-4 font-medium">{key.name}</td>
                <td className="px-6 py-4 font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {key.token}
                    <button
                      onClick={() => handleCopy(key.id, key.token)}
                      className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                      title="Copy Key"
                    >
                      {copiedId === key.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {key.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 border border-success/30 px-2 py-0.5 text-[10px] font-medium text-success">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Revoked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{key.createdAt}</td>
                <td className="px-6 py-4 text-right">
                  {key.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-400 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
