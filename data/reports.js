/* Report definitions. Previews are computed live from the mock datasets. */

import { customers } from './customers';
import { projects } from './projects';
import { transactions } from './transactions';
import { teamMembers } from './team';
import { baseTasks } from './tasks';
import { formatCurrency, formatNumber } from '@/lib/utils';

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const REPORT_TYPES = [
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Income vs. expenses, top customers, and transaction breakdown for the period.',
    icon: 'revenue',
  },
  {
    id: 'projects',
    title: 'Projects Report',
    description: 'Portfolio health, status distribution, budget utilization, and at-risk projects.',
    icon: 'projects',
  },
  {
    id: 'customers',
    title: 'Customers Report',
    description: 'Growth, segmentation by industry and status, and revenue concentration.',
    icon: 'customers',
  },
  {
    id: 'team',
    title: 'Team Report',
    description: 'Productivity, workload distribution, and task completion by department.',
    icon: 'team',
  },
  {
    id: 'transactions',
    title: 'Transactions Report',
    description: 'Volume, success rate, payment method mix, and failed payment follow-ups.',
    icon: 'transactions',
  },
];

export const reports = REPORT_TYPES.map((t, i) => ({
  ...t,
  id: `rep-${t.id}`,
  type: t.id,
  generatedAt: daysAgoISO([1, 3, 6, 9, 14][i]),
  status: i === 3 ? 'draft' : 'ready',
  period: 'Last 90 days',
}));

/* Compute the preview payload for a report type from live mock data. */
export function buildReportPreview(type) {
  switch (type) {
    case 'revenue': {
      const income = transactions.filter((t) => t.amount > 0 && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
      const expenses = Math.abs(transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
      const byType = {};
      for (const t of transactions) byType[t.type] = (byType[t.type] || 0) + 1;
      return {
        headline: formatCurrency(income),
        headlineLabel: 'Total income (period)',
        metrics: [
          { label: 'Total income', value: formatCurrency(income) },
          { label: 'Total expenses', value: formatCurrency(expenses) },
          { label: 'Net', value: formatCurrency(income - expenses) },
          { label: 'Transactions', value: formatNumber(transactions.length) },
        ],
        rows: Object.entries(byType).map(([k, v]) => ({ label: k, value: String(v) })),
        rowsTitle: 'Transactions by type',
      };
    }
    case 'projects': {
      const byStatus = {};
      for (const p of projects) byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      const budget = projects.reduce((s, p) => s + p.budget, 0);
      const spent = projects.reduce((s, p) => s + p.spent, 0);
      return {
        headline: `${projects.length}`,
        headlineLabel: 'Projects in portfolio',
        metrics: [
          { label: 'Active', value: String(byStatus.active || 0) },
          { label: 'At risk', value: String(byStatus['at-risk'] || 0) },
          { label: 'Completed', value: String(byStatus.completed || 0) },
          { label: 'Budget utilization', value: `${Math.round((spent / budget) * 100)}%` },
        ],
        rows: projects.filter((p) => p.status === 'at-risk').map((p) => ({ label: p.name, value: `${p.progress}%` })),
        rowsTitle: 'At-risk projects',
      };
    }
    case 'customers': {
      const totalRevenue = customers.reduce((s, c) => s + c.revenue, 0);
      const byIndustry = {};
      for (const c of customers) byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1;
      const top = [...customers].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      return {
        headline: formatCurrency(totalRevenue),
        headlineLabel: 'Total customer revenue',
        metrics: [
          { label: 'Customers', value: String(customers.length) },
          { label: 'Active', value: String(customers.filter((c) => c.status === 'active').length) },
          { label: 'Avg revenue', value: formatCurrency(Math.round(totalRevenue / customers.length)) },
          { label: 'Industries', value: String(Object.keys(byIndustry).length) },
        ],
        rows: top.map((c) => ({ label: c.company, value: formatCurrency(c.revenue) })),
        rowsTitle: 'Top customers by revenue',
      };
    }
    case 'team': {
      const avgProd = Math.round(teamMembers.reduce((s, m) => s + m.productivity, 0) / teamMembers.length);
      const byDept = {};
      for (const m of teamMembers) byDept[m.department] = (byDept[m.department] || 0) + 1;
      const top = [...teamMembers].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5);
      return {
        headline: `${avgProd}%`,
        headlineLabel: 'Average productivity',
        metrics: [
          { label: 'Members', value: String(teamMembers.length) },
          { label: 'Departments', value: String(Object.keys(byDept).length) },
          { label: 'Tasks completed', value: formatNumber(teamMembers.reduce((s, m) => s + m.tasksCompleted, 0)) },
          { label: 'Avg productivity', value: `${avgProd}%` },
        ],
        rows: top.map((m) => ({ label: m.name, value: `${m.tasksCompleted} tasks` })),
        rowsTitle: 'Top contributors',
      };
    }
    case 'transactions':
    default: {
      const completed = transactions.filter((t) => t.status === 'completed').length;
      const byMethod = {};
      for (const t of transactions) byMethod[t.method] = (byMethod[t.method] || 0) + 1;
      const volume = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      return {
        headline: formatCurrency(volume),
        headlineLabel: 'Processed volume',
        metrics: [
          { label: 'Transactions', value: String(transactions.length) },
          { label: 'Success rate', value: `${Math.round((completed / transactions.length) * 100)}%` },
          { label: 'Failed', value: String(transactions.filter((t) => t.status === 'failed').length) },
          { label: 'Pending', value: String(transactions.filter((t) => t.status === 'pending').length) },
        ],
        rows: Object.entries(byMethod).map(([k, v]) => ({ label: k, value: String(v) })),
        rowsTitle: 'Volume by payment method',
      };
    }
  }
}

export function tasksSummary() {
  const byStatus = {};
  for (const t of baseTasks) byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  return byStatus;
}
