'use client';

import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { FilterSelect, SearchInput } from '@/components/ui/fields';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Drawer } from '@/components/ui/Drawer';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/states';
import { SkeletonCard, SkeletonChart } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { BarsChart, Sparkline } from '@/components/charts/charts';
import { DonutChart } from '@/components/charts/distribution';
import { useToast } from '@/components/providers';
import { useDebounce, useLocalStorage } from '@/hooks/hooks';
import { teamMembers, teamById, departments } from '@/data/team';
import { projectsForMember } from '@/data/projects';
import { baseTasks, tasksForMember } from '@/data/tasks';
import { teamProductivitySeries } from '@/data/index';
import { simulateFetch } from '@/lib/api';
import { cn, formatDate, formatNumber, timeAgo, seededRandom, intBetween } from '@/lib/utils';

const MEMBER_STATUSES = ['active', 'away', 'offline'];
const SORT_KEYS = ['name', 'productivity', 'tasksCompleted'];
const METRICS = [
  { id: 'productivity', label: 'Productivity', key: 'productivity', name: 'Productivity score', color: '#4f46e5' },
  { id: 'tasks', label: 'Tasks completed', key: 'tasksCompleted', name: 'Tasks completed', color: '#10b981' },
];

function activitySeries(memberId) {
  let hash = 7;
  const s = String(memberId);
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const rand = seededRandom(hash);
  return Array.from({ length: 8 }, () => intBetween(rand, 20, 100));
}

export default function TeamPage() {
  const { toast } = useToast();

  /* ---- view preference (grid / table) ---- */
  const [view, setView] = useLocalStorage('nexora:team-view', 'grid');

  /* ---- filters / search / sort ---- */
  const [searchInput, setSearchInput] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const debouncedQ = useDebounce(searchInput, 300);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    simulateFetch(() => true).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [metric, setMetric] = useState('productivity');
  const activeMetric = METRICS.find((m) => m.id === metric) || METRICS[0];
  const productivitySeries = useMemo(() => teamProductivitySeries(), []);

  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId ? teamById[selectedId] : null;

  /* ---- filtering + sorting ---- */
  const filtered = useMemo(() => {
    const q = debouncedQ.trim().toLowerCase();
    return teamMembers.filter((m) => {
      if (department !== 'all' && m.department !== department) return false;
      if (status !== 'all' && m.status !== status) return false;
      if (q) {
        const haystack = `${m.name} ${m.role} ${m.department}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [department, status, debouncedQ]);

  const sorted = useMemo(() => {
    const dirMul = sortDir === 'asc' ? 1 : -1;
    const rows = [...filtered];
    rows.sort((a, b) => {
      switch (sortKey) {
        case 'productivity':
          return (a.productivity - b.productivity) * dirMul;
        case 'tasksCompleted':
          return (a.tasksCompleted - b.tasksCompleted) * dirMul;
        case 'name':
        default:
          return a.name.localeCompare(b.name) * dirMul;
      }
    });
    return rows;
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const hasActiveFilters = searchInput !== '' || department !== 'all' || status !== 'all';
  const clearFilters = () => {
    setSearchInput('');
    setDepartment('all');
    setStatus('all');
  };

  /* ---- summary stats (from filtered members) ---- */
  const summary = useMemo(() => {
    const total = filtered.length;
    const avgProductivity = total ? Math.round(filtered.reduce((s, m) => s + m.productivity, 0) / total) : 0;
    const totalTasks = filtered.reduce((s, m) => s + m.tasksCompleted, 0);
    const activeNow = filtered.filter((m) => m.status === 'active').length;
    return { total, avgProductivity, totalTasks, activeNow };
  }, [filtered]);

  /* ---- department distribution ---- */
  const deptDistribution = useMemo(
    () =>
      departments.map((d) => ({
        label: d,
        value: teamMembers.filter((m) => m.department === d).length,
      })),
    []
  );

  /* ---- drawer data ---- */
  const drawerData = useMemo(() => {
    if (!selected) return null;
    const projects = projectsForMember(selected.id);
    const tasks = tasksForMember(selected.id, baseTasks);
    return { projects, tasks, activity: activitySeries(selected.id) };
  }, [selected]);

  const handleMessage = () => {
    if (!selected) return;
    toast({
      title: 'Message sent',
      description: `Your message to ${selected.name} is on its way.`,
      variant: 'success',
    });
  };

  /* ---- table columns ---- */
  const columns = [
    {
      key: 'name',
      label: 'Member',
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar name={m.name} size="md" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{m.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (m) => <Badge variant="neutral" size="sm">{m.department}</Badge>,
    },
    { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} size="sm" /> },
    {
      key: 'productivity',
      label: 'Productivity',
      sortable: true,
      render: (m) => (
        <div className="w-40">
          <Progress value={m.productivity} showLabel size="sm" />
        </div>
      ),
    },
    {
      key: 'tasksCompleted',
      label: 'Tasks',
      sortable: true,
      align: 'right',
      render: (m) => <span className="tabular-nums">{formatNumber(m.tasksCompleted)}</span>,
    },
    {
      key: 'lastActive',
      label: 'Last active',
      render: (m) => <span className="text-slate-500 dark:text-slate-400">{timeAgo(m.lastActive)}</span>,
    },
  ];

  const memberCard = (m) => (
    <article
      role="button"
      tabIndex={0}
      onClick={() => setSelectedId(m.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedId(m.id);
        }
      }}
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start gap-3">
        <Avatar name={m.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900 dark:text-white">{m.name}</p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{m.role}</p>
        </div>
        <StatusBadge status={m.status} size="sm" />
      </div>
      <div className="mt-3">
        <Badge variant="neutral" size="sm">{m.department}</Badge>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">Productivity</span>
          <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{m.productivity}%</span>
        </div>
        <Progress value={m.productivity} size="sm" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{formatNumber(m.tasksCompleted)}</span> tasks completed
        </span>
        <span>Active {timeAgo(m.lastActive)}</span>
      </div>
    </article>
  );

  const mobileCard = (m) => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setSelectedId(m.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedId(m.id);
        }
      }}
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3">
        <Avatar name={m.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900 dark:text-white">{m.name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{m.role}</p>
        </div>
        <StatusBadge status={m.status} size="sm" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <Progress value={m.productivity} showLabel size="sm" />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{formatNumber(m.tasksCompleted)} tasks</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage your people — track productivity, workload, and who's online right now."
      />

      {/* Summary stats */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Headcount"
            value={formatNumber(summary.total)}
            changeLabel={hasActiveFilters ? 'matching filters' : `${departments.length} departments`}
            icon={<Icon name="team" className="h-5 w-5" />}
          />
          <KpiCard
            title="Avg productivity"
            value={`${summary.avgProductivity}%`}
            changeLabel="across the team"
            icon={<Icon name="analytics" className="h-5 w-5" />}
          />
          <KpiCard
            title="Tasks completed"
            value={formatNumber(summary.totalTasks)}
            changeLabel="all time"
            changeTone="up"
            icon={<Icon name="tasks" className="h-5 w-5" />}
          />
          <KpiCard
            title="Active now"
            value={formatNumber(summary.activeNow)}
            changeLabel={`${formatNumber(summary.total - summary.activeNow)} away or offline`}
            icon={<Icon name="user" className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader
              title="Team productivity"
              subtitle="Weekly trend across the team"
              action={
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Metric">
                  {METRICS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetric(m.id)}
                      aria-pressed={metric === m.id}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium transition',
                        metric === m.id
                          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              }
            />
            <CardContent>
              <BarsChart
                data={productivitySeries}
                dataKeys={[{ key: activeMetric.key, name: activeMetric.name, color: activeMetric.color }]}
                height={280}
                ariaLabel={`Team ${activeMetric.label.toLowerCase()} by week`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Department distribution" subtitle="Headcount by department" />
            <CardContent>
              <DonutChart
                data={deptDistribution}
                height={280}
                centerLabel="Members"
                centerValue={formatNumber(teamMembers.length)}
                ariaLabel="Headcount by department"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52 flex-1">
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, role, or department…"
            />
          </div>
          <FilterSelect label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {MEMBER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </FilterSelect>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="View">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
              aria-label="Grid view"
              title="Grid view"
              className={cn(
                'rounded-md p-1.5 transition',
                view === 'grid'
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon name="grid" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              aria-label="Table view"
              title="Table view"
              className={cn(
                'rounded-md p-1.5 transition',
                view === 'table'
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon name="list" className="h-4 w-4" />
            </button>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            title="No team members found"
            description="Try adjusting your search or filters."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : view === 'table' ? (
        <DataTable
          columns={columns}
          data={sorted}
          keyField="id"
          sortKey={SORT_KEYS.includes(sortKey) ? sortKey : undefined}
          sortDir={sortDir}
          onSort={handleSort}
          ariaLabel="Team members"
          onRowClick={(m) => setSelectedId(m.id)}
          mobileCard={mobileCard}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((m) => (
            <div key={m.id}>{memberCard(m)}</div>
          ))}
        </div>
      )}

      {/* Profile drawer */}
      <Drawer
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={selected ? selected.name : 'Team member'}
        description={selected ? selected.role : undefined}
        position="right"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedId(null)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleMessage}>
              Message
            </Button>
          </div>
        }
      >
        {selected && drawerData && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">{selected.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.role}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="neutral" size="sm">{selected.department}</Badge>
                  <StatusBadge status={selected.status} size="sm" />
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</dt>
                <dd className="mt-1 break-all text-slate-900 dark:text-white">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Last active</dt>
                <dd className="mt-1 text-slate-900 dark:text-white">{timeAgo(selected.lastActive)}</dd>
              </div>
            </dl>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Stats</h4>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Productivity</p>
                  <div className="mt-2">
                    <Progress value={selected.productivity} showLabel size="sm" />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tasks completed</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatNumber(selected.tasksCompleted)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Projects</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {drawerData.projects.length}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Assigned tasks</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {drawerData.tasks.length}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Activity</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Last 8 weeks</p>
              <div className="mt-2">
                <Sparkline data={drawerData.activity} color="#4f46e5" height={56} width={320} ariaLabel={`${selected.name} activity trend`} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Projects <span className="ml-1 text-xs font-normal text-slate-500">({drawerData.projects.length})</span>
              </h4>
              {drawerData.projects.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Not assigned to any projects.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {drawerData.projects.slice(0, 5).map((p) => (
                    <li key={p.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
                        <StatusBadge status={p.status} size="sm" />
                      </div>
                      <div className="mt-2">
                        <Progress value={p.progress} size="sm" showLabel />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Tasks <span className="ml-1 text-xs font-normal text-slate-500">({drawerData.tasks.length})</span>
              </h4>
              {drawerData.tasks.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No tasks assigned.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {drawerData.tasks.slice(0, 6).map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-900 dark:text-white">{t.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Due {formatDate(t.dueDate)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <PriorityBadge priority={t.priority} size="sm" />
                        <StatusBadge status={t.status} size="sm" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
