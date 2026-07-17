'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { NODE_DEFINITIONS, NODE_CATEGORIES } from '@/lib/nodeDefinitions';

function NodeCard({ nodeType, onAddNode }: { nodeType: string; onAddNode?: (nodeType: string) => void }) {
  const def = NODE_DEFINITIONS[nodeType];
  if (!def) return null;

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/flowsphere-node-type', nodeType);
    e.dataTransfer.setData('application/flowsphere-node-data', JSON.stringify({
      label: def.label,
      category: def.category,
      nodeType,
      config: {},
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onAddNode?.(nodeType)}
      className="flex items-center gap-3 rounded-xl p-2.5 cursor-pointer active:cursor-grabbing hover:bg-white/5 border border-transparent hover:border-white/8 transition-all duration-150 group"
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm"
        style={{ background: `${def.color}15`, border: `1px solid ${def.color}25` }}
      >
        {def.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white truncate">{def.label}</div>
        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{def.description}</div>
      </div>
    </div>
  );
}

function CategorySection({ name, types, onAddNode }: { name: string; types: string[]; onAddNode?: (nodeType: string) => void }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white uppercase tracking-wider transition-colors"
      >
        {name}
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">
              {types.map((type) => <NodeCard key={type} nodeType={type} onAddNode={onAddNode} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NodePanelProps {
  onAddNode?: (nodeType: string) => void;
}

export function NodePanel({ onAddNode }: NodePanelProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? Object.entries(NODE_DEFINITIONS).filter(([, def]) =>
        def.label.toLowerCase().includes(search.toLowerCase()) ||
        def.keywords.some((k) => k.includes(search.toLowerCase()))
      ).map(([type]) => type)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white mb-3">Node Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="input-glass w-full pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Nodes */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {filtered ? (
          <div className="space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No nodes found</p>
            ) : (
              filtered.map((type) => <NodeCard key={type} nodeType={type} onAddNode={onAddNode} />)
            )}
          </div>
        ) : (
          Object.entries(NODE_CATEGORIES).map(([name, types]) => (
            <CategorySection key={name} name={name} types={types} onAddNode={onAddNode} />
          ))
        )}
      </div>

      {/* Tip */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-[10px] text-muted-foreground text-center">
          Click nodes or drag them onto the canvas to add
        </p>
      </div>
    </div>
  );
}
