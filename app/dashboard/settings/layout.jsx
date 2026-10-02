import { PageHeader } from '@/components/ui/PageHeader';
import SettingsTabs from './tabs';

export const metadata = { title: 'Settings' };

export default function SettingsLayout({ children }) {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, preferences, and how Nexora looks and feels."
      />
      <SettingsTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}
