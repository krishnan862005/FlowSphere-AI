import type { Metadata } from 'next';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';

export const metadata: Metadata = {
  title: 'Documentation — FlowSphere AI',
  description: 'Learn how to build, connect, and deploy workflows at scale using FlowSphere AI.',
};

export default function DocsPage() {
  const categories = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', href: '#intro' },
        { label: 'Quickstart Guide', href: '#quickstart' },
        { label: 'Core Concepts', href: '#concepts' },
      ],
    },
    {
      title: 'Workflow Builder',
      items: [
        { label: 'Triggers', href: '#triggers' },
        { label: 'Actions & Nodes', href: '#actions' },
        { label: 'Variables & Data', href: '#variables' },
        { label: 'Conditions & Logic', href: '#logic' },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { label: 'OpenAI & LLMs', href: '#openai' },
        { label: 'Databases', href: '#databases' },
        { label: 'Slack & Webhooks', href: '#slack' },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen bg-background pt-16">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[80px]" />
      </div>

      <LandingNav />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-8">
              {categories.map((category) => (
                <div key={category.title} className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {category.title}
                  </h4>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-white transition-colors duration-150"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Content area */}
          <div className="md:col-span-3 space-y-12 border-l border-white/5 pl-0 md:pl-12">
            <section id="intro" className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">Documentation</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to FlowSphere AI documentation. FlowSphere AI is a next-generation workflow automation
                platform designed to help developers and businesses build, connect, and scale integrations using AI.
              </p>
            </section>

            <section id="quickstart" className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Quickstart Guide</h2>
              <p className="text-muted-foreground leading-relaxed">
                To get started with FlowSphere AI, register a new account on our platform and launch the workspace.
                Within the workspace, you can construct workflows visually by combining triggers and node execution actions.
              </p>
              <div className="p-5 glass rounded-2xl border border-white/5 bg-white/[0.02]">
                <code className="text-sm font-mono text-primary-light">
                  $ pnpm install && pnpm dev
                </code>
              </div>
            </section>

            <section id="concepts" className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Core Concepts</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform operates around three key building blocks:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                <li><strong className="text-white">Workflows:</strong> A collection of nodes representing automations.</li>
                <li><strong className="text-white">Triggers:</strong> Events that start the execution (e.g. Webhook, Schedule, Manual).</li>
                <li><strong className="text-white">Nodes:</strong> Actions performed during a run (e.g. LLM prompts, databases, Slack messages).</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
