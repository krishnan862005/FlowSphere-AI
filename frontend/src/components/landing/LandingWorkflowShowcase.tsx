'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const SHOWCASE_TABS = [
  {
    id: 'customer',
    label: 'Customer Onboarding',
    description: 'Automatically welcome new customers, sync to CRM, and notify your team in real-time.',
    nodes: [
      { id: 1, x: 20, y: 50, label: '🪝 New Signup Webhook', color: '#5B5FFF' },
      { id: 2, x: 240, y: 20, label: '🤖 AI Welcome Email', color: '#8A5CFF' },
      { id: 3, x: 240, y: 100, label: '📊 Update CRM', color: '#32D9FF' },
      { id: 4, x: 460, y: 20, label: '✉️ Send Email', color: '#22C55E' },
      { id: 5, x: 460, y: 100, label: '💬 Slack Notify', color: '#F59E0B' },
    ],
    edges: [
      { from: 1, to: 2, fromX: 180, fromY: 70, toX: 240, toY: 40 },
      { from: 1, to: 3, fromX: 180, fromY: 70, toX: 240, toY: 120 },
      { from: 2, to: 4, fromX: 400, fromY: 40, toX: 460, toY: 40 },
      { from: 3, to: 5, fromX: 400, fromY: 120, toX: 460, toY: 120 },
    ],
    metric: { label: 'Avg setup time', value: '12 min', trend: '↓ vs 4 hours manually' },
  },
  {
    id: 'content',
    label: 'AI Content Pipeline',
    description: 'Generate, review, and publish social content automatically across all channels.',
    nodes: [
      { id: 1, x: 20, y: 50, label: '⏰ Daily 9AM', color: '#5B5FFF' },
      { id: 2, x: 220, y: 50, label: '🧠 GPT-4o Writer', color: '#8A5CFF' },
      { id: 3, x: 420, y: 20, label: '🐦 Twitter/X', color: '#32D9FF' },
      { id: 4, x: 420, y: 80, label: '📸 LinkedIn', color: '#22C55E' },
    ],
    edges: [
      { from: 1, to: 2, fromX: 160, fromY: 70, toX: 220, toY: 70 },
      { from: 2, to: 3, fromX: 380, fromY: 70, toX: 420, toY: 40 },
      { from: 2, to: 4, fromX: 380, fromY: 70, toX: 420, toY: 100 },
    ],
    metric: { label: 'Posts generated', value: '365/yr', trend: '↑ 100% consistent' },
  },
  {
    id: 'data',
    label: 'Data Sync Pipeline',
    description: 'Sync, transform, and load data between databases, spreadsheets, and analytics tools.',
    nodes: [
      { id: 1, x: 20, y: 50, label: '⏱️ Hourly Sync', color: '#5B5FFF' },
      { id: 2, x: 220, y: 50, label: '🗃️ Query DB', color: '#8A5CFF' },
      { id: 3, x: 420, y: 20, label: '📊 Google Sheets', color: '#22C55E' },
      { id: 4, x: 420, y: 80, label: '📈 Analytics', color: '#F59E0B' },
    ],
    edges: [
      { from: 1, to: 2, fromX: 160, fromY: 70, toX: 220, toY: 70 },
      { from: 2, to: 3, fromX: 380, fromY: 70, toX: 420, toY: 40 },
      { from: 2, to: 4, fromX: 380, fromY: 70, toX: 420, toY: 100 },
    ],
    metric: { label: 'Data freshness', value: '< 1hr', trend: '↑ was 24hrs' },
  },
];

function WorkflowDiagram({ tab }: { tab: typeof SHOWCASE_TABS[0] }) {
  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-xl canvas-bg border border-white/5">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        {tab.edges.map((edge, i) => (
          <motion.line
            key={i}
            x1={edge.fromX} y1={edge.fromY}
            x2={edge.toX} y2={edge.toY}
            stroke="rgba(91,95,255,0.4)"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </svg>
      {tab.nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className="absolute"
          style={{ left: node.x, top: node.y - 15 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <div
            className="rounded-xl border px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap backdrop-blur-sm"
            style={{ background: `${node.color}15`, borderColor: `${node.color}40` }}
          >
            {node.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function LandingWorkflowShowcase() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const tab = SHOWCASE_TABS[active]!;

  return (
    <section id="showcase" className="py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-4">
            Showcase
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Automation in <span className="gradient-text">action</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real-world workflows built with FlowSphere AI in minutes.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {SHOWCASE_TABS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active === i
                    ? 'bg-primary text-white shadow-glow-sm'
                    : 'bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Diagram */}
            <WorkflowDiagram key={tab.id} tab={tab} />

            {/* Details */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">{tab.label}</h3>
              <p className="text-muted-foreground mb-6">{tab.description}</p>

              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">{tab.metric.label}</div>
                <div className="text-3xl font-bold gradient-text-primary">{tab.metric.value}</div>
                <div className="text-xs text-success mt-1">{tab.metric.trend}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
