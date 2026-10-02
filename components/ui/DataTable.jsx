'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SkeletonTable } from './Skeleton';
import { EmptyState } from './states';

/* Reusable data table.
   columns: [{ key, label, sortable?, render?(row), align?: 'left'|'right'|'center', className? }]
   Sorting is controlled by the parent: sortKey, sortDir ('asc'|'desc'), onSort(key).
   mobileCard(row): optional render function used below the md breakpoint. */
export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  sortKey,
  sortDir = 'asc',
  onSort,
  isLoading = false,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyAction,
  rowHref,
  onRowClick,
  mobileCard,
  className,
  ariaLabel = 'Data table',
}) {
  if (isLoading) return <SkeletonTable rows={6} columns={columns.length || 5} className={className} />;

  if (!data.length) {
    return (
      <div className={cn('rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900', className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  const renderRow = (row, rowIdx) => {
    const href = typeof rowHref === 'function' ? rowHref(row) : null;
    const cells = columns.map((col) => {
      const content = col.render ? col.render(row, rowIdx) : row[col.key];
      const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
      return (
        <td key={col.key} className={cn('whitespace-nowrap px-4 py-3.5 text-sm', align, col.className)}>
          {content}
        </td>
      );
    });
    const trCls = cn(
      'border-t border-slate-100 transition-colors first:border-t-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50',
      (href || onRowClick) && 'cursor-pointer'
    );
    const onClick = () => onRowClick && onRowClick(row);
    const onKeyDown = (e) => {
      if ((href || onRowClick) && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    };
    if (href) {
      return (
        <tr key={row[keyField]} className={trCls}>
          {columns.map((col, ci) => {
            const content = col.render ? col.render(row, rowIdx) : row[col.key];
            const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
            const cell = (
              <td key={col.key} className={cn('whitespace-nowrap px-4 py-3.5 text-sm', align, col.className)}>
                {content}
              </td>
            );
            // First cell carries the link; others render plainly but the whole row is clickable via stretched link pattern
            return ci === 0 ? (
              <td key={col.key} className={cn('whitespace-nowrap px-4 py-3.5 text-sm', align, col.className)}>
                <Link href={href} className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300">
                  {content}
                </Link>
              </td>
            ) : cell;
          })}
        </tr>
      );
    }
    return (
      <tr key={row[keyField]} className={trCls} onClick={onRowClick ? onClick : undefined} onKeyDown={onKeyDown} tabIndex={onRowClick ? 0 : undefined}>
        {cells}
      </tr>
    );
  };

  return (
    <div className={className}>
      {/* Desktop / tablet table */}
      <div className={cn('overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900', mobileCard && 'hidden md:block')}>
        <table className="w-full border-collapse text-sm text-slate-700 dark:text-slate-300" aria-label={ariaLabel}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
              {columns.map((col) => {
                const align = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                const active = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortable ? (active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                    className={cn('whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400', align, col.className)}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-800 dark:hover:text-slate-100"
                      >
                        {col.label}
                        <svg className={cn('h-3.5 w-3.5', active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-600')} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          {active && sortDir === 'desc' ? (
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                          )}
                        </svg>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{data.map(renderRow)}</tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {mobileCard && (
        <div className="space-y-3 md:hidden">
          {data.map((row) => (
            <div key={row[keyField]}>{mobileCard(row)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
