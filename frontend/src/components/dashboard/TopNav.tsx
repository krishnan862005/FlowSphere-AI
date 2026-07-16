'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Settings, Moon, Sun, Command, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

export function TopNav() {
  const { user } = useAuth();
  const { connected } = useSocket();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-surface-1/50 backdrop-blur-sm px-6 flex-shrink-0">
      {/* Left — Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${connected ? 'bg-success' : 'bg-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground">{connected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      {/* Center — Search */}
      <button
        onClick={() => setSearchOpen(true)}
        className="hidden md:flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-white transition-all duration-200 w-72"
      >
        <Search className="h-4 w-4" />
        <span>Search workflows...</span>
        <div className="ml-auto flex items-center gap-1">
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs">⌘</kbd>
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs">K</kbd>
        </div>
      </button>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <div className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200"
            title="Choose Theme"
          >
            <Palette className="h-4 w-4" />
          </button>
          
          <AnimatePresence>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-2xl glass border border-white/5 bg-surface-1 shadow-glow-sm p-2 z-50 space-y-1"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Themes
                  </div>
                  {[
                    { id: 'dark', name: 'Default Dark', icon: '🌌', colorBg: 'bg-primary' },
                    { id: 'aurora', name: 'Aurora Theme', icon: '✨', colorBg: 'bg-[#64FFDA]' },
                    { id: 'lava', name: 'Lava Mode', icon: '🌋', colorBg: 'bg-[#FF4500]' },
                    { id: 'purple', name: 'Electric Purple', icon: '🔮', colorBg: 'bg-[#A855F7]' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                        theme === t.id
                          ? 'text-white bg-white/10'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span className="font-medium flex-1 text-left">{t.name}</span>
                      <span className={`h-2 w-2 rounded-full ${t.colorBg}`} />
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Bell className="h-4 w-4" />
            {/* Unread badge */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl border border-white/8 shadow-card overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <button className="text-xs text-primary hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[
                    { title: 'Workflow executed', message: 'Customer Onboarding ran successfully', time: '2m ago', read: false },
                    { title: 'Execution failed', message: 'Data Sync Pipeline failed on step 3', time: '1h ago', read: false },
                    { title: 'Team invite accepted', message: 'Alex joined your workspace', time: '3h ago', read: true },
                  ].map((notif, i) => (
                    <div key={i} className={`flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/3 last:border-0 ${!notif.read ? 'bg-primary/3' : ''}`}>
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{notif.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{notif.message}</div>
                        <div className="text-xs text-muted-foreground/50 mt-1">{notif.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-white/5">
                  <a href="/dashboard/notifications" className="text-xs text-primary hover:underline block text-center">
                    View all notifications
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings shortcut */}
        <a
          href="/dashboard/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
        </a>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: 'linear-gradient(135deg, #5B5FFF, #8A5CFF)' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Click outside to close */}
      {notifOpen && <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />}
    </header>
  );
}
