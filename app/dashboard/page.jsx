import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardRoot() {
  redirect('/dashboard/overview');
}
