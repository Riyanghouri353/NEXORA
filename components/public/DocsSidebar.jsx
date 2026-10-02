'use client';

import { useState } from 'react';
import { SearchInput } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

/* Sticky docs nav with a live filter. sections: [{ id, label }] */
export function DocsSidebar({ sections = [] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(sections[0]?.id);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? sections.filter((s) => s.label.toLowerCase().includes(q))
    : sections;

  return (
    <div className="sticky top-24 space-y-3">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter docs…"
        aria-label="Filter documentation sections"
      />
      <nav aria-label="Documentation sections">
        {filtered.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            No sections match “{query}”.
          </p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                    active === s.id
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  )}
                >
                  <Icon name={s.icon || 'doc'} className="h-4 w-4 shrink-0" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Need a hand?</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Our team answers every message within one business day.
        </p>
        <a
          href="/contact"
          className="mt-3 inline-block rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
