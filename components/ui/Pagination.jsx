'use client';

import { cn } from '@/lib/utils';
import { FilterSelect } from './fields';

/* Controlled pagination. page is 1-based. */
export function Pagination({
  page,
  totalPages,
  onChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalItems,
  className,
}) {
  if (totalPages <= 1 && !pageSizeOptions) return null;

  const pages = pageRange(page, totalPages);

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        {typeof totalItems === 'number' && (
          <span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{totalItems}</span>{' '}
            {totalItems === 1 ? 'result' : 'results'}
          </span>
        )}
        {pageSizeOptions && onPageSizeChange && (
          <FilterSelect label="Per page" value={String(pageSize)} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </FilterSelect>
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PageButton disabled={page <= 1} onClick={() => onChange(page - 1)} label="Previous page">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
          </PageButton>
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-1 text-sm text-slate-400" aria-hidden="true">…</span>
            ) : (
              <PageButton key={p} active={p === page} onClick={() => onChange(p)} label={`Page ${p}`}>
                {p}
              </PageButton>
            )
          )}
          <PageButton disabled={page >= totalPages} onClick={() => onChange(page + 1)} label="Next page">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
          </PageButton>
        </nav>
      )}
    </div>
  );
}

function PageButton({ children, active, disabled, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition',
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800'
      )}
    >
      {children}
    </button>
  );
}

function pageRange(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, page - 1, page, page + 1, total - 1, total]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}
