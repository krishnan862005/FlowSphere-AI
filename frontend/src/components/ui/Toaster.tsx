'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { border: '#22C55E', bg: 'rgba(34,197,94,0.08)', icon: '#22C55E' },
  error: { border: '#FF4D6D', bg: 'rgba(255,77,109,0.08)', icon: '#FF4D6D' },
  warning: { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: '#F59E0B' },
  info: { border: '#5B5FFF', bg: 'rgba(91,95,255,0.08)', icon: '#5B5FFF' },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const t: Toast = { id, duration: 4000, ...opts };
    setToasts((prev) => [...prev, t]);
    if (t.duration) setTimeout(() => dismiss(id), t.duration);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: 'error', title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast]);

  // Expose globally
  useEffect(() => {
    (window as unknown as { __toast: typeof toast }).__toast = toast;
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            const colors = COLORS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-card backdrop-blur-xl"
                style={{ background: `${colors.bg}`, borderColor: colors.border + '40' }}
              >
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colors.icon }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{t.title}</div>
                  {t.message && <div className="text-xs text-muted-foreground mt-0.5">{t.message}</div>}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside Toaster');
  return ctx;
}
