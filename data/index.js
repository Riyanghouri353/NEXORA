/* Central re-export for the mock-data layer. */

export * from './team';
export * from './customers';
export * from './projects';
export * from './transactions';
export * from './tasks';
export * from './notifications';
export * from './activities';
export * from './reports';

/* Time-series generators for charts (deterministic, seeded). */
import { seededRandom, intBetween } from '@/lib/utils';

function series(seed, points, base, variance, trend = 0) {
  const rand = seededRandom(seed);
  let value = base;
  return Array.from({ length: points }, (_, i) => {
    value = Math.max(base * 0.4, value + (rand() - 0.5) * variance + trend);
    return Math.round(value);
  });
}

export function revenueSeries(range) {
  // range: '7d' | '30d' | '90d' | '12m'
  const config = {
    '7d': { points: 7, base: 42000, variance: 14000, trend: 900, label: (i) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] },
    '30d': { points: 30, base: 40000, variance: 15000, trend: 500, label: (i) => `Day ${i + 1}` },
    '90d': { points: 90, base: 38000, variance: 16000, trend: 260, label: (i) => `Day ${i + 1}` },
    '12m': { points: 12, base: 1150000, variance: 260000, trend: 22000, label: (i) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i] },
  }[range] || { points: 30, base: 40000, variance: 15000, trend: 500, label: (i) => `Day ${i + 1}` };

  const revenue = series(1101, config.points, config.base, config.variance, config.trend);
  const expenses = series(2202, config.points, config.base * 0.62, config.variance * 0.6, config.trend * 0.5);
  return revenue.map((r, i) => ({
    label: config.label(i),
    revenue: r,
    expenses: expenses[i],
    profit: r - expenses[i],
  }));
}

export function customerGrowthSeries(months = 12) {
  const rand = seededRandom(3303);
  let total = 210;
  const out = [];
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < months; i++) {
    const added = intBetween(rand, 8, 26);
    const churned = intBetween(rand, 2, 9);
    total += added - churned;
    out.push({ label: names[i % 12], added, churned, total });
  }
  return out;
}

export function projectCompletionSeries() {
  const rand = seededRandom(4404);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names.map((label) => ({
    label,
    completed: intBetween(rand, 3, 12),
    started: intBetween(rand, 4, 14),
  }));
}

export function funnelStages() {
  return [
    { stage: 'Visitors', value: 48200 },
    { stage: 'Signups', value: 12480 },
    { stage: 'Trials', value: 5230 },
    { stage: 'Qualified', value: 2140 },
    { stage: 'Customers', value: 986 },
  ];
}

export function geoDistribution() {
  return [
    { region: 'North America', customers: 118, revenue: 1840000 },
    { region: 'Europe', customers: 64, revenue: 920000 },
    { region: 'Asia Pacific', customers: 41, revenue: 540000 },
    { region: 'Latin America', customers: 18, revenue: 210000 },
    { region: 'Middle East & Africa', customers: 9, revenue: 96000 },
  ];
}

export function teamProductivitySeries() {
  const rand = seededRandom(5505);
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  return weeks.map((label) => ({
    label,
    productivity: intBetween(rand, 78, 97),
    tasksCompleted: intBetween(rand, 120, 220),
  }));
}
