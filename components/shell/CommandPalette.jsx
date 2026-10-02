'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandPalette, useTheme, useToast } from '@/components/providers';
import { useDebounce } from '@/hooks/hooks';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

/* Global command palette (Cmd/Ctrl+K). Commands are registered statically here;
   creation commands dispatch a window event that QuickCreate listens for. */

const NAV_COMMANDS = [
  { id: 'go-overview', label: 'Go to Overview', category: 'Navigate', icon: 'overview', href: '/dashboard/overview' },
  { id: 'go-analytics', label: 'Go to Analytics', category: 'Navigate', icon: 'analytics', href: '/dashboard/analytics' },
  { id: 'go-projects', label: 'Go to Projects', category: 'Navigate', icon: 'projects', href: '/dashboard/projects' },
  { id: 'go-customers', label: 'Go to Customers', category: 'Navigate', icon: 'customers', href: '/dashboard/customers' },
  { id: 'go-transactions', label: 'Go to Transactions', category: 'Navigate', icon: 'transactions', href: '/dashboard/transactions' },
  { id: 'go-team', label: 'Go to Team', category: 'Navigate', icon: 'team', href: '/dashboard/team' },
  { id: 'go-tasks', label: 'Go to Tasks', category: 'Navigate', icon: 'tasks', href: '/dashboard/tasks' },
  { id: 'go-reports', label: 'Go to Reports', category: 'Navigate', icon: 'reports', href: '/dashboard/reports' },
  { id: 'go-notifications', label: 'Open Notifications', category: 'Navigate', icon: 'notifications', href: '/dashboard/notifications' },
  { id: 'go-settings', label: 'Open Settings', category: 'Navigate', icon: 'settings', href: '/dashboard/settings' },
  { id: 'go-help', label: 'Open Help', category: 'Navigate', icon: 'help', href: '/dashboard/help' },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debouncedQuery = useDebounce(query, 120);

  const fireQuickCreate = (kind) => {
    window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind } }));
  };

  const commands = useMemo(() => {
    const actionCommands = [
      { id: 'new-project', label: 'Create Project', category: 'Actions', icon: 'plus', run: () => fireQuickCreate('project') },
      { id: 'new-customer', label: 'Add Customer', category: 'Actions', icon: 'plus', run: () => fireQuickCreate('customer') },
      { id: 'new-task', label: 'Create Task', category: 'Actions', icon: 'plus', run: () => fireQuickCreate('task') },
      {
        id: 'toggle-theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        category: 'Actions',
        icon: theme === 'dark' ? 'sun' : 'moon',
        run: () => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          toast({ title: `${next === 'dark' ? 'Dark' : 'Light'} mode enabled`, variant: 'success' });
        },
      },
      { id: 'open-notifications', label: 'Open Notifications', category: 'Actions', icon: 'notifications', run: () => router.push('/dashboard/notifications') },
      { id: 'open-settings', label: 'Open Settings', category: 'Actions', icon: 'settings', run: () => router.push('/dashboard/settings') },
    ];
    return [...NAV_COMMANDS, ...actionCommands];
  }, [router, theme, setTheme, toast]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, debouncedQuery]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current && listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el && el.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open ]);

  const run = (cmd) => {
    setOpen(false);
    if (cmd.href) router.push(cmd.href);
    else if (cmd.run) cmd.run();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) run(cmd);
    }
  };

  if (!open) return null;

  const groups = [];
  for (const cmd of filtered) {
    const last = groups[groups.length - 1];
    if (last && last.category === cmd.category) last.items.push(cmd);
    else groups.push({ category: cmd.category, items: [cmd] });
  }
  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]" role="presentation">
      <div className="animate-fade-in absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="animate-scale-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <Icon name="command" className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            aria-label="Command palette search"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined}
            className="h-12 w-full bg-transparent py-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 sm:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>
        <div ref={listRef} id="cmd-list" role="listbox" aria-label="Commands" className="max-h-[46vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No commands match “{query}”.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.category} className="mb-1 last:mb-0">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {g.category}
              </p>
              {g.items.map((cmd) => {
                flatIndex += 1;
                const idx = flatIndex;
                const active = idx === activeIndex;
                return (
                  <button
                    key={cmd.id}
                    id={`cmd-${cmd.id}`}
                    data-index={idx}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => run(cmd)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
                      active ? 'bg-brand-50 text-brand-900 dark:bg-brand-950 dark:text-brand-100' : 'text-slate-700 dark:text-slate-200'
                    )}
                  >
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>
                      <Icon name={cmd.icon} className="h-4 w-4" />
                    </span>
                    <span className="flex-1 font-medium">{cmd.label}</span>
                    {cmd.href && <span className="text-xs text-slate-400">{cmd.category}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-slate-200 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> select</span>
          <span className="flex items-center gap-1"><Kbd>esc</Kbd> close</span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-px font-sans dark:border-slate-700 dark:bg-slate-800">
      {children}
    </kbd>
  );
}
