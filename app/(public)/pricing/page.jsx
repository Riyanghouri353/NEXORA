import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { PricingPlans } from '@/components/public/PricingPlans';
import { FaqAccordion } from '@/components/public/FaqAccordion';

export const metadata = {
  title: 'Pricing — Nexora',
  description:
    'Simple, transparent pricing for teams of every size. Starter $19, Professional $49, Enterprise custom. Yearly billing saves 20%.',
  openGraph: {
    title: 'Pricing — Nexora',
    description: 'Starter $19, Professional $49, Enterprise custom. Try free for 14 days.',
    type: 'website',
  },
};

const COMPARISON = [
  { feature: 'Projects', starter: 'Up to 5', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Team seats', starter: '3', pro: 'Up to 25', enterprise: 'Unlimited' },
  { feature: 'Analytics dashboards', starter: 'Core', pro: 'Advanced + forecasting', enterprise: 'Advanced + forecasting' },
  { feature: 'Custom reports', starter: false, pro: true, enterprise: true },
  { feature: 'Automation workflows', starter: false, pro: true, enterprise: true },
  { feature: 'Integrations', starter: '10', pro: 'All', enterprise: 'All + custom' },
  { feature: 'API access', starter: false, pro: true, enterprise: true },
  { feature: 'SSO / SAML', starter: false, pro: false, enterprise: true },
  { feature: 'Audit logs', starter: false, pro: false, enterprise: true },
  { feature: 'Dedicated success manager', starter: false, pro: false, enterprise: true },
  { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: '24/7 + SLA' },
];

function Cell({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex justify-center">
        <Icon name="check" className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex justify-center">
        <Icon name="x" className="h-5 w-5 text-slate-300 dark:text-slate-700" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return <span className="text-sm text-slate-600 dark:text-slate-300">{value}</span>;
}

const FAQS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — every plan starts with a 14-day free trial. No credit card required, and your data is preserved if you decide to upgrade later.',
  },
  {
    q: 'How does yearly billing work?',
    a: 'Yearly billing saves you 20% compared to paying monthly. You are billed once per year, and you can add or remove seats at any time — we prorate the difference automatically.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Anytime. Upgrades take effect immediately with prorated billing; downgrades apply at the end of your current billing cycle. Nothing is ever locked in.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit cards for self-serve plans. Enterprise customers can pay by invoice, ACH, or wire transfer with annual terms.',
  },
  {
    q: 'Do you offer discounts?',
    a: 'Yes: 30% off for early-stage startups and registered nonprofits for the first year, plus volume pricing on Enterprise. Talk to our team to apply.',
  },
];

export default function PricingPage() {
  return (
    <main>
      {/* Header */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" dot>
              14-day free trial on every plan
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Pricing that scales with your ambition
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Start small, grow without friction. Switch to yearly billing and save 20% —
              no hidden fees, no surprises.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-6xl">
            <PricingPlans />
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Compare plans in detail
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Everything you need to pick the right fit for your team.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">Feature comparison across Nexora plans</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Feature
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Starter
                  </th>
                  <th scope="col" className="px-6 py-4 text-center">
                    <span className="inline-flex flex-col items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Professional</span>
                      <Badge variant="primary" size="sm">Most popular</Badge>
                    </span>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 1 ? 'bg-slate-50/70 dark:bg-slate-800/30' : undefined}
                  >
                    <th scope="row" className="px-6 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {row.feature}
                    </th>
                    <td className="px-6 py-3.5 text-center"><Cell value={row.starter} /></td>
                    <td className="px-6 py-3.5 text-center"><Cell value={row.pro} /></td>
                    <td className="px-6 py-3.5 text-center"><Cell value={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enterprise banner */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-8 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Need something custom? Let's talk Enterprise.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                SSO, audit logs, custom SLAs, dedicated onboarding, and volume pricing —
                built around how your organization actually works.
              </p>
            </div>
            <Link href="/contact" className="shrink-0">
              <Button variant="primary" size="lg" rightIcon={<Icon name="arrowRight" className="h-4 w-4" />}>
                Contact sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pricing questions
            </h2>
          </div>
          <div className="mt-10">
            <FaqAccordion items={FAQS} />
          </div>
        </div>
      </section>
    </main>
  );
}
