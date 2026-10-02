'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCommandPalette, useTheme, useToast } from '@/components/providers';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/hooks/useSettings';
import { breadcrumbsForPath } from '@/lib/nav';
import { timeAgo } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tooltip } from '@/components/ui/Tooltip';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

function fireQuickCreate(kind) {
  window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind } }));
}

export function TopNav({ onOpenMobileNav }) {
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();
  const crumbs = breadcrumbsForPath(pathname);

  return (
    <header className="no-print sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:gap-3 sm:px-5 dark:border-slate-800 dark:bg-slate-900/90">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Icon name="menu" className="h-5 w-5" />
      </button>

      {/* Breadcrumb (desktop) */}
      <div className="hidden min-w-0 flex-1 md:block">
        <Breadcrumb items={crumbs} />
      </div>
      {/* Compact title on mobile */}
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 md:hidden dark:text-white">
        {crumbs[crumbs.length - 1]?.label}
      </p>

      {/* Global search trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition hover:border-slate-300 hover:text-slate-500 sm:flex lg:w-72 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      >
        <Icon name="search" className="h-4 w-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-600 dark:bg-slate-900">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 sm:hidden dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Icon name="search" className="h-5 w-5" />
      </button>

      <NotificationsBell />

      {/* Quick create */}
      <Dropdown
        label="Quick create"
        trigger={
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
            <Icon name="plus" className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </span>
        }
        items={[
          { label: 'New project', icon: <Icon name="projects" className="h-4 w-4" />, onClick: () => fireQuickCreate('project') },
          { label: 'Add customer', icon: <Icon name="customers" className="h-4 w-4" />, onClick: () => fireQuickCreate('customer') },
          { label: 'Create task', icon: <Icon name="tasks" className="h-4 w-4" />, onClick: () => fireQuickCreate('task') },
        ]}
      />

      <ThemeToggle />
      <UserMenu />
    </header>
  );
}

function NotificationsBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const recent = notifications.slice(0, 6);

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 z-[70] mt-2 w-[min(92vw,360px)] origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {recent.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-slate-200 dark:bg-slate-700' : 'bg-brand-600')} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{n.title}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{n.message}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-slate-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800/60"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    toast({ title: `Theme: ${next}`, description: next === 'system' ? 'Following your system preference.' : undefined, variant: 'info', duration: 2500 });
  };

  const icon = theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'monitor';
  const label = `Theme: ${theme}. Activate to switch.`;

  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={cycle}
        aria-label={label}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Icon name={icon} className="h-5 w-5" />
      </button>
    </Tooltip>
  );
}

function UserMenu() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const name = settings.profile.name || 'Alex Morgan';

  return (
    <Dropdown
      label="User menu"
      trigger={
        <span className="inline-flex items-center gap-2 rounded-lg p-1 pr-1 transition hover:bg-slate-100 sm:pr-2 dark:hover:bg-slate-800" role="button" tabIndex={0} aria-label="User menu">
          <Avatar name={name} size="sm" />
          <Icon name="chevronDown" className="hidden h-4 w-4 text-slate-400 sm:block" />
        </span>
      }
      items={[
        {
          label: name,
          icon: <Icon name="user" className="h-4 w-4" />,
          onClick: () => {},
        },
        { divider: true },
        { label: 'Profile settings', icon: <Icon name="user" className="h-4 w-4" />, href: '/dashboard/settings/profile' },
        { label: 'Preferences', icon: <Icon name="settings" className="h-4 w-4" />, href: '/dashboard/settings/preferences' },
        { label: 'Appearance', icon: <Icon name="sun" className="h-4 w-4" />, href: '/dashboard/settings/appearance' },
        { divider: true },
        {
          label: 'Sign out',
          icon: <Icon name="logout" className="h-4 w-4" />,
          onClick: () => toast({ title: 'Signed out (mock)', description: 'This demo has no real authentication.', variant: 'info' }),
        },
      ]}
    />
  );
}
