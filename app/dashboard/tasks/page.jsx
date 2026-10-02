'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Button, IconButton } from '@/components/ui/Button';
import { Input, Textarea, Select, FilterSelect, SearchInput } from '@/components/ui/fields';
import { Checkbox } from '@/components/ui/toggles';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { DataTable } from '@/components/ui/DataTable';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/states';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/providers';
import { useTasks, TASK_STATUSES, TASK_PRIORITIES } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/hooks';
import { teamMembers, teamById } from '@/data/team';
import { projects, projectById } from '@/data/projects';
import { simulateFetch, simulateMutation } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

/* ---------- helpers ---------- */

function toDateInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false;
  return new Date(task.dueDate) < startOfToday();
}

function isDueThisWeek(task) {
  if (!task.dueDate || task.status === 'done') return false;
  const due = new Date(task.dueDate);
  const today = startOfToday().getTime();
  return due.getTime() >= today && due.getTime() <= today + 7 * 86400000;
}

function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const v = values[field];
    if (rule.required && (!v || String(v).trim() === '')) errors[field] = rule.message || 'This field is required.';
  }
  return errors;
}

function taskSortValue(row, key) {
  switch (key) {
    case 'assignee':
      return (row.assigneeId && teamById[row.assigneeId] ? teamById[row.assigneeId].name : 'zzzz').toLowerCase();
    case 'project':
      return (row.projectId && projectById[row.projectId] ? projectById[row.projectId].name : 'zzzz').toLowerCase();
    case 'dueDate':
      return row.dueDate ? new Date(row.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    case 'status':
      return TASK_STATUSES.findIndex((s) => s.id === row.status);
    case 'priority':
      return TASK_PRIORITIES.findIndex((p) => p.id === row.priority);
    default:
      return String(row[key] ?? '').toLowerCase();
  }
}

/* ---------- task card (kanban) ---------- */

function TaskCard({ task, onMove, onToggleComplete, onEdit, onDelete }) {
  const member = task.assigneeId ? teamById[task.assigneeId] : null;
  const project = task.projectId ? projectById[task.projectId] : null;
  const done = task.status === 'done';
  const overdue = isOverdue(task);
  const idx = TASK_STATUSES.findIndex((s) => s.id === task.status);
  const prev = idx > 0 ? TASK_STATUSES[idx - 1] : null;
  const next = idx >= 0 && idx < TASK_STATUSES.length - 1 ? TASK_STATUSES[idx + 1] : null;

  const menuItems = [
    { label: 'Edit task', icon: <Icon name="pencil" className="h-4 w-4" />, onClick: onEdit },
    { divider: true },
    ...TASK_STATUSES.filter((s) => s.id !== task.status).map((s) => ({
      label: `Move to ${s.label}`,
      icon: <Icon name="arrowRight" className="h-4 w-4" />,
      onClick: () => onMove(task.id, s.id),
    })),
  ];

  return (
    <article
      aria-label={`Task: ${task.title}`}
      className={cn(
        'rounded-xl border bg-white p-3.5 shadow-sm transition dark:bg-slate-900',
        done ? 'border-slate-200 opacity-75 dark:border-slate-800' : 'border-slate-200 hover:shadow dark:border-slate-800'
      )}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={done}
          onChange={onToggleComplete}
          aria-label={done ? `Reopen task "${task.title}"` : `Mark task "${task.title}" as done`}
          className="mt-0.5"
        />
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit task: ${task.title}`}
          className="min-w-0 flex-1 text-left"
        >
          <span
            className={cn(
              'block truncate text-sm font-medium',
              done
                ? 'text-slate-400 line-through dark:text-slate-500'
                : 'text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400'
            )}
          >
            {task.title}
          </span>
        </button>
        <Dropdown
          label={`Card actions for "${task.title}"`}
          align="right"
          trigger={
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
              <Icon name="dots" className="h-4 w-4" />
              Move
            </span>
          }
          items={menuItems}
        />
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{task.description}</p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} size="sm" />
        {project && <span className="truncate text-xs text-slate-500 dark:text-slate-400">{project.name}</span>}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {member ? (
            <Avatar name={member.name} size="xs" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Icon name="user" className="h-3.5 w-3.5" />
            </span>
          )}
          <span className="truncate text-xs text-slate-500 dark:text-slate-400">{member ? member.name : 'Unassigned'}</span>
        </span>
        {task.dueDate && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 text-xs',
              overdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <Icon name="calendar" className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(task.dueDate)}
            {overdue && <span className="sr-only">(overdue)</span>}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <IconButton
          label={prev ? `Move "${task.title}" back to ${prev.label}` : `"${task.title}" is already in the first column`}
          disabled={!prev}
          onClick={() => prev && onMove(task.id, prev.id)}
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </IconButton>
        <span className="mx-auto text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {TASK_STATUSES[idx] ? TASK_STATUSES[idx].label : ''}
        </span>
        <IconButton label={`Delete task "${task.title}"`} onClick={onDelete}>
          <Icon name="trash" className="h-4 w-4" />
        </IconButton>
        <IconButton
          label={next ? `Move "${task.title}" forward to ${next.label}` : `"${task.title}" is already in the last column`}
          disabled={!next}
          onClick={() => next && onMove(task.id, next.id)}
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </IconButton>
      </div>
    </article>
  );
}

/* ---------- edit modal (local; updates via updateTask) ---------- */

function TaskEditModal({ task, onClose }) {
  const { toast } = useToast();
  const { updateTask } = useTasks();
  const [values, setValues] = useState({
    title: task.title || '',
    description: task.description || '',
    assigneeId: task.assigneeId || '',
    projectId: task.projectId || '',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    dueDate: toDateInputValue(task.dueDate),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(values, {
      title: { required: true, message: 'Task title is required.' },
      assigneeId: { required: true, message: 'Choose an assignee.' },
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await simulateMutation(
      () =>
        updateTask(task.id, {
          title: values.title.trim(),
          description: values.description.trim(),
          assigneeId: values.assigneeId || null,
          projectId: values.projectId || null,
          priority: values.priority,
          status: values.status,
          dueDate: values.dueDate ? new Date(`${values.dueDate}T12:00:00`).toISOString() : null,
        }),
      500
    );
    setSaving(false);
    toast({ title: 'Task updated', description: `"${values.title.trim()}" was saved.`, variant: 'success' });
    onClose();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-4">
        <Input
          label="Title"
          required
          placeholder="e.g. Review Q3 analytics draft"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
        />
        <Textarea
          label="Description"
          placeholder="Context, acceptance criteria…"
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Assignee" required value={values.assigneeId} onChange={(e) => set('assigneeId', e.target.value)} error={errors.assigneeId}>
            <option value="">Select a teammate…</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.role}
              </option>
            ))}
          </Select>
          <Select label="Project" value={values.projectId} onChange={(e) => set('projectId', e.target.value)}>
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select label="Priority" value={values.priority} onChange={(e) => set('priority', e.target.value)}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
          <Select label="Status" value={values.status} onChange={(e) => set('status', e.target.value)}>
            {TASK_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Due date" type="date" value={values.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

/* ---------- mobile card for list view ---------- */

function TaskMobileCard({ row, onEdit, onDelete, onToggleComplete }) {
  const member = row.assigneeId ? teamById[row.assigneeId] : null;
  const project = row.projectId ? projectById[row.projectId] : null;
  const done = row.status === 'done';
  const overdue = isOverdue(row);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-2">
        <Checkbox
          checked={done}
          onChange={() => onToggleComplete(row)}
          aria-label={done ? `Reopen task "${row.title}"` : `Mark task "${row.title}" as done`}
          className="mt-0.5"
        />
        <button
          type="button"
          onClick={() => onEdit(row)}
          aria-label={`Edit task: ${row.title}`}
          className="min-w-0 flex-1 text-left text-sm font-medium text-slate-900 dark:text-white"
        >
          <span className={cn(done && 'text-slate-400 line-through dark:text-slate-500')}>{row.title}</span>
        </button>
        <IconButton label={`Edit ${row.title}`} onClick={() => onEdit(row)}>
          <Icon name="pencil" className="h-4 w-4" />
        </IconButton>
        <IconButton label={`Delete ${row.title}`} onClick={() => onDelete(row)}>
          <Icon name="trash" className="h-4 w-4" />
        </IconButton>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={row.priority} size="sm" />
        <StatusBadge status={row.status} size="sm" />
        {project && <span className="text-xs text-slate-500 dark:text-slate-400">{project.name}</span>}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-500 dark:text-slate-400">
          {member && <Avatar name={member.name} size="xs" />}
          <span className="truncate">{member ? member.name : 'Unassigned'}</span>
        </span>
        {row.dueDate && (
          <span className={cn('shrink-0', overdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')}>
            {formatDate(row.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- main page ---------- */

function TasksPage() {
  const { toast } = useToast();
  const { tasks, deleteTask, moveTask, toggleComplete } = useTasks();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => (searchParams.get('view') === 'list' ? 'list' : 'kanban'));
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [priorityFilter, setPriorityFilter] = useState(() => searchParams.get('priority') || 'all');
  const [assigneeFilter, setAssigneeFilter] = useState(() => searchParams.get('assignee') || 'all');
  const [projectFilter, setProjectFilter] = useState(() => searchParams.get('project') || 'all');
  const [sortKey, setSortKey] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let live = true;
    simulateFetch(() => true, 500).then(() => {
      if (live) setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  /* Keep filters shareable in the URL. */
  useEffect(() => {
    const sp = new URLSearchParams();
    if (view !== 'kanban') sp.set('view', view);
    if (debouncedSearch.trim()) sp.set('q', debouncedSearch.trim());
    if (priorityFilter !== 'all') sp.set('priority', priorityFilter);
    if (assigneeFilter !== 'all') sp.set('assignee', assigneeFilter);
    if (projectFilter !== 'all') sp.set('project', projectFilter);
    const next = sp.toString();
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [view, debouncedSearch, priorityFilter, assigneeFilter, projectFilter, searchParams, router, pathname]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter(isOverdue).length,
      dueWeek: tasks.filter(isDueThisWeek).length,
    }),
    [tasks]
  );

  const filtersActive =
    debouncedSearch.trim() !== '' || priorityFilter !== 'all' || assigneeFilter !== 'all' || projectFilter !== 'all';

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return tasks.filter((t) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'all' && t.assigneeId !== assigneeFilter) return false;
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
      if (q) {
        const member = t.assigneeId ? teamById[t.assigneeId] : null;
        const project = t.projectId ? projectById[t.projectId] : null;
        const haystack = `${t.title} ${t.description || ''} ${member ? member.name : ''} ${project ? project.name : ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, debouncedSearch, priorityFilter, assigneeFilter, projectFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = taskSortValue(a, sortKey);
      const vb = taskSortValue(b, sortKey);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const clearFilters = () => {
    setSearch('');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setProjectFilter('all');
  };

  const handleMove = useCallback(
    (id, status) => {
      const label = TASK_STATUSES.find((s) => s.id === status)?.label || status;
      moveTask(id, status);
      toast({ title: 'Task moved', description: `Moved to ${label}.`, variant: 'success' });
    },
    [moveTask, toast]
  );

  const handleToggleComplete = useCallback(
    (task) => {
      const willComplete = task.status !== 'done';
      toggleComplete(task.id);
      toast({
        title: willComplete ? 'Task completed' : 'Task reopened',
        description: `"${task.title}" was ${willComplete ? 'moved to Done' : 'moved back to To Do'}.`,
        variant: 'success',
      });
    },
    [toggleComplete, toast]
  );

  const handleDelete = useCallback(() => {
    if (!deletingTask) return;
    deleteTask(deletingTask.id);
    toast({ title: 'Task deleted', description: `"${deletingTask.title}" was removed.`, variant: 'success' });
    setDeletingTask(null);
  }, [deletingTask, deleteTask, toast]);

  const openQuickCreate = useCallback(() => {
    window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind: 'task' } }));
  }, []);

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey]
  );

  const columns = useMemo(
    () => [
      {
        key: 'title',
        label: 'Task',
        sortable: true,
        render: (row) => (
          <div className="min-w-[220px] max-w-[340px]">
            <button
              type="button"
              onClick={() => setEditingTask(row)}
              className="block max-w-full truncate text-left font-medium text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
            >
              {row.title}
            </button>
            {row.description && (
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{row.description}</p>
            )}
          </div>
        ),
      },
      {
        key: 'assignee',
        label: 'Assignee',
        sortable: true,
        render: (row) => {
          const m = row.assigneeId ? teamById[row.assigneeId] : null;
          return m ? (
            <span className="inline-flex items-center gap-2">
              <Avatar name={m.name} size="xs" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{m.name}</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">Unassigned</span>
          );
        },
      },
      {
        key: 'project',
        label: 'Project',
        sortable: true,
        render: (row) => {
          const p = row.projectId ? projectById[row.projectId] : null;
          return p ? (
            <span className="text-sm text-slate-700 dark:text-slate-300">{p.name}</span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
          );
        },
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        render: (row) => <PriorityBadge priority={row.priority} size="sm" />,
      },
      {
        key: 'dueDate',
        label: 'Due date',
        sortable: true,
        render: (row) =>
          row.dueDate ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm',
                isOverdue(row) ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'
              )}
            >
              <Icon name="calendar" className="h-4 w-4" aria-hidden="true" />
              {formatDate(row.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
          ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (row) => <StatusBadge status={row.status} size="sm" />,
      },
      {
        key: 'actions',
        label: <span className="sr-only">Actions</span>,
        align: 'right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <IconButton
              label={row.status === 'done' ? `Reopen "${row.title}"` : `Mark "${row.title}" as done`}
              onClick={() => handleToggleComplete(row)}
            >
              <Icon name="check" className="h-4 w-4" />
            </IconButton>
            <IconButton label={`Edit "${row.title}"`} onClick={() => setEditingTask(row)}>
              <Icon name="pencil" className="h-4 w-4" />
            </IconButton>
            <IconButton label={`Delete "${row.title}"`} onClick={() => setDeletingTask(row)}>
              <Icon name="trash" className="h-4 w-4" />
            </IconButton>
          </div>
        ),
      },
    ],
    [handleToggleComplete]
  );

  const completionPct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const viewToggleCls = (active) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none',
      active
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    );

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Plan, track, and ship work across every project."
        actions={
          <>
            <div
              role="group"
              aria-label="Change view"
              className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
            >
              <button type="button" aria-pressed={view === 'kanban'} onClick={() => setView('kanban')} className={viewToggleCls(view === 'kanban')}>
                <Icon name="grid" className="h-4 w-4" aria-hidden="true" />
                Kanban
              </button>
              <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={viewToggleCls(view === 'list')}>
                <Icon name="list" className="h-4 w-4" aria-hidden="true" />
                List
              </button>
            </div>
            <Button onClick={openQuickCreate} leftIcon={<Icon name="plus" className="h-4 w-4" aria-hidden="true" />}>
              New task
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              title="Total tasks"
              value={stats.total}
              changeLabel="tracked across all statuses"
              icon={<Icon name="tasks" className="h-5 w-5" />}
            />
            <KpiCard
              title="Completed"
              value={stats.completed}
              change={`${completionPct}%`}
              changeLabel="completion rate"
              changeTone="up"
              icon={<Icon name="check" className="h-5 w-5" />}
            />
            <KpiCard
              title="Overdue"
              value={stats.overdue}
              change={stats.overdue > 0 ? 'Needs attention' : undefined}
              changeLabel={stats.overdue > 0 ? 'past their due date' : 'nothing past due'}
              changeTone="down"
              icon={<Icon name="clock" className="h-5 w-5" />}
            />
            <KpiCard
              title="Due this week"
              value={stats.dueWeek}
              changeLabel="due in the next 7 days"
              icon={<Icon name="calendar" className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tasks…"
          className="min-w-[180px] flex-1 sm:max-w-xs"
        />
        <FilterSelect label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Assignee" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option value="all">All assignees</option>
          {teamMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </FilterSelect>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<Icon name="x" className="h-4 w-4" aria-hidden="true" />}>
            Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        view === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4" aria-hidden="true">
            {TASK_STATUSES.map((s) => (
              <div key={s.id} className="w-[300px] shrink-0 space-y-3">
                <Skeleton className="h-6 w-28" />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <SkeletonTable rows={8} columns={7} />
        )
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            title={filtersActive ? 'No tasks match your filters' : 'No tasks yet'}
            description={
              filtersActive ? 'Try a different search or clear the filters to see more work.' : 'Create your first task to get the board moving.'
            }
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openQuickCreate} leftIcon={<Icon name="plus" className="h-4 w-4" aria-hidden="true" />}>
                  New task
                </Button>
              )
            }
          />
        </div>
      ) : view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label="Task kanban board">
          {TASK_STATUSES.map((status) => {
            const columnTasks = filtered.filter((t) => t.status === status.id);
            return (
              <section
                key={status.id}
                role="listitem"
                aria-label={`${status.label} column, ${columnTasks.length} tasks`}
                className="flex w-[300px] shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <header className="flex items-center justify-between px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{status.label}</h2>
                  <Badge variant="neutral" size="sm">
                    {columnTasks.length}
                  </Badge>
                </header>
                <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto px-3 pb-4">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                      No tasks here yet
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onMove={handleMove}
                        onToggleComplete={() => handleToggleComplete(task)}
                        onEdit={() => setEditingTask(task)}
                        onDelete={() => setDeletingTask(task)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={sorted}
          keyField="id"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          ariaLabel="Tasks"
          mobileCard={(row) => (
            <TaskMobileCard
              row={row}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onToggleComplete={handleToggleComplete}
            />
          )}
        />
      )}

      <Modal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit task"
        description="Update the details of this task."
        size="lg"
      >
        {editingTask && <TaskEditModal key={editingTask.id} task={editingTask} onClose={() => setEditingTask(null)} />}
      </Modal>

      <Modal
        open={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete task"
        description="This action can't be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete task
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Delete <span className="font-semibold text-slate-900 dark:text-white">“{deletingTask?.title}”</span>? It will
          be permanently removed from your workspace.
        </p>
      </Modal>
    </div>
  );
}

function TasksLoadingFallback() {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={8} columns={6} />
    </div>
  );
}

export default function TasksRoute() {
  return (
    <Suspense fallback={<TasksLoadingFallback />}>
      <TasksPage />
    </Suspense>
  );
}
