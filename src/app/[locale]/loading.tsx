import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container py-12">
      <Skeleton className="mb-4 h-10 w-1/3" />
      <Skeleton className="mb-8 h-6 w-1/2" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
