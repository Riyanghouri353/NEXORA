/* Shared chart styling: one palette, grid/tick colors via CSS variables
   (--chart-grid / --chart-tick are set in globals.css for both themes). */

export const chartColors = {
  revenue: '#4f46e5',
  revenueFill: '#4f46e5',
  expenses: '#f59e0b',
  profit: '#10b981',
  customers: '#0ea5e9',
  projects: '#8b5cf6',
  tasks: '#f43f5e',
  productivity: '#14b8a6',
  neutral: '#94a3b8',
  grid: 'var(--chart-grid)',
  tick: 'var(--chart-tick)',
};

export const categoricalPalette = [
  '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e',
  '#8b5cf6', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

export const axisTickStyle = {
  fontSize: 11,
  fill: 'var(--chart-tick)',
};

export const tooltipStyle = {
  backgroundColor: 'var(--tw-tooltip-bg, #fff)',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
};

export function withOpacity(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
