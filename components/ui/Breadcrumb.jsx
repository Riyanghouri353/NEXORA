'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

/* items: [{ label, href? }] */
export function Breadcrumb({ items = [], className }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              {i > 0 && (
                <li aria-hidden="true" className="shrink-0 text-slate-300 dark:text-slate-600">
                  /
                </li>
              )}
              <li className={cn('min-w-0', last && 'truncate')}>
                {item.href && !last ? (
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={cn(last ? 'truncate font-medium text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400')}>
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
