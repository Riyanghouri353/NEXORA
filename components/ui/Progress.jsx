'use client';

import { cn } from '@/lib/utils';

const barColors = {
  primary: 'bg-brand-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
};

export function Progress({ value = 0, variant = 'primary', size = 'md', showLabel = false, className, ariaLabel }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || 'Progress'}
        className={cn('w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', heights[size] || heights.md)}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColors[variant] || barColors.primary)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
