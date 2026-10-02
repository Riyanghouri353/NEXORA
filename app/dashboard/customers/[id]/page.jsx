import { notFound } from 'next/navigation';
import { customers, customerById } from '@/data/customers';
import { projectsForCustomer } from '@/data/projects';
import { transactionsForCustomer } from '@/data/transactions';
import { activitiesForCustomer } from '@/data/activities';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatDate, timeAgo } from '@/lib/utils';
import { CustomerTabs } from './CustomerTabs';
import { CustomerActions } from './CustomerActions';

// All customer ids are known at build time; unknown ids get a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return customers.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const customer = customerById[id];
  if (!customer) return { title: 'Customer not found' };
  return {
    title: `${customer.company} · Customers`,
    description: `${customer.company} — ${customer.industry} customer profile, projects, transactions, and activity.`,
  };
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value || '—'}</dd>
    </div>
  );
}

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  const customer = customerById[id];
  if (!customer) notFound();

  const custProjects = projectsForCustomer(id);
  const custTransactions = transactionsForCustomer(id);
  const custActivities = activitiesForCustomer(id);
  const activeProjects = custProjects.filter((p) => p.status === 'active').length;

  return (
    <div>
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {customer.company}
            <StatusBadge status={customer.status} />
          </span>
        }
        description={`${customer.industry} · ${customer.city}`}
        breadcrumbs={[{ label: 'Customers', href: '/dashboard/customers' }, { label: customer.company }]}
        actions={<CustomerActions customer={customer} />}
      />

      {/* Profile card */}
      <Card className="mb-6">
        <CardHeader title="Profile" subtitle="Contact and company details" />
        <CardContent>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar name={customer.company} size="xl" ring />
            <dl className="grid flex-1 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Contact" value={customer.contact} />
              <InfoItem label="Email" value={customer.email} />
              <InfoItem label="Phone" value={customer.phone} />
              <InfoItem label="Industry" value={customer.industry} />
              <InfoItem label="City" value={customer.city} />
              <InfoItem label="Address" value={customer.address} />
              <InfoItem label="Customer since" value={formatDate(customer.joinedAt)} />
              <InfoItem label="Last activity" value={timeAgo(customer.lastActivity)} />
            </dl>
          </div>
        </CardContent>
      </Card>

      <CustomerTabs
        customer={customer}
        projects={custProjects}
        transactions={custTransactions}
        activities={custActivities}
        activeProjects={activeProjects}
      />
    </div>
  );
}
