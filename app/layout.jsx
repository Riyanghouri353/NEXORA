import './globals.css';
import { AppProviders } from '@/components/providers';

export const metadata = {
  title: {
    default: 'Nexora — Operations Intelligence Platform',
    template: '%s | Nexora',
  },
  description:
    'Nexora is an operations intelligence platform to monitor business performance, manage projects and customers, track transactions, and lead teams — all in one place.',
  keywords: ['operations', 'analytics', 'project management', 'CRM', 'dashboard', 'SaaS'],
  authors: [{ name: 'Nexora' }],
  openGraph: {
    title: 'Nexora — Operations Intelligence Platform',
    description:
      'Monitor performance, manage projects and customers, track transactions, and lead your team from one intelligent workspace.',
    type: 'website',
    siteName: 'Nexora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexora — Operations Intelligence Platform',
    description: 'One intelligent workspace for operations, projects, customers, and teams.',
  },
  metadataBase: new URL('https://nexora.example.com'),
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('nexora-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
