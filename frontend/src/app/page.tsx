import type { Metadata } from 'next';

import { LandingHero } from '@/components/landing/LandingHero';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingWorkflowShowcase } from '@/components/landing/LandingWorkflowShowcase';
import { LandingTestimonials } from '@/components/landing/LandingTestimonials';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';

export const metadata: Metadata = {
  title: 'FlowSphere AI — Design. Automate. Scale.',
  description: 'The next-generation AI-powered workflow automation platform. Build, connect, and deploy automations at scale — without writing a single line of code.',
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[80px]" />
      </div>
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingWorkflowShowcase />
      <LandingTestimonials />
      <LandingPricing />
      <LandingFAQ />
      <LandingFooter />
    </main>
  );
}
