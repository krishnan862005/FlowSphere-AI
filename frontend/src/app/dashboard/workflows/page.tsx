import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Workflows | FlowSphere AI',
};

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your automation workflows.</p>
        </div>
      </div>
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">Your workflows will appear here.</p>
      </div>
    </div>
  );
}
