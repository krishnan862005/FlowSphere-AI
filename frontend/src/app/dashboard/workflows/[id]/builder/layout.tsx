import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workflow Builder | FlowSphere AI',
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-16 bottom-0 left-0 right-0 bg-background overflow-hidden">
      {children}
    </div>
  );
}
