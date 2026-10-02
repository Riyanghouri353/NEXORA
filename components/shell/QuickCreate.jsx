'use client';

import { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/fields';
import { useToast } from '@/components/providers';
import { useTasks, TASK_PRIORITIES } from '@/hooks/useTasks';
import { customers } from '@/data/customers';
import { projects, PROJECT_PRIORITIES } from '@/data/projects';
import { teamMembers } from '@/data/team';
import { simulateMutation } from '@/lib/api';
import { cn } from '@/lib/utils';

/* Listens for `nexora:quick-create` window events: { detail: { kind: 'project'|'customer'|'task' } }
   Rendered once inside the dashboard layout. */

function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const v = values[field];
    if (rule.required && (!v || String(v).trim() === '')) errors[field] = rule.message || 'This field is required.';
    else if (rule.email && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[field] = 'Enter a valid email address.';
    else if (rule.min && v && Number(v) < rule.min) errors[field] = `Must be at least ${rule.min}.`;
  }
  return errors;
}

function FieldGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function ProjectForm({ onDone }) {
  const { toast } = useToast();
  const [values, setValues] = useState({ name: '', clientId: '', description: '', budget: '', deadline: '', priority: 'medium', teamIds: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const toggleMember = (id) => {
    setValues((p) => ({
      ...p,
      teamIds: p.teamIds.includes(id) ? p.teamIds.filter((x) => x !== id) : [...p.teamIds, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(values, {
      name: { required: true, message: 'Project name is required.' },
      clientId: { required: true, message: 'Choose a client.' },
      budget: { required: true, min: 1000 },
      deadline: { required: true, message: 'Set a deadline.' },
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await simulateMutation(() => true, 700);
    setSaving(false);
    toast({ title: 'Project created', description: `"${values.name}" was added to your portfolio (mock).`, variant: 'success' });
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-4">
        <Input label="Project name" required placeholder="e.g. Aurora Data Platform" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
        <FieldGrid>
          <Select label="Client" required value={values.clientId} onChange={(e) => set('clientId', e.target.value)} error={errors.clientId}>
            <option value="">Select a client…</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
          </Select>
          <Select label="Priority" value={values.priority} onChange={(e) => set('priority', e.target.value)}>
            {PROJECT_PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
          <Input label="Budget (USD)" required type="number" min="0" step="1000" placeholder="120000" value={values.budget} onChange={(e) => set('budget', e.target.value)} error={errors.budget} />
          <Input label="Deadline" required type="date" value={values.deadline} onChange={(e) => set('deadline', e.target.value)} error={errors.deadline} />
        </FieldGrid>
        <Textarea label="Description" placeholder="Goals, scope, and success criteria…" value={values.description} onChange={(e) => set('description', e.target.value)} />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Team members</p>
          <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            {teamMembers.map((m) => {
              const selected = values.teamIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    selected
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                  )}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={saving}>Create project</Button>
      </div>
    </form>
  );
}

function CustomerForm({ onDone }) {
  const { toast } = useToast();
  const [values, setValues] = useState({ company: '', name: '', email: '', phone: '', industry: 'Technology', status: 'trial' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(values, {
      company: { required: true, message: 'Company name is required.' },
      name: { required: true, message: 'Contact name is required.' },
      email: { required: true, email: true },
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await simulateMutation(() => true, 700);
    setSaving(false);
    toast({ title: 'Customer added', description: `${values.company} was added (mock).`, variant: 'success' });
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-4">
        <FieldGrid>
          <Input label="Company" required placeholder="Acme Corp" value={values.company} onChange={(e) => set('company', e.target.value)} error={errors.company} />
          <Input label="Contact name" required placeholder="Jane Smith" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
          <Input label="Email" required type="email" placeholder="jane@acme.com" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
          <Select label="Industry" value={values.industry} onChange={(e) => set('industry', e.target.value)}>
            {['Technology', 'Retail', 'Healthcare', 'Finance', 'Logistics', 'Manufacturing', 'Energy', 'Media', 'Education', 'Hospitality', 'Other'].map((i) => <option key={i}>{i}</option>)}
          </Select>
          <Select label="Status" value={values.status} onChange={(e) => set('status', e.target.value)}>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </Select>
        </FieldGrid>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={saving}>Add customer</Button>
      </div>
    </form>
  );
}

function TaskForm({ onDone, defaults = {} }) {
  const { toast } = useToast();
  const { addTask } = useTasks();
  const [values, setValues] = useState({
    title: defaults.title || '',
    description: defaults.description || '',
    assigneeId: defaults.assigneeId || '',
    projectId: defaults.projectId || '',
    priority: defaults.priority || 'medium',
    dueDate: defaults.dueDate || '',
    status: defaults.status || 'todo',
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
    const task = await simulateMutation(() => addTask({
      title: values.title.trim(),
      description: values.description.trim(),
      assigneeId: values.assigneeId || null,
      projectId: values.projectId || null,
      priority: values.priority,
      dueDate: values.dueDate ? new Date(values.dueDate + 'T12:00:00').toISOString() : null,
      status: values.status,
    }), 600);
    setSaving(false);
    toast({ title: 'Task created', description: `"${task.title}" was added to ${values.status === 'todo' ? 'To Do' : values.status}.`, variant: 'success' });
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-4">
        <Input label="Title" required placeholder="e.g. Review Q3 analytics draft" value={values.title} onChange={(e) => set('title', e.target.value)} error={errors.title} />
        <Textarea label="Description" placeholder="Context, acceptance criteria…" value={values.description} onChange={(e) => set('description', e.target.value)} />
        <FieldGrid>
          <Select label="Assignee" required value={values.assigneeId} onChange={(e) => set('assigneeId', e.target.value)} error={errors.assigneeId}>
            <option value="">Select a teammate…</option>
            {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
          </Select>
          <Select label="Project" value={values.projectId} onChange={(e) => set('projectId', e.target.value)}>
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select label="Priority" value={values.priority} onChange={(e) => set('priority', e.target.value)}>
            {TASK_PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
          <Input label="Due date" type="date" value={values.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </FieldGrid>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={saving}>Create task</Button>
      </div>
    </form>
  );
}

const TITLES = {
  project: 'New project',
  customer: 'Add customer',
  task: 'Create task',
};

export function QuickCreate() {
  const [kind, setKind] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const k = e.detail && e.detail.kind;
      if (k === 'project' || k === 'customer' || k === 'task') setKind(k);
    };
    window.addEventListener('nexora:quick-create', handler);
    return () => window.removeEventListener('nexora:quick-create', handler);
  }, []);

  const close = useCallback(() => setKind(null), []);

  return (
    <>
      <Modal open={kind === 'project'} onClose={close} title={TITLES.project} description="Spin up a new client engagement." size="lg">
        <ProjectForm onDone={close} />
      </Modal>
      <Modal open={kind === 'customer'} onClose={close} title={TITLES.customer} description="Add a company to your CRM." size="lg">
        <CustomerForm onDone={close} />
      </Modal>
      <Modal open={kind === 'task'} onClose={close} title={TITLES.task} description="Capture work for your team." size="lg">
        <TaskForm onDone={close} />
      </Modal>
    </>
  );
}

/* Re-export TaskForm so the Tasks page can reuse it for editing. */
export { TaskForm };
