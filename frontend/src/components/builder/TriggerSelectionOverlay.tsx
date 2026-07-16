'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MousePointerClick,
  Globe,
  Clock,
  Webhook,
  FileText,
  GitBranch,
  MessageSquare,
  Sparkles,
  Plus,
  ChevronRight,
  Zap,
  X,
} from 'lucide-react';

interface TriggerOption {
  id: string;
  nodeType: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    id: 'manual',
    nodeType: 'manualTrigger',
    icon: <MousePointerClick className="h-5 w-5" />,
    label: 'Trigger manually',
    description: 'Runs the flow on clicking a button in FlowSphere. Good for getting started quickly',
    color: '#22C55E',
  },
  {
    id: 'app-event',
    nodeType: 'webhookTrigger',
    icon: <Zap className="h-5 w-5" />,
    label: 'On app event',
    description: 'Runs the flow when something happens in an app like Telegram, Notion or Airtable',
    color: '#5B5FFF',
  },
  {
    id: 'schedule',
    nodeType: 'scheduleTrigger',
    icon: <Clock className="h-5 w-5" />,
    label: 'On a schedule',
    description: 'Runs the flow every day, hour, or custom interval',
    color: '#F59E0B',
  },
  {
    id: 'webhook',
    nodeType: 'webhookTrigger',
    icon: <Webhook className="h-5 w-5" />,
    label: 'On webhook call',
    description: 'Runs the flow on receiving an HTTP request',
    color: '#32D9FF',
  },
  {
    id: 'form',
    nodeType: 'webhookTrigger',
    icon: <FileText className="h-5 w-5" />,
    label: 'On form submission',
    description: 'Generate webforms in FlowSphere and pass their responses to the workflow',
    color: '#EC4899',
  },
  {
    id: 'sub-workflow',
    nodeType: 'manualTrigger',
    icon: <GitBranch className="h-5 w-5" />,
    label: 'When executed by another workflow',
    description: 'Runs the flow when called by the Execute Workflow node from a different workflow',
    color: '#A855F7',
  },
  {
    id: 'chat',
    nodeType: 'manualTrigger',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'On chat message',
    description: 'Runs the flow when a user sends a chat message. For use with AI nodes',
    color: '#06B6D4',
  },
];

interface TriggerSelectionOverlayProps {
  onSelectTrigger: (nodeType: string, label: string, description: string) => void;
  onBuildWithAI: () => void;
}

export function TriggerSelectionOverlay({ onSelectTrigger, onBuildWithAI }: TriggerSelectionOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTriggerPanel, setShowTriggerPanel] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredTriggers = TRIGGER_OPTIONS.filter(
    (t) =>
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFirstStep = useCallback(() => {
    setShowTriggerPanel(true);
  }, []);

  return (
    <>
      {/* Centered empty-state prompt */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-6 pointer-events-auto"
        >
          {/* Add first step button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddFirstStep}
            className="group flex flex-col items-center justify-center gap-3 w-[180px] h-[180px] rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] backdrop-blur-sm hover:border-white/30 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.1] transition-all duration-300">
              <Plus className="h-7 w-7 text-white/50 group-hover:text-white/80 transition-colors" />
            </div>
            <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
              Add first step...
            </span>
          </motion.button>

          {/* "or" divider */}
          <span className="text-sm font-medium text-white/30">or</span>

          {/* Build with AI button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBuildWithAI}
            className="group flex flex-col items-center justify-center gap-3 w-[180px] h-[180px] rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] backdrop-blur-sm hover:border-purple-500/40 hover:bg-purple-500/[0.06] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/[0.1] transition-all duration-300">
              <Sparkles className="h-7 w-7 text-white/50 group-hover:text-purple-400 transition-colors" />
            </div>
            <span className="text-sm font-medium text-white/60 group-hover:text-purple-300 transition-colors">
              Build with AI
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Right-side trigger selection panel */}
      <AnimatePresence>
        {showTriggerPanel && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="absolute right-0 top-0 bottom-0 w-[380px] z-30 border-l border-white/8 bg-[#1a1d2e]/95 backdrop-blur-xl flex flex-col"
          >
            {/* Panel header */}
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[15px] font-semibold text-white">
                  What triggers this workflow?
                </h3>
                <button
                  onClick={() => setShowTriggerPanel(false)}
                  className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-white/40 mb-4">
                A trigger is a step that starts your workflow
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search nodes..."
                  autoFocus
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Trigger options list */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
              <div className="space-y-0.5">
                {filteredTriggers.map((trigger, index) => (
                  <motion.button
                    key={trigger.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    onMouseEnter={() => setHoveredId(trigger.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      onSelectTrigger(trigger.nodeType, trigger.label, trigger.description);
                      setShowTriggerPanel(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left hover:bg-white/[0.06] transition-all duration-200 group"
                  >
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: hoveredId === trigger.id ? `${trigger.color}20` : 'rgba(255,255,255,0.05)',
                        color: hoveredId === trigger.id ? trigger.color : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {trigger.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/85 group-hover:text-white transition-colors">
                        {trigger.label}
                      </div>
                      <div className="text-xs text-white/35 group-hover:text-white/50 truncate transition-colors">
                        {trigger.description}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/15 group-hover:text-white/40 transition-all duration-200 group-hover:translate-x-0.5" />
                  </motion.button>
                ))}

                {filteredTriggers.length === 0 && (
                  <div className="py-8 text-center text-sm text-white/30">
                    No triggers match &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>

              {/* Other ways section */}
              {!searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 border-t border-white/5 pt-2"
                >
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left hover:bg-white/[0.06] transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.05] text-white/50 group-hover:bg-white/[0.08]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white/85 group-hover:text-white">
                        Other ways...
                      </div>
                      <div className="text-xs text-white/35 group-hover:text-white/50">
                        Runs the flow on workflow errors, file changes, etc.
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/15 group-hover:text-white/40" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
