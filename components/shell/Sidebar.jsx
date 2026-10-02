'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { baseNotifications } from '@/data/notifications';

function Logo({ collapsed }) {
  return (
    <Link href="/dashboard/overview" className="flex items-center gap-2.5 px-2" aria-label="Nexora home">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </span>
      {!collapsed && (
        <span className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Nexora
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({ collapsed = false, onNavigate }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/dashboard/overview') return pathname === '/dashboard/overview' || pathname === '/dashboard';
    if (href === '/dashboard/settings') return pathname.startsWith('/dashboard/settings');
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-5 last:mb-0">
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                    collapsed && 'justify-center px-0 py-2.5',
                    active
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  )}
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.label === 'Notifications' && <NavBadge />}
                </Link>
              );
              if (collapsed) {
                return (
                  <li key={item.href}>
                    <Tooltip content={item.label} position="right">
                      {link}
                    </Tooltip>
                  </li>
                );
              }
              return <li key={item.href}>{link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavBadge() {
  // Rendered client-side only to avoid hydration mismatch on the count
  const [count, setCount] = useStateSafe();
  if (!count) return null;
  return (
    <span className="ml-auto rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{count}</span>
  );
}

function useStateSafe() {  const [count, setCount] = useState(0);
  useEffect(() => {
    try {
      const read = JSON.parse(localStorage.getItem('nexora-notifications-read-v1') || '[]');
      setCount(baseNotifications.filter((n) => !n.read && !read.includes(n.id)).length);
    } catch {
      setCount(baseNotifications.filter((n) => !n.read).length);
    }
  }, []);
  return [count, setCount];
}

export function Sidebar({ collapsed, onToggleCollapse }) {
  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex dark:border-slate-800 dark:bg-slate-900',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-slate-200 dark:border-slate-800', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
        )}
      </div>

      <SidebarNav collapsed={collapsed} />

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="flex w-full items-center justify-center rounded-lg py-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        ) : (
          <UserCard />
        )}
      </div>
    </aside>
  );
}

function UserCard() {
  return (
    <Link
      href="/dashboard/settings/profile"
      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
        AM
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">Alex Morgan</span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Operations Manager</span>
      </span>
    </Link>
  );
}
