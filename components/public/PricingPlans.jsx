'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For small teams getting organized.',
    monthly: 19,
    cta: 'Start free trial',
    icon: 'sparkles',
    features: ['Up to 5 projects', '3 team seats', 'Core analytics dashboards', 'Task management', 'Email support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'For growing teams that run on data.',
    monthly: 49,
    cta: 'Start free trial',
    icon: 'analytics',
    popular: true,
    features: [
      'Unlimited projects',
      'Up to 25 team seats',
      'Advanced analytics & forecasting',
      'Automation workflows',
      'Custom reports',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For organizations at scale.',
    monthly: null,
    cta: 'Talk to sales',
    icon: 'grid',
    features: [
      'Everything in Professional',
      'Unlimited seats & workspaces',
      'SSO / SAML & audit logs',
      'Dedicated success manager',
      'Custom SLAs & onboarding',
    ],
  },
];

function planPrice(plan, yearly) {
  if (plan.monthly == null) return null;
  return yearly ? Math.round(plan.monthly * 0.8) : plan.monthly;
}

export function PricingPlans() {
  const [yearly, setYearly] = useState(true);

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3" role="group" aria-label="Billing period">
        <button
          type="button"
          aria-pressed={!yearly}
          onClick={() => setYearly(false)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition',
            !yearly
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={yearly}
          onClick={() => setYearly(true)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition',
            yearly
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          )}
        >
          Yearly
        </button>
        <Badge variant="success" dot>
          Save 20%
        </Badge>
      </div>

      {/* Plan cards */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3" aria-live="polite">
        {PLANS.map((plan) => {
          const price = planPrice(plan, yearly);
          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-white p-8 transition dark:bg-slate-900',
                plan.popular
                  ? 'border-brand-600 shadow-xl shadow-brand-600/10 dark:border-brand-500'
                  : 'border-slate-200 dark:border-slate-800'
              )}
            >
              {plan.popular && (
                <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <Icon name={plan.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{plan.tagline}</p>
              <div className="mt-6 flex h-16 items-end">
                {price != null ? (
                  <div>
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      ${price}
                    </span>
                    <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">/ mo</span>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {yearly ? `Billed annually ($${price * 12}/yr)` : 'Billed monthly'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Custom
                    </span>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Tailored to your organization
                    </p>
                  </div>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/dashboard/overview" aria-label={`${plan.cta} — ${plan.name}`}>
                  <Button variant={plan.popular ? 'primary' : 'secondary'} size="lg" className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
