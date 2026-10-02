'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Checkbox, Switch } from '@/components/ui/toggles';
import { Input, Select } from '@/components/ui/fields';
import { Progress } from '@/components/ui/Progress';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/states';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/providers';
import { useTasks } from '@/hooks/useTasks';
import { tasksForProject, tasksForMember } from '@/data/tasks';
import { activitiesForProject } from '@/data/activities';
import { customerById } from '@/data/customers';
import { teamById } from '@/data/team';
import { PROJECT_STATUSES } from '@/data/projects';
import { simulateMutation } from '@/lib/api';
import { cn, formatCurrency, formatDate, timeAgo } from '@/lib/utils';

const FILE_EXTS = ['pdf', 'docx', 'xlsx', 'png', 'fig', 'zip'];

function fireQuickCreate(kind) {
  window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind } }));
}

/* ------------------------------------------------------------------ */
/* Overview tab                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab({ project, members, client, overdue }) {
  const spentPct = Math.min(100, Math.round((project.spent / project.budget) * 100));
  const remaining = project.budget - project.spent;

  const detailRows = [
    { label: 'Status', value: <StatusBadge status={project.status} size="sm" /> },
    { label: 'Priority', value: <PriorityBadge priority={project.priority} size="sm" /> },
    { label: 'Start date', value: formatDate(project.startDate) },
    {
      label: 'Deadline',
      value: (
        <span className={cn('inline-flex items-center gap-1.5', overdue && 'font-semibold text-red-600 dark:text-red-400')}>
          {formatDate(project.deadline)}
          {overdue && <Badge variant="danger" size="sm">Overdue</Badge>}
        </span>
      ),
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader title="Project overview" />
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.description}</p>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Overall progress</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{project.progress}%</span>
            </div>
            <Progress value={project.progress} size="lg" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Budget</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(project.budget)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Spent</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(project.spent)}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{spentPct}% of budget</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Remaining</p>
              <p className={cn('mt-1 text-lg font-bold', remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>
                {formatCurrency(remaining)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {remaining < 0 ? 'Over budget' : 'Available'}
              </p>
            </div>
          </div>

          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {detailRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <dt className="text-sm text-slate-500 dark:text-slate-400">{row.label}</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-white">{row.value}</dd>
              </div>
            ))}
          </dl>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="neutral" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Team"
            subtitle={`${members.length} members`}
            action={
              <span className="inline-flex">
                <AvatarStack names={members.map((m) => m.name)} max={5} />
              </span>
            }
          />
          <CardContent>
            <ul className="space-y-3">
              {members.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{m.role}</p>
                  </div>
                  {m.id === project.leadId && <Badge variant="primary" size="sm">Lead</Badge>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {client && (
          <Card>
            <CardHeader title="Client" />
            <CardContent>
              <p className="font-semibold text-slate-900 dark:text-white">{client.company}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{client.contact}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{client.email}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {client.city} · {client.industry}
              </p>
              <Link
                href={`/dashboard/customers/${client.id}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                View customer <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tasks tab                                                           */
/* ------------------------------------------------------------------ */

function TasksTab({ project }) {
  const { toast } = useToast();
  const { tasks, toggleComplete } = useTasks();
  const projectTasks = useMemo(() => tasksForProject(project.id, tasks), [project.id, tasks]);
  const openCount = projectTasks.filter((t) => t.status !== 'done').length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {openCount} open · {projectTasks.length - openCount} completed
        </p>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Icon name="plus" className="h-4 w-4" />}
          onClick={() => fireQuickCreate('task')}
        >
          Add task
        </Button>
      </div>

      {projectTasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Tasks linked to this project will show up here."
          action={
            <Button variant="secondary" onClick={() => fireQuickCreate('task')}>
              Create task
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {projectTasks.map((t) => {
            const done = t.status === 'done';
            const assignee = t.assigneeId ? teamById[t.assigneeId] : null;
            const taskOverdue = t.dueDate && new Date(t.dueDate).getTime() < Date.now() && !done;
            return (
              <li
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900"
              >
                <Checkbox
                  label={
                    <span className={cn(done && 'text-slate-400 line-through dark:text-slate-500')}>{t.title}</span>
                  }
                  checked={done}
                  onChange={() => {
                    toggleComplete(t.id);
                    toast({
                      title: done ? 'Task reopened' : 'Task completed',
                      description: t.title,
                      variant: done ? 'info' : 'success',
                    });
                  }}
                />
                {t.description && (
                  <p className="mt-1.5 pl-7 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                )}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-7">
                  <PriorityBadge priority={t.priority} size="sm" />
                  {assignee && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Avatar name={assignee.name} size="xs" />
                      {assignee.name}
                    </span>
                  )}
                  {t.dueDate && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs',
                        taskOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      <Icon name="calendar" className="h-3.5 w-3.5" />
                      {formatDate(t.dueDate)}
                    </span>
                  )}
                  <span className="text-xs capitalize text-slate-400 dark:text-slate-500">
                    {t.status.replace('-', ' ')}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Team tab                                                            */
/* ------------------------------------------------------------------ */

function TeamTab({ project, members, tasks }) {
  return (
    <Card>
      <CardHeader title="Project team" subtitle={`${members.length} members assigned`} />
      <CardContent>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map((m) => {
            const taskCount = tasksForMember(m.id, tasks).length;
            return (
              <li key={m.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <Avatar name={m.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{m.name}</p>
                    {m.id === project.leadId && <Badge variant="primary" size="sm">Lead</Badge>}
                    <Badge
                      variant={m.status === 'active' ? 'success' : m.status === 'away' ? 'warning' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {m.role} · {m.department}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{taskCount}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">tasks</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Activity tab                                                        */
/* ------------------------------------------------------------------ */

function ActivityTab({ project }) {
  const feed = useMemo(() => activitiesForProject(project.id), [project.id]);

  if (feed.length === 0) {
    return (
      <EmptyState
        title="No recent activity"
        description="Updates, comments, and milestones for this project will appear here."
      />
    );
  }

  return (
    <Card>
      <CardHeader title="Activity" subtitle={`${feed.length} recent events`} />
      <CardContent>
        <ul className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
          {feed.map((a) => {
            const actor = a.actorId ? teamById[a.actorId] : null;
            return (
              <li key={a.id} className="relative flex gap-3.5 pl-0">
                <span className="relative z-10 shrink-0">
                  {actor ? <Avatar name={actor.name} size="sm" ring /> : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                      <Icon name="bell" className="h-4 w-4" />
                    </span>
                  )}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{a.text}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{timeAgo(a.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Files tab                                                           */
/* ------------------------------------------------------------------ */

function FilesTab({ project }) {
  const { toast } = useToast();

  const files = useMemo(() => {
    const slug = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return Array.from({ length: project.files }, (_, i) => {
      const ext = FILE_EXTS[i % FILE_EXTS.length];
      const sizeKb = 120 + ((i * 137 + project.files * 31) % 4800);
      return {
        id: `${project.id}-file-${i + 1}`,
        name: `${slug}-v${i + 1}.${ext}`,
        size: sizeKb < 1024 ? `${sizeKb} KB` : `${(sizeKb / 1024).toFixed(1)} MB`,
      };
    });
  }, [project]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {files.length} file{files.length === 1 ? '' : 's'} attached
        </p>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Icon name="plus" className="h-4 w-4" />}
          onClick={() =>
            toast({ title: 'Upload files', description: 'File uploads are disabled in this demo.', variant: 'info' })
          }
        >
          Upload
        </Button>
      </div>
      <Card>
        <CardContent className="!py-2">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Icon name="doc" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{f.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{f.size}</p>
                </div>
                <IconButton
                  label={`Download ${f.name}`}
                  onClick={() =>
                    toast({
                      title: 'Download started',
                      description: `${f.name} is downloading (mock).`,
                      variant: 'success',
                    })
                  }
                >
                  <Icon name="download" className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings tab                                                        */
/* ------------------------------------------------------------------ */

function SettingsTab({ project }) {
  const { toast } = useToast();
  const [name, setName] = useState(project.name);
  const [status, setStatus] = useState(project.status);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Project name is required.');
      return;
    }
    setNameError('');
    setSaving(true);
    await simulateMutation(() => true, 600);
    setSaving(false);
    toast({
      title: 'Settings saved',
      description: `“${name.trim()}” was updated successfully.`,
      variant: 'success',
    });
  };

  const handleReset = () => {
    setName(project.name);
    setStatus(project.status);
    setNotifications(true);
    setNameError('');
    toast({ title: 'Changes discarded', description: 'Settings were reset to their saved values.', variant: 'info' });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader title="Project settings" subtitle="Manage the basics for this project" />
      <CardContent>
        <form onSubmit={handleSave} className="space-y-5" noValidate>
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            required
          />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </Select>
          <Switch
            label="Email notifications"
            description="Send the team an email when milestones are reached"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
              Discard
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs island                                                         */
/* ------------------------------------------------------------------ */

export function ProjectTabs({ project }) {
  const [tab, setTab] = useState('overview');
  const { tasks } = useTasks();

  const client = customerById[project.clientId];
  const members = useMemo(
    () => project.teamIds.map((id) => teamById[id]).filter(Boolean),
    [project]
  );
  const openTaskCount = useMemo(
    () => tasksForProject(project.id, tasks).filter((t) => t.status !== 'done').length,
    [project.id, tasks]
  );
  const overdue = new Date(project.deadline).getTime() < Date.now() && project.status !== 'completed';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Icon name="overview" className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <Icon name="tasks" className="h-4 w-4" />, badge: openTaskCount },
    { id: 'team', label: 'Team', icon: <Icon name="team" className="h-4 w-4" />, badge: members.length },
    { id: 'activity', label: 'Activity', icon: <Icon name="clock" className="h-4 w-4" /> },
    { id: 'files', label: 'Files', icon: <Icon name="doc" className="h-4 w-4" />, badge: project.files },
    { id: 'settings', label: 'Settings', icon: <Icon name="settings" className="h-4 w-4" /> },
  ];

  return (
    <div>
      <Tabs tabs={tabs} value={tab} onChange={setTab} ariaLabel="Project sections" />
      <TabPanel id="overview" active={tab === 'overview'}>
        <OverviewTab project={project} members={members} client={client} overdue={overdue} />
      </TabPanel>
      <TabPanel id="tasks" active={tab === 'tasks'}>
        <TasksTab project={project} />
      </TabPanel>
      <TabPanel id="team" active={tab === 'team'}>
        <TeamTab project={project} members={members} tasks={tasks} />
      </TabPanel>
      <TabPanel id="activity" active={tab === 'activity'}>
        <ActivityTab project={project} />
      </TabPanel>
      <TabPanel id="files" active={tab === 'files'}>
        <FilesTab project={project} />
      </TabPanel>
      <TabPanel id="settings" active={tab === 'settings'}>
        <SettingsTab project={project} />
      </TabPanel>
    </div>
  );
}
