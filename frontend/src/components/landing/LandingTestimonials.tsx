'use client';

import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { useRef } from 'react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Head of Operations',
    company: 'TechNova Inc.',
    avatar: 'SC',
    avatarColor: '#5B5FFF',
    rating: 5,
    text: 'FlowSphere AI replaced 3 different automation tools we were using. The AI workflow generation is genuinely magical — I described what I wanted and it built the entire pipeline in 30 seconds.',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Lead Developer',
    company: 'Streamline Labs',
    avatar: 'MR',
    avatarColor: '#8A5CFF',
    rating: 5,
    text: "The React Flow canvas is buttery smooth. I've tried every workflow tool out there and FlowSphere's builder is in a different league. Custom JavaScript nodes with full async support sealed the deal.",
  },
  {
    name: 'Priya Patel',
    role: 'Growth Lead',
    company: 'ScaleUp.io',
    avatar: 'PP',
    avatarColor: '#32D9FF',
    rating: 5,
    text: "We automated our entire customer onboarding journey — Typeform → CRM → Slack → personalized email sequence. Set it up in 45 minutes with no code. Our team's productivity jumped 40%.",
  },
  {
    name: 'James Thornton',
    role: 'CTO',
    company: 'Meridian Group',
    avatar: 'JT',
    avatarColor: '#22C55E',
    rating: 5,
    text: "The enterprise security features and audit logging gave us the compliance confidence we needed. We migrated 200+ workflows from our old platform in a weekend. Incredible product.",
  },
  {
    name: 'Aisha Okonkwo',
    role: 'AI Product Manager',
    company: 'FutureBridge',
    avatar: 'AO',
    avatarColor: '#F59E0B',
    rating: 5,
    text: 'The AI assistant inside the workflow builder is a game-changer. It detected a misconfiguration in our pipeline that would have taken hours to find manually. Saved us from a critical outage.',
  },
  {
    name: 'Li Wei',
    role: 'DevOps Engineer',
    company: 'Axiom Cloud',
    avatar: 'LW',
    avatarColor: '#FF4D6D',
    rating: 5,
    text: 'Real-time execution logs with WebSocket streaming, Docker deployment, and the REST API coverage — everything a DevOps engineer wants. We integrated it with our CI/CD pipeline in 2 hours.',
  },
];

export function LandingTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Loved by <span className="gradient-text">10,000+ teams</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what engineers, operators, and product teams say.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-hover rounded-2xl p-6"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.avatarColor}, ${t.avatarColor}88)` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
