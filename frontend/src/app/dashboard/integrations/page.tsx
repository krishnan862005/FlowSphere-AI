'use client';

import { useState } from 'react';
import { Puzzle, Search, Check, Sparkles, AlertCircle } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', description: 'Send messages, alerts, and channel notifications', category: 'Messaging', icon: '💬', connected: true },
  { id: 'discord', name: 'Discord', description: 'Post webhook updates and chat alerts', category: 'Messaging', icon: '🎮', connected: true },
  { id: 'telegram', name: 'Telegram', description: 'Send automated messages via custom Telegram bots', category: 'Messaging', icon: '✈️', connected: false },
  { id: 'github', name: 'GitHub', description: 'Track repos, issues, pull requests, and git actions', category: 'Utilities', icon: '🐙', connected: false },
  { id: 'openai', name: 'OpenAI', description: 'Leverage GPT models to analyze text or generate items', category: 'AI', icon: '🤖', connected: true },
  { id: 'gemini', name: 'Gemini', description: 'Use Google Gemini models for structured AI logic', category: 'AI', icon: '✨', connected: false },
  { id: 'notion', name: 'Notion', description: 'Sync database records and page contents', category: 'Productivity', icon: '📓', connected: false },
  { id: 'airtable', name: 'Airtable', description: 'Import and export custom spreadsheet data', category: 'Productivity', icon: '🗄️', connected: false },
];

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState(INTEGRATIONS);

  const toggleConnect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, connected: !item.connected } : item))
    );
  };

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Puzzle className="h-6 w-6 text-primary" />
            Integrations
          </h1>
          <p className="text-muted-foreground mt-1">Connect FlowSphere AI to your favorite external apps and APIs.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations..."
            className="input-glass w-full pl-10 text-xs py-2.5"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <div key={item.id} className="glass rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-all">
            <div>
              {/* App logo row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/8 text-2xl">
                  {item.icon}
                </div>
                {item.connected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 border border-success/30 px-2.5 py-0.5 text-[10px] font-medium text-success">
                    <Check className="h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Disconnected
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              <h3 className="text-sm font-semibold text-white mb-1.5">{item.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed min-h-[48px]">{item.description}</p>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.category}</span>
              <button
                onClick={() => toggleConnect(item.id)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                  item.connected
                    ? 'border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-muted-foreground hover:text-red-400'
                    : 'btn-glow text-white'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No integrations match &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
