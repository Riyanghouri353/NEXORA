'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchInput, FilterSelect } from '@/components/ui/fields';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/states';
import { useToast } from '@/components/providers';
import { useDebounce } from '@/hooks/hooks';
import { cn } from '@/lib/utils';

const FAQ = [
  {
    id: 'getting-started',
    category: 'Getting started',
    question: 'How do I navigate the dashboard?',
    answer:
      'Use the sidebar on the left to move between sections: Overview, Projects, Customers, Transactions, Team, Tasks, Reports, and more. Press Cmd+K (or Ctrl+K) anywhere to open the command palette and jump to any page instantly.',
  },
  {
    id: 'command-palette',
    category: 'Getting started',
    question: 'What can I do with the command palette?',
    answer:
      'The command palette (Cmd+K / Ctrl+K) lets you search pages, run quick actions, and create new projects, customers, or tasks without touching the mouse. Type to filter, use arrow keys to move, and Enter to select.',
  },
  {
    id: 'create-project',
    category: 'Projects',
    question: 'How do I create a new project?',
    answer:
      'Click the "New" button in the top navigation, or press Cmd+K and type "new project". Fill in the project name, client, budget, and deadline, then save. The project appears in your Projects list immediately.',
  },
  {
    id: 'project-status',
    category: 'Projects',
    question: 'What do the project statuses mean?',
    answer:
      'Planning means the project is scoped but not started. Active projects are underway, At-risk projects need attention (check budget or deadlines), On-hold projects are paused, and Completed projects are finished and archived from active views.',
  },
  {
    id: 'add-customer',
    category: 'Customers',
    question: 'How do I add a customer?',
    answer:
      'Go to Customers and click "Add customer", or use the global quick-create (Cmd+K → "new customer"). Enter the company name, contact details, and industry. Transactions and projects can then be linked to that customer.',
  },
  {
    id: 'customer-revenue',
    category: 'Customers',
    question: 'Where does customer revenue come from?',
    answer:
      'Customer revenue is calculated from completed transactions linked to that customer. Open a customer profile to see the transaction history, linked projects, and revenue totals.',
  },
  {
    id: 'generate-report',
    category: 'Reports',
    question: 'How do I generate a report?',
    answer:
      'Open Reports and click "Generate report". Choose a report type (Revenue, Projects, Customers, Team, or Transactions), a period, and a format. You can preview any report first, adjust the period to recompute the numbers, then download it as CSV.',
  },
  {
    id: 'export-csv',
    category: 'Reports',
    question: 'Can I export data to CSV?',
    answer:
      'Yes. Open a report preview and click "Download CSV" to export its metrics and rows. List pages with export buttons download the currently filtered view.',
  },
  {
    id: 'change-theme',
    category: 'Account',
    question: 'How do I switch between light and dark mode?',
    answer:
      'Go to Settings → Appearance and choose Light, Dark, or System. System follows your operating system preference automatically.',
  },
  {
    id: 'update-profile',
    category: 'Account',
    question: 'Where do I update my profile information?',
    answer:
      'Go to Settings → Profile. Update your name, email, role, company, phone, and bio, then click "Save changes". Your avatar is generated automatically from your name.',
  },
  {
    id: 'notifications-settings',
    category: 'Account',
    question: 'How do I control notifications?',
    answer:
      'Go to Settings → Preferences → Notifications. You can toggle email notifications, push notifications, the weekly digest, and task reminders independently, then save.',
  },
  {
    id: 'reset-settings',
    category: 'Account',
    question: 'Can I reset my settings to defaults?',
    answer:
      'On the Profile page, click "Reset to defaults" to restore the default profile. Other sections can be reset by re-selecting the default values and saving.',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQ.map((f) => f.category)))];

const SHORTCUTS = [
  { keys: ['⌘', 'K'], action: 'Open the command palette', note: 'Ctrl+K on Windows/Linux' },
  { keys: ['Esc'], action: 'Close dialogs, menus, and the palette' },
  { keys: ['↑', '↓'], action: 'Move through menu and palette items' },
  { keys: ['Enter'], action: 'Confirm the highlighted item' },
  { keys: ['Tab'], action: 'Move between form fields and controls' },
];

function FaqItem({ item, open, onToggle }) {
  const panelId = `faq-panel-${item.id}`;
  return (
    <div className="border-b border-slate-200 last:border-b-0 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-5 dark:hover:bg-slate-800/50"
      >
        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.question}</span>
        <Icon
          name="chevronDown"
          className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div id={panelId} role="region" className="px-4 pb-5 sm:px-5">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState(null);
  const debouncedQuery = useDebounce(query, 250);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return FAQ.filter((f) => {
      if (category !== 'All' && f.category !== category) return false;
      if (!q) return true;
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });
  }, [debouncedQuery, category]);

  const handleChat = () => {
    toast({
      title: 'Live chat is a demo',
      description: 'In this demo, support chat is simulated. Email us instead!',
      variant: 'info',
    });
  };

  return (
    <div>
      <PageHeader
        title="Help center"
        description="Answers, shortcuts, and ways to reach the Nexora team."
      />

      {/* Search + filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search help articles…"
          className="w-full sm:max-w-md"
        />
        <FilterSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* FAQ */}
        <div>
          {results.length === 0 ? (
            <Card>
              <EmptyState
                title="No articles found"
                description={`Nothing matches "${debouncedQuery}"${category !== 'All' ? ` in ${category}` : ''}. Try a different search.`}
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('');
                      setCategory('All');
                    }}
                  >
                    Clear search
                  </Button>
                }
              />
            </Card>
          ) : (
            <Card>
              <div className="px-4 pt-4 sm:px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400" aria-live="polite">
                  {results.length} article{results.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="mt-2">
                {results.map((item) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    open={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Shortcuts */}
          <Card className="mt-6">
            <CardHeader title="Keyboard shortcuts" subtitle="Work faster without leaving the keyboard." />
            <CardContent>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {SHORTCUTS.map((s) => (
                    <tr key={s.action}>
                      <td className="py-2.5 pr-4">
                        <span className="flex gap-1">
                          {s.keys.map((k) => (
                            <kbd
                              key={k}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {k}
                            </kbd>
                          ))}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{s.action}</td>
                      <td className="hidden py-2.5 text-right text-xs text-slate-400 sm:table-cell dark:text-slate-500">
                        {s.note || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Support + docs */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact support" subtitle="We usually reply within a day." />
            <CardContent>
              <div className="space-y-3">
                <a
                  href="mailto:support@nexora.io"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    <Icon name="help" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">Email us</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">support@nexora.io</span>
                  </span>
                </a>
                <Button variant="outline" className="w-full" onClick={handleChat}>
                  Start live chat
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Documentation" subtitle="Guides and references." />
            <CardContent>
              <ul className="space-y-1">
                {[
                  { label: 'Getting started guide', href: '/docs#getting-started' },
                  { label: 'Reports & exports', href: '/docs#dashboard' },
                  { label: 'API reference', href: '/docs#api' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {l.label}
                      <Icon name="arrowRight" className="h-4 w-4 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
