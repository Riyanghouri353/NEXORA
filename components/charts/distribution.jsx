'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { categoricalPalette, tooltipStyle } from '@/lib/chartTheme';
import { useTheme } from '@/components/providers';
import { formatNumber } from '@/lib/utils';

/* Donut chart. data: [{ label, value }]. Interactive legend + tooltip. */
export function DonutChart({ data = [], height = 260, ariaLabel = 'Donut chart', centerLabel, centerValue }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const total = useMemo(() => data.reduce((s, d) => s + (Number(d.value) || 0), 0), [data]);

  return (
    <div style={{ height }} className="relative" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
            {data.map((entry, i) => (
              <Cell key={entry.label} fill={entry.color || categoricalPalette[i % categoricalPalette.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ ...tooltipStyle, backgroundColor: dark ? '#0f172a' : '#fff', border: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`, color: dark ? '#f1f5f9' : '#0f172a' }}
            formatter={(value, name) => [`${formatNumber(value)} (${total ? Math.round((value / total) * 100) : 0}%)`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
          {centerValue && <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{centerValue}</p>}
          {centerLabel && <p className="text-xs text-slate-500 dark:text-slate-400">{centerLabel}</p>}
        </div>
      )}
    </div>
  );
}

/* Conversion funnel — hand-rolled bars for precise control. Interactive: hover shows details. */
export function FunnelChart({ stages = [], className }) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className={className} role="img" aria-label="Conversion funnel">
      <div className="space-y-3">
        {stages.map((s, i) => {
          const pct = Math.round((s.value / max) * 100);
          const conv = i === 0 ? 100 : Math.round((s.value / stages[0].value) * 100);
          const stepConv = i === 0 ? null : Math.round((s.value / stages[i - 1].value) * 100);
          return (
            <div key={s.stage} className="group">
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{s.stage}</span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  {formatNumber(s.value)}
                  <span className="ml-2 text-xs">({conv}% of top)</span>
                </span>
              </div>
              <div className="h-9 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800" title={`${s.stage}: ${formatNumber(s.value)}`}>
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-brand-600 to-brand-400 pr-2 text-[11px] font-semibold text-white transition-all duration-500"
                  style={{ width: `${Math.max(pct, 6)}%`, opacity: 1 - i * 0.12 }}
                >
                  {stepConv !== null && pct > 18 && <span>{stepConv}%</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
