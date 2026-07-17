'use client';

import { motion, useInView } from 'framer-motion';
import { Check, Zap, Building2, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

const PLANS = [
  {
    name: 'Starter',
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for individuals and small projects',
    badge: null,
    features: [
      '10 active workflows',
      '1,000 executions/month',
      '5 team members',
      '50+ node types',
      'Webhook & schedule triggers',
      'Community support',
      '1-day execution history',
    ],
    cta: 'Get Started Free',
    ctaHref: '/auth/register',
    highlighted: false,
    color: '#64FFDA',      // Aurora teal
    theme: 'aurora',
  },
  {
    name: 'Professional',
    icon: Rocket,
    price: { monthly: 49, annual: 39 },
    description: 'For growing teams with advanced automation needs',
    badge: 'Most Popular',
    features: [
      'Unlimited workflows',
      '50,000 executions/month',
      '25 team members',
      '200+ node types',
      'All trigger types',
      'AI assistant (GPT-4o)',
      'Priority email support',
      '90-day execution history',
      'Custom integrations',
      'Version history',
      'Analytics dashboard',
    ],
    cta: 'Start Free Trial',
    ctaHref: '/auth/register?plan=professional',
    highlighted: true,
    color: '#A855F7',      // Electric purple
    theme: 'purple',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: { monthly: 199, annual: 159 },
    description: 'For large organizations with mission-critical automation',
    badge: null,
    features: [
      'Unlimited everything',
      'Unlimited executions',
      'Unlimited team members',
      'All AI providers',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee (99.99%)',
      '1-year execution history',
      'Custom node development',
      'On-premise deployment',
      'Audit logs & SIEM',
      'Custom contracts',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlighted: false,
    color: '#FF6B35',      // Lava orange
    theme: 'lava',
  },
];

export function LandingPricing() {
  const [annual, setAnnual] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      {/* Tri-color background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(100,255,218,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(100,255,218,0.06))',
              border: '1px solid rgba(168,85,247,0.25)',
              color: '#A855F7',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Pricing
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}
          >
            Simple, transparent{' '}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(248,250,252,0.45)', fontFamily: 'Outfit, sans-serif' }}>
            Start free. Scale as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div
            className="inline-flex items-center gap-1 rounded-xl p-1"
            style={{ background: 'rgba(14,18,44,0.8)', border: '1px solid rgba(100,255,218,0.1)' }}
          >
            <button
              onClick={() => setAnnual(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200"
              style={{
                fontFamily: 'Outfit, sans-serif',
                background: !annual ? 'linear-gradient(135deg, #64FFDA, #38BDF8)' : 'transparent',
                color: !annual ? '#080A1C' : 'rgba(248,250,252,0.45)',
                boxShadow: !annual ? '0 0 14px rgba(100,255,218,0.3)' : 'none',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              style={{
                fontFamily: 'Outfit, sans-serif',
                background: annual ? 'linear-gradient(135deg, #64FFDA, #38BDF8)' : 'transparent',
                color: annual ? '#080A1C' : 'rgba(248,250,252,0.45)',
                boxShadow: annual ? '0 0 14px rgba(100,255,218,0.3)' : 'none',
              }}
            >
              Annual
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: plan.highlighted ? 1.04 : 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-3xl p-8 overflow-hidden"
              style={{
                background: plan.highlighted
                  ? `linear-gradient(145deg, rgba(168,85,247,0.12) 0%, rgba(14,18,44,0.95) 60%, rgba(100,255,218,0.06) 100%)`
                  : 'rgba(14,18,44,0.65)',
                border: plan.highlighted
                  ? 'none'
                  : `1px solid ${plan.color}12`,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Highlighted card: animated tri-border */}
              {plan.highlighted && (
                <>
                  <div className="absolute inset-0 rounded-3xl"
                    style={{
                      background: `linear-gradient(145deg, rgba(168,85,247,0.12), rgba(14,18,44,0.95), rgba(100,255,218,0.06))`,
                    }}
                  />
                  {/* Gradient border */}
                  <div className="absolute inset-0 rounded-3xl"
                    style={{
                      padding: '1px',
                      background: 'linear-gradient(135deg, rgba(100,255,218,0.5), rgba(168,85,247,0.5), rgba(255,69,0,0.4))',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Background glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
                      filter: 'blur(30px)',
                    }}
                  />
                </>
              )}

              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="rounded-full px-4 py-1.5 text-xs font-bold text-white whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #A855F7, #64FFDA)',
                      boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="relative">
                {/* Plan header */}
                <div className="mb-6">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                    style={{ background: `${plan.color}12`, border: `1px solid ${plan.color}28` }}
                  >
                    <plan.icon className="h-6 w-6" style={{ color: plan.color }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
                    {plan.name}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'rgba(248,250,252,0.45)', fontFamily: 'Outfit, sans-serif' }}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span
                      className="text-5xl font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${plan.color}, rgba(248,250,252,0.9))`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="mb-2" style={{ color: 'rgba(248,250,252,0.4)', fontFamily: 'Outfit, sans-serif' }}>/month</span>
                    )}
                  </div>
                  {annual && plan.price.monthly > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                      Billed annually · Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                    </p>
                  )}
                  {plan.price.monthly === 0 && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                      Free forever · No credit card required
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className="block w-full rounded-xl py-3 text-center text-sm font-bold transition-all duration-200 mb-8"
                  style={
                    plan.highlighted
                      ? {
                          background: 'linear-gradient(135deg, #64FFDA 0%, #A855F7 50%, #FF4500 100%)',
                          color: '#F8FAFC',
                          boxShadow: '0 4px 20px rgba(168,85,247,0.35)',
                          fontFamily: 'Outfit, sans-serif',
                        }
                      : {
                          background: `${plan.color}08`,
                          border: `1px solid ${plan.color}25`,
                          color: plan.color,
                          fontFamily: 'Outfit, sans-serif',
                        }
                  }
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${plan.color}12` }}
                      >
                        <Check className="h-3 w-3" style={{ color: plan.color }} />
                      </div>
                      <span className="text-sm" style={{ color: 'rgba(248,250,252,0.5)', fontFamily: 'Outfit, sans-serif' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-sm"
          style={{ color: 'rgba(248,250,252,0.35)', fontFamily: 'Outfit, sans-serif' }}
        >
          All plans include a 14-day free trial · No credit card required · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
