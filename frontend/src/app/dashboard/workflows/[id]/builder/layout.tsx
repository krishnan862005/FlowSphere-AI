import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workflow Builder | FlowSphere AI',
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {children}
    </div>
  );
}
