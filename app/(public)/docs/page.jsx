import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { DocsSidebar } from '@/components/public/DocsSidebar';
import { FaqAccordion } from '@/components/public/FaqAccordion';

export const metadata = {
  title: 'Documentation — Nexora',
  description:
    'Nexora documentation: getting started, dashboards, projects, customers, API reference, webhooks, and FAQs.',
  openGraph: {
    title: 'Documentation — Nexora',
    description: 'Guides and API references for getting the most out of Nexora.',
    type: 'website',
  },
};

const SECTIONS = [
  { id: 'getting-started', label: 'Getting started', icon: 'sparkles' },
  { id: 'dashboard', label: 'Dashboard', icon: 'overview' },
  { id: 'projects', label: 'Projects', icon: 'projects' },
  { id: 'customers', label: 'Customers', icon: 'customers' },
  { id: 'api', label: 'API reference', icon: 'doc' },
  { id: 'webhooks', label: 'Webhooks', icon: 'bell' },
  { id: 'faq', label: 'FAQ', icon: 'help' },
];

function DocSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      <div className="prose-docs mt-4 space-y-4 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

function Step({ n, title, text }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {n}
      </span>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1">{text}</p>
      </div>
    </li>
  );
}

function CodeBlock({ title, code }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      {title && (
        <div className="border-b border-slate-800 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const FAQS = [
  {
    q: 'Do I need to be a developer to use Nexora?',
    a: 'No. Everything in the dashboard — analytics, projects, customers, reports, automations — is point-and-click. The API and webhooks are there for teams that want to go further.',
  },
  {
    q: 'How do I import my existing data?',
    a: 'Head to Settings → Import in the dashboard and upload a CSV for customers, projects, or transactions. Nexora maps columns automatically and previews everything before committing.',
  },
  {
    q: 'Can I export my data?',
    a: 'Anytime. Every list view has a CSV export, reports can be scheduled to your inbox, and the API gives you programmatic access to everything you put in.',
  },
  {
    q: 'Is there a rate limit on the API?',
    a: 'Professional plans get 1,000 requests per minute; Enterprise plans get custom limits. Rate limit headers are returned on every response.',
  },
];

const LIST_CUSTOMERS_CODE = `GET https://api.nexora.io/v1/customers?status=active&limit=20

{
  "data": [
    {
      "id": "cus_8f2a41",
      "company": "Acme Corp",
      "contact": "Ada Lovelace",
      "email": "ada@acme.com",
      "health_score": 94,
      "arr": 48000,
      "status": "active"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 1284 }
}`;

const CREATE_PROJECT_CODE = `POST https://api.nexora.io/v1/projects
Authorization: Bearer nx_live_••••••••

{
  "name": "Atlas website relaunch",
  "customer_id": "cus_8f2a41",
  "priority": "high",
  "budget": 75000,
  "deadline": "2026-12-15",
  "tags": ["web", "q4"]
}

→ 201 Created
{
  "id": "prj_91bd20",
  "name": "Atlas website relaunch",
  "status": "planning",
  "progress": 0
}`;

const WEBHOOK_CODE = `// Example payload: customer.health_changed
{
  "event": "customer.health_changed",
  "occurred_at": "2026-10-02T13:05:00Z",
  "data": {
    "customer_id": "cus_8f2a41",
    "previous_score": 78,
    "new_score": 52,
    "reasons": ["support_tickets_spike", "login_drop"]
  }
}`;

export default function DocsPage() {
  return (
    <main className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Docs' }]} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Documentation
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Everything you need to run your operations on Nexora — from your first
              login to your first API integration.
            </p>
          </div>
          <Badge variant="primary" dot>v2.4 · Updated October 2026</Badge>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)_200px]">
          {/* Left: sticky nav with filter */}
          <aside>
            <DocsSidebar sections={SECTIONS} />
          </aside>

          {/* Center: doc content */}
          <div className="min-w-0 space-y-14">
            <DocSection id="getting-started" eyebrow="Start here" title="Getting started">
              <p>
                Welcome to Nexora. Follow these four steps and your workspace will be
                live before your coffee cools.
              </p>
              <ol className="space-y-5 pt-2">
                <Step
                  n={1}
                  title="Open the dashboard"
                  text="Everything starts at the overview — your live picture of revenue, projects, and customers."
                />
                <Step
                  n={2}
                  title="Import your data"
                  text="Upload CSVs for customers, projects, and transactions. Nexora maps columns automatically and previews the result before anything is saved."
                />
                <Step
                  n={3}
                  title="Invite your team"
                  text="Add seats from the Team page. Everyone gets the right permissions automatically based on their department and role."
                />
                <Step
                  n={4}
                  title="Turn on automations"
                  text="Pick from 30+ templates — overdue-task nudges, health-score alerts, milestone celebrations — or build your own triggers."
                />
              </ol>
              <Card className="mt-6 border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900 dark:bg-brand-950/40">
                <div className="flex items-start gap-3">
                  <Icon name="sparkles" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300" />
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Tip:</span> open the{' '}
                    <Link href="/dashboard/overview" className="font-semibold text-brand-700 underline underline-offset-2 dark:text-brand-300">
                      live demo
                    </Link>{' '}
                    alongside these docs — every screen described here is clickable right now.
                  </p>
                </div>
              </Card>
            </DocSection>

            <DocSection id="dashboard" eyebrow="Guide" title="Dashboard">
              <p>
                The dashboard is Nexora's home screen: revenue, expenses, and profit over
                7, 30, 90, or 365 days, plus customer growth, project health, and team
                capacity widgets.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li><span className="font-semibold text-slate-800 dark:text-slate-100">Range selectors</span> — every chart responds to the selected period instantly.</li>
                <li><span className="font-semibold text-slate-800 dark:text-slate-100">Drill-downs</span> — click any metric to see the underlying customers, projects, or transactions.</li>
                <li><span className="font-semibold text-slate-800 dark:text-slate-100">Custom layout</span> — drag widgets into the order your team cares about; layouts persist per user.</li>
              </ul>
            </DocSection>

            <DocSection id="projects" eyebrow="Guide" title="Projects">
              <p>
                Projects in Nexora combine a task board, a budget tracker, and a timeline in
                one record. Create a project, assign the team, set milestones — Nexora keeps
                progress, spend, and deadlines in sync.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Five statuses: <span className="font-mono text-[13px]">backlog → todo → in-progress → review → done</span>.</li>
                <li>Budgets warn you automatically at 75% and 100% of spend.</li>
                <li>Every task supports priorities, due dates, assignees, and file attachments.</li>
              </ul>
            </DocSection>

            <DocSection id="customers" eyebrow="Guide" title="Customers">
              <p>
                Each customer gets a 360° profile: contact details, revenue history,
                open projects, transactions, and a daily-updated health score from 0–100.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li><span className="font-semibold text-slate-800 dark:text-slate-100">Health scores</span> combine activity, spend trends, and engagement — accounts below 60 appear in your risk list.</li>
                <li><span className="font-semibold text-slate-800 dark:text-slate-100">Segments</span> group customers by industry, status, or value without writing a query.</li>
                <li><span className="font-semibold text-slate-800 dark:text-slate-100">Timeline</span> shows every interaction, deal, and project in chronological order.</li>
              </ul>
            </DocSection>

            <DocSection id="api" eyebrow="Developers" title="API reference">
              <p>
                The Nexora REST API gives you programmatic access to customers, projects,
                tasks, transactions, and reports. Authenticate with a Bearer token from
                Settings → API keys. Base URL: <span className="font-mono text-[13px]">https://api.nexora.io/v1</span>.
              </p>
              <div className="space-y-6 pt-2">
                <CodeBlock title="List customers" code={LIST_CUSTOMERS_CODE} />
                <CodeBlock title="Create a project" code={CREATE_PROJECT_CODE} />
              </div>
              <p className="pt-2">
                Responses are JSON, paginated with <span className="font-mono text-[13px]">page</span> and{' '}
                <span className="font-mono text-[13px]">per_page</span> parameters. Errors follow RFC 7807
                with a <span className="font-mono text-[13px]">type</span>,{' '}
                <span className="font-mono text-[13px]">title</span>, and{' '}
                <span className="font-mono text-[13px]">detail</span> field.
              </p>
            </DocSection>

            <DocSection id="webhooks" eyebrow="Developers" title="Webhooks">
              <p>
                Subscribe to events and Nexora will POST a signed JSON payload to your
                endpoint the moment something happens. Verify signatures with the
                <span className="font-mono text-[13px]"> X-Nexora-Signature</span> header and your webhook secret.
              </p>
              <div className="pt-2">
                <CodeBlock title="customer.health_changed" code={WEBHOOK_CODE} />
              </div>
              <ul className="list-disc space-y-2 pl-6 pt-2">
                <li>Popular events: <span className="font-mono text-[13px]">project.milestone_reached</span>, <span className="font-mono text-[13px]">task.overdue</span>, <span className="font-mono text-[13px]">transaction.completed</span>, <span className="font-mono text-[13px]">customer.health_changed</span>.</li>
                <li>Failed deliveries retry with exponential backoff for 24 hours.</li>
                <li>Manage endpoints from Settings → Webhooks in the dashboard.</li>
              </ul>
            </DocSection>

            <DocSection id="faq" eyebrow="Help" title="Frequently asked questions">
              <div className="pt-2">
                <FaqAccordion items={FAQS} />
              </div>
              <p className="pt-2">
                Still stuck?{' '}
                <Link href="/contact" className="font-semibold text-brand-700 underline underline-offset-2 dark:text-brand-300">
                  Contact support
                </Link>{' '}
                — we answer within one business day.
              </p>
            </DocSection>
          </div>

          {/* Right: table of contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                On this page
              </p>
              <nav aria-label="Table of contents" className="mt-3">
                <ul className="space-y-1 border-l-2 border-slate-200 dark:border-slate-800">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="-ml-0.5 block border-l-2 border-transparent py-1.5 pl-4 text-sm text-slate-500 transition hover:border-brand-400 hover:text-slate-900 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-white"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
