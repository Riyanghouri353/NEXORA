'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';

const TABS = [
  { id: 'profile', label: 'Profile', href: '/dashboard/settings/profile', icon: 'user' },
  { id: 'preferences', label: 'Preferences', href: '/dashboard/settings/preferences', icon: 'settings' },
  { id: 'appearance', label: 'Appearance', href: '/dashboard/settings/appearance', icon: 'monitor' },
];

export default function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
      {TABS.map((tab) => {
        const selected = pathname === tab.href;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={selected ? 'page' : undefined}
            className={cn(
              '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              selected
                ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
            )}
          >
            <Icon name={tab.icon} className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
