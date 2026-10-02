'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* Dropdown menu.
   items: [{ label, icon, href, onClick, danger, divider }]
   trigger: React node rendered inside the toggle button. */
export function Dropdown({ trigger, items = [], align = 'right', label = 'Menu', className, menuClassName }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const focusables = items.filter((i) => !i.divider);

  const onMenuKeyDown = (e) => {
    const idx = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = idx < 0 ? 0 : (idx + 1) % focusables.length;
      itemRefs.current[next] && itemRefs.current[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx < 0 ? focusables.length - 1 : (idx - 1 + focusables.length) % focusables.length;
      itemRefs.current[prev] && itemRefs.current[prev].focus();
    }
  };

  let focusIdx = -1;

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={typeof trigger === 'string' ? undefined : label}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'animate-scale-in absolute z-[70] mt-2 min-w-[200px] origin-top rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} role="separator" className="my-1.5 h-px bg-slate-200 dark:bg-slate-700" />;
            }
            focusIdx += 1;
            const fi = focusIdx;
            const cls = cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition focus-visible:outline-none',
              item.danger
                ? 'text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 dark:focus:bg-red-950'
                : 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:bg-slate-800'
            );
            const inner = (
              <>
                {item.icon && <span className="h-4 w-4 shrink-0 opacity-70">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </>
            );
            if (item.href) {
              return (
                <Link
                  key={i}
                  href={item.href}
                  role="menuitem"
                  ref={(el) => (itemRefs.current[fi] = el)}
                  onClick={() => setOpen(false)}
                  className={cls}
                >
                  {inner}
                </Link>
              );
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                ref={(el) => (itemRefs.current[fi] = el)}
                onClick={() => {
                  setOpen(false);
                  item.onClick && item.onClick();
                }}
                className={cls}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
