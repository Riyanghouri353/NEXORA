import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { teamMembers } from '@/data/team';

export const metadata = {
  title: 'About — Nexora',
  description:
    'Nexora builds the operations intelligence platform for modern teams. Read our story, meet our leadership, and see what we stand for.',
  openGraph: {
    title: 'About — Nexora',
    description: 'Our story, our values, our team. Nexora exists to end the era of tab-switching.',
    type: 'website',
  },
};

const VALUES = [
  {
    icon: 'eye',
    title: 'Clarity over cleverness',
    description:
      'If a dashboard needs a manual, it failed. We design every screen to be understood in seconds — by the intern and the CEO alike.',
  },
  {
    icon: 'check',
    title: 'Do the boring work',
    description:
      'Great operations are unglamorous: exports that work, alerts that fire, numbers that reconcile. We obsess over the unsexy parts.',
  },
  {
    icon: 'team',
    title: 'Teams, not tools',
    description:
      'Software should make people better at working together, not better at feeding the software. Nexora adapts to your team, never the reverse.',
  },
  {
    icon: 'sparkles',
    title: 'Earn trust daily',
    description:
      'Your business runs on this data. We earn that responsibility with reliability, transparency, and security — every single day.',
  },
];

const STATS = [
  { value: '12,000+', label: 'teams run on Nexora' },
  { value: '4.9 / 5', label: 'average customer rating' },
  { value: '99.99%', label: 'uptime over the last year' },
  { value: '38', label: 'countries with customers' },
];

const TIMELINE = [
  {
    year: '2021',
    title: 'The spreadsheet rebellion',
    text: 'Two founders, one shared Google Sheet with 40 tabs, and a growing conviction that running a business should not feel like data entry.',
  },
  {
    year: '2022',
    title: 'Nexora 1.0 launches',
    text: 'Our first customers come aboard: a unified dashboard for revenue and projects. 200 teams sign up in the first six months.',
  },
  {
    year: '2023',
    title: 'Customers and automation arrive',
    text: 'Customer health scoring and workflow automation ship. Teams start retiring their second, third, and fourth tools.',
  },
  {
    year: '2024',
    title: 'Enterprise-ready',
    text: 'SSO, audit logs, and custom SLAs land. Nexora passes its first SOC 2 audit and welcomes its 5,000th team.',
  },
  {
    year: '2025',
    title: 'Forecasting and AI summaries',
    text: 'Predictive forecasting and natural-language report summaries turn Nexora from a mirror of the business into a compass.',
  },
  {
    year: '2026',
    title: '12,000 teams and counting',
    text: 'Today Nexora powers operations for more than 12,000 teams across 38 countries — and we are just getting started.',
  },
];

export default function AboutPage() {
  const leaders = teamMembers.slice(0, 6);

  return (
    <main>
      {/* Story */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="primary" dot>Our story</Badge>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            We got tired of tab-switching, so we built the exit
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Nexora started in 2021 when our founders were running a small agency and spending
            more time reconciling tools than serving clients. Revenue lived in Stripe, projects
            in Asana, customers in a CRM nobody updated, and the truth in a 40-tab spreadsheet.
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
            We built the dashboard we wished existed — one workspace where analytics, projects,
            customers, and automation share a single source of truth. Five years later, more
            than 12,000 teams start their day in Nexora.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-slate-200 bg-brand-600 py-16 sm:py-20 dark:bg-brand-900">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">Our mission</p>
          <p className="mt-4 text-2xl font-bold leading-10 text-white sm:text-3xl sm:leading-12">
            “End the era of busywork. Give every team one calm place to see the business,
            decide, and act.”
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Values</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              What we optimize for
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <Card key={v.title} className="p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <Icon name={v.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{v.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-slate-200 bg-slate-950 py-14 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col">
                <dt className="order-2 mt-2 text-sm text-slate-400">{s.label}</dt>
                <dd className="order-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Leadership</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The people behind the platform
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Operators, engineers, and designers who have felt the pain — and decided to fix it.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((m) => (
              <Card key={m.id} className="flex items-start gap-4 p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <Avatar name={m.name} size="xl" ring />
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-brand-700 dark:text-brand-300">{m.role}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{m.department}</p>
                  <Badge variant={m.status === 'active' ? 'success' : 'neutral'} dot size="sm" className="mt-2.5 capitalize">
                    {m.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Timeline</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              How we got here
            </h2>
          </div>
          <ol className="relative mt-12 space-y-10 border-l-2 border-brand-200 pl-8 dark:border-brand-900">
            {TIMELINE.map((t) => (
              <li key={t.year} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 ring-4 ring-white dark:ring-slate-950"
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
                <p className="text-sm font-bold text-brand-700 dark:text-brand-300">{t.year}</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{t.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{t.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 text-center">
            <Link href="/contact">
              <Button variant="primary" size="lg" rightIcon={<Icon name="arrowRight" className="h-4 w-4" />}>
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
