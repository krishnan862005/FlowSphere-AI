'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Star, Zap, GitBranch, Cpu, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const STATS = [
  { value: '50K+', label: 'Automations created', icon: Zap, color: '#64FFDA' },
  { value: '99.9%', label: 'Uptime guaranteed', icon: BarChart3, color: '#A855F7' },
  { value: '200+', label: 'Node integrations', icon: GitBranch, color: '#FF6B35' },
  { value: '10ms', label: 'Avg execution time', icon: Cpu, color: '#38BDF8' },
];

const LOGOS = ['Stripe', 'GitHub', 'Slack', 'Notion', 'OpenAI', 'Vercel', 'Linear', 'Figma'];

// Animated workflow preview nodes — tri-theme colors
const PREVIEW_NODES = [
  { id: 1, x: 60,  y: 120, label: 'Webhook Trigger',  color: '#64FFDA', icon: '⚡' },
  { id: 2, x: 280, y: 80,  label: 'GPT-4o',           color: '#A855F7', icon: '🤖' },
  { id: 3, x: 280, y: 180, label: 'Condition',         color: '#38BDF8', icon: '❔' },
  { id: 4, x: 500, y: 60,  label: 'Send Email',        color: '#22C55E', icon: '✉️' },
  { id: 5, x: 500, y: 180, label: 'Slack Alert',       color: '#FF6B35', icon: '💬' },
];

function AnimatedWorkflowPreview() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border"
      style={{
        background: 'rgba(8, 10, 28, 0.85)',
        borderColor: 'rgba(100,255,218,0.12)',
        boxShadow: '0 0 60px rgba(100,255,218,0.06), 0 0 120px rgba(168,85,247,0.05)',
      }}
    >
      {/* Tri-color grid dots */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(100,255,218,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle corner glows */}
      <div className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,255,218,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
      />
      <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
      />

      {/* SVG edges */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {/* Edge 1→2  Aurora teal */}
        <motion.path
          d={`M ${160} ${140} C ${220} ${140} ${220} ${100} ${280} ${100}`}
          stroke="rgba(100,255,218,0.5)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
        />
        {/* Edge 1→3  Electric sky */}
        <motion.path
          d={`M ${160} ${140} C ${220} ${140} ${220} ${200} ${280} ${200}`}
          stroke="rgba(56,189,248,0.5)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}
        />
        {/* Edge 2→4  Green */}
        <motion.path
          d={`M ${380} ${100} C ${440} ${100} ${440} ${80} ${500} ${80}`}
          stroke="rgba(34,197,94,0.5)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.1, ease: 'easeInOut' }}
        />
        {/* Edge 3→5  Lava orange */}
        <motion.path
          d={`M ${380} ${200} C ${440} ${200} ${440} ${200} ${500} ${200}`}
          stroke="rgba(255,107,53,0.5)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.4, ease: 'easeInOut' }}
        />

        {/* Animated data pulses — tri-color */}
        {[
          { path: `M 60 140 C 120 140 220 100 280 100`, delay: 2,   color: '#64FFDA' },
          { path: `M 280 100 C 400 100 440 80 500 80`,  delay: 2.5, color: '#A855F7' },
          { path: `M 60 140 C 120 140 220 200 280 200`, delay: 3,   color: '#38BDF8' },
          { path: `M 280 200 C 440 200 440 200 500 200`,delay: 3.5, color: '#FF6B35' },
        ].map((pulse, i) => (
          <motion.circle
            key={i}
            r="4"
            fill={pulse.color}
            filter="url(#triGlow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, delay: pulse.delay, repeat: Infinity, repeatDelay: 2.5 }}
          >
            <animateMotion
              dur="1.5s"
              begin={`${pulse.delay}s`}
              repeatCount="indefinite"
              path={pulse.path}
            />
          </motion.circle>
        ))}

        <defs>
          <filter id="triGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Nodes */}
      {PREVIEW_NODES.map((node, i) => (
        <motion.div
          key={node.id}
          className="absolute"
          style={{ left: node.x, top: node.y - 20 }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.2 }}
        >
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
            style={{
              background: `${node.color}12`,
              borderColor: `${node.color}35`,
              boxShadow: `0 4px 20px ${node.color}18, inset 0 1px 0 ${node.color}15`,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            <span>{node.icon}</span>
            <span style={{ color: 'rgba(248,250,252,0.9)' }}>{node.label}</span>
          </div>
          {/* Pulse ring — only on trigger node */}
          {i === 0 && (
            <motion.div
              className="absolute inset-0 rounded-xl border"
              style={{ borderColor: node.color }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}

      {/* Execution status bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl px-4 py-2 backdrop-blur-sm"
        style={{
          background: 'rgba(14,18,44,0.75)',
          border: '1px solid rgba(100,255,218,0.1)',
        }}
      >
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ background: '#22C55E' }}
          animate={{ scale: [1, 1.4, 1], boxShadow: ['0 0 0 0 rgba(34,197,94,0)', '0 0 0 4px rgba(34,197,94,0.2)', '0 0 0 0 rgba(34,197,94,0)'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-xs font-mono" style={{ color: 'rgba(248,250,252,0.45)' }}>Execution #4821 · Running ·</span>
        <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #64FFDA, #A855F7, #FF6B35)' }}
            initial={{ width: '0%' }}
            animate={{ width: '68%' }}
            transition={{ duration: 2, ease: 'easeOut', delay: 1 }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color: '#64FFDA' }}>68%</span>
      </div>
    </div>
  );
}

export function LandingHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">

      {/* ── Tri-color ambient orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Aurora teal — top left */}
        <motion.div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(100,255,218,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Electric purple — center-right */}
        <motion.div
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Lava orange — bottom right */}
        <motion.div
          className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.09) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        {/* Accent blue — bottom left */}
        <motion.div
          className="absolute bottom-1/4 -left-20 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="mx-auto max-w-7xl w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Content */}
          <div className="text-center lg:text-left">
            {/* Badge — tri-color border */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(100,255,218,0.08), rgba(168,85,247,0.08), rgba(255,69,0,0.06))',
                border: '1px solid rgba(100,255,218,0.25)',
                color: '#64FFDA',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                ⚡
              </motion.span>
              Powered by GPT-4o + Claude + Gemini
              <span style={{ color: '#A855F7' }}>→</span>
            </motion.div>

            {/* Headline — tri-theme gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span style={{ color: '#F8FAFC' }}>Design.</span>
              <br />
              <span className="gradient-text">Automate.</span>
              <br />
              <span style={{ color: '#F8FAFC' }}>Scale.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
              style={{ color: 'rgba(248,250,252,0.55)', fontFamily: 'Outfit, sans-serif' }}
            >
              FlowSphere AI is a next-generation workflow automation platform. Visually build,
              connect, and deploy automations powered by AI — in minutes, not months.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              {/* Primary — Tri-gradient */}
              <Link
                href="/auth/register"
                className="btn-glow group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Start Building Free
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Link>

              {/* Secondary — Aurora outline */}
              <button
                className="group inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold text-white transition-all duration-300"
                style={{
                  background: 'rgba(100,255,218,0.05)',
                  border: '1px solid rgba(100,255,218,0.2)',
                  fontFamily: 'Outfit, sans-serif',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,255,218,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(100,255,218,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(100,255,218,0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100,255,218,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(100,255,218,0.2)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: 'rgba(100,255,218,0.12)', border: '1px solid rgba(100,255,218,0.25)' }}
                >
                  <Play className="h-3.5 w-3.5" style={{ color: '#64FFDA', fill: '#64FFDA' }} />
                </div>
                Watch Demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {[
                  { letter: 'A', color: '#64FFDA' },
                  { letter: 'B', color: '#A855F7' },
                  { letter: 'C', color: '#FF6B35' },
                  { letter: 'D', color: '#38BDF8' },
                  { letter: 'E', color: '#EC4899' },
                ].map(({ letter, color }, i) => (
                  <div
                    key={letter}
                    className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `${color}20`,
                      borderColor: `${color}40`,
                      color: color,
                      zIndex: 5 - i,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5" style={{ fill: '#FFD166', color: '#FFD166' }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'rgba(248,250,252,0.45)', fontFamily: 'Outfit, sans-serif' }}>Trusted by 10,000+ teams worldwide</p>
              </div>
            </motion.div>
          </div>

          {/* Right — Workflow Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            {/* Tri-color glow behind preview */}
            <div className="absolute -inset-6 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 30% 50%, rgba(100,255,218,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(255,69,0,0.06) 100%)',
                filter: 'blur(30px)',
              }}
            />
            <AnimatedWorkflowPreview />
          </motion.div>
        </div>

        {/* Stats — each with its theme color */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="rounded-2xl p-6 text-center group cursor-default transition-all duration-300"
              style={{
                background: 'rgba(14,18,44,0.65)',
                border: `1px solid ${stat.color}18`,
                backdropFilter: 'blur(20px)',
              }}
              whileHover={{
                borderColor: `${stat.color}40`,
                boxShadow: `0 0 30px ${stat.color}12`,
                y: -4,
              }}
            >
              <div className="flex justify-center mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}25` }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}, rgba(248,250,252,0.9))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: 'rgba(248,250,252,0.45)', fontFamily: 'Outfit, sans-serif' }}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Logo strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-16 text-center"
        >
          <p className="text-sm mb-6" style={{ color: 'rgba(248,250,252,0.35)', fontFamily: 'Outfit, sans-serif' }}>
            Integrates with your favorite tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {LOGOS.map((logo, i) => (
              <motion.span
                key={logo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.4, y: 0 }}
                whileHover={{ opacity: 1, color: '#64FFDA' }}
                transition={{ delay: 1 + i * 0.05 }}
                className="text-sm font-semibold cursor-default transition-all duration-200"
                style={{ color: 'rgba(248,250,252,0.4)', fontFamily: 'Outfit, sans-serif' }}
              >
                {logo}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
