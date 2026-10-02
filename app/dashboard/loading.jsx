import { SkeletonCard, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SkeletonChart className="xl:col-span-2" />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}
