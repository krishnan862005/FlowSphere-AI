'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

import { NODE_DEFINITIONS } from '@/lib/nodeDefinitions';

export const FlowNode = memo(function FlowNode({ data, selected }: NodeProps) {
  const nodeType = data.nodeType as string;
  const def = NODE_DEFINITIONS[nodeType];
  const color = def?.color ?? '#5B5FFF';
  const icon = def?.icon ?? '⚡';
  const label = data.label ?? def?.label ?? nodeType;
  const hasErrors = Array.isArray(data.errors) && data.errors.length > 0;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flow-node relative min-w-[180px] max-w-[220px] ${selected ? 'selected' : ''}`}
    >
      {/* Error indicator */}
      {hasErrors && (
        <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive border-2 border-background z-10" />
      )}

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!border-2 !border-white/20"
        style={{ background: color }}
      />

      {/* Node body */}
      <div className="px-4 py-3">
        {/* Category label */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm flex-shrink-0"
            style={{ background: `${color}20`, border: `1px solid ${color}30` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{label}</div>
            {def && (
              <div className="text-[10px] text-muted-foreground capitalize">{def.category.toLowerCase()}</div>
            )}
          </div>
        </div>

        {/* Config preview */}
        {data.config?.description && (
          <div className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
            {String(data.config.description)}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className="h-0.5 w-full rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!border-2 !border-white/20"
        style={{ background: color }}
      />
    </motion.div>
  );
});
