'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/fields';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/providers';
import { useSettings, DEFAULT_SETTINGS } from '@/hooks/useSettings';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfilePage() {
  const { toast } = useToast();
  const { settings, updateSection, hydrated } = useSettings();
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS.profile });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hydrated) setForm({ ...settings.profile });
  }, [hydrated, settings.profile]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    setTimeout(() => {
      updateSection('profile', { ...form, name: form.name.trim(), email: form.email.trim() });
      setSaving(false);
      toast({ title: 'Profile saved', description: 'Your profile has been updated.', variant: 'success' });
    }, 600);
  };

  const handleReset = () => {
    const defaults = { ...DEFAULT_SETTINGS.profile };
    setForm(defaults);
    setErrors({});
    updateSection('profile', defaults);
    toast({ title: 'Profile reset', description: 'Profile restored to defaults.', variant: 'info' });
  };

  return (
    <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Avatar card */}
      <Card>
        <CardHeader title="Avatar" subtitle="Generated from your name" />
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <Avatar name={form.name.trim() || 'User'} size="xl" ring />
            <p className="text-sm font-medium text-slate-900 dark:text-white">{form.name.trim() || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {form.role.trim() || 'No role set'}
              {form.company.trim() ? ` · ${form.company.trim()}` : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form card */}
      <Card>
        <CardHeader
          title="Profile"
          subtitle="This information appears across the dashboard."
          action={
            <Button type="button" variant="outline" size="sm" onClick={handleReset} leftIcon={<Icon name="refresh" className="h-4 w-4" />}>
              Reset to defaults
            </Button>
          }
        />
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" required placeholder="Alex Morgan" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Email" required type="email" placeholder="alex@nexora.io" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Role" placeholder="Operations Manager" value={form.role} onChange={set('role')} />
            <Input label="Company" placeholder="Nexora Inc." value={form.company} onChange={set('company')} />
            <Input label="Phone" type="tel" placeholder="+1 (415) 555-0132" value={form.phone} onChange={set('phone')} />
            <div className="sm:col-span-2">
              <Textarea label="Bio" placeholder="Tell the team a little about yourself…" value={form.bio} onChange={set('bio')} rows={4} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving} leftIcon={<Icon name="check" className="h-4 w-4" />}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
