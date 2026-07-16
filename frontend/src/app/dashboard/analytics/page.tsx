import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | FlowSphere AI',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep insights into your automation performance.</p>
      </div>
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">Analytics charts and metrics will appear here.</p>
      </div>
    </div>
  );
}
