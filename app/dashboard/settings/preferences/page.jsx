'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/fields';
import { Switch } from '@/components/ui/toggles';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/providers';
import { useSettings, DEFAULT_SETTINGS } from '@/hooks/useSettings';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
];

const TIMEZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-12-31)' },
];

export default function PreferencesPage() {
  const { toast } = useToast();
  const { settings, updateSection, hydrated } = useSettings();
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS.preferences });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hydrated) setForm({ ...settings.preferences });
  }, [hydrated, settings.preferences]);

  const setSelect = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setToggle = (key) => (next) => setForm((prev) => ({ ...prev, [key]: next }));

  const handleSave = (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setTimeout(() => {
      updateSection('preferences', form);
      setSaving(false);
      toast({ title: 'Preferences saved', description: 'Your preferences have been updated.', variant: 'success' });
    }, 500);
  };

  return (
    <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Localization" subtitle="How dates, times, and language appear." />
        <CardContent>
          <div className="space-y-4">
            <Select label="Language" value={form.language} onChange={setSelect('language')}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
            <Select label="Timezone" value={form.timezone} onChange={setSelect('timezone')}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </Select>
            <Select label="Date format" value={form.dateFormat} onChange={setSelect('dateFormat')}>
              {DATE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
            <Select label="Week starts on" value={form.weekStartsOn} onChange={setSelect('weekStartsOn')}>
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="saturday">Saturday</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Notifications" subtitle="Choose what reaches you and how." />
        <CardContent>
          <div className="space-y-5">
            <Switch
              label="Email notifications"
              description="Important updates delivered to your inbox."
              checked={form.emailNotifications}
              onChange={setToggle('emailNotifications')}
            />
            <Switch
              label="Push notifications"
              description="Real-time alerts in your browser."
              checked={form.pushNotifications}
              onChange={setToggle('pushNotifications')}
            />
            <Switch
              label="Weekly digest"
              description="A summary of your week, every Monday morning."
              checked={form.weeklyDigest}
              onChange={setToggle('weeklyDigest')}
            />
            <Switch
              label="Task reminders"
              description="Nudges before tasks are due."
              checked={form.taskReminders}
              onChange={setToggle('taskReminders')}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving} leftIcon={<Icon name="check" className="h-4 w-4" />}>
              {saving ? 'Saving…' : 'Save preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
