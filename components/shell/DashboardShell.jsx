'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopNav } from '@/components/shell/TopNav';
import { MobileNav, BottomTabBar } from '@/components/shell/MobileNav';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { QuickCreate } from '@/components/shell/QuickCreate';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { settings, updateSection } = useSettings();
  const collapsed = !!settings.appearance.sidebarCollapsed;
  const density = settings.appearance.density;

  return (
    <div className={cn('min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100', density === 'compact' && '[&_main]:text-[15px]')}>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <div className="flex">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => updateSection('appearance', { sidebarCollapsed: !collapsed })}
        />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopNav onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-8" id="main-content">
            {children}
          </main>
        </div>
      </div>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <BottomTabBar />
      <CommandPalette />
      <QuickCreate />
    </div>
  );
}
