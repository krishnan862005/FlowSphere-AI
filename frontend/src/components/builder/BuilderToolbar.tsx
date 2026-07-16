'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Undo2, Redo2, Save, Play, ChevronLeft, PanelLeft,
  Bot, GitBranch, Zap, Settings2, Circle, CheckCircle2, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import type { Node, Edge } from 'reactflow';

interface BuilderToolbarProps {
  workflowId: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedLabel: string;
  validationMessage?: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleNodePanel: () => void;
  nodePanelOpen: boolean;
  onToggleAI: () => void;
  aiOpen: boolean;
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export function BuilderToolbar({
  workflowId, isDirty, isSaving, lastSavedLabel, validationMessage,
  canUndo, canRedo,
  onUndo, onRedo, onToggleNodePanel, nodePanelOpen,
  onToggleAI, aiOpen,
}: BuilderToolbarProps) {
  const [saving, setSaving] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.post(`/workflows/${workflowId}/execute`);
    } catch (err) {
      console.error(err);
    }
    setRunning(false);
  };

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-2 glass rounded-2xl border border-white/10 px-3 py-2 shadow-card"
    >
      {/* Back button */}
      <Link
        href="/dashboard/workflows"
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="h-4 w-px bg-white/10" />

      {/* Toggle node panel */}
      <button
        onClick={onToggleNodePanel}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
          nodePanelOpen ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'
        }`}
        title="Toggle node panel"
      >
        <PanelLeft className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-white/10" />

      {/* Undo/Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-white/10" />

      {/* Workflow name / save status */}
      <div className="flex items-center gap-2 px-2">
        <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-white font-medium">Workflow Editor</span>
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1">
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin text-secondary" />
          ) : isDirty ? (
            <Circle className="h-2.5 w-2.5 text-warning fill-warning" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-success" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {isSaving ? 'Saving…' : (lastSavedLabel || 'Ready')}
          </span>
        </div>
        {validationMessage && (
          <span className="rounded-full border border-warning/20 bg-warning/10 px-2 py-1 text-[10px] text-warning">
            {validationMessage}
          </span>
        )}
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* AI toggle */}
      <button
        onClick={onToggleAI}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
          aiOpen ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'
        }`}
      >
        <Bot className="h-3.5 w-3.5" />
        AI Assistant
      </button>

      <div className="h-4 w-px bg-white/10" />

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!isDirty || saving}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 disabled:opacity-40 transition-all"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Save
      </button>

      {/* Run */}
      <button
        onClick={handleRun}
        disabled={running}
        className="btn-glow flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        {running ? 'Running...' : 'Run'}
      </button>
    </motion.div>
  );
}

// Need React import for useState
import React from 'react';
