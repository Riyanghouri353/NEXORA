'use client';

import { cn } from '@/lib/utils';
import { initials, avatarColor } from '@/lib/utils';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

export function Avatar({ name, size = 'md', className, ring = false }) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white',
        avatarColor(name),
        sizes[size] || sizes.md,
        ring && 'ring-2 ring-white dark:ring-slate-900',
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names = [], max = 4, size = 'sm', className }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className={cn('inline-flex items-center', className)} aria-label={`${names.length} team members`}>
      {shown.map((n, i) => (
        <Avatar key={n + i} name={n} size={size} ring className={i > 0 ? '-ml-2' : undefined} />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            '-ml-2 inline-flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-900',
            sizes[size] || sizes.sm
          )}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
