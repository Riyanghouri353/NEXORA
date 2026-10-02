'use client';

import { Switch } from '@/components/ui/toggles';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useTheme, useToast } from '@/components/providers';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
];

const DENSITY_OPTIONS = [
  { value: 'comfortable', label: 'Comfortable', description: 'Roomier spacing' },
  { value: 'compact', label: 'Compact', description: 'Fit more on screen' },
];

function SegmentedControl({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            value === opt.value
              ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          {opt.icon && <Icon name={opt.icon} className="h-4 w-4" />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function AppearancePage() {
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings, updateSection } = useSettings();
  const appearance = settings.appearance;

  const handleTheme = (next) => {
    setTheme(next);
    toast({
      title: 'Theme updated',
      description: `Switched to ${next === 'system' ? 'system default' : next + ' mode'}.`,
      variant: 'success',
    });
  };

  const handleAppearance = (patch, label) => {
    updateSection('appearance', patch);
    if (label) toast({ title: label, variant: 'success' });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader title="Theme" subtitle={`Currently following ${theme === 'system' ? 'your system' : theme + ' mode'} (${resolvedTheme}).`} />
          <CardContent>
            <SegmentedControl options={THEME_OPTIONS} value={theme} onChange={handleTheme} ariaLabel="Color theme" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Dashboard density" subtitle="Control how tightly content is packed." />
          <CardContent>
            <SegmentedControl
              options={DENSITY_OPTIONS}
              value={appearance.density}
              onChange={(v) => handleAppearance({ density: v }, `Density set to ${v}`)}
              ariaLabel="Dashboard density"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Interface" subtitle="Fine-tune the shell behavior." />
          <CardContent>
            <div className="space-y-5">
              <Switch
                label="Collapsed sidebar"
                description="Start with the sidebar collapsed on desktop."
                checked={appearance.sidebarCollapsed}
                onChange={(v) => handleAppearance({ sidebarCollapsed: v }, v ? 'Sidebar will start collapsed' : 'Sidebar will start expanded')}
              />
              <Switch
                label="Reduced motion"
                description="Minimize animations and transitions."
                checked={appearance.reducedMotion}
                onChange={(v) => handleAppearance({ reducedMotion: v }, v ? 'Reduced motion enabled' : 'Reduced motion disabled')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live preview */}
      <Card>
        <CardHeader title="Live preview" subtitle="A sample card rendered with your current theme." />
        <CardContent>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Sample metric
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">$48,210</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">+12.4% vs last month</p>
              </div>
              <Badge variant="primary" size="sm" dot>
                Active
              </Badge>
            </div>
            <div className="mt-4 h-16 rounded-lg bg-slate-100 dark:bg-slate-800" aria-hidden="true">
              <svg viewBox="0 0 200 64" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  points="0,52 25,44 50,47 75,32 100,36 125,22 150,26 175,12 200,16"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm">Primary action</Button>
              <Button size="sm" variant="outline">
                Secondary
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Theme changes apply instantly across the whole dashboard — this card just makes it easy to compare.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
