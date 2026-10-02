'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customers, industries, CUSTOMER_STATUSES } from '@/data/customers';
import { projects } from '@/data/projects';
import { simulateFetchWithError } from '@/lib/api';
import { useDebounce } from '@/hooks/hooks';
import { useToast } from '@/components/providers';
import { formatCurrency, formatCompactCurrency, formatDate, formatNumber, timeAgo } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { SearchInput, FilterSelect } from '@/components/ui/fields';
import { Switch } from '@/components/ui/toggles';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { KpiCard } from '@/components/ui/KpiCard';
import { Drawer } from '@/components/ui/Drawer';
import { ErrorState } from '@/components/ui/states';
import { SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;

const REVENUE_OPTIONS = [
  { id: 'all', label: 'All revenue' },
  { id: 'under-50k', label: 'Under $50k', test: (r) => r < 50000 },
  { id: '50k-150k', label: '$50k – $150k', test: (r) => r >= 50000 && r < 150000 },
  { id: '150k-300k', label: '$150k – $300k', test: (r) => r >= 150000 && r < 300000 },
  { id: 'over-300k', label: 'Over $300k', test: (r) => r >= 300000 },
];

function fireQuickCreate() {
  window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind: 'customer' } }));
}

function readInitialFilters(sp) {
  return {
    q: sp.get('q') || '',
    status: sp.get('status') || 'all',
    industry: sp.get('industry') || 'all',
    revenue: sp.get('revenue') || 'all',
    sort: sp.get('sort') || 'company',
    dir: sp.get('dir') === 'desc' ? 'desc' : 'asc',
    page: Math.max(1, Number(sp.get('page')) || 1),
    pageSize: PAGE_SIZE_OPTIONS.includes(Number(sp.get('pageSize'))) ? Number(sp.get('pageSize')) : DEFAULT_PAGE_SIZE,
  };
}

function buildQueryString(f) {
  const sp = new URLSearchParams();
  if (f.q) sp.set('q', f.q);
  if (f.status !== 'all') sp.set('status', f.status);
  if (f.industry !== 'all') sp.set('industry', f.industry);
  if (f.revenue !== 'all') sp.set('revenue', f.revenue);
  if (f.sort !== 'company') sp.set('sort', f.sort);
  if (f.dir !== 'asc') sp.set('dir', f.dir);
  if (f.page > 1) sp.set('page', String(f.page));
  if (f.pageSize !== DEFAULT_PAGE_SIZE) sp.set('pageSize', String(f.pageSize));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function CustomersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [filters, setFilters] = useState(() => readInitialFilters(searchParams));
  const [inputQ, setInputQ] = useState(() => searchParams.get('q') || '');
  const [rows, setRows] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [simulateError, setSimulateError] = useState(() => searchParams.get('simulate') === 'error');
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Stable filter updater: reads the latest filters from a ref so debounced
     effects and event handlers never act on a stale snapshot. */
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const updateFilters = useCallback(
    (patch) => {
      const next = { ...filtersRef.current, ...patch };
      filtersRef.current = next;
      setFilters(next);
      router.replace(`/dashboard/customers${buildQueryString(next)}`, { scroll: false });
    },
    [router]
  );

  /* Simulated async load, with error-simulation support */
  const load = useCallback(async () => {
    setLoadError(false);
    setRows(null);
    try {
      const data = await simulateFetchWithError(() => customers, simulateError);
      setRows(data);
    } catch (err) {
      setLoadError(true);
    }
  }, [simulateError]);

  useEffect(() => {
    load();
  }, [load]);

  /* Debounced search -> URL filter */
  const debouncedQ = useDebounce(inputQ, 300);
  useEffect(() => {
    if (debouncedQ !== filtersRef.current.q) {
      updateFilters({ q: debouncedQ, page: 1 });
    }
  }, [debouncedQ, updateFilters]);

  const projectCountByCustomer = useMemo(() => {
    const map = {};
    for (const p of projects) map[p.clientId] = (map[p.clientId] || 0) + 1;
    return map;
  }, []);

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      trial: customers.filter((c) => c.status === 'trial').length,
      revenue: customers.reduce((sum, c) => sum + c.revenue, 0),
    }),
    []
  );

  const filtered = useMemo(() => {
    const list = rows || [];
    const ql = filters.q.trim().toLowerCase();
    const revenueOpt = REVENUE_OPTIONS.find((o) => o.id === filters.revenue);
    const out = list.filter((c) => {
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.industry !== 'all' && c.industry !== filters.industry) return false;
      if (revenueOpt && revenueOpt.test && !revenueOpt.test(c.revenue)) return false;
      if (ql && ![c.company, c.contact, c.email].some((v) => String(v).toLowerCase().includes(ql))) return false;
      return true;
    });
    const dir = filters.dir === 'asc' ? 1 : -1;
    out.sort((a, b) => {
      switch (filters.sort) {
        case 'revenue':
          return (a.revenue - b.revenue) * dir;
        case 'lastActivity':
          return (new Date(a.lastActivity) - new Date(b.lastActivity)) * dir;
        case 'joinedAt':
          return (new Date(a.joinedAt) - new Date(b.joinedAt)) * dir;
        case 'company':
        default:
          return a.company.localeCompare(b.company) * dir;
      }
    });
    return out;
  }, [rows, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize);

  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) + (filters.industry !== 'all' ? 1 : 0) + (filters.revenue !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setInputQ('');
    updateFilters({ q: '', status: 'all', industry: 'all', revenue: 'all', page: 1 });
    setDrawerOpen(false);
  };

  const onSort = (key) => {
    updateFilters({
      sort: key,
      dir: filters.sort === key && filters.dir === 'asc' ? 'desc' : 'asc',
    });
  };

  const filterControls = (
    <>
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}
      >
        <option value="all">All statuses</option>
        {CUSTOMER_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Industry"
        value={filters.industry}
        onChange={(e) => updateFilters({ industry: e.target.value, page: 1 })}
      >
        <option value="all">All industries</option>
        {industries.map((ind) => (
          <option key={ind} value={ind}>
            {ind}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Revenue"
        value={filters.revenue}
        onChange={(e) => updateFilters({ revenue: e.target.value, page: 1 })}
      >
        {REVENUE_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </FilterSelect>
    </>
  );

  const columns = [
    {
      key: 'company',
      label: 'Customer',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.company} size="sm" />
          <div className="min-w-0">
            <div className="font-medium text-slate-900 dark:text-white">{row.company}</div>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{row.contact}</div>
          </div>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'industry',
      label: 'Industry',
      render: (row) => <span className="text-slate-600 dark:text-slate-300">{row.industry}</span>,
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      align: 'right',
      render: (row) => <span className="tabular-nums text-slate-900 dark:text-white">{formatCurrency(row.revenue)}</span>,
    },
    {
      key: 'projects',
      label: 'Projects',
      align: 'right',
      render: (row) => <span className="tabular-nums">{formatNumber(projectCountByCustomer[row.id] || 0)}</span>,
    },
    {
      key: 'lastActivity',
      label: 'Last activity',
      sortable: true,
      render: (row) => <span className="text-slate-600 dark:text-slate-300">{timeAgo(row.lastActivity)}</span>,
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      sortable: true,
      render: (row) => <span className="text-slate-600 dark:text-slate-300">{formatDate(row.joinedAt)}</span>,
    },
  ];

  const mobileCard = (row) => (
    <Link
      href={`/dashboard/customers/${row.id}`}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
    >
      <Avatar name={row.company} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-slate-900 dark:text-white">{row.company}</p>
          <StatusBadge status={row.status} size="sm" />
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {row.contact} · {row.industry}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(row.revenue)}</span>
          {' · '}
          {formatNumber(projectCountByCustomer[row.id] || 0)} projects · {timeAgo(row.lastActivity)}
        </p>
      </div>
    </Link>
  );

  const loading = rows === null && !loadError;

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage customer accounts, track revenue, and review engagement across your portfolio."
        actions={
          <Button variant="primary" leftIcon={<Icon name="plus" className="h-4 w-4" />} onClick={fireQuickCreate}>
            Add Customer
          </Button>
        }
      />

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard title="Total customers" value={formatNumber(stats.total)} icon={<Icon name="customers" className="h-5 w-5" />} />
        <KpiCard title="Active" value={formatNumber(stats.active)} icon={<Icon name="check" className="h-5 w-5" />} />
        <KpiCard title="Trial" value={formatNumber(stats.trial)} icon={<Icon name="sparkles" className="h-5 w-5" />} />
        <KpiCard
          title="Total revenue"
          value={formatCompactCurrency(stats.revenue)}
          icon={<Icon name="currency" className="h-5 w-5" />}
        />
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <SearchInput
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="Search company, contact, or email…"
            aria-label="Search customers"
          />
        </div>
        <div className="hidden items-end gap-3 md:flex">{filterControls}</div>
        <Button
          variant="outline"
          className="md:hidden"
          leftIcon={<Icon name="filter" className="h-4 w-4" />}
          onClick={() => setDrawerOpen(true)}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {(activeFilterCount > 0 || filters.q) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filter customers"
        description="Refine the customer list by status, industry, and revenue."
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="ghost" onClick={clearFilters}>
              Clear all
            </Button>
            <Button variant="primary" onClick={() => setDrawerOpen(false)}>
              Show {formatNumber(filtered.length)} results
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">{filterControls}</div>
      </Drawer>

      {/* Table */}
      {loadError ? (
        <ErrorState
          title="Couldn't load customers"
          description="The customer list couldn't be fetched. Check your connection and try again."
          onRetry={load}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={pageRows}
            keyField="id"
            sortKey={filters.sort}
            sortDir={filters.dir}
            onSort={onSort}
            isLoading={loading}
            ariaLabel="Customers"
            onRowClick={(row) => router.push(`/dashboard/customers/${row.id}`)}
            mobileCard={mobileCard}
            emptyTitle="No customers found"
            emptyDescription={
              filters.q || activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : 'Add your first customer to get started.'
            }
            emptyAction={
              filters.q || activeFilterCount > 0 ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={fireQuickCreate}>
                  Add Customer
                </Button>
              )
            }
          />
          {!loading && filtered.length > 0 && (
            <Pagination
              className="mt-4"
              page={safePage}
              totalPages={totalPages}
              onChange={(p) => updateFilters({ page: p })}
              pageSize={filters.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageSizeChange={(n) => updateFilters({ pageSize: n, page: 1 })}
              totalItems={filtered.length}
            />
          )}
        </>
      )}

      {/* Error-simulation toggle */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Simulate load error</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toggle to preview the error state, then retry to recover.
          </p>
        </div>
        <Switch
          label="Simulate error"
          checked={simulateError}
          onChange={(next) => {
            setSimulateError(next);
            if (next) {
              toast({ title: 'Error simulation on', description: 'The next load will fail.', variant: 'warning' });
            }
          }}
        />
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div>
          <SkeletonCard className="mb-6 h-24" />
          <SkeletonTable rows={6} columns={6} />
        </div>
      }
    >
      <CustomersList />
    </Suspense>
  );
}
