'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800', className)}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 && 'w-2/3')} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900', className)} aria-hidden="true">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="mt-2 h-8 w-1/2" />
      <SkeletonText lines={2} className="mt-4" />
    </div>
  );
}

export function SkeletonTable({ rows = 6, columns = 5, className }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800', className)} aria-hidden="true">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ className }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900', className)} aria-hidden="true">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-1 h-3 w-56" />
      <Skeleton className="mt-6 h-56 w-full" />
    </div>
  );
}
