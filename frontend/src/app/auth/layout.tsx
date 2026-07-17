import { Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | FlowSphere AI',
  description: 'Sign in to your FlowSphere AI account.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 relative">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-sm transition-shadow group-hover:shadow-glow-primary">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">FlowSphere</span>
              <span className="text-white"> AI</span>
            </span>
          </Link>
        </div>

        {/* Form content */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {children}
        </div>
      </div>

      {/* Right panel — visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-l border-white/5">
        {/* Ambient */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex flex-col items-center justify-center w-full p-16 text-center">
          <div className="dot-grid absolute inset-0 opacity-20" />
          <div className="relative">
            {/* Animated workflow cards */}
            <div className="relative mb-12 h-64 w-full">
              {[
                { label: 'Webhook Trigger', color: '#5B5FFF', x: 0, y: 0, delay: 0 },
                { label: 'AI Processing', color: '#8A5CFF', x: 160, y: -30, delay: 0.1 },
                { label: 'Send Email', color: '#32D9FF', x: 320, y: 0, delay: 0.2 },
              ].map((card) => (
                <div
                  key={card.label}
                  className="absolute rounded-xl border px-4 py-3 text-xs font-medium text-white backdrop-blur-sm animate-float"
                  style={{
                    left: card.x,
                    top: 100 + card.y,
                    background: `${card.color}15`,
                    borderColor: `${card.color}40`,
                    animationDelay: `${card.delay * 1.5}s`,
                  }}
                >
                  {card.label}
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Automate anything with{' '}
              <span className="gradient-text">AI intelligence</span>
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
              Join 10,000+ teams using FlowSphere AI to automate their workflows and scale their operations.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { value: '50K+', label: 'Workflows' },
                { value: '99.9%', label: 'Uptime' },
                { value: '10ms', label: 'Avg exec' },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4">
                  <div className="text-xl font-bold gradient-text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
