'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

const toneIcon = {
  up: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
    </svg>
  ),
  down: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  ),
};

const toneCls = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-slate-500 dark:text-slate-400',
};

/* KPI stat card: title, value, change (+/- %), changeLabel ("vs last month"),
   changeTone ('up'|'down'|'neutral'), icon (node), description, spark (node). */
export function KpiCard({ title, value, change, changeLabel, changeTone = 'neutral', icon, description, spark, className, onClick }) {
  const body = (
    <CardContent className="pb-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white sm:text-[1.7rem]">
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {change !== undefined && change !== null && (
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums', toneCls[changeTone])}>
            {toneIcon[changeTone]}
            {change}
          </span>
        )}
        {changeLabel && <span className="text-xs text-slate-400 dark:text-slate-500">{changeLabel}</span>}
      </div>
      {description && <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>}
      {spark && <div className="mt-3">{spark}</div>}
    </CardContent>
  );
  if (onClick) {
    return (
      <Card className={cn('cursor-pointer transition hover:shadow-md', className)}>
        <button type="button" onClick={onClick} className="block w-full text-left" aria-label={title}>
          {body}
        </button>
      </Card>
    );
  }
  return <Card className={className}>{body}</Card>;
}
