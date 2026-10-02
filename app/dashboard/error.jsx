'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/states';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Log for diagnostics; the UI shows a friendly message instead of a stack trace.
    console.error('Dashboard error boundary caught:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <ErrorState
        title="This section ran into a problem"
        description="Something unexpected happened while loading this view. Your other data is unaffected."
        onRetry={reset}
      />
    </div>
  );
}
