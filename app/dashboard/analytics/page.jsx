'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterSelect } from '@/components/ui/fields';
import { Checkbox, Switch } from '@/components/ui/toggles';
import { StatusBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { SkeletonCard, SkeletonChart } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { RevenueChart, BarsChart } from '@/components/charts/charts';
import { DonutChart, FunnelChart } from '@/components/charts/distribution';
import { simulateFetchWithError } from '@/lib/api';
import {
  customerGrowthSeries,
  customers,
  funnelStages,
  geoDistribution,
  projectCompletionSeries,
  revenueSeries,
} from '@/data';
import { cn, formatCurrency, formatNumber, seededRandom } from '@/lib/utils';

const RANGE_OPTIONS = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: '12m', label: 'Last 12 months' },
];

const MIN_REVENUE_OPTIONS = [
  { id: '0', label: 'Any revenue' },
  { id: '100000', label: '$100k+' },
  { id: '250000', label: '$250k+' },
  { id: '500000', label: '$500k+' },
];

const MONTHS_FOR_RANGE = { '7d': 3, '30d': 6, '90d': 9, '12m': 12 };
const FUNNEL_SCALE = { '7d': 0.06, '30d': 0.25, '90d': 0.6, '12m': 1 };

/* Previous-period series: same shape as revenueSeries but a different seed offset,
   so comparison mode shows a distinct, deterministic "prior period". */
function priorPeriodSeries(range) {
  const config =
    {
      '7d': { points: 7, base: 42000, variance: 14000, trend: 900, label: (i) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] },
      '30d': { points: 30, base: 40000, variance: 15000, trend: 500, label: (i) => `Day ${i + 1}` },
      '90d': { points: 90, base: 38000, variance: 16000, trend: 260, label: (i) => `Day ${i + 1}` },
      '12m': { points: 12, base: 1150000, variance: 260000, trend: 22000, label: (i) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i] },
    }[range] || { points: 30, base: 40000, variance: 15000, trend: 500, label: (i) => `Day ${i + 1}` };

  const gen = (seed, base, variance, trend) => {
    const rand = seededRandom(seed);
    let value = base;
    return Array.from({ length: config.points }, () => {
      value = Math.max(base * 0.4, value + (rand() - 0.5) * variance + trend);
      return Math.round(value);
    });
  };

  const revenue = gen(9101, config.base * 0.94, config.variance, config.trend * 0.55);
  const expenses = gen(9202, config.base * 0.6, config.variance * 0.6, config.trend * 0.28);
  return revenue.map((r, i) => ({
    label: config.label(i),
    revenue: r,
    expenses: expenses[i],
    profit: r - expenses[i],
  }));
}

const sumKey = (rows, key) => rows.reduce((s, r) => s + r[key], 0);

function buildAnalytics({ range, compare, minRevenue }) {
  const rev = revenueSeries(range);
  const prev = compare ? priorPeriodSeries(range) : null;
  const months = MONTHS_FOR_RANGE[range] || 6;
  const scale = FUNNEL_SCALE[range] || 0.25;

  const totals = (rows) => ({
    revenue: sumKey(rows, 'revenue'),
    expenses: sumKey(rows, 'expenses'),
    profit: sumKey(rows, 'profit'),
  });

  return {
    rev,
    prev,
    cur: totals(rev),
    prv: prev ? totals(prev) : null,
    growth: customerGrowthSeries(months),
    completion: projectCompletionSeries().slice(-months),
    funnel: funnelStages().map((s) => ({ ...s, value: Math.max(1, Math.round(s.value * scale)) })),
    geo: geoDistribution().map((g) => ({
      ...g,
      customers: Math.max(1, Math.round(g.customers * scale)),
      revenue: Math.round(g.revenue * scale),
    })),
    top: customers
      .filter((c) => c.revenue >= minRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
  };
}

function deltaPct(cur, prev) {
  return prev ? ((cur - prev) / prev) * 100 : 0;
}

function DeltaBadge({ value }) {
  const n = Number(value) || 0;
  const up = n >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
        up
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
      )}
      aria-label={`${up ? 'up' : 'down'} ${Math.abs(n).toFixed(1)} percent versus previous period`}
    >
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      {Math.abs(n).toFixed(1)}%
    </span>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart />
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [compare, setCompare] = useState(false);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showProfit, setShowProfit] = useState(false);
  const [showAdded, setShowAdded] = useState(true);
  const [showChurned, setShowChurned] = useState(true);
  const [minRevenue, setMinRevenue] = useState('0');
  const [sortKey, setSortKey] = useState('revenue');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const reqId = useRef(0);

  const load = useCallback(
    async (fail = false) => {
      const id = ++reqId.current;
      setLoading(true);
      setError(false);
      try {
        const result = await simulateFetchWithError(
          () => buildAnalytics({ range, compare, minRevenue: Number(minRevenue) }),
          fail,
          400
        );
        if (reqId.current !== id) return;
        setData(result);
      } catch {
        if (reqId.current === id) setError(true);
      } finally {
        if (reqId.current === id) setLoading(false);
      }
    },
    [range, compare, minRevenue, showExpenses, showProfit, showAdded, showChurned]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const sortedTop = useMemo(() => {
    if (!data) return [];
    const rows = [...data.top];
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return rows;
  }, [data, sortKey, sortDir]);

  const maxTopRevenue = useMemo(
    () => Math.max(1, ...sortedTop.map((c) => c.revenue)),
    [sortedTop]
  );

  const geoTotal = useMemo(() => (data ? data.geo.reduce((s, g) => s + g.revenue, 0) : 1), [data]);

  const growthKeys = useMemo(() => {
    const keys = [];
    if (showAdded) keys.push({ key: 'added', name: 'New customers', color: '#4f46e5' });
    if (showChurned) keys.push({ key: 'churned', name: 'Churned', color: '#f59e0b' });
    return keys;
  }, [showAdded, showChurned]);

  const tableColumns = useMemo(
    () => [
      {
        key: 'company',
        label: 'Customer',
        sortable: true,
        render: (r) => (
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{r.company}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{r.contact}</p>
          </div>
        ),
      },
      { key: 'industry', label: 'Industry', sortable: true },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (r) => <StatusBadge status={r.status} />,
      },
      {
        key: 'revenue',
        label: 'Revenue',
        sortable: true,
        align: 'right',
        render: (r) => <span className="tabular-nums">{formatCurrency(r.revenue)}</span>,
      },
      {
        key: 'share',
        label: 'Share of top',
        render: (r) => (
          <Progress value={Math.round((r.revenue / maxTopRevenue) * 100)} showLabel className="w-32 max-w-full" ariaLabel={`${r.company} revenue share`} />
        ),
      },
    ],
    [maxTopRevenue]
  );

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const rangeLabel = RANGE_OPTIONS.find((r) => r.id === range)?.label || 'Last 30 days';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue, growth, funnel, and customer performance with period comparisons."
        actions={[
          <Button
            key="simulate-error"
            variant="outline"
            leftIcon={<Icon name="refresh" className="h-4 w-4" />}
            onClick={() => load(true)}
          >
            Simulate error
          </Button>,
        ]}
      />

      {/* Controls */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-4 py-4">
          <FilterSelect label="Date range" value={range} onChange={(e) => setRange(e.target.value)}>
            {RANGE_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </FilterSelect>
          <Switch
            label="Compare vs previous period"
            description="Show prior-period deltas"
            checked={compare}
            onChange={() => setCompare((v) => !v)}
          />
          <fieldset className="flex items-center gap-4">
            <legend className="sr-only">Revenue chart metrics</legend>
            <Checkbox label="Expenses" checked={showExpenses} onChange={() => setShowExpenses((v) => !v)} />
            <Checkbox label="Profit" checked={showProfit} onChange={() => setShowProfit((v) => !v)} />
          </fieldset>
          <fieldset className="flex items-center gap-4">
            <legend className="sr-only">Customer growth metrics</legend>
            <Checkbox label="New customers" checked={showAdded} onChange={() => setShowAdded((v) => !v)} />
            <Checkbox label="Churned" checked={showChurned} onChange={() => setShowChurned((v) => !v)} />
          </fieldset>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <ErrorState
            title="Analytics failed to load"
            description="The simulated request failed. Your filters are preserved — retry to reload the view."
            onRetry={() => load(false)}
            retryLabel="Retry"
          />
        </Card>
      ) : loading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Totals with comparison deltas */}
          <div className="grid gap-4 md:grid-cols-3" role="region" aria-label="Period totals">
            {[
              { id: 'revenue', label: 'Total revenue', value: data.cur.revenue, prev: data.prv?.revenue },
              { id: 'expenses', label: 'Total expenses', value: data.cur.expenses, prev: data.prv?.expenses },
              { id: 'profit', label: 'Net profit', value: data.cur.profit, prev: data.prv?.profit },
            ].map((s) => (
              <Card key={s.id}>
                <CardContent className="py-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                    {compare && s.prev !== undefined && <DeltaBadge value={deltaPct(s.value, s.prev)} />}
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                    {formatCurrency(s.value)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{rangeLabel}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue charts */}
          <div className={cn('grid gap-6', compare && 'lg:grid-cols-2')}>
            <Card>
              <CardHeader title="Revenue over time" subtitle={`Current period · ${rangeLabel}`} />
              <CardContent>
                <RevenueChart data={data.rev} height={300} showExpenses={showExpenses} showProfit={showProfit} ariaLabel={`Revenue chart for ${rangeLabel}`} />
              </CardContent>
            </Card>
            {compare && data.prev && (
              <Card>
                <CardHeader title="Previous period" subtitle="Same length, immediately before" />
                <CardContent>
                  <RevenueChart data={data.prev} height={300} showExpenses={showExpenses} showProfit={showProfit} ariaLabel="Revenue chart for the previous period" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Growth + completion */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Customer growth" subtitle="New vs churned customers per period" />
              <CardContent>
                {growthKeys.length > 0 ? (
                  <BarsChart data={data.growth} dataKeys={growthKeys} height={280} ariaLabel="Customer growth bar chart" />
                ) : (
                  <EmptyState
                    title="No metrics selected"
                    description="Turn on at least one metric toggle to see customer growth."
                    className="py-10"
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Project completion" subtitle="Projects started vs completed per month" />
              <CardContent>
                <BarsChart
                  data={data.completion}
                  dataKeys={[
                    { key: 'started', name: 'Started', color: '#4f46e5' },
                    { key: 'completed', name: 'Completed', color: '#10b981' },
                  ]}
                  height={280}
                  ariaLabel="Project completion bar chart"
                />
              </CardContent>
            </Card>
          </div>

          {/* Funnel + geography */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Conversion funnel" subtitle={`Visitor to customer · ${rangeLabel}`} />
              <CardContent>
                <FunnelChart stages={data.funnel} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Geographic distribution" subtitle="Revenue by region" />
              <CardContent>
                <DonutChart
                  data={data.geo.map((g) => ({ label: g.region, value: g.revenue }))}
                  height={240}
                  centerLabel="Total revenue"
                  centerValue={formatCurrency(geoTotal).replace(/\.00$/, '')}
                  ariaLabel="Revenue by region donut chart"
                />
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Revenue and customers by region</caption>
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <th scope="col" className="py-2 pr-4 font-medium">Region</th>
                        <th scope="col" className="py-2 pr-4 text-right font-medium">Customers</th>
                        <th scope="col" className="py-2 text-right font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.geo.map((g) => (
                        <tr key={g.region}>
                          <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">{g.region}</td>
                          <td className="py-2 pr-4 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatNumber(g.customers)}</td>
                          <td className="py-2 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatCurrency(g.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance table */}
          <Card>
            <CardHeader
              title="Top customers by revenue"
              subtitle="Ranked by lifetime revenue"
              action={
                <FilterSelect label="Min. revenue" value={minRevenue} onChange={(e) => setMinRevenue(e.target.value)}>
                  {MIN_REVENUE_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </FilterSelect>
              }
            />
            <CardContent className="px-0 pb-0">
              <DataTable
                columns={tableColumns}
                data={sortedTop}
                keyField="id"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                rowHref={(row) => `/dashboard/customers/${row.id}`}
                emptyTitle="No customers match this filter"
                emptyDescription="No customers meet the $500k+ minimum revenue threshold. Lower the threshold to see results."
                emptyAction={
                  <Button variant="secondary" size="sm" onClick={() => setMinRevenue('0')}>
                    Clear filter
                  </Button>
                }
                mobileCard={(r) => (
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{r.company}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {r.industry} · {formatCurrency(r.revenue)}
                    </p>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
