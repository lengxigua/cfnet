import { cn } from '@/lib/utils';

/**
 * Skeleton loading placeholder component
 * Displays an animated pulse effect for content loading states
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
