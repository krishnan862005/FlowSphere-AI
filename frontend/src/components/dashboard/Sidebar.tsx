'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GitBranch, Play, BarChart3, Settings,
  Puzzle, Key, Users, Shield, ChevronDown, ChevronRight,
  Zap, Bell, HelpCircle, LogOut, Plus, Search,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Workflows',
    icon: GitBranch,
    children: [
      { href: '/dashboard/workflows', label: 'All Workflows', icon: GitBranch },
      { href: '/dashboard/workflows/templates', label: 'Templates', icon: Puzzle },
    ],
  },
  { href: '/dashboard/executions', label: 'Executions', icon: Play },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/team', label: 'Team', icon: Users },
];

const BOTTOM_ITEMS = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/docs', label: 'Help & Docs', icon: HelpCircle, external: true },
];

interface NavItemProps {
  item: typeof NAV_ITEMS[0];
  collapsed: boolean;
}

function NavItem({ item, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  if ('children' in item && item.children) {
    const isActive = item.children.some((c) => pathname === c.href);
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`nav-item w-full ${isActive ? 'active' : ''}`}
        >
          <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </>
          )}
        </button>
        <AnimatePresence>
          {expanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pl-9 mt-1 space-y-1"
            >
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`nav-item ${pathname === child.href ? 'active' : ''}`}
                >
                  <child.icon className="h-4 w-4" />
                  <span>{child.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const href = (item as { href: string }).href;
  const isActive = pathname === href;

  return (
    <Link href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
      <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
      {isActive && !collapsed && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col border-r border-white/5 bg-surface-1 overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-sm flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">
              <span className="gradient-text">FlowSphere</span>
              <span className="text-white"> AI</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary mx-auto">
            <Zap className="h-4 w-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1 rounded text-muted-foreground hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapse expand */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute top-4 -right-3 z-10 h-6 w-6 rounded-full bg-surface-2 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}

      {/* Quick actions */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/dashboard/workflows/new"
            className="flex items-center gap-2 w-full rounded-xl bg-primary/15 border border-primary/20 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Link>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item, i) => (
          <NavItem key={i} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-white/5 px-3 py-3 space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target={(item as { external?: boolean }).external ? '_blank' : undefined}
            className="nav-item"
          >
            <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* User profile */}
      <div className="border-t border-white/5 p-3">
        <div className={`flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5B5FFF, #8A5CFF)' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
