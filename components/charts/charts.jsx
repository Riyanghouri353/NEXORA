'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { chartColors, tooltipStyle, withOpacity } from '@/lib/chartTheme';
import { useTheme } from '@/components/providers';
import { formatCompactCurrency } from '@/lib/utils';

/* Interactive revenue chart. Parent controls `data` (range selector lives in the page). */
export function RevenueChart({ data = [], height = 320, showExpenses = true, showProfit = false }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  const tooltipContentStyle = useMemo(
    () => ({
      ...tooltipStyle,
      backgroundColor: dark ? '#0f172a' : '#ffffff',
      border: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`,
      color: dark ? '#f1f5f9' : '#0f172a',
    }),
    [dark]
  );

  return (
    <div style={{ height }} role="img" aria-label="Revenue chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.revenue} stopOpacity={0.32} />
              <stop offset="100%" stopColor={chartColors.revenue} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: chartColors.tick }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: chartColors.tick }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompactCurrency(v)}
            width={56}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            formatter={(value, name) => [formatCompactCurrency(value), name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit']}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke={chartColors.revenue} strokeWidth={2.5} fill="url(#revFill)" />
          {showExpenses && (
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke={chartColors.expenses} strokeWidth={2} dot={false} />
          )}
          {showProfit && (
            <Line type="monotone" dataKey="profit" name="Profit" stroke={chartColors.profit} strokeWidth={2} dot={false} strokeDasharray="6 4" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ data = [], color = chartColors.revenue, height = 44, width = 120, ariaLabel = 'Trend sparkline' }) {
  const points = useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  return (
    <div style={{ height, width }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#spark-${color.replace('#', '')})`} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({ data = [], dataKeys = [], height = 300, layout = 'horizontal', ariaLabel = 'Bar chart' }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  return (
    <div style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} layout={layout === 'vertical' ? 'vertical' : 'horizontal'}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactCurrency(v)} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} width={110} />
            </>
          ) : (
            <>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} width={48} />
            </>
          )}
          <Tooltip
            contentStyle={{ ...tooltipStyle, backgroundColor: dark ? '#0f172a' : '#fff', border: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`, color: dark ? '#f1f5f9' : '#0f172a' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {dataKeys.map((k) => (
            <Bar key={k.key} dataKey={k.key} name={k.name || k.key} fill={k.color} radius={[4, 4, 0, 0]} maxBarSize={42} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
