'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function NewWorkflowPage() {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function createAndRedirect() {
      try {
        const response = await apiClient.post<{ id: string }>('/workflows', {
          name: 'Untitled Workflow',
          description: 'A new automation workflow.',
          triggerType: 'MANUAL',
          canvasData: { nodes: [], edges: [] },
        });
        
        if (response.data?.id) {
          router.push(`/dashboard/workflows/${response.data.id}/builder`);
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Failed to create workflow:', err);
        router.push('/dashboard');
      }
    }

    createAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Creating your workflow...</p>
      </div>
    </div>
  );
}
