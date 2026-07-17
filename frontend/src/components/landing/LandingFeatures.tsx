'use client';

import { motion, useInView } from 'framer-motion';
import {
  Zap, GitBranch, Brain, Clock, Shield, BarChart3,
  Layers, Terminal, Globe, RefreshCw, Bell, Users,
} from 'lucide-react';
import { useRef } from 'react';

// Feature colors rotate through: Aurora teal → Electric purple → Lava orange → Accent blue
const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Builder',
    description: 'Describe your workflow in plain English and let GPT-4o generate the entire automation for you instantly.',
    color: '#64FFDA',   // Aurora teal
    badge: 'Most Popular',
  },
  {
    icon: GitBranch,
    title: 'Visual Node Editor',
    description: 'Drag, connect, and configure 200+ pre-built nodes on an infinite canvas with real-time collaboration.',
    color: '#A855F7',   // Electric purple
    badge: null,
  },
  {
    icon: Zap,
    title: 'Real-Time Execution',
    description: 'Watch your automations execute live with instant log streaming, progress tracking, and execution insights.',
    color: '#FF6B35',   // Lava orange
    badge: null,
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Schedule workflows with cron expressions, trigger on events, or fire via webhook URLs with zero setup.',
    color: '#38BDF8',   // Aurora sky
    badge: null,
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Role-based access control, AES-256 encryption, audit logs, and SOC2-ready infrastructure.',
    color: '#22C55E',   // Green
    badge: null,
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Track execution trends, success rates, bottlenecks, and ROI with powerful built-in dashboards.',
    color: '#FFD166',   // Lava gold
    badge: null,
  },
  {
    icon: Layers,
    title: 'Plugin Integrations',
    description: 'Connect to any API with 200+ pre-built integrations or build custom ones with our SDK.',
    color: '#EC4899',   // Lava-purple fusion pink
    badge: null,
  },
  {
    icon: Terminal,
    title: 'Custom Code',
    description: 'Drop into JavaScript or Python for advanced logic, transformations, and custom integrations.',
    color: '#A855F7',   // Electric purple
    badge: 'For Developers',
  },
  {
    icon: RefreshCw,
    title: 'Auto Retry & Recovery',
    description: 'Intelligent retry logic with exponential backoff, dead-letter queues, and automatic error recovery.',
    color: '#64FFDA',   // Aurora teal
    badge: null,
  },
  {
    icon: Globe,
    title: 'Global Edge Deploy',
    description: 'Run workflows from 30+ global regions with sub-10ms execution and 99.99% uptime SLA.',
    color: '#FF4500',   // Lava red
    badge: null,
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get alerted via email, Slack, Discord, or SMS when workflows succeed, fail, or hit thresholds.',
    color: '#38BDF8',   // Aurora sky
    badge: null,
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Shared workspaces, version history, comments, and live collaborative editing for your entire team.',
    color: '#C084FC',   // Soft purple
    badge: null,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function LandingFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-32 px-6 overflow-hidden">

      {/* Section ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(100,255,218,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Tri-color tag */}
          <span
            className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(100,255,218,0.08), rgba(168,85,247,0.06))',
              border: '1px solid rgba(100,255,218,0.25)',
              color: '#64FFDA',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Features
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}
          >
            Everything you need to{' '}
            <span className="gradient-text">automate at scale</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(248,250,252,0.45)', fontFamily: 'Outfit, sans-serif' }}>
            From simple webhook triggers to complex AI-driven pipelines — FlowSphere AI handles it all with
            an intuitive visual interface and enterprise-grade reliability.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group rounded-2xl p-6 cursor-default relative overflow-hidden transition-all duration-350"
              style={{
                background: 'rgba(14,18,44,0.6)',
                border: `1px solid ${feature.color}10`,
                backdropFilter: 'blur(20px)',
              }}
              whileHover={{
                borderColor: `${feature.color}30`,
                boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 30px ${feature.color}08`,
                y: -4,
              }}
            >
              {/* Subtle corner glow on hover */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle, ${feature.color}12 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                  transform: 'translate(30%, -30%)',
                }}
              />

              {/* Icon row */}
              <div className="mb-4 flex items-start justify-between">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: `${feature.color}10`,
                    border: `1px solid ${feature.color}25`,
                  }}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                </motion.div>
                {feature.badge && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      background: `${feature.color}10`,
                      color: feature.color,
                      border: `1px solid ${feature.color}25`,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {feature.badge}
                  </span>
                )}
              </div>

              <h3
                className="text-lg font-semibold mb-2 transition-colors duration-200"
                style={{ color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.45)', fontFamily: 'Outfit, sans-serif' }}>
                {feature.description}
              </p>

              {/* Hover accent line — animated */}
              <motion.div
                className="mt-4 h-0.5 rounded-full"
                style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                initial={{ width: '0%' }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
