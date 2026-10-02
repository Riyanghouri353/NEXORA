'use client';

import { cn } from '@/lib/utils';

const badgeVariants = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  primary: 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-800',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800',
  danger: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800',
  info: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800',
};

const dotColors = {
  neutral: 'bg-slate-400',
  primary: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
};

export function Badge({ variant = 'neutral', size = 'md', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        badgeVariants[variant] || badgeVariants.neutral,
        className
      )}
    >
      {dot && <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant] || dotColors.neutral)} />}
      {children}
    </span>
  );
}

/* Status → badge variant mapping used across pages */
export const statusBadgeVariant = {
  active: 'success',
  completed: 'success',
  done: 'success',
  trial: 'info',
  planning: 'info',
  'in-progress': 'primary',
  todo: 'neutral',
  backlog: 'neutral',
  review: 'warning',
  'at-risk': 'danger',
  'on-hold': 'warning',
  pending: 'warning',
  failed: 'danger',
  refunded: 'neutral',
  paused: 'warning',
  churned: 'danger',
  away: 'warning',
  offline: 'neutral',
  draft: 'neutral',
  ready: 'success',
};

export function StatusBadge({ status, label, size, className }) {
  const variant = statusBadgeVariant[status] || 'neutral';
  const text = label || String(status || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge variant={variant} size={size} dot className={className}>
      {text}
    </Badge>
  );
}

export function PriorityBadge({ priority, size }) {
  const variant = { low: 'neutral', medium: 'info', high: 'warning', critical: 'danger' }[priority] || 'neutral';
  const text = String(priority || '').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge variant={variant} size={size}>
      {text}
    </Badge>
  );
}
