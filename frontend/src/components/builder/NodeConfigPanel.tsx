'use client';

import { X, Settings2, Trash2 } from 'lucide-react';
import type { Node } from 'reactflow';

import { NODE_DEFINITIONS } from '@/lib/nodeDefinitions';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (updates: Record<string, unknown>) => void;
}

interface ConfigField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
}

function ConfigField({ field, value, onChange }: { field: ConfigField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case 'text':
    case 'secret':
      return (
        <input
          type={field.type === 'secret' ? 'password' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="input-glass w-full text-xs py-2"
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={Number(value ?? field.defaultValue ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="input-glass w-full text-xs py-2"
        />
      );
    case 'textarea':
    case 'code':
    case 'json':
      return (
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.type === 'code' ? 6 : 3}
          className={`input-glass w-full text-xs py-2 resize-none ${field.type === 'code' || field.type === 'json' ? 'font-mono' : ''}`}
        />
      );
    case 'select':
      return (
        <select
          value={String(value ?? field.defaultValue ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="input-glass w-full text-xs py-2 cursor-pointer"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-1">{opt.label}</option>
          ))}
        </select>
      );
    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onChange(!value)}
            className={`relative h-5 w-9 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-xs text-muted-foreground">{value ? 'Enabled' : 'Disabled'}</span>
        </label>
      );
    default:
      return null;
  }
}

export function NodeConfigPanel({ node, onClose, onDelete, onUpdate }: NodeConfigPanelProps) {
  const nodeType = node.data.nodeType as string;
  const def = NODE_DEFINITIONS[nodeType];
  const config = (node.data.config ?? {}) as Record<string, unknown>;

  const updateConfig = (key: string, value: unknown) => {
    onUpdate({ config: { ...config, [key]: value } });
  };

  const updateLabel = (label: string) => {
    onUpdate({ label });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          {def && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-sm flex-shrink-0"
              style={{ background: `${def.color}15`, border: `1px solid ${def.color}25` }}
            >
              {def.icon}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-white">{def?.label ?? nodeType}</div>
            <div className="text-[10px] text-muted-foreground capitalize">{def?.category.toLowerCase() ?? 'node'}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete node"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Config form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Node label */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Node Label</label>
          <input
            type="text"
            value={String(node.data.label ?? def?.label ?? nodeType)}
            onChange={(e) => updateLabel(e.target.value)}
            className="input-glass w-full text-xs py-2"
          />
        </div>

        {/* Description */}
        {def?.description && (
          <div className="rounded-xl border border-white/5 bg-white/3 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">{def.description}</p>
          </div>
        )}

        {/* Config schema fields */}
        {def?.configSchema?.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-white mb-1.5">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <ConfigField
              field={field}
              value={config[field.key] ?? field.defaultValue}
              onChange={(v) => updateConfig(field.key, v)}
            />
          </div>
        ))}

        {/* Node ID */}
        <div className="pt-2 border-t border-white/5">
          <div className="text-[10px] text-muted-foreground">Node ID: <span className="font-mono">{node.id}</span></div>
        </div>
      </div>

      {/* IO diagram */}
      {def && (
        <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">I/O</div>
          <div className="flex items-start justify-between text-[10px] text-muted-foreground gap-4">
            <div>
              <div className="font-medium text-white mb-1">Inputs</div>
              {def.inputs.length > 0 ? def.inputs.map((i) => <div key={i.id}>• {i.label}</div>) : <div>—</div>}
            </div>
            <div>
              <div className="font-medium text-white mb-1">Outputs</div>
              {def.outputs.length > 0 ? def.outputs.map((o) => <div key={o.id}>• {o.label}</div>) : <div>—</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
