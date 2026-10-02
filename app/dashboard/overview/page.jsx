'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, IconButton } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Drawer } from '@/components/ui/Drawer';
import { Switch } from '@/components/ui/toggles';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonCard, SkeletonChart } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { RevenueChart, Sparkline, BarsChart } from '@/components/charts/charts';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { simulateFetch } from '@/lib/api';
import {
  activities,
  baseTasks,
  customerById,
  customers,
  customerGrowthSeries,
  funnelStages,
  projects,
  revenueSeries,
  teamById,
  teamMembers,
  teamProductivitySeries,
  transactions,
} from '@/data';
import { formatCurrency, formatDate, formatNumber, timeAgo } from '@/lib/utils';

const DAY_MS = 86400000;

const RANGE_OPTIONS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '12m', label: '12 months' },
];

const ACTIVITY_META = {
  project: { icon: 'projects', label: 'Project' },
  task: { icon: 'tasks', label: 'Task' },
  transaction: { icon: 'transactions', label: 'Transaction' },
  customer: { icon: 'customers', label: 'Customer' },
  team: { icon: 'team', label: 'Team' },
  system: { icon: 'settings', label: 'System' },
};

const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

function signedPct(value, decimals = 1) {
  const n = Number(value) || 0;
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(decimals)}%`;
}

/* Average a long series down to at most `max` buckets so bar charts stay readable. */
function downsample(points, max = 24) {
  if (points.length <= max) return points;
  const size = Math.ceil(points.length / max);
  const buckets = [];
  for (let i = 0; i < points.length; i += size) {
    const chunk = points.slice(i, i + size);
    const avg = (key) => Math.round(chunk.reduce((s, p) => s + p[key], 0) / chunk.length);
    buckets.push({
      label: chunk.length > 1 ? `${chunk[0].label}–${chunk[chunk.length - 1].label}` : chunk[0].label,
      revenue: avg('revenue'),
      expenses: avg('expenses'),
      profit: avg('profit'),
    });
  }
  return buckets;
}

function fireQuickCreate(kind) {
  window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind } }));
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonChart />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <SkeletonCard />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { widgets, visibleWidgets, toggleWidget, moveWidget, resetLayout } = useDashboardLayout();

  useEffect(() => {
    let alive = true;
    simulateFetch(() => true, 600).then(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const now = Date.now();
    const withinDays = (iso, days) => now - new Date(iso).getTime() <= days * DAY_MS;
    const betweenDays = (iso, from, to) => {
      const age = now - new Date(iso).getTime();
      return age > from * DAY_MS && age <= to * DAY_MS;
    };

    const revenueTxns = transactions.filter((t) => t.amount > 0 && t.status === 'completed');
    const revTotal = revenueTxns.reduce((s, t) => s + t.amount, 0);
    const revCur = revenueTxns.filter((t) => withinDays(t.date, 30)).reduce((s, t) => s + t.amount, 0);
    const revPrev = revenueTxns.filter((t) => betweenDays(t.date, 30, 60)).reduce((s, t) => s + t.amount, 0);
    const revChange = revPrev > 0 ? ((revCur - revPrev) / revPrev) * 100 : 0;

    const activeProjects = projects.filter((p) => p.status === 'active');
    const newProjects = projects.filter((p) => withinDays(p.startDate, 90)).length;
    const atRisk = projects.filter((p) => p.status === 'at-risk').length;

    const newCustomers = customers.filter((c) => withinDays(c.joinedAt, 90)).length;

    const funnel = funnelStages();
    const conversion = (funnel[funnel.length - 1].value / funnel[0].value) * 100;

    const pending = baseTasks.filter((t) => t.status !== 'done');
    const overdue = pending.filter((t) => new Date(t.dueDate).getTime() < now).length;

    const productivity = teamMembers.reduce((s, m) => s + m.productivity, 0) / teamMembers.length;

    return [
      {
        id: 'revenue',
        title: 'Revenue',
        value: formatCurrency(revTotal),
        change: signedPct(revChange),
        changeLabel: 'vs prior 30 days',
        changeTone: revChange >= 0 ? 'up' : 'down',
        icon: <Icon name="currency" className="h-5 w-5" />,
        description: `${formatCurrency(revCur)} collected in the last 30 days.`,
        spark: (
          <Sparkline
            data={revenueSeries('30d').map((p) => p.revenue)}
            color="#4f46e5"
            ariaLabel="Revenue trend over the last 30 days"
          />
        ),
      },
      {
        id: 'projects',
        title: 'Active Projects',
        value: String(activeProjects.length),
        change: `+${newProjects}`,
        changeLabel: 'started this quarter',
        changeTone: 'up',
        icon: <Icon name="projects" className="h-5 w-5" />,
        description: atRisk > 0 ? `${atRisk} flagged at risk — review needed.` : 'No projects flagged at risk.',
      },
      {
        id: 'customers',
        title: 'Customers',
        value: formatNumber(customers.length),
        change: `+${newCustomers}`,
        changeLabel: 'joined this quarter',
        changeTone: 'up',
        icon: <Icon name="customers" className="h-5 w-5" />,
        description: `${new Set(customers.map((c) => c.industry)).size} industries served.`,
      },
      {
        id: 'conversion',
        title: 'Conversion Rate',
        value: `${conversion.toFixed(2)}%`,
        change: '+0.4 pts',
        changeLabel: 'vs last quarter',
        changeTone: 'up',
        icon: <Icon name="analytics" className="h-5 w-5" />,
        description: `${formatNumber(funnel[funnel.length - 1].value)} of ${formatNumber(funnel[0].value)} visitors converted.`,
        spark: (
          <Sparkline
            data={customerGrowthSeries(12).map((g) => g.total)}
            color="#10b981"
            ariaLabel="Customer growth trend over the last 12 months"
          />
        ),
      },
      {
        id: 'tasks',
        title: 'Pending Tasks',
        value: formatNumber(pending.length),
        change: overdue > 0 ? `${overdue} overdue` : 'None overdue',
        changeLabel: 'need attention',
        changeTone: overdue > 0 ? 'down' : 'up',
        icon: <Icon name="tasks" className="h-5 w-5" />,
        description: `${pending.filter((t) => withinDays(t.dueDate, 7) && new Date(t.dueDate).getTime() >= now).length} due in the next 7 days.`,
      },
      {
        id: 'productivity',
        title: 'Team Productivity',
        value: `${productivity.toFixed(1)}%`,
        change: '+1.8 pts',
        changeLabel: 'vs last quarter',
        changeTone: 'up',
        icon: <Icon name="team" className="h-5 w-5" />,
        description: `${formatNumber(teamMembers.reduce((s, m) => s + m.tasksCompleted, 0))} tasks completed all-time.`,
        spark: (
          <Sparkline
            data={teamProductivitySeries().map((t) => t.productivity)}
            color="#f59e0b"
            ariaLabel="Team productivity trend over the last 8 weeks"
          />
        ),
      },
    ];
  }, []);

  const series = useMemo(() => revenueSeries(range), [range]);

  const performance = useMemo(() => {
    const total = (key) => series.reduce((s, p) => s + p[key], 0);
    const rev = total('revenue');
    const exp = total('expenses');
    const prof = total('profit');
    const growth = series[0].revenue > 0 ? ((series[series.length - 1].revenue - series[0].revenue) / series[0].revenue) * 100 : 0;
    const bars = downsample(series).map((p) => ({
      label: p.label,
      Revenue: p.revenue,
      Expenses: p.expenses,
      Profit: p.profit,
    }));
    return { rev, exp, prof, growth, bars };
  }, [series]);

  const recentActivity = useMemo(() => activities.slice(0, 8), []);

  const healthProjects = useMemo(
    () =>
      projects
        .filter((p) => p.status !== 'completed')
        .sort(
          (a, b) =>
            (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3) ||
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
        .slice(0, 6),
    []
  );

  const quickActions = [
    {
      label: 'New Project',
      description: 'Kick off a new engagement',
      icon: 'projects',
      onClick: () => fireQuickCreate('project'),
    },
    {
      label: 'Add Customer',
      description: 'Create a customer record',
      icon: 'customers',
      onClick: () => fireQuickCreate('customer'),
    },
    {
      label: 'Create Task',
      description: 'Assign work to the team',
      icon: 'tasks',
      onClick: () => fireQuickCreate('task'),
    },
    {
      label: 'Generate Report',
      description: 'Build a performance report',
      icon: 'reports',
      onClick: () => router.push('/dashboard/reports'),
    },
  ];

  /* Widget sections — rendered in `visibleWidgets` order. */
  const sections = {
    kpis: (
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k) => (
            <KpiCard key={k.id} {...k} />
          ))}
        </div>
      </section>
    ),
    revenue: (
      <section aria-label="Revenue">
        <Card>
          <CardHeader
            title="Revenue"
            subtitle="Revenue performance across the selected period"
            action={
              <div role="group" aria-label="Select date range" className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {RANGE_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={range === r.id}
                    onClick={() => setRange(r.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      range === r.id
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            }
          />
          <CardContent>
            <RevenueChart data={series} height={320} showExpenses showProfit ariaLabel={`Revenue chart, last ${RANGE_OPTIONS.find((r) => r.id === range).label}`} />
          </CardContent>
        </Card>
      </section>
    ),
    performance: (
      <section aria-label="Performance summary">
        <Card>
          <CardHeader title="Performance" subtitle={`Revenue vs expenses for the last ${RANGE_OPTIONS.find((r) => r.id === range).label}`} />
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 pb-5 lg:grid-cols-4">
              {[
                { label: 'Revenue', value: formatCurrency(performance.rev), tone: 'text-slate-900 dark:text-white' },
                { label: 'Expenses', value: formatCurrency(performance.exp), tone: 'text-amber-600 dark:text-amber-400' },
                { label: 'Profit', value: formatCurrency(performance.prof), tone: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Growth', value: signedPct(performance.growth), tone: performance.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</dt>
                  <dd className={`mt-1 text-xl font-bold tabular-nums ${s.tone}`}>{s.value}</dd>
                </div>
              ))}
            </dl>
            <BarsChart
              data={performance.bars}
              dataKeys={[
                { key: 'Revenue', name: 'Revenue', color: '#4f46e5' },
                { key: 'Expenses', name: 'Expenses', color: '#f59e0b' },
                { key: 'Profit', name: 'Profit', color: '#10b981' },
              ]}
              height={280}
              ariaLabel="Revenue versus expenses bar chart"
            />
          </CardContent>
        </Card>
      </section>
    ),
    activity: (
      <section aria-label="Recent activity">
        <Card>
          <CardHeader title="Recent activity" subtitle="Latest events across projects, tasks, and customers" />
          <CardContent>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((a) => {
                const meta = ACTIVITY_META[a.type] || ACTIVITY_META.system;
                const actor = teamById[a.actorId];
                return (
                  <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300" aria-hidden="true">
                      <Icon name={meta.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{a.text}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {actor ? `${actor.name} · ` : ''}
                        {timeAgo(a.createdAt)}
                      </p>
                    </div>
                    {actor && <Avatar name={actor.name} size="sm" className="shrink-0" />}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>
    ),
    health: (
      <section aria-label="Project health">
        <Card>
          <CardHeader title="Project health" subtitle="Top priorities by urgency and deadline" />
          <CardContent>
            <ul className="space-y-5">
              {healthProjects.map((p) => {
                const names = p.teamIds.map((id) => teamById[id]?.name).filter(Boolean);
                const overdue = new Date(p.deadline).getTime() < Date.now();
                return (
                  <li key={p.id}>
                    <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                      <StatusBadge status={p.status} />
                      <PriorityBadge priority={p.priority} />
                    </div>
                    <Progress value={p.progress} showLabel ariaLabel={`${p.name} progress`} />
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <p className={`inline-flex items-center gap-1 text-xs ${overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        <Icon name="calendar" className="h-3.5 w-3.5" aria-hidden="true" />
                        {overdue ? 'Overdue · ' : 'Due '}
                        {formatDate(p.deadline)}
                      </p>
                      <AvatarStack names={names} max={3} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>
    ),
    'quick-actions': (
      <section aria-label="Quick actions">
        <Card>
          <CardHeader title="Quick actions" subtitle="Common tasks, one click away" />
          <CardContent>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-800 dark:hover:border-brand-700 dark:hover:bg-brand-950/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300" aria-hidden="true">
                    <Icon name={a.icon} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">{a.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{a.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    ),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="A live snapshot of revenue, projects, customers, and team activity."
        actions={[
          <Button
            key="customize"
            variant="outline"
            leftIcon={<Icon name="grid" className="h-4 w-4" />}
            onClick={() => setCustomizeOpen(true)}
          >
            Customize
          </Button>,
        ]}
      />

      {loading ? (
        <OverviewSkeleton />
      ) : (
        <>
          {visibleWidgets.map((w) => (
            <div key={w.id}>{sections[w.id]}</div>
          ))}
          {visibleWidgets.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm font-medium text-slate-900 dark:text-white">All widgets are hidden</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Use Customize to bring widgets back, or reset the layout.
                </p>
                <Button variant="secondary" className="mt-4" onClick={resetLayout}>
                  Reset to default
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Drawer
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        title="Customize dashboard"
        description="Show, hide, and reorder widgets. Changes save automatically."
        footer={
          <Button variant="secondary" onClick={resetLayout}>
            Reset to default
          </Button>
        }
      >
        <ul className="space-y-2">
          {widgets.map((w, i) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <Switch
                label={w.label}
                description={w.visible ? 'Visible on the dashboard' : 'Hidden from the dashboard'}
                checked={w.visible}
                onChange={() => toggleWidget(w.id)}
                className="min-w-0 flex-1"
              />
              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  label={`Move ${w.label} up`}
                  disabled={i === 0}
                  onClick={() => moveWidget(w.id, 'up')}
                >
                  <Icon name="chevronDown" className="h-4 w-4 rotate-180" />
                </IconButton>
                <IconButton
                  label={`Move ${w.label} down`}
                  disabled={i === widgets.length - 1}
                  onClick={() => moveWidget(w.id, 'down')}
                >
                  <Icon name="chevronDown" className="h-4 w-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      </Drawer>
    </div>
  );
}
