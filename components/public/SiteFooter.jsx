import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Docs', href: '/docs' },
      { label: 'Dashboard', href: '/dashboard/overview' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/about' },
      { label: 'Press', href: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API reference', href: '/docs' },
      { label: 'Help center', href: '/dashboard/help' },
      { label: 'Status', href: '/dashboard/overview' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/about' },
      { label: 'Terms', href: '/about' },
      { label: 'Security', href: '/docs' },
      { label: 'DPA', href: '/docs' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Nexora home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Nexora</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
              The operations intelligence platform for modern teams. Monitor, manage, and grow — from one workspace.
            </p>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              Demo application. All data is fictional and stored locally in your browser.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label + l.href}>
                    <Link href={l.href} className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 Nexora Inc. All rights reserved.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Built with Next.js 15 · React 19 · Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
