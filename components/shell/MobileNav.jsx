'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer } from '@/components/ui/Drawer';
import { SidebarNav } from './Sidebar';
import { Icon } from '@/components/ui/Icon';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

/* Mobile: slide-out drawer reusing the desktop nav + a compact bottom tab bar. */
export function MobileNav({ open, onClose }) {
  return (
    <Drawer open={open} onClose={onClose} position="left" size="sm" title="Nexora" description="Operations Intelligence">
      <div className="-mx-5 -my-5 flex h-full flex-col">
        <SidebarNav collapsed={false} onNavigate={onClose} />
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <Link
            href="/dashboard/settings/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">AM</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">Alex Morgan</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Operations Manager</span>
            </span>
          </Link>
        </div>
      </div>
    </Drawer>
  );
}

const TABS = [
  { label: 'Home', href: '/dashboard/overview', icon: 'overview', match: ['/dashboard/overview', '/dashboard'] },
  { label: 'Projects', href: '/dashboard/projects', icon: 'projects', match: ['/dashboard/projects'] },
  { label: 'Tasks', href: '/dashboard/tasks', icon: 'tasks', match: ['/dashboard/tasks'] },
  { label: 'Alerts', href: '/dashboard/notifications', icon: 'notifications', match: ['/dashboard/notifications'], badge: true },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <nav
      aria-label="Mobile primary"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match.some((m) => pathname === m || pathname.startsWith(m + '/'));
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition',
                  active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <span className="relative">
                  <Icon name={tab.icon} className="h-5 w-5" />
                  {tab.badge && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
