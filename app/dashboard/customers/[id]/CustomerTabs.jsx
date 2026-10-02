'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { DataTable } from '@/components/ui/DataTable';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Icon } from '@/components/ui/Icon';
import { useLocalStorage } from '@/hooks/hooks';
import { useToast } from '@/components/providers';
import { formatCurrency, formatDate, timeAgo, formatNumber, cn } from '@/lib/utils';

export function CustomerTabs({ customer, projects, transactions, activities, activeProjects }) {
  const [tab, setTab] = useState('overview');
  const { toast } = useToast();

  /* Notes persisted per-customer in localStorage */
  const [notes, setNotes, hydrated] = useLocalStorage('nexora-customer-notes-v1', {});
  const [draft, setDraft] = useState('');
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    if (hydrated && !draftReady) {
      setDraft((notes && notes[customer.id]) || '');
      setDraftReady(true);
    }
  }, [hydrated, draftReady, notes, customer.id]);

  const savedNote = (notes && notes[customer.id]) || '';

  const saveNote = () => {
    setNotes((prev) => ({ ...(prev || {}), [customer.id]: draft.trim() }));
    toast({ title: 'Note saved', description: `Your note for ${customer.company} is stored locally.`, variant: 'success' });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Icon name="overview" className="h-4 w-4" /> },
    { id: 'projects', label: 'Projects', icon: <Icon name="projects" className="h-4 w-4" />, badge: projects.length },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <Icon name="transactions" className="h-4 w-4" />,
      badge: transactions.length,
    },
    { id: 'activity', label: 'Activity', icon: <Icon name="clock" className="h-4 w-4" />, badge: activities.length },
    { id: 'notes', label: 'Notes', icon: <Icon name="doc" className="h-4 w-4" />, badge: savedNote ? 1 : undefined },
  ];

  const projectColumns = [
    {
      key: 'name',
      label: 'Project',
      render: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>,
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'progress',
      label: 'Progress',
      render: (row) => (
        <div className="w-32">
          <Progress value={row.progress} showLabel />
        </div>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (row) => {
        const overdue = row.status !== 'completed' && new Date(row.deadline) < new Date();
        return (
          <span className={cn(overdue && 'font-medium text-red-600 dark:text-red-400')}>
            {formatDate(row.deadline)}
          </span>
        );
      },
    },
  ];

  const transactionColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) => <span className="text-slate-600 dark:text-slate-300">{formatDate(row.date)}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{row.description}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {row.type} · {row.method} · {row.reference}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span
          className={cn(
            'font-medium tabular-nums',
            row.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          )}
        >
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <Tabs tabs={tabs} value={tab} onChange={setTab} ariaLabel="Customer sections" />

      <TabPanel id="overview" active={tab === 'overview'}>
        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4 xl:grid-cols-4">
          <KpiCard title="Revenue" value={formatCurrency(customer.revenue)} icon={<Icon name="currency" className="h-5 w-5" />} />
          <KpiCard
            title="Active projects"
            value={formatNumber(activeProjects)}
            description={`${formatNumber(projects.length)} total projects`}
            icon={<Icon name="projects" className="h-5 w-5" />}
          />
          <KpiCard
            title="Transactions"
            value={formatNumber(transactions.length)}
            icon={<Icon name="transactions" className="h-5 w-5" />}
          />
          <KpiCard
            title="Last activity"
            value={timeAgo(customer.lastActivity)}
            description={`Customer since ${formatDate(customer.joinedAt)}`}
            icon={<Icon name="clock" className="h-5 w-5" />}
          />
        </div>

        <Card className="mt-4">
          <CardHeader
            title="Notes preview"
            subtitle="Latest remarks about this customer"
            action={
              <Button variant="ghost" size="sm" onClick={() => setTab('notes')}>
                Open notes
              </Button>
            }
          />
          <CardContent>
            {customer.notes && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  CRM note
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{customer.notes}</p>
              </div>
            )}
            {savedNote ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Your note
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{savedNote}</p>
              </div>
            ) : (
              !customer.notes && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet. Add one from the Notes tab.</p>
              )
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel id="projects" active={tab === 'projects'}>
        <div className="pt-6">
          <DataTable
            columns={projectColumns}
            data={projects}
            keyField="id"
            ariaLabel="Customer projects"
            rowHref={(row) => `/dashboard/projects/${row.id}`}
            emptyTitle="No projects"
            emptyDescription={`${customer.company} has no projects yet.`}
          />
        </div>
      </TabPanel>

      <TabPanel id="transactions" active={tab === 'transactions'}>
        <div className="pt-6">
          <DataTable
            columns={transactionColumns}
            data={transactions}
            keyField="id"
            ariaLabel="Customer transactions"
            emptyTitle="No transactions"
            emptyDescription={`${customer.company} has no transactions yet.`}
          />
        </div>
      </TabPanel>

      <TabPanel id="activity" active={tab === 'activity'}>
        <div className="pt-6">
          {activities.length === 0 ? (
            <Card>
              <CardContent>
                <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No activity recorded for {customer.company} yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ol className="relative space-y-6 border-l border-slate-200 pl-6 dark:border-slate-800">
              {activities.map((a) => (
                <li key={a.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-950"
                  />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{a.text}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{timeAgo(a.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </TabPanel>

      <TabPanel id="notes" active={tab === 'notes'}>
        <div className="grid gap-4 pt-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="CRM note" subtitle="From the customer record" />
            <CardContent>
              {customer.notes ? (
                <p className="text-sm text-slate-700 dark:text-slate-300">{customer.notes}</p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No CRM note on file.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Your notes" subtitle="Saved in this browser, per customer" />
            <CardContent>
              <Textarea
                label="Note"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={6}
                placeholder={`Add a note about ${customer.company}…`}
                hint="Notes are stored locally in your browser (nexora-customer-notes-v1)."
              />
              <div className="mt-3 flex items-center gap-2">
                <Button variant="primary" onClick={saveNote} disabled={!draft.trim() && !savedNote}>
                  Save note
                </Button>
                {savedNote && !draft && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Cleared — saving now will remove the stored note.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>
    </div>
  );
}
