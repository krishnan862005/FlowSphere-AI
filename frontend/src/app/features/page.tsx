import type { Metadata } from 'next';

import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';

export const metadata: Metadata = {
  title: 'Features — FlowSphere AI',
  description: 'Explore the advanced features of FlowSphere AI workflow automation platform.',
};

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background pt-16">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[80px]" />
      </div>
      <LandingNav />
      <div className="relative z-10">
        <LandingFeatures />
      </div>
      <LandingFooter />
    </main>
  );
}
