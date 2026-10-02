import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { FaqAccordion } from '@/components/public/FaqAccordion';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Nexora — The operations intelligence platform for modern teams',
  description:
    'Nexora unifies analytics, projects, customers, and automation in one calm workspace. See every KPI, ship every project, grow every account.',
  openGraph: {
    title: 'Nexora — The operations intelligence platform for modern teams',
    description:
      'Analytics, projects, customers, and automation in one workspace. Try Nexora free.',
    type: 'website',
  },
};

function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{description}</p>
      )}
    </div>
  );
}

/* --- Product screenshot mock, built entirely from divs --- */
function HeroScreenshot() {
  const bars = [38, 55, 44, 66, 58, 78, 70, 90, 84, 100, 92, 76];
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-xs text-slate-400 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700">
          app.nexora.io/dashboard/overview
        </span>
      </div>
      <div className="flex">
        {/* App sidebar */}
        <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-slate-200 bg-slate-50/60 p-3 sm:flex dark:border-slate-800 dark:bg-slate-900/60">
          {['Overview', 'Analytics', 'Projects', 'Customers', 'Team'].map((item, i) => (
            <div
              key={item}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium',
                i === 0
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {item}
            </div>
          ))}
          <div className="mt-auto rounded-lg bg-brand-50 p-3 dark:bg-brand-950">
            <div className="h-2 w-3/4 rounded bg-brand-200 dark:bg-brand-800" />
            <div className="mt-2 h-6 rounded-md bg-brand-600" />
          </div>
        </div>
        {/* Main panel */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-1.5 h-2.5 w-48 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-brand-600" />
          </div>
          {/* KPI row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { v: '$248k', l: 'Revenue', up: true },
              { v: '1,284', l: 'Active customers', up: true },
              { v: '92%', l: 'On-time delivery', up: false },
            ].map((k) => (
              <div key={k.l} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-base font-extrabold text-slate-900 sm:text-lg dark:text-white">{k.v}</div>
                <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{k.l}</div>
                <div className={cn('mt-1.5 h-1.5 w-16 rounded-full', k.up ? 'bg-emerald-500' : 'bg-brand-500')} />
              </div>
            ))}
          </div>
          {/* Chart */}
          <div className="mt-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex gap-2">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">30d</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] text-slate-400">90d</span>
              </div>
            </div>
            <div className="mt-3 flex h-28 items-end gap-1.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={cn(
                    'flex-1 rounded-t',
                    i === bars.length - 3 ? 'bg-brand-600' : 'bg-brand-200 dark:bg-brand-900'
                  )}
                />
              ))}
            </div>
          </div>
          {/* Task rows */}
          <div className="mt-3 space-y-2">
            {[
              { t: 'Launch onboarding v2', w: '78%', c: 'bg-emerald-500' },
              { t: 'Q3 revenue review', w: '45%', c: 'bg-brand-500' },
              { t: 'Customer health audit', w: '22%', c: 'bg-amber-500' },
            ].map((r) => (
              <div key={r.t} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800">
                <span className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 dark:text-slate-300">{r.t}</span>
                <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-slate-800">
                  <span className={cn('block h-full rounded-full', r.c)} style={{ width: r.w }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreviewMock() {
  const donut = [
    { label: 'Enterprise', value: 42, color: 'bg-brand-600' },
    { label: 'Mid-market', value: 33, color: 'bg-brand-300 dark:bg-brand-700' },
    { label: 'SMB', value: 25, color: 'bg-slate-200 dark:bg-slate-700' },
  ];
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0 rounded-full bg-[conic-gradient(#4f46e5_0_42%,#c7d2fe_42%_75%,#e2e8f0_75%_100%)] dark:bg-[conic-gradient(#4f46e5_0_42%,#312e81_42%_75%,#1e293b_75%_100%)]">
            <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-900" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">42%</span>
            </div>
          </div>
          <ul className="space-y-2.5">
            {donut.map((d) => (
              <li key={d.label} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className={cn('h-2.5 w-2.5 rounded-full', d.color)} />
                {d.label} · {d.value}%
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 space-y-3">
          {[
            { t: 'Acme Corp renewed · $48k', d: '2h ago', s: 'success' },
            { t: 'Project “Atlas” hit milestone', d: '5h ago', s: 'primary' },
            { t: '3 tasks overdue in “Beacon”', d: 'Yesterday', s: 'warning' },
          ].map((a) => (
            <div key={a.t} className="flex items-center gap-3">
              <Badge variant={a.s} dot size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">{a.t}</p>
                <p className="text-[11px] text-slate-400">{a.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TRUSTED_BY = [
  { name: 'VANTEK', style: 'font-black tracking-[0.22em]' },
  { name: 'Northloop', style: 'font-bold italic' },
  { name: 'HELIOS', style: 'font-light tracking-[0.3em]' },
  { name: 'crestline', style: 'font-extrabold lowercase tracking-tight' },
  { name: 'Bluefin&Co', style: 'font-semibold' },
  { name: 'ARCADIA', style: 'font-bold tracking-[0.14em]' },
];

const FEATURES = [
  { icon: 'analytics', title: 'Real-time analytics', description: 'Revenue, growth, and funnel metrics that update the moment something happens — no overnight ETL, no stale exports.' },
  { icon: 'projects', title: 'Project management', description: 'Plan, track, and ship work across teams with boards, timelines, and budgets that stay in sync automatically.' },
  { icon: 'customers', title: 'Customer management', description: 'A single customer record with revenue, projects, tickets, and history — the whole relationship in one place.' },
  { icon: 'reports', title: 'Reporting', description: 'Board-ready reports in one click. Schedule them weekly, share them by link, or export to CSV anytime.' },
  { icon: 'sparkles', title: 'Automation', description: 'Trigger reminders, assignments, and follow-ups from the events you define. Busywork disappears on its own.' },
  { icon: 'team', title: 'Team management', description: 'See capacity, productivity, and workload across every department, and rebalance before anyone burns out.' },
  { icon: 'notifications', title: 'Smart notifications', description: 'Only the signals that matter: milestones, risks, and changes — delivered where your team already works.' },
  { icon: 'search', title: 'Universal search', description: 'One search box for customers, projects, tasks, and transactions. Press a key, find anything in milliseconds.' },
];

const TESTIMONIALS = [
  {
    quote:
      'We replaced four tools with Nexora in a single quarter. Our Monday planning meeting went from 90 minutes of status-reading to 20 minutes of decisions.',
    name: 'Maya Lindqvist',
    role: 'COO, Northloop',
  },
  {
    quote:
      'The analytics are the first dashboards our executives actually open. I stopped building weekly slide decks entirely — the reports just send themselves.',
    name: 'Daniel Osei',
    role: 'Head of Finance, Vantek',
  },
  {
    quote:
      'Customer health used to be a gut feeling. Now every account has a score, a history, and an owner. Our churn dropped 18% in six months.',
    name: 'Priya Raman',
    role: 'VP Customer Success, Helios',
  },
  {
    quote:
      'Onboarding took an afternoon. By Friday the whole team was living in it. It is the calmest piece of software we run.',
    name: 'Tomás Herrera',
    role: 'Founder, Crestline Studio',
  },
];

const FAQS = [
  {
    q: 'How long does it take to get started?',
    a: 'Most teams are fully set up in under a day. Import customers and projects from CSV, invite your team, and the dashboards populate automatically. Every plan includes a free 14-day trial — no credit card required.',
  },
  {
    q: 'Can Nexora replace our existing tools?',
    a: 'Yes — that is the point. Nexora consolidates analytics, project tracking, customer management, and reporting into one workspace, so teams typically retire 3–5 separate subscriptions after migrating.',
  },
  {
    q: 'Is our data secure?',
    a: 'Absolutely. All data is encrypted in transit and at rest, Enterprise plans include SSO/SAML and audit logs, and this demo stores everything locally in your own browser.',
  },
  {
    q: 'What happens after the trial ends?',
    a: 'Nothing scary. Your workspace is preserved, and you can pick a plan whenever you are ready. If you decide Nexora is not for you, export everything to CSV and walk away.',
  },
  {
    q: 'Do you offer discounts for startups or nonprofits?',
    a: 'Yes. Early-stage startups and registered nonprofits get 30% off any paid plan for the first year. Contact our team and we will set it up.',
  },
];

function AlternateSection({ flip, eyebrow, title, description, bullets, mock, linkHref, linkLabel }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn(flip && 'lg:order-2')}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{description}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              <span className="text-[15px]">{b}</span>
            </li>
          ))}
        </ul>
        <Link
          href={linkHref}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {linkLabel}
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>
      <div className={cn(flip && 'lg:order-1')}>{mock}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" dot className="animate-fade-in">
              Nexora 2.0 is live — automation workflows included
            </Badge>
            <h1 className="animate-fade-in mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              One calm workspace for your{' '}
              <span className="text-brand-600 dark:text-brand-400">entire operation</span>
            </h1>
            <p className="animate-fade-in mt-6 text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              Nexora brings analytics, projects, customers, and automation together — so your team
              stops switching tools and starts seeing clearly.
            </p>
            <div className="animate-fade-in mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard/overview">
                <Button variant="primary" size="lg" rightIcon={<Icon name="arrowRight" className="h-4 w-4" />}>
                  Open the live demo
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="secondary" size="lg">
                  Explore features
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              Free 14-day trial · No credit card · Cancel anytime
            </p>
          </div>
          <div className="animate-slide-up mx-auto mt-14 max-w-5xl">
            <HeroScreenshot />
          </div>
        </div>
      </section>

      {/* 2 — Trusted by */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-10 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Trusted by operations teams at
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {TRUSTED_BY.map((c) => (
              <span key={c.name} className={cn('text-lg text-slate-400 dark:text-slate-500', c.style)}>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Problem / solution */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Nexora"
            title="Your tools grew. Your clarity didn't."
            description="Every new SaaS subscription promised focus and delivered another tab. Nexora reverses the trade."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">The old way</p>
              <ul className="mt-6 space-y-4">
                {[
                  'Revenue in one tool, projects in another, customers in a third',
                  'Weekly status meetings spent reading numbers aloud',
                  'Reports built by hand the night before the board meeting',
                  'Churn discovered after the customer already left',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <Icon name="x" className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />
                    <span className="text-[15px]">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-8 dark:border-brand-900 dark:bg-brand-950/30">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">The Nexora way</p>
              <ul className="mt-6 space-y-4">
                {[
                  'One workspace: analytics, projects, customers, automation',
                  'Live dashboards replace status meetings entirely',
                  'Reports generate themselves and arrive on schedule',
                  'Customer health scores flag risk before it becomes churn',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-800 dark:text-slate-100">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[15px] font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Dashboard preview */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AlternateSection
            eyebrow="Overview"
            title="Your whole business, one glance"
            description="The Nexora dashboard is the first screen your team opens and the last one they argue about. Every KPI is live, every number is clickable, and every drill-down tells the story behind the metric."
            bullets={[
              'Revenue, expenses, and profit tracked in real time',
              'Customer growth, project health, and team capacity side by side',
              'Fully interactive — click any metric to see the underlying records',
            ]}
            linkHref="/dashboard/overview"
            linkLabel="See the dashboard in action"
            mock={<DashboardPreviewMock />}
          />
        </div>
      </section>

      {/* 5 — Feature grid */}
      <section className="py-20 sm:py-28" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform"
            title="Everything you need. Nothing you babysit."
            description="Eight tightly-integrated modules, one shared data model. Enter a customer once and watch them appear in analytics, projects, reports, and automations."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="group p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950 dark:text-brand-300 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{f.description}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
              Dive into every feature
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 — Analytics section */}
      <section className="border-y border-slate-200 bg-slate-950 py-20 text-white sm:py-28 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Analytics</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Answers, not just charts
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Nexora's analytics engine connects revenue, projects, and customers into one story.
                Ask why growth stalled and get the funnel, the accounts, and the projects behind it —
                in seconds, not sprint planning sessions.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  '12-month revenue, funnel, and cohort analysis out of the box',
                  'Forecasting that learns from your actual close rates',
                  'Export anything to CSV or schedule it to your inbox',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-slate-200">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-400" />
                    <span className="text-[15px]">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div aria-hidden="true" className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Revenue forecast</p>
                <Badge variant="success" dot size="sm">+18.2% YoY</Badge>
              </div>
              <div className="mt-5 flex h-40 items-end gap-2">
                {[34, 42, 38, 50, 56, 52, 64, 71, 68, 80, 88, 96].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={cn(
                      'flex-1 rounded-t-md',
                      i > 8 ? 'bg-brand-500/50' : 'bg-brand-500'
                    )}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ['Pipeline', '$412k'],
                  ['Win rate', '34%'],
                  ['Avg. deal', '$18.2k'],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-slate-800/70 p-3">
                    <p className="text-[11px] text-slate-400">{l}</p>
                    <p className="mt-1 text-base font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Project management section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AlternateSection
            flip
            eyebrow="Projects"
            title="Ship on time, every time"
            description="Boards, timelines, and budgets that update themselves as work moves. Nexora flags slipping deadlines before they slip, and shows exactly which task is blocking the milestone."
            bullets={[
              'Kanban boards, timelines, and calendar views for every project',
              'Budget vs. spend tracking with automatic overrun alerts',
              'Dependencies, priorities, and assignees in one drag-and-drop board',
            ]}
            linkHref="/features#project-management"
            linkLabel="Explore project management"
            mock={
              <div aria-hidden="true" className="grid grid-cols-3 gap-3">
                {[
                  { title: 'Backlog', count: 4, tone: 'bg-slate-100 dark:bg-slate-800' },
                  { title: 'In progress', count: 3, tone: 'bg-brand-50 dark:bg-brand-950' },
                  { title: 'Done', count: 12, tone: 'bg-emerald-50 dark:bg-emerald-950/40' },
                ].map((col) => (
                  <div key={col.title} className={cn('rounded-xl border border-slate-200 p-3 dark:border-slate-800', col.tone)}>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {col.title} <span className="ml-1 font-normal text-slate-400">{col.count}</span>
                    </p>
                    <div className="mt-3 space-y-2">
                      {[0, 1].map((i) => (
                        <div key={i} className="rounded-lg bg-white p-2.5 shadow-sm dark:bg-slate-900">
                          <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
                          <div className="mt-1.5 h-2 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                          <div className="mt-2 flex items-center justify-between">
                            <span className="h-5 w-5 rounded-full bg-brand-200 dark:bg-brand-800" />
                            <span className="h-4 w-10 rounded bg-slate-100 dark:bg-slate-800" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        </div>
      </section>

      {/* 8 — Customer management section */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AlternateSection
            eyebrow="Customers"
            title="Know every account like it's your only one"
            description="Every customer gets a living profile: revenue history, open projects, support tickets, and a health score that updates daily. Your team always knows who needs attention — and why."
            bullets={[
              '360° customer profiles with revenue, projects, and activity',
              'Health scores that surface at-risk accounts early',
              'Segments, industries, and territories without a data team',
            ]}
            linkHref="/features#customer-management"
            linkLabel="Explore customer management"
            mock={
              <div aria-hidden="true" className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {[
                  { name: 'Acme Corp', meta: 'Enterprise · $48k ARR', score: 94, tone: 'bg-emerald-500' },
                  { name: 'Northloop', meta: 'Mid-market · $21k ARR', score: 78, tone: 'bg-brand-500' },
                  { name: 'Beacon Labs', meta: 'SMB · $6k ARR', score: 52, tone: 'bg-amber-500' },
                  { name: 'Helios', meta: 'Enterprise · $63k ARR', score: 88, tone: 'bg-emerald-500' },
                ].map((c, i) => (
                  <div key={c.name} className={cn('flex items-center gap-3 px-5 py-4', i > 0 && 'border-t border-slate-100 dark:border-slate-800')}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {c.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.meta}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{c.score}</p>
                      <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={cn('h-full rounded-full', c.tone)} style={{ width: `${c.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        </div>
      </section>

      {/* 9 — Integrations row */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Integrations"
            title="Plays well with your stack"
            description="Connect the tools you already love. Data flows in automatically — no manual imports, no Zapier gymnastics."
          />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {['Slack', 'Stripe', 'GitHub', 'Google Workspace', 'Salesforce', 'HubSpot', 'Linear', 'Notion', 'Zapier', 'Figma', 'Intercom', 'QuickBooks'].map((name) => (
              <span
                key={name}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — Testimonials */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Customers"
            title="Loved by teams that hate busywork"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="flex flex-col p-7">
                <Icon name="sparkles" className="h-6 w-6 text-brand-500" />
                <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-slate-700 dark:text-slate-200">
                  “{t.quote}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {t.name.split(' ').map((w) => w[0]).join('')}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 11 — Pricing teaser */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing that scales with you"
            description="Start free, upgrade when you're ready. Every paid plan includes unlimited dashboards, all integrations, and onboarding help."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              { name: 'Starter', price: '$19', note: 'per user / month' },
              { name: 'Professional', price: '$49', note: 'per user / month', popular: true },
              { name: 'Enterprise', price: 'Custom', note: 'tailored to you' },
            ].map((p) => (
              <Card key={p.name} className={cn('relative p-7 text-center', p.popular && 'border-brand-600 shadow-xl shadow-brand-600/10 dark:border-brand-500')}>
                {p.popular && (
                  <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
                )}
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{p.price}</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{p.note}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/pricing">
              <Button variant="primary" size="lg" rightIcon={<Icon name="arrowRight" className="h-4 w-4" />}>
                Compare plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 12 — FAQ */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions, answered"
          />
          <div className="mt-10">
            <FaqAccordion items={FAQS} />
          </div>
        </div>
      </section>

      {/* 13 — Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-16 text-center sm:px-12 sm:py-20 dark:bg-brand-800">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
              <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-white/10" />
            </div>
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Stop switching tabs. Start seeing clearly.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Join thousands of teams running their operations on Nexora. Set up in a day — free for 14 days.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard/overview">
                <span className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-bold text-brand-700 shadow-lg transition hover:bg-brand-50">
                  Open the live demo
                  <Icon name="arrowRight" className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/contact">
                <span className="inline-flex h-12 items-center rounded-lg border border-white/40 px-6 text-base font-semibold text-white transition hover:bg-white/10">
                  Talk to sales
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
