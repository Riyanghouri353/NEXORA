import { DashboardShell } from '@/components/shell/DashboardShell';

export const metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Nexora Dashboard',
  },
  description: 'Nexora operations dashboard — monitor performance, projects, customers, and teams.',
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
