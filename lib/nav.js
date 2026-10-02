/* Single source of truth for the dashboard navigation.
   Used by: Sidebar, MobileNav, TopNav breadcrumbs, CommandPalette. */

export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Overview', href: '/dashboard/overview', icon: 'overview' },
      { label: 'Analytics', href: '/dashboard/analytics', icon: 'analytics' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Projects', href: '/dashboard/projects', icon: 'projects' },
      { label: 'Customers', href: '/dashboard/customers', icon: 'customers' },
      { label: 'Transactions', href: '/dashboard/transactions', icon: 'transactions' },
      { label: 'Team', href: '/dashboard/team', icon: 'team' },
      { label: 'Tasks', href: '/dashboard/tasks', icon: 'tasks' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Reports', href: '/dashboard/reports', icon: 'reports' },
      { label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
      { label: 'Help', href: '/dashboard/help', icon: 'help' },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

/* Breadcrumb labels for dashboard routes (dynamic segments resolved at runtime) */
export const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/dashboard/overview': 'Overview',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/projects': 'Projects',
  '/dashboard/customers': 'Customers',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/team': 'Team',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/reports': 'Reports',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Settings',
  '/dashboard/settings/profile': 'Profile',
  '/dashboard/settings/preferences': 'Preferences',
  '/dashboard/settings/appearance': 'Appearance',
  '/dashboard/help': 'Help',
};

export function breadcrumbsForPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Dashboard', href: '/dashboard/overview' }];
  let acc = '';
  for (const seg of segments.slice(1)) {
    acc += '/' + seg;
    const full = '/dashboard' + acc;
    // dynamic ids: show a generic label (detail pages add their own crumb)
    if (/^\d+$/.test(seg) || /^[a-z]+-\d+$/i.test(seg)) {
      crumbs.push({ label: 'Details' });
    } else {
      crumbs.push({ label: ROUTE_LABELS[full] || seg, href: undefined });
    }
  }
  return crumbs;
}
