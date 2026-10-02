'use client';

import { cn } from '@/lib/utils';

/* CSS-only tooltip (hover + focus). position: top | bottom | left | right */
export function Tooltip({ content, position = 'top', className, children, delay = 0 }) {
  if (!content) return children;
  const posCls = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  }[position];
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        className={cn(
          'pointer-events-none absolute z-[80] whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 dark:bg-slate-700',
          posCls
        )}
      >
        {content}
      </span>
    </span>
  );
}
