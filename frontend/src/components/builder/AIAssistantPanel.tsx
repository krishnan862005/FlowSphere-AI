'use client';

import type { CanvasData } from '@flowsphere/types';
import { motion } from 'framer-motion';
import { X, Send, Bot, Loader2, Sparkles, Zap, FileText, AlertTriangle, Lightbulb } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { apiClient } from '@/lib/api';


interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: Zap, label: 'Generate workflow', prompt: 'Generate a workflow that ' },
  { icon: Sparkles, label: 'Explain workflow', action: 'explain' },
  { icon: AlertTriangle, label: 'Detect errors', action: 'detect-errors' },
  { icon: Lightbulb, label: 'Optimize', action: 'optimize' },
  { icon: FileText, label: 'Generate docs', action: 'generate-docs' },
];

interface AIAssistantPanelProps {
  workflowId: string;
  onClose: () => void;
  onApplyWorkflow: (canvasData: CanvasData) => void;
}

export function AIAssistantPanel({ workflowId, onClose, onApplyWorkflow }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your FlowSphere AI assistant. I can help you:\n\n• **Generate workflows** from natural language\n• **Explain** how your workflow works\n• **Detect errors** and misconfigurations\n• **Optimize** for performance\n• **Generate documentation**\n\nWhat would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await apiClient.post<{ message: string }>('/ai/chat', {
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      });

      const reply = res.data?.message ?? 'Sorry, I could not generate a response.';
      setMessages((m) => [...m, { role: 'assistant', content: reply, timestamp: new Date() }]);

      // Try to parse workflow JSON from reply
      const jsonMatch = reply.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch?.[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.canvasData) {
            onApplyWorkflow(parsed.canvasData as CanvasData);
          }
        } catch { /* not JSON */ }
      }
    } catch {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key configuration.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (action: string) => {
    setLoading(true);
    try {
      const endpoint = `/ai/${action}`;
      const res = await apiClient.post<{ explanation?: string; suggestions?: string; documentation?: string; errors?: string[] }>(endpoint, { workflowId });
      const data = res.data;
      const content = data?.explanation ?? data?.suggestions ?? data?.documentation ?? JSON.stringify(data, null, 2);
      setMessages((m) => [...m, {
        role: 'assistant',
        content: content ?? 'Analysis complete.',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'Could not complete this action. Make sure your workflow has nodes added.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/15 border border-secondary/20">
            <Bot className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Assistant</div>
            <div className="text-[10px] text-muted-foreground">Powered by GPT-4o</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-3 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => qa.action ? runAction(qa.action) : setInput(qa.prompt ?? '')}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-150 disabled:opacity-40"
            >
              <qa.icon className="h-3 w-3" />
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 border border-secondary/20 mt-1">
                <Bot className="h-3 w-3 text-secondary" />
              </div>
            )}
            <div
              className={`rounded-2xl px-3 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-primary/20 text-white border border-primary/20 rounded-tr-sm'
                  : 'bg-white/5 text-muted-foreground border border-white/5 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/15 border border-secondary/20">
              <Bot className="h-3 w-3 text-secondary" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything about your workflow..."
            className="input-glass flex-1 resize-none text-xs py-2.5 min-h-[40px] max-h-[100px]"
            rows={1}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-secondary disabled:opacity-40 transition-all hover:bg-secondary/80"
          >
            {loading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Send className="h-4 w-4 text-white" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
