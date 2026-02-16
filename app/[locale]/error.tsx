'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report error to analytics (client-side fetch)
    try {
      const errorData = {
        message: error.message,
        digest: error.digest,
        url: window.location.href,
        timestamp: Date.now(),
      };
      // Fire-and-forget error reporting
      fetch('/api/health', {
        method: 'HEAD',
        headers: {
          'X-Error-Report': JSON.stringify(errorData),
        },
      }).catch(() => {
        // Silently ignore reporting failures
      });
    } catch {
      // Silently ignore reporting failures
    }

    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-destructive">Error</h1>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
