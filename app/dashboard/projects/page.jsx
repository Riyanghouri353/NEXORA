'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, IconButton } from '@/components/ui/Button';
import { FilterSelect, SearchInput } from '@/components/ui/fields';
import { Switch } from '@/components/ui/toggles';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Drawer } from '@/components/ui/Drawer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Progress } from '@/components/ui/Progress';
import { AvatarStack } from '@/components/ui/Avatar';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { projects, PROJECT_STATUSES, PROJECT_PRIORITIES } from '@/data/projects';
import { customerById } from '@/data/customers';
import { teamMembers, teamById } from '@/data/team';
import { useDebounce, useLocalStorage } from '@/hooks/hooks';
import { simulateFetchWithError } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const STATUS_ORDER = PROJECT_STATUSES.map((s) => s.id);
const PRIORITY_ORDER = ['low', 'medium', 'high', 'critical'];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DAY_MS = 24 * 60 * 60 * 1000;

function parseParamInt(raw, fallback) {
  const n = parseInt(raw || '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function isOverdue(project, now = Date.now()) {
  return new Date(project.deadline).getTime() < now && project.status !== 'completed';
}

function fireQuickCreate(kind) {
  window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind } }));
}

/* ------------------------------------------------------------------ */
/* Filter fields shared by the desktop bar and the mobile drawer       */
/* ------------------------------------------------------------------ */

function FilterFields({ filters, onChange }) {
  const { status, priority, member, deadline, budget } = filters;
  return (
    <>
      <FilterSelect label="Status" value={status} onChange={(e) => onChange('status', e.target.value)}>
        <option value="all">All statuses</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </FilterSelect>
      <FilterSelect label="Priority" value={priority} onChange={(e) => onChange('priority', e.target.value)}>
        <option value="all">All priorities</option>
        {PROJECT_PRIORITIES.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </FilterSelect>
      <FilterSelect label="Member" value={member} onChange={(e) => onChange('member', e.target.value)}>
        <option value="all">All members</option>
        {teamMembers.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </FilterSelect>
      <FilterSelect label="Deadline" value={deadline} onChange={(e) => onChange('deadline', e.target.value)}>
        <option value="all">All deadlines</option>
        <option value="overdue">Overdue</option>
        <option value="next30">Next 30 days</option>
        <option value="next90">Next 90 days</option>
      </FilterSelect>
      <FilterSelect label="Budget" value={budget} onChange={(e) => onChange('budget', e.target.value)}>
        <option value="all">All budgets</option>
        <option value="under100">Under $100k</option>
        <option value="mid">$100k – $300k</option>
        <option value="over300">Over $300k</option>
      </FilterSelect>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Grid card                                                           */
/* ------------------------------------------------------------------ */

function ProjectCard({ project }) {
  const overdue = isOverdue(project);
  const spentPct = Math.min(100, Math.round((project.spent / project.budget) * 100));
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
            {project.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {project.id} · {project.clientName}
          </p>
        </div>
        <PriorityBadge priority={project.priority} size="sm" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={project.status} size="sm" />
        {overdue && <Badge variant="danger" size="sm">Overdue</Badge>}
      </div>
      <div className="mt-4">
        <Progress value={project.progress} size="sm" showLabel />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <AvatarStack names={project.teamNames} max={4} />
        <span className={cn('text-xs', overdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')}>
          {formatDate(project.deadline)}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Budget · {spentPct}% spent</span>
        <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(project.budget)}</span>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* List page (inner — wrapped in Suspense for useSearchParams)         */
/* ------------------------------------------------------------------ */

function ProjectsListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* URL-backed filter state */
  const params = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      status: searchParams.get('status') || 'all',
      priority: searchParams.get('priority') || 'all',
      member: searchParams.get('member') || 'all',
      deadline: searchParams.get('deadline') || 'all',
      budget: searchParams.get('budget') || 'all',
      sort: searchParams.get('sort') || 'name',
      dir: searchParams.get('dir') || 'asc',
      page: parseParamInt(searchParams.get('page'), 1),
      pageSize: parseParamInt(searchParams.get('pageSize'), 10),
    }),
    [searchParams]
  );
  const { q, status, priority, member, deadline, budget, sort, dir, page, pageSize } = params;

  const [searchValue, setSearchValue] = useState(q);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useLocalStorage('nexora-projects-view', 'table');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [simulateError, setSimulateError] = useState(() => searchParams.get('simulate') === 'error');

  const debouncedQ = useDebounce(searchValue, 300);

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const defaults = {
        q: '', status: 'all', priority: 'all', member: 'all', deadline: 'all',
        budget: 'all', sort: 'name', dir: 'asc', page: '1', pageSize: '10',
      };
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        const str = value === null || value === undefined ? '' : String(value);
        if (str === '' || str === defaults[key]) next.delete(key);
        else next.set(key, str);
      }
      if (resetPage) next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  /* Keep the local search box in sync with the URL (e.g. after Clear) */
  useEffect(() => {
    if (q !== searchValue) setSearchValue(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  /* Push debounced search text into the URL */
  useEffect(() => {
    if ((debouncedQ || '') !== q) updateParams({ q: debouncedQ || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const handleFilterChange = useCallback(
    (key, value) => updateParams({ [key]: value }),
    [updateParams]
  );

  const activeFilterCount = [
    status !== 'all',
    priority !== 'all',
    member !== 'all',
    deadline !== 'all',
    budget !== 'all',
    debouncedQ.trim() !== '',
  ].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setSearchValue('');
    updateParams({ q: null, status: null, priority: null, member: null, deadline: null, budget: null });
  }, [updateParams]);

  /* Enrich once, then filter + sort */
  const filtered = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase();
    let list = projects.map((p) => ({
      ...p,
      clientName: customerById[p.clientId]?.company || '—',
      teamNames: p.teamIds.map((id) => teamById[id]?.name).filter(Boolean),
    }));
    if (needle) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.id.toLowerCase().includes(needle) ||
          p.clientName.toLowerCase().includes(needle) ||
          p.tags.some((t) => t.toLowerCase().includes(needle))
      );
    }
    if (status !== 'all') list = list.filter((p) => p.status === status);
    if (priority !== 'all') list = list.filter((p) => p.priority === priority);
    if (member !== 'all') list = list.filter((p) => p.teamIds.includes(member));
    if (deadline !== 'all') {
      const now = Date.now();
      list = list.filter((p) => {
        const dl = new Date(p.deadline).getTime();
        if (deadline === 'overdue') return dl < now && p.status !== 'completed';
        if (deadline === 'next30') return dl >= now && dl <= now + 30 * DAY_MS;
        if (deadline === 'next90') return dl >= now && dl <= now + 90 * DAY_MS;
        return true;
      });
    }
    if (budget !== 'all') {
      list = list.filter((p) =>
        budget === 'under100'
          ? p.budget < 100000
          : budget === 'mid'
            ? p.budget >= 100000 && p.budget <= 300000
            : p.budget > 300000
      );
    }
    const comparators = {
      name: (a, b) => a.name.localeCompare(b.name),
      client: (a, b) => a.clientName.localeCompare(b.clientName),
      status: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
      priority: (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
      progress: (a, b) => a.progress - b.progress,
      deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
      budget: (a, b) => a.budget - b.budget,
    };
    const compare = comparators[sort] || comparators.name;
    const mul = dir === 'desc' ? -1 : 1;
    return [...list].sort((a, b) => compare(a, b) * mul);
  }, [debouncedQ, status, priority, member, deadline, budget, sort, dir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  /* Simulated loading / error states */
  const loadKey = [simulateError, debouncedQ, status, priority, member, deadline, budget].join('|');
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(null);
    simulateFetchWithError(() => true, simulateError, 350)
      .then(() => {
        if (alive) setLoading(false);
      })
      .catch((err) => {
        if (alive) {
          setLoadError(err);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [loadKey, reloadTick]);

  const handleSort = (key) => {
    if (sort === key) updateParams({ dir: dir === 'asc' ? 'desc' : 'asc' }, { resetPage: false });
    else updateParams({ sort: key, dir: 'asc' }, { resetPage: false });
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Project',
        sortable: true,
        render: (p) => (
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{p.id}</div>
          </div>
        ),
      },
      {
        key: 'client',
        label: 'Client',
        sortable: true,
        render: (p) => <span className="text-slate-700 dark:text-slate-300">{p.clientName}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (p) => <StatusBadge status={p.status} size="sm" />,
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        render: (p) => <PriorityBadge priority={p.priority} size="sm" />,
      },
      {
        key: 'progress',
        label: 'Progress',
        sortable: true,
        render: (p) => (
          <div className="w-32">
            <Progress value={p.progress} size="sm" showLabel />
          </div>
        ),
      },
      {
        key: 'team',
        label: 'Team',
        render: (p) => <AvatarStack names={p.teamNames} max={4} />,
      },
      {
        key: 'deadline',
        label: 'Deadline',
        sortable: true,
        render: (p) => {
          const overdue = isOverdue(p);
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5',
                overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {formatDate(p.deadline)}
              {overdue && <Badge variant="danger" size="sm">Overdue</Badge>}
            </span>
          );
        },
      },
      {
        key: 'budget',
        label: 'Budget',
        sortable: true,
        align: 'right',
        render: (p) => {
          const pct = Math.min(100, (p.spent / p.budget) * 100);
          const overBudget = p.spent > p.budget;
          return (
            <div className="w-36">
              <div className="text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(p.budget)}</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={cn('h-full rounded-full', overBudget ? 'bg-red-500' : 'bg-brand-500')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{formatCurrency(p.spent)} spent</div>
            </div>
          );
        },
      },
    ],
    []
  );

  const mobileCard = (p) => {
    const overdue = isOverdue(p);
    return (
      <Link
        href={`/dashboard/projects/${p.id}`}
        className="block rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-900 dark:text-white">{p.name}</div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{p.clientName} · {p.id}</div>
          </div>
          <PriorityBadge priority={p.priority} size="sm" />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={p.status} size="sm" />
          {overdue && <Badge variant="danger" size="sm">Overdue</Badge>}
        </div>
        <div className="mt-3">
          <Progress value={p.progress} size="sm" showLabel />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <span className={overdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}>
            {formatDate(p.deadline)}
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(p.budget)}</span>
        </div>
      </Link>
    );
  };

  const emptyAction =
    activeFilterCount > 0 ? (
      <Button variant="secondary" size="sm" onClick={clearFilters}>
        Clear filters
      </Button>
    ) : undefined;

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Track delivery, budgets, and teams across every client engagement."
        actions={
          <>
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-700" role="group" aria-label="Change view">
              <IconButton
                label="Table view"
                onClick={() => setView('table')}
                variant={view === 'table' ? 'secondary' : 'ghost'}
              >
                <Icon name="list" className="h-4 w-4" />
              </IconButton>
              <IconButton
                label="Grid view"
                onClick={() => setView('grid')}
                variant={view === 'grid' ? 'secondary' : 'ghost'}
              >
                <Icon name="grid" className="h-4 w-4" />
              </IconButton>
            </div>
            <Button
              variant="primary"
              leftIcon={<Icon name="plus" className="h-4 w-4" />}
              onClick={() => fireQuickCreate('project')}
            >
              New Project
            </Button>
          </>
        }
      />

      {/* Desktop filter bar */}
      <div className="mb-4 hidden flex-wrap items-center gap-3 md:flex">
        <SearchInput
          className="w-64"
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search projects, clients, tags…"
        />
        <FilterFields filters={{ status, priority, member, deadline, budget }} onChange={handleFilterChange} />
        <div className="ml-auto flex items-center gap-3">
          <Switch
            label="Simulate error"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
          />
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Mobile filter row */}
      <div className="mb-4 flex gap-2 md:hidden">
        <SearchInput
          className="min-w-0 flex-1"
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search projects…"
        />
        <Button
          variant="outline"
          leftIcon={<Icon name="filter" className="h-4 w-4" />}
          onClick={() => setDrawerOpen(true)}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <ErrorState
            title="Couldn't load projects"
            description={loadError.message || 'The project list failed to load. Please try again.'}
            onRetry={() => setReloadTick((t) => t + 1)}
          />
        </div>
      ) : view === 'table' ? (
        <DataTable
          columns={columns}
          data={paged}
          keyField="id"
          sortKey={sort}
          sortDir={dir}
          onSort={handleSort}
          isLoading={loading}
          rowHref={(p) => `/dashboard/projects/${p.id}`}
          mobileCard={mobileCard}
          emptyTitle="No projects found"
          emptyDescription={
            activeFilterCount > 0
              ? 'No projects match your current filters. Try widening the search.'
              : 'There are no projects to show right now.'
          }
          emptyAction={emptyAction}
          ariaLabel="Projects"
        />
      ) : (
        <div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <EmptyState
                title="No projects found"
                description={
                  activeFilterCount > 0
                    ? 'No projects match your current filters. Try widening the search.'
                    : 'There are no projects to show right now.'
                }
                action={emptyAction}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paged.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {!loadError && filtered.length > 0 && (
        <Pagination
          className="mt-4"
          page={safePage}
          totalPages={totalPages}
          onChange={(p) => updateParams({ page: p }, { resetPage: false })}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(n) => updateParams({ pageSize: n })}
          totalItems={filtered.length}
        />
      )}

      {/* Mobile filter drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        description="Refine the project list"
        position="right"
        footer={
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Clear all
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => setDrawerOpen(false)}>
              Show {filtered.length} result{filtered.length === 1 ? '' : 's'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <FilterFields filters={{ status, priority, member, deadline, budget }} onChange={handleFilterChange} />
          <Switch
            label="Simulate error"
            description="Force the list to fail loading"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
          />
        </div>
      </Drawer>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={8} columns={8} />}>
      <ProjectsListPage />
    </Suspense>
  );
}
