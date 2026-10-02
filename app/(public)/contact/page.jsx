import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { ContactForm } from '@/components/public/ContactForm';

export const metadata = {
  title: 'Contact — Nexora',
  description:
    'Get in touch with the Nexora team: sales questions, support, partnerships, and press. We reply within one business day.',
  openGraph: {
    title: 'Contact — Nexora',
    description: 'Questions about plans, migration, or Enterprise? Talk to a human within one business day.',
    type: 'website',
  },
};

const INFO_CARDS = [
  {
    icon: 'help',
    title: 'Sales',
    description: 'Plan questions, demos, and Enterprise quotes.',
    detail: 'sales@nexora.io',
    href: 'mailto:sales@nexora.io',
  },
  {
    icon: 'bell',
    title: 'Support',
    description: 'Product help and troubleshooting, 7 days a week.',
    detail: 'support@nexora.io',
    href: 'mailto:support@nexora.io',
  },
  {
    icon: 'globe',
    title: 'Press & partnerships',
    description: 'Media inquiries and integration partners.',
    detail: 'press@nexora.io',
    href: 'mailto:press@nexora.io',
  },
];

const OFFICES = [
  {
    city: 'San Francisco',
    address: '548 Market Street, Suite 400\nSan Francisco, CA 94104',
    detail: 'Headquarters · Sales & Engineering',
  },
  {
    city: 'London',
    address: '12 Rivington Street\nLondon EC2A 3DU, UK',
    detail: 'EMEA · Customer Success',
  },
  {
    city: 'Singapore',
    address: '8 Marina View, #43-01\nSingapore 018960',
    detail: 'APAC · Support & Partnerships',
  },
];

export default function ContactPage() {
  return (
    <main>
      {/* Header */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" dot>We reply within one business day</Badge>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Talk to a human
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Questions about plans, migration, or Enterprise? Send us a message —
              a real person on our team will get back to you.
            </p>
          </div>

          {/* Info cards */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
            {INFO_CARDS.map((c) => (
              <Card key={c.title} className="p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{c.title}</h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{c.description}</p>
                <a
                  href={c.href}
                  className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  {c.detail}
                </a>
              </Card>
            ))}
          </div>

          {/* Form + offices */}
          <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-5">
            <Card className="p-7 sm:p-9 lg:col-span-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Send us a message</h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Fields marked * are required.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Card>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our offices</h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Three hubs, one team — working across every timezone.
              </p>
              <div className="mt-6 space-y-4">
                {OFFICES.map((o) => (
                  <Card key={o.city} className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        <Icon name="globe" className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{o.city}</h3>
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {o.address}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-brand-700 dark:text-brand-300">{o.detail}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900 dark:bg-brand-950/40">
                <div className="flex items-start gap-3">
                  <Icon name="clock" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300" />
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Prefer to explore first?</span>
                    {' '}The live demo is open right now — no signup, no sales call.
                  </p>
                </div>
                <a
                  href="/dashboard/overview"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  Open the demo
                  <Icon name="arrowRight" className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
