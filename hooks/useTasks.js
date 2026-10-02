'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './hooks';
import { baseTasks } from '@/data/tasks';

/* Merges mock tasks with localStorage overrides:
   - created: full task objects created by the user
   - updated: partial updates by id
   - deleted: ids removed by the user
*/
const STORAGE_KEY = 'nexora-tasks-v1';

function mergeTasks(base, overlay) {
  const { created = [], updated = {}, deleted = [] } = overlay || {};
  const deletedSet = new Set(deleted);
  const list = base
    .filter((t) => !deletedSet.has(t.id))
    .map((t) => (updated[t.id] ? { ...t, ...updated[t.id] } : t));
  return [...created, ...list];
}

let taskSeq = 1000;
function nextId() {
  taskSeq += 1;
  return `tsk-local-${Date.now().toString(36)}-${taskSeq}`;
}

export function useTasks() {
  const [overlay, setOverlay] = useLocalStorage(STORAGE_KEY, { created: [], updated: {}, deleted: [] });

  const tasks = useMemo(() => mergeTasks(baseTasks, overlay), [overlay]);

  const addTask = useCallback(
    (input) => {
      const task = {
        id: nextId(),
        title: input.title,
        description: input.description || '',
        assigneeId: input.assigneeId || null,
        projectId: input.projectId || null,
        priority: input.priority || 'medium',
        dueDate: input.dueDate || null,
        status: input.status || 'todo',
        createdAt: new Date().toISOString(),
        local: true,
      };
      setOverlay((prev) => ({ ...prev, created: [task, ...(prev.created || [])] }));
      return task;
    },
    [setOverlay]
  );

  const updateTask = useCallback(
    (id, patch) => {
      setOverlay((prev) => {
        const created = (prev.created || []).map((t) => (t.id === id ? { ...t, ...patch } : t));
        const isLocal = (prev.created || []).some((t) => t.id === id);
        if (isLocal) return { ...prev, created };
        return { ...prev, created, updated: { ...(prev.updated || {}), [id]: { ...((prev.updated || {})[id] || {}), ...patch } } };
      });
    },
    [setOverlay]
  );

  const deleteTask = useCallback(
    (id) => {
      setOverlay((prev) => ({
        created: (prev.created || []).filter((t) => t.id !== id),
        updated: Object.fromEntries(Object.entries(prev.updated || {}).filter(([k]) => k !== id)),
        deleted: [...(prev.deleted || []), id],
      }));
    },
    [setOverlay]
  );

  const moveTask = useCallback((id, status) => updateTask(id, { status }), [updateTask]);
  const toggleComplete = useCallback(
    (id) => {
      const current = mergeTasks(baseTasks, overlay).find((t) => t.id === id);
      updateTask(id, { status: current && current.status === 'done' ? 'todo' : 'done' });
    },
    [overlay, updateTask]
  );

  const resetAll = useCallback(() => {
    setOverlay({ created: [], updated: {}, deleted: [] });
  }, [setOverlay]);

  return { tasks, addTask, updateTask, deleteTask, moveTask, toggleComplete, resetAll };
}

export const TASK_STATUSES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
];
