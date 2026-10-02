import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Features — Nexora',
  description:
    'Explore every Nexora capability: real-time analytics, project management, customer management, reporting, automation, team management, notifications, and universal search.',
  openGraph: {
    title: 'Features — Nexora',
    description: 'A deep tour of the Nexora platform: eight modules, one shared data model.',
    type: 'website',
  },
};

const SECTIONS = [
  {
    id: 'analytics',
    icon: 'analytics',
    eyebrow: 'Analytics',
    title: 'Real-time analytics that answer “why”',
    description:
      'Nexora streams every event — revenue, deals, project updates, customer activity — into live dashboards. No nightly ETL jobs, no stale spreadsheets, no “let me pull that number for you.”',
    bullets: [
      'Revenue, expenses, and profit with 7d / 30d / 90d / 12m ranges',
      'Funnel and cohort analysis that updates as deals move',
      'Forecasting tuned to your actual close rates',
    ],
    highlights: [
      { stat: '<1s', label: 'dashboard refresh' },
      { stat: '40+', label: 'built-in metrics' },
      { stat: '12m', label: 'history retained' },
    ],
  },
  {
    id: 'project-management',
    icon: 'projects',
    eyebrow: 'Project management',
    title: 'Projects that manage themselves (almost)',
    description:
      'Plan in boards or timelines, track budget against spend, and let Nexora flag the risks. Dependencies, priorities, and assignees stay in sync — the status meeting becomes optional.',
    bullets: [
      'Kanban, timeline, and calendar views on the same data',
      'Budget vs. spend with automatic overrun alerts',
      'Milestones, dependencies, and critical-path highlighting',
    ],
    highlights: [
      { stat: '5', label: 'project views' },
      { stat: '98%', label: 'on-time delivery*' },
      { stat: '0', label: 'status meetings needed' },
    ],
  },
  {
    id: 'customer-management',
    icon: 'customers',
    eyebrow: 'Customer management',
    title: 'Every account, fully understood',
    description:
      'A living 360° profile for each customer: revenue history, open projects, transactions, and a health score that updates daily. Anyone on your team can answer “how is Acme doing?” in one click.',
    bullets: [
      'Health scores combining activity, spend, and engagement',
      'Full timeline: deals, projects, tickets, notes',
      'Segments by industry, territory, or value — no data team required',
    ],
    highlights: [
      { stat: '360°', label: 'customer view' },
      { stat: '-18%', label: 'avg. churn reduction' },
      { stat: '24/7', label: 'health monitoring' },
    ],
  },
  {
    id: 'reporting',
    icon: 'reports',
    eyebrow: 'Reporting',
    title: 'Board-ready reports, zero late nights',
    description:
      'Build a report once from any dashboard, then schedule it. Stakeholders get a polished summary in their inbox every Monday — or grab a live link anytime.',
    bullets: [
      'One-click reports from any dashboard or dataset',
      'Scheduled delivery: daily, weekly, monthly',
      'CSV export and shareable live links',
    ],
    highlights: [
      { stat: '1-click', label: 'report generation' },
      { stat: '∞', label: 'recipients' },
      { stat: '0', label: 'slides to build' },
    ],
  },
  {
    id: 'automation',
    icon: 'sparkles',
    eyebrow: 'Automation',
    title: 'Busywork, handled quietly',
    description:
      'Define triggers once — a deal stalling, a task going overdue, a health score dropping — and Nexora takes care of the follow-up: reminders, assignments, escalations.',
    bullets: [
      'Event-based triggers across projects, customers, and tasks',
      'Multi-step workflows with conditions and delays',
      'A full run history so nothing happens mysteriously',
    ],
    highlights: [
      { stat: '30+', label: 'trigger types' },
      { stat: '6hrs', label: 'saved per week*' },
      { stat: '100%', label: 'auditable runs' },
    ],
  },
  {
    id: 'team-management',
    icon: 'team',
    eyebrow: 'Team management',
    title: 'Capacity you can actually see',
    description:
      'Workload, productivity, and availability across every department — in one view. Rebalance before anyone burns out, and staff the next project with confidence.',
    bullets: [
      'Capacity planning across teams and projects',
      'Productivity trends without surveillance vibes',
      'Roles, departments, and availability in one directory',
    ],
    highlights: [
      { stat: '1', label: 'team directory' },
      { stat: '14', label: 'departments supported' },
      { stat: '0', label: 'spreadsheets needed' },
    ],
  },
  {
    id: 'notifications',
    icon: 'notifications',
    eyebrow: 'Notifications',
    title: 'Signals, not noise',
    description:
      'Nexora notifies you about what matters — milestones hit, risks emerging, customers going quiet — and stays silent about the rest. Tune every channel to your taste.',
    bullets: [
      'Smart digests instead of a firehose of alerts',
      'Per-category controls: projects, tasks, customers, system',
      'In-app, email, and Slack delivery',
    ],
    highlights: [
      { stat: '-70%', label: 'alert volume*' },
      { stat: '3', label: 'delivery channels' },
      { stat: '5', label: 'notification categories' },
    ],
  },
  {
    id: 'search',
    icon: 'search',
    eyebrow: 'Search',
    title: 'Find anything in milliseconds',
    description:
      'One search box for customers, projects, tasks, transactions, and team members. Keyboard-first, typo-tolerant, and instant — press a key and you are already there.',
    bullets: [
      'Unified search across every record type',
      'Keyboard shortcut to search from anywhere',
      'Recent and pinned results that follow you',
    ],
    highlights: [
      { stat: '<50ms', label: 'typical search' },
      { stat: '6', label: 'record types indexed' },
      { stat: '1', label: 'shortcut to rule them all' },
    ],
  },
];

function FeatureMock({ id }) {
  if (id === 'analytics') {
    return (
      <div aria-hidden="true" className="flex h-44 items-end gap-1.5">
        {[30, 45, 38, 58, 52, 70, 66, 84, 78, 92, 88, 100].map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className={cn('flex-1 rounded-t-md', i === 11 ? 'bg-brand-600' : 'bg-brand-200 dark:bg-brand-900')} />
        ))}
      </div>
    );
  }
  if (id === 'project-management') {
    return (
      <div aria-hidden="true" className="space-y-2.5">
        {[
          { t: 'Design system v3', w: '85%' },
          { t: 'API migration', w: '60%' },
          { t: 'Mobile release', w: '30%' },
        ].map((p) => (
          <div key={p.t}>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>{p.t}</span>
              <span>{p.w}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-brand-600" style={{ width: p.w }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (id === 'customer-management') {
    return (
      <div aria-hidden="true" className="grid grid-cols-3 gap-3 text-center">
        {[
          ['1,284', 'customers'],
          ['94', 'avg. health'],
          ['12', 'at risk'],
        ].map(([v, l]) => (
          <div key={l} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{v}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{l}</p>
          </div>
        ))}
      </div>
    );
  }
  if (id === 'reporting') {
    return (
      <div aria-hidden="true" className="space-y-2.5">
        {['Weekly revenue summary', 'Q3 board deck', 'Customer health digest'].map((r, i) => (
          <div key={r} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <Icon name="doc" className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{r}</span>
            <Badge variant={i === 0 ? 'success' : 'neutral'} size="sm" dot>{i === 0 ? 'Sent' : 'Scheduled'}</Badge>
          </div>
        ))}
      </div>
    );
  }
  if (id === 'automation') {
    return (
      <div aria-hidden="true" className="flex items-center gap-2">
        {['Deal stalls 7d', 'Notify owner', 'Escalate'].map((s, i, arr) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className="flex-1 rounded-xl border border-brand-200 bg-brand-50 px-3 py-3 text-center text-xs font-semibold text-brand-800 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200">
              {s}
            </div>
            {i < arr.length - 1 && <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />}
          </div>
        ))}
      </div>
    );
  }
  if (id === 'team-management') {
    return (
      <div aria-hidden="true" className="space-y-2.5">
        {[
          { n: 'Engineering', w: '82%' },
          { n: 'Design', w: '64%' },
          { n: 'Sales', w: '91%' },
        ].map((t) => (
          <div key={t.n} className="flex items-center gap-3">
            <span className="w-24 text-xs font-medium text-slate-600 dark:text-slate-300">{t.n}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: t.w }} />
            </div>
            <span className="w-10 text-right text-xs text-slate-400">{t.w}</span>
          </div>
        ))}
      </div>
    );
  }
  if (id === 'notifications') {
    return (
      <div aria-hidden="true" className="space-y-2.5">
        {[
          { t: 'Milestone reached in “Atlas”', v: 'primary' },
          { t: 'Acme Corp health dropped to 52', v: 'warning' },
        ].map((n) => (
          <div key={n.t} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
            <Badge variant={n.v} dot size="sm" />
            <span className="text-sm text-slate-700 dark:text-slate-300">{n.t}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Icon name="search" className="h-4 w-4" />
        <span>Search customers, projects, tasks…</span>
        <kbd className="ml-auto rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold dark:border-slate-700 dark:bg-slate-800">⌘K</kbd>
      </div>
      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
        {['Acme Corp — Customer', 'Atlas — Project', 'Invoice #INV-2041'].map((r) => (
          <div key={r} className="rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300">{r}</div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <main>
      {/* Header + anchor nav */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-16 sm:py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" dot>Platform tour</Badge>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Every feature, up close
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Eight modules, one shared data model. Jump to what matters to you —
              or read the whole tour.
            </p>
          </div>
          <nav aria-label="Feature sections" className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
              >
                <Icon name={s.icon} className="h-4 w-4" />
                {s.eyebrow}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Feature sections, alternating */}
      {SECTIONS.map((s, idx) => {
        const flip = idx % 2 === 1;
        return (
          <section
            key={s.id}
            id={s.id}
            className={cn(
              'scroll-mt-24 py-16 sm:py-24',
              idx % 2 === 1 && 'border-y border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40'
            )}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={cn(flip && 'lg:order-2')}>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
                    {s.eyebrow}
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {s.title}
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{s.description}</p>
                  <ul className="mt-6 space-y-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          <Icon name="check" className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[15px]">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={cn(flip && 'lg:order-1')}>
                  <Card className="p-6">
                    <FeatureMock id={s.id} />
                    <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                      {s.highlights.map((h) => (
                        <div key={h.label} className="text-center">
                          <p className="text-xl font-extrabold text-brand-700 sm:text-2xl dark:text-brand-300">{h.stat}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{h.label}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            See it all in your own workspace
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Every feature above is live in the demo. Open it, click around, break things —
            nothing is staged.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard/overview">
              <Button variant="primary" size="lg" rightIcon={<Icon name="arrowRight" className="h-4 w-4" />}>
                Open the live demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" size="lg">See pricing</Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            * Illustrative figures based on customer surveys.
          </p>
        </div>
      </section>
    </main>
  );
}
