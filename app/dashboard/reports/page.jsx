'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select, FilterSelect } from '@/components/ui/fields';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/states';
import { useToast } from '@/components/providers';
import { reports, REPORT_TYPES, buildReportPreview } from '@/data/reports';
import { formatDate, timeAgo, cn } from '@/lib/utils';
import { toCSV, downloadCSV } from '@/lib/csv';

/* Icon per report type (REPORT_TYPES.icon falls back to `overview` otherwise). */
const TYPE_ICONS = {
  revenue: 'currency',
  projects: 'projects',
  customers: 'customers',
  team: 'team',
  transactions: 'transactions',
};

const PREVIEW_PERIODS = {
  '30d': { label: 'Last 30 days', scale: 0.4 },
  '90d': { label: 'Last 90 days', scale: 1.0 },
};

/* Deterministically scale formatted numeric strings ("$48,210" -> "$19,284").
   Percentages are ratios and stay untouched. */
function scaleValue(value, scale) {
  const str = String(value);
  if (scale === 1 || str.includes('%')) return str;
  const m = /^(-?[^\d.,]*)([\d,]+(?:\.\d+)?)(.*)$/.exec(str.trim());
  if (!m) return str;
  const n = parseFloat(m[2].replace(/,/g, ''));
  if (!Number.isFinite(n)) return str;
  const scaled = Math.round(n * scale * 100) / 100;
  return `${m[1]}${scaled.toLocaleString('en-US', { maximumFractionDigits: 2 })}${m[3]}`;
}

function ReportPreviewBody({ type, period }) {
  const base = useMemo(() => buildReportPreview(type), [type]);
  const scale = PREVIEW_PERIODS[period].scale;
  const preview = useMemo(
    () => ({
      ...base,
      headline: scaleValue(base.headline, scale),
      metrics: base.metrics.map((m) => ({ ...m, value: scaleValue(m.value, scale) })),
      rows: base.rows.map((r) => ({ ...r, value: scaleValue(r.value, scale) })),
    }),
    [base, scale]
  );

  return (
    <div className="space-y-6">
      {/* Headline */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {preview.headlineLabel}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{preview.headline}</p>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {preview.metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Detail rows */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <caption className="bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
            {preview.rowsTitle}
          </caption>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {preview.rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                  No rows for this period.
                </td>
              </tr>
            )}
            {preview.rows.map((row, i) => (
              <tr key={row.label + i} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{row.label}</td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportList, setReportList] = useState(reports);
  const [selectedType, setSelectedType] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [previewId, setPreviewId] = useState(null);
  const [previewPeriod, setPreviewPeriod] = useState('90d');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genType, setGenType] = useState('revenue');
  const [genPeriod, setGenPeriod] = useState('Last 90 days');
  const [genFormat, setGenFormat] = useState('csv');
  const [generating, setGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const genTimer = useRef(null);

  useEffect(() => () => genTimer.current && clearTimeout(genTimer.current), []);

  const filtered = useMemo(() => {
    const now = Date.now();
    return reportList.filter((r) => {
      if (selectedType && r.type !== selectedType) return false;
      if (dateFilter !== 'all') {
        const cutoff = now - Number(dateFilter) * 86400000;
        if (new Date(r.generatedAt).getTime() < cutoff) return false;
      }
      return true;
    });
  }, [reportList, selectedType, dateFilter]);

  const previewReport = previewId ? reportList.find((r) => r.id === previewId) : null;

  const openPreview = (id) => {
    setPreviewPeriod('90d');
    setPreviewId(id);
  };

  const handleMockExport = (report) => {
    toast({
      title: 'Export queued',
      description: `"${report.title}" will be exported as CSV shortly.`,
      variant: 'info',
    });
  };

  const handleDuplicate = (report) => {
    const copy = {
      ...report,
      id: `rep-${report.type}-${Date.now()}`,
      title: `${report.title} (copy)`,
      generatedAt: new Date().toISOString(),
      status: 'draft',
    };
    setReportList((prev) => [copy, ...prev]);
    toast({ title: 'Report duplicated', description: `"${copy.title}" added as a draft.`, variant: 'success' });
  };

  const handleDelete = () => {
    const target = reportList.find((r) => r.id === deleteId);
    setReportList((prev) => prev.filter((r) => r.id !== deleteId));
    if (previewId === deleteId) setPreviewId(null);
    setDeleteId(null);
    toast({
      title: 'Report deleted',
      description: target ? `"${target.title}" was removed.` : undefined,
      variant: 'success',
    });
  };

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    genTimer.current = setTimeout(() => {
      const typeDef = REPORT_TYPES.find((t) => t.id === genType);
      const created = {
        id: `rep-${genType}-${Date.now()}`,
        type: genType,
        title: `${typeDef.title} — Custom`,
        description: `Custom ${genPeriod.toLowerCase()} report generated as ${genFormat.toUpperCase()}.`,
        generatedAt: new Date().toISOString(),
        status: 'ready',
        period: genPeriod,
        icon: typeDef.icon,
      };
      setReportList((prev) => [created, ...prev]);
      setGenerating(false);
      setGenerateOpen(false);
      toast({ title: 'Report generated', description: `"${created.title}" is ready.`, variant: 'success' });
    }, 1000);
  };

  const handlePreviewDownload = () => {
    if (!previewReport) return;
    const base = buildReportPreview(previewReport.type);
    const scale = PREVIEW_PERIODS[previewPeriod].scale;
    const rows = [
      { label: base.headlineLabel, value: scaleValue(base.headline, scale) },
      ...base.metrics.map((m) => ({ label: m.label, value: scaleValue(m.value, scale) })),
      { label: '', value: '' },
      { label: base.rowsTitle, value: '' },
      ...base.rows.map((r) => ({ label: r.label, value: scaleValue(r.value, scale) })),
    ];
    downloadCSV(
      `${previewReport.type}-report-${previewPeriod}.csv`,
      toCSV(rows, [
        { label: 'Metric', key: 'label' },
        { label: 'Value', key: 'value' },
      ])
    );
    toast({ title: 'Report downloaded', description: `${previewReport.title} exported as CSV.`, variant: 'success' });
  };

  const actionItems = (report) => [
    { label: 'Preview', icon: <Icon name="eye" className="h-4 w-4" />, onClick: () => openPreview(report.id) },
    { label: 'Download CSV', icon: <Icon name="download" className="h-4 w-4" />, onClick: () => handleMockExport(report) },
    { label: 'Duplicate', icon: <Icon name="doc" className="h-4 w-4" />, onClick: () => handleDuplicate(report) },
    { divider: true },
    { label: 'Delete', icon: <Icon name="trash" className="h-4 w-4" />, danger: true, onClick: () => setDeleteId(report.id) },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate, preview, and export business reports from live data."
        actions={
          <Button leftIcon={<Icon name="plus" className="h-4 w-4" />} onClick={() => setGenerateOpen(true)}>
            Generate report
          </Button>
        }
      />

      {/* Report type cards */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Report types</h2>
          {selectedType && (
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {REPORT_TYPES.map((t) => {
            const active = selectedType === t.id;
            const count = reportList.filter((r) => r.type === t.id).length;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(active ? null : t.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                  active
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-950/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-lg',
                    active
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  )}
                >
                  <Icon name={TYPE_ICONS[t.icon] || t.icon} className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {count} report{count === 1 ? '' : 's'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Generated reports
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {filtered.length}
          </span>
        </h2>
        <FilterSelect label="Generated" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </FilterSelect>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No reports found"
            description={
              selectedType || dateFilter !== 'all'
                ? 'No reports match the current filters. Try clearing them.'
                : 'Generate your first report to get started.'
            }
            action={
              selectedType || dateFilter !== 'all' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedType(null);
                    setDateFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setGenerateOpen(true)}>Generate report</Button>
              )
            }
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 sm:inline-flex dark:bg-slate-800 dark:text-slate-300">
                  <Icon name={TYPE_ICONS[r.icon] || r.icon || 'reports'} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{r.title}</p>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{r.description}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(r.generatedAt)} · {timeAgo(r.generatedAt)} · {r.period}
                  </p>
                </div>
                <Dropdown
                  label={`Actions for ${r.title}`}
                  trigger={
                    <span className="inline-flex rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                      <Icon name="dots" className="h-5 w-5" />
                    </span>
                  }
                  items={actionItems(r)}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Preview modal */}
      <Modal
        open={!!previewReport}
        onClose={() => setPreviewId(null)}
        title={previewReport ? previewReport.title : 'Report preview'}
        description={
          previewReport
            ? `${previewReport.period} · Generated ${timeAgo(previewReport.generatedAt)}`
            : undefined
        }
        size="xl"
        footer={
          <>
            <Button variant="outline" leftIcon={<Icon name="printer" className="h-4 w-4" />} onClick={() => window.print()}>
              Print
            </Button>
            <Button leftIcon={<Icon name="download" className="h-4 w-4" />} onClick={handlePreviewDownload}>
              Download CSV
            </Button>
          </>
        }
      >
        {previewReport && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Preview period"
                className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800"
              >
                {Object.entries(PREVIEW_PERIODS).map(([key, { label }]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={previewPeriod === key}
                    onClick={() => setPreviewPeriod(key)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition',
                      previewPeriod === key
                        ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <StatusBadge status={previewReport.status} size="sm" />
            </div>
            <ReportPreviewBody type={previewReport.type} period={previewPeriod} />
          </div>
        )}
      </Modal>

      {/* Generate modal */}
      <Modal
        open={generateOpen}
        onClose={() => !generating && setGenerateOpen(false)}
        title="Generate report"
        description="Pick a type, period, and format. Generation is simulated and takes a moment."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setGenerateOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button loading={generating} onClick={handleGenerate} leftIcon={<Icon name="sparkles" className="h-4 w-4" />}>
              {generating ? 'Generating…' : 'Generate report'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Report type" value={genType} onChange={(e) => setGenType(e.target.value)}>
            {REPORT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
          <Select label="Period" value={genPeriod} onChange={(e) => setGenPeriod(e.target.value)}>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
          </Select>
          <Select label="Format" value={genFormat} onChange={(e) => setGenFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </Select>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete report"
        description="This will permanently remove the report from your list. This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete report
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {deleteId && `Delete "${reportList.find((r) => r.id === deleteId)?.title}"?`}
        </p>
      </Modal>
    </div>
  );
}
