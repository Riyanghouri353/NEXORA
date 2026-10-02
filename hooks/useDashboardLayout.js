'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './hooks';

/* Dashboard widget layout: visibility + order, persisted. */

export const DEFAULT_WIDGETS = [
  { id: 'kpis', label: 'KPI cards', visible: true },
  { id: 'revenue', label: 'Revenue chart', visible: true },
  { id: 'performance', label: 'Performance summary', visible: true },
  { id: 'activity', label: 'Recent activity', visible: true },
  { id: 'health', label: 'Project health', visible: true },
  { id: 'quick-actions', label: 'Quick actions', visible: true },
];

const KEY = 'nexora-dashboard-layout-v1';

export function useDashboardLayout() {
  const [widgets, setWidgets] = useLocalStorage(KEY, DEFAULT_WIDGETS);

  const ordered = useMemo(() => {
    const list = Array.isArray(widgets) && widgets.length ? widgets : DEFAULT_WIDGETS;
    // tolerate newly added widget ids
    const known = new Set(list.map((w) => w.id));
    const missing = DEFAULT_WIDGETS.filter((w) => !known.has(w.id));
    return [...list, ...missing];
  }, [widgets]);

  const visibleWidgets = useMemo(() => ordered.filter((w) => w.visible), [ordered]);

  const toggleWidget = useCallback(
    (id) => {
      setWidgets((prev) => {
        const list = Array.isArray(prev) && prev.length ? prev : DEFAULT_WIDGETS;
        return list.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
      });
    },
    [setWidgets]
  );

  const moveWidget = useCallback(
    (id, direction) => {
      setWidgets((prev) => {
        const list = [...(Array.isArray(prev) && prev.length ? prev : DEFAULT_WIDGETS)];
        const i = list.findIndex((w) => w.id === id);
        const j = direction === 'up' ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= list.length) return prev;
        [list[i], list[j]] = [list[j], list[i]];
        return list;
      });
    },
    [setWidgets]
  );

  const resetLayout = useCallback(() => setWidgets(DEFAULT_WIDGETS), [setWidgets]);

  return { widgets: ordered, visibleWidgets, toggleWidget, moveWidget, resetLayout };
}
