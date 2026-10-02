'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Input, FilterSelect, SearchInput } from '@/components/ui/fields';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { Checkbox } from '@/components/ui/toggles';
import { ErrorState } from '@/components/ui/states';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/providers';
import { useDebounce } from '@/hooks/hooks';
import { transactions, TRANSACTION_TYPES, TRANSACTION_STATUSES } from '@/data/transactions';
import { customerById } from '@/data/customers';
import { simulateFetchWithError } from '@/lib/api';
import { toCSV, downloadCSV } from '@/lib/csv';
import { cn, formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const PAYMENT_METHODS = ['Card', 'Bank transfer', 'Wire', 'ACH', 'Digital wallet'];
const TYPE_BADGE = { invoice: 'primary', subscription: 'info', payout: 'warning', refund: 'danger', expense: 'neutral' };
const TYPE_LABEL = Object.fromEntries(TRANSACTION_TYPES.map((t) => [t.id, t.label]));
const STATUS_LABEL = Object.fromEntries(TRANSACTION_STATUSES.map((s) => [s.id, s.label]));
const DATE_PRESETS = [
  { id: 'p7', label: 'Last 7 days', days: 7 },
  { id: 'p30', label: 'Last 30 days', days: 30 },
  { id: 'p90', label: 'Last 90 days', days: 90 },
];

const SORTABLE = ['date', 'amount', 'customer', 'status'];

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function presetRange(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toISODate(from), to: toISODate(to) };
}

function timelineFor(t) {
  const items = [
    { title: 'Transaction recorded', detail: `Reference ${t.reference}`, at: t.date },
    { title: 'Payment authorized', detail: t.method, at: t.date },
  ];
  if (t.status === 'completed') items.push({ title: 'Funds settled', detail: 'Completed', at: t.date });
  else if (t.status === 'pending') items.push({ title: 'Awaiting settlement', detail: 'Pending', at: t.date });
  else if (t.status === 'failed') items.push({ title: 'Payment failed', detail: 'Failed', at: t.date });
  else if (t.status === 'refunded') items.push({ title: 'Refund issued', detail: 'Refunded', at: t.date });
  return items;
}

function TransactionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const params = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || 'all',
      status: searchParams.get('status') || 'all',
      method: searchParams.get('method') || 'all',
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      sort: SORTABLE.includes(searchParams.get('sort')) ? searchParams.get('sort') : 'date',
      dir: searchParams.get('dir') === 'asc' ? 'asc' : 'desc',
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1),
      pageSize: PAGE_SIZE_OPTIONS.includes(parseInt(searchParams.get('pageSize') || '', 10))
        ? parseInt(searchParams.get('pageSize'), 10)
        : 10,
    }),
    [searchParams]
  );

  const updateParams = useCallback(
    (patch, { keepPage = false } = {}) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined || v === 'all') next.delete(k);
        else next.set(k, String(v));
      });
      if (!keepPage && !('page' in patch)) next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  /* ---- debounced search synced to the URL ---- */
  const [searchInput, setSearchInput] = useState(params.q);
  const debouncedQ = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedQ !== params.q) updateParams({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  useEffect(() => {
    setSearchInput(params.q);
  }, [params.q]);

  /* ---- simulated loading + error simulation ---- */
  const [simulateError, setSimulateError] = useState(() => searchParams.get('simulate') === 'error');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const runLoad = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await simulateFetchWithError(() => true, simulateError);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [simulateError]);

  useEffect(() => {
    runLoad();
  }, [runLoad]);

  /* ---- filtering ---- */
  const filtered = useMemo(() => {
    const q = debouncedQ.trim().toLowerCase();
    return transactions.filter((t) => {
      if (params.type !== 'all' && t.type !== params.type) return false;
      if (params.status !== 'all' && t.status !== params.status) return false;
      if (params.method !== 'all' && t.method !== params.method) return false;
      const day = t.date.slice(0, 10);
      if (params.from && day < params.from) return false;
      if (params.to && day > params.to) return false;
      if (q) {
        const customer = customerById[t.customerId];
        const haystack = `${t.description} ${t.reference} ${customer ? customer.company : ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [params.type, params.status, params.method, params.from, params.to, debouncedQ]);

  /* ---- sorting ---- */
  const sorted = useMemo(() => {
    const dirMul = params.dir === 'asc' ? 1 : -1;
    const rows = [...filtered];
    rows.sort((a, b) => {
      switch (params.sort) {
        case 'amount':
          return (a.amount - b.amount) * dirMul;
        case 'customer': {
          const ca = customerById[a.customerId]?.company || '';
          const cb = customerById[b.customerId]?.company || '';
          return ca.localeCompare(cb) * dirMul;
        }
        case 'status':
          return a.status.localeCompare(b.status) * dirMul;
        case 'date':
        default:
          return (new Date(a.date) - new Date(b.date)) * dirMul;
      }
    });
    return rows;
  }, [filtered, params.sort, params.dir]);

  const handleSort = (key) => {
    if (key === params.sort) {
      updateParams({ sort: key, dir: params.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sort: key, dir: key === 'date' || key === 'amount' ? 'desc' : 'asc' });
    }
  };

  /* ---- pagination ---- */
  const totalPages = Math.max(1, Math.ceil(sorted.length / params.pageSize));
  const page = Math.min(params.page, totalPages);
  const paged = useMemo(
    () => sorted.slice((page - 1) * params.pageSize, page * params.pageSize),
    [sorted, page, params.pageSize]
  );

  /* ---- summary stats (from all filtered rows) ---- */
  const summary = useMemo(() => {
    let volume = 0;
    let income = 0;
    let expenses = 0;
    let completed = 0;
    filtered.forEach((t) => {
      volume += Math.abs(t.amount);
      if (t.amount >= 0) income += t.amount;
      else expenses += Math.abs(t.amount);
      if (t.status === 'completed') completed += 1;
    });
    return {
      volume,
      income,
      expenses,
      successRate: filtered.length ? (completed / filtered.length) * 100 : null,
      completed,
      total: filtered.length,
    };
  }, [filtered]);

  const hasActiveFilters =
    params.q !== '' || params.type !== 'all' || params.status !== 'all' || params.method !== 'all' || params.from !== '' || params.to !== '';

  const clearFilters = () => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  };

  /* ---- detail modal ---- */
  const [selected, setSelected] = useState(null);
  const selectedCustomer = selected ? customerById[selected.customerId] : null;

  const handleReceipt = () => {
    if (!selected) return;
    toast({
      title: 'Receipt download started',
      description: `Receipt for ${selected.reference} is being generated.`,
      variant: 'success',
    });
  };

  /* ---- CSV export of the currently filtered data ---- */
  const handleExport = () => {
    const columns = [
      { label: 'Reference', key: 'reference' },
      { label: 'Description', key: 'description' },
      { label: 'Customer', get: (r) => customerById[r.customerId]?.company || '' },
      { label: 'Amount', get: (r) => r.amount },
      { label: 'Type', get: (r) => TYPE_LABEL[r.type] || r.type },
      { label: 'Status', get: (r) => STATUS_LABEL[r.status] || r.status },
      { label: 'Method', key: 'method' },
      { label: 'Date', get: (r) => formatDate(r.date) },
    ];
    const csv = toCSV(sorted, columns);
    const stamp = toISODate(new Date()).replace(/-/g, '');
    downloadCSV(`nexora-transactions-${stamp}.csv`, csv);
    toast({
      title: 'Export complete',
      description: `${formatNumber(sorted.length)} transactions exported to CSV.`,
      variant: 'success',
    });
  };

  const activePresetId = useMemo(() => {
    const found = DATE_PRESETS.find((p) => {
      const r = presetRange(p.days);
      return r.from === params.from && r.to === params.to;
    });
    return found ? found.id : null;
  }, [params.from, params.to]);

  const columns = [
    {
      key: 'transaction',
      label: 'Transaction',
      render: (t) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900 dark:text-white">{t.reference}</p>
          <p className="mt-0.5 max-w-56 truncate text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (t) => {
        const c = customerById[t.customerId];
        return c ? (
          <Link
            href={`/dashboard/customers/${c.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            {c.company}
          </Link>
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span
          className={cn(
            'font-semibold tabular-nums',
            t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          )}
        >
          {formatCurrency(t.amount)}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (t) => (
        <Badge variant={TYPE_BADGE[t.type] || 'neutral'} size="sm">
          {TYPE_LABEL[t.type] || t.type}
        </Badge>
      ),
    },
    { key: 'status', label: 'Status', sortable: true, render: (t) => <StatusBadge status={t.status} size="sm" /> },
    { key: 'method', label: 'Method', render: (t) => <span className="text-slate-600 dark:text-slate-400">{t.method}</span> },
    { key: 'date', label: 'Date', sortable: true, render: (t) => formatDate(t.date) },
  ];

  const mobileCard = (t) => {
    const c = customerById[t.customerId];
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelected(t)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelected(t);
          }
        }}
        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-white">{t.reference}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
          </div>
          <span
            className={cn(
              'shrink-0 font-semibold tabular-nums',
              t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {formatCurrency(t.amount)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={t.status} size="sm" />
          <Badge variant={TYPE_BADGE[t.type] || 'neutral'} size="sm">
            {TYPE_LABEL[t.type] || t.type}
          </Badge>
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{formatDate(t.date)}</span>
        </div>
        {c && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{c.company}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Track every invoice, subscription, payout, refund, and expense across your customers."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Icon name="refresh" className="h-4 w-4" />} onClick={runLoad}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Icon name="download" className="h-4 w-4" />} onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        }
      />

      {loadError ? (
        <ErrorState
          title="Couldn't load transactions"
          description={loadError.message || 'Something went wrong while loading transactions.'}
          onRetry={runLoad}
          retryLabel="Retry"
        />
      ) : (
        <>
          {/* Summary cards */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Total volume"
                value={formatCurrency(summary.volume)}
                changeLabel={`${formatNumber(summary.total)} transactions`}
                icon={<Icon name="currency" className="h-5 w-5" />}
              />
              <KpiCard
                title="Income"
                value={formatCurrency(summary.income)}
                changeLabel="inflows"
                changeTone="up"
                icon={<Icon name="transactions" className="h-5 w-5" />}
              />
              <KpiCard
                title="Expenses"
                value={formatCurrency(summary.expenses)}
                changeLabel="outflows"
                changeTone="down"
                icon={<Icon name="doc" className="h-5 w-5" />}
              />
              <KpiCard
                title="Success rate"
                value={summary.successRate === null ? '—' : `${summary.successRate.toFixed(1)}%`}
                changeLabel={`${formatNumber(summary.completed)} of ${formatNumber(summary.total)} completed`}
                icon={<Icon name="check" className="h-5 w-5" />}
              />
            </div>
          )}

          {/* Filter bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-52 flex-1">
                <SearchInput
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search description, reference, or company…"
                />
              </div>
              <FilterSelect label="Type" value={params.type} onChange={(e) => updateParams({ type: e.target.value })}>
                <option value="all">All types</option>
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect label="Status" value={params.status} onChange={(e) => updateParams({ status: e.target.value })}>
                <option value="all">All statuses</option>
                {TRANSACTION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect label="Method" value={params.method} onChange={(e) => updateParams({ method: e.target.value })}>
                <option value="all">All methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</span>
                {DATE_PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    size="xs"
                    variant={activePresetId === p.id ? 'primary' : 'secondary'}
                    onClick={() => {
                      const r = presetRange(p.days);
                      updateParams({ from: r.from, to: r.to });
                    }}
                  >
                    {p.label}
                  </Button>
                ))}
                <Button
                  size="xs"
                  variant={activePresetId === null && !params.from && !params.to ? 'primary' : 'secondary'}
                  onClick={() => updateParams({ from: '', to: '' })}
                >
                  All time
                </Button>
              </div>
              <Input
                type="date"
                label="From"
                value={params.from}
                max={params.to || undefined}
                onChange={(e) => updateParams({ from: e.target.value })}
                className="w-40"
              />
              <Input
                type="date"
                label="To"
                value={params.to}
                min={params.from || undefined}
                onChange={(e) => updateParams({ to: e.target.value })}
                className="w-40"
              />
              <div className="ml-auto flex items-center gap-3">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
                <Checkbox
                  label="Simulate error"
                  description="Force the loader to fail"
                  checked={simulateError}
                  onChange={(e) => setSimulateError(e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paged}
            keyField="id"
            sortKey={params.sort}
            sortDir={params.dir}
            onSort={handleSort}
            isLoading={loading}
            ariaLabel="Transactions"
            onRowClick={setSelected}
            mobileCard={mobileCard}
            emptyTitle="No transactions found"
            emptyDescription={
              hasActiveFilters ? 'Try adjusting your search or filters.' : 'No transactions have been recorded yet.'
            }
            emptyAction={
              hasActiveFilters ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />

          {!loading && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => updateParams({ page: p }, { keepPage: true })}
              pageSize={params.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageSizeChange={(n) => updateParams({ pageSize: n })}
              totalItems={sorted.length}
            />
          )}
        </>
      )}

      {/* Detail modal */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Transaction ${selected.reference}` : 'Transaction'}
        description={selected ? selected.description : undefined}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button variant="primary" leftIcon={<Icon name="download" className="h-4 w-4" />} onClick={handleReceipt}>
              Download receipt
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</dt>
                <dd
                  className={cn(
                    'mt-1 text-xl font-bold tabular-nums',
                    selected.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {formatCurrency(selected.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={selected.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</dt>
                <dd className="mt-1">
                  <Badge variant={TYPE_BADGE[selected.type] || 'neutral'}>{TYPE_LABEL[selected.type] || selected.type}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Payment method</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">{selected.method}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">{formatDateTime(selected.date)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Reference</dt>
                <dd className="mt-1 font-mono text-sm text-slate-900 dark:text-white">{selected.reference}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Customer</dt>
                <dd className="mt-1 text-sm">
                  {selectedCustomer ? (
                    <Link
                      href={`/dashboard/customers/${selectedCustomer.id}`}
                      className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      {selectedCustomer.company}
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Transaction ID</dt>
                <dd className="mt-1 font-mono text-sm text-slate-900 dark:text-white">{selected.id}</dd>
              </div>
            </dl>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Timeline</h4>
              <ol className="mt-3 space-y-4">
                {timelineFor(selected).map((item, i) => (
                  <li key={i} className="relative flex gap-3 pl-6">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/15"
                    />
                    {i < timelineFor(selected).length - 1 && (
                      <span aria-hidden="true" className="absolute left-[4.5px] top-5 h-[calc(100%-8px)] w-px bg-slate-200 dark:bg-slate-700" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.detail} · {formatDateTime(item.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={8} columns={7} />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsContent />
    </Suspense>
  );
}
