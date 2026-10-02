'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

/* Accessible FAQ accordion. items: [{ q, a }] */
export function FaqAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {items.map((item, i) => {
        const open = openIndex === i;
        const buttonId = `faq-button-${i}`;
        const panelId = `faq-panel-${i}`;
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-semibold text-slate-900 dark:text-white">{item.q}</span>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform dark:bg-slate-800 dark:text-slate-400',
                    open && 'rotate-180 bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  )}
                >
                  <Icon name="chevronDown" className="h-4 w-4" />
                </span>
              </button>
            </h3>
            {open && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="animate-slide-up px-6 pb-6"
              >
                <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
