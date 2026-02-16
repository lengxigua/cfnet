import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col p-8">
      {/* Navigation skeleton */}
      <nav className="flex justify-between items-center max-w-6xl mx-auto w-full mb-12">
        <Skeleton className="h-7 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </nav>

      {/* Main content skeleton */}
      <main className="max-w-4xl w-full mx-auto space-y-8 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-3"
            >
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
