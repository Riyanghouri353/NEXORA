# NEXORA — Operations Intelligence Platform

A large, realistic, multi-page SaaS web application built with **Next.js 15 (App Router), React 19, and Tailwind CSS — in JavaScript only**. Nexora is an operations intelligence dashboard for companies: monitor business performance, manage projects and customers, inspect transactions, lead teams, track tasks, analyze reports, and manage notifications — all from one workspace.

This project was built as a frontend engineering exercise: no database, no backend, no API keys. All data is realistic local mock data with simulated async behavior.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5.27 (App Router) |
| Language | JavaScript only — no TypeScript anywhere |
| UI | React 19 |
| Styling | Tailwind CSS 3 (class-based dark mode) |
| Charts | Recharts 2.15 |
| State | React state + Context + URL search params + localStorage |
| Data | Local JS modules (`/data`) with seeded deterministic generation |

> **Why Next.js 15.5.27:** 15.5.3 carries CVE-2025-66478 and Vercel blocks deployments of it. 15.5.27 is the patched stable release in the same minor line.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (must pass with zero errors)
npm start        # serve the production build
```

No environment variables, no database setup, no external services required.

## Folder structure

```
app/
  layout.jsx                 # root layout: theme no-flash script, providers, metadata
  globals.css                # Tailwind + theme vars, focus states, scrollbars, print
  not-found.jsx              # custom 404
  (public)/
    layout.jsx               # marketing shell (SiteHeader / SiteFooter)
    page.jsx                 # homepage (13 sections)
    pricing|features|about|contact|docs/page.jsx
  dashboard/
    layout.jsx               # dashboard shell (sidebar, topnav, mobile nav)
    loading.jsx / error.jsx  # route-level loading + error boundaries
    page.jsx                 # redirects to /dashboard/overview
    overview/page.jsx        # KPI dashboard, charts, widget customization
    analytics/page.jsx       # deep analytics with filters + comparison mode
    projects/page.jsx        # filterable/sortable project list (table + grid)
    projects/[id]/page.jsx   # project detail (static params, tabbed)
    customers/page.jsx       # customer list
    customers/[id]/page.jsx  # customer detail (static params, tabbed)
    transactions/page.jsx    # transactions + real CSV export
    team/page.jsx            # team directory + productivity charts
    tasks/page.jsx           # Kanban board (persisted)
    reports/page.jsx         # reports center + preview/print/CSV
    notifications/page.jsx   # notification center (persisted read state)
    settings/
      profile|preferences|appearance/page.jsx
    help/page.jsx
components/
  ui/                        # design system (Button, Input, Select, Modal, Drawer,
                             # Dropdown, Tabs, Badge, Card, Table, Pagination, Toast,
                             # Skeleton, EmptyState, ErrorState, Avatar, Progress,
                             # Breadcrumb, CommandPalette pieces, KpiCard, …)
  charts/                    # RevenueChart, BarsChart, Sparkline, DonutChart, FunnelChart
  shell/                     # Sidebar, TopNav, MobileNav, CommandPalette, QuickCreate
  public/                    # SiteHeader, SiteFooter, FAQ/pricing/contact/docs islands
  providers.jsx              # ThemeProvider, ToastProvider, CommandPaletteProvider
data/
  team.js (20) · customers.js (30) · projects.js (25) · transactions.js (50)
  tasks.js (40) · notifications.js (50) · activities.js (30) · reports.js
  index.js                   # re-exports + chart series generators
hooks/
  hooks.js                   # useLocalStorage, useDebounce, useMediaQuery
  useTasks.js                # task store (mock + localStorage overlay)
  useNotifications.js        # read-state store (localStorage)
  useDashboardLayout.js      # widget visibility/order (localStorage)
  useSettings.js             # profile/preferences/appearance (localStorage)
lib/
  utils.js · csv.js · api.js (simulated latency) · chartTheme.js · nav.js
docs/
  CONTRACT.md                # component/data API contract used during construction
```

## Routes

**Public:** `/`, `/pricing`, `/features`, `/about`, `/contact`, `/docs`

**App:** `/dashboard` → `/dashboard/overview`, `/dashboard/analytics`, `/dashboard/projects`,
`/dashboard/projects/[id]`, `/dashboard/customers`, `/dashboard/customers/[id]`,
`/dashboard/transactions`, `/dashboard/team`, `/dashboard/tasks`, `/dashboard/reports`,
`/dashboard/notifications`, `/dashboard/settings` → `/dashboard/settings/profile`,
`/dashboard/settings/preferences`, `/dashboard/settings/appearance`, `/dashboard/help`

Plus a custom `/404` (`app/not-found.jsx`) and dashboard `loading.jsx` / `error.jsx` boundaries.

## Mock-data strategy

- All entities live in `/data/*.js` as plain modules with **stable ids** (`cus-001`, `prj-001`, …).
- Relationships are by id: projects → customers + team members, transactions → customers,
  tasks → projects + members, activities → all of the above. Detail pages derive related
  records from these links — nothing is duplicated.
- Bulk records are generated with a **seeded PRNG** (`seededRandom` in `lib/utils.js`), so data
  is deterministic across builds but still realistic (real company/person names, no "Test User 1").
- `lib/api.js` adds simulated network latency (`simulateFetch`, `simulateMutation`,
  `simulateFetchWithError`) so loading / error / retry states are genuinely exercised.
- User mutations (tasks, notification read state, dashboard layout, settings, customer notes)
  are overlaid in **localStorage** and merged over the mock base — the UI architecture is
  backend-ready: replace the `data/*` selectors with API calls and the pages keep working.

## Key features

- **Dashboard:** 6 KPI cards, interactive revenue chart (7d/30d/90d/12m), performance section,
  activity feed, project health, quick actions, and a customizable widget layout persisted to localStorage.
- **Command palette** (`Cmd/Ctrl+K`): navigation + actions, keyboard navigable, categorized.
- **Global quick-create:** New Project / Add Customer / Create Task modals with validation, available everywhere.
- **Projects:** URL-synced filters, sorting, pagination, table/grid views, mobile filter drawer, dynamic detail pages.
- **Customers:** searchable/filterable list, detail pages with tabs (projects, transactions, activity, localStorage notes).
- **Transactions:** date-range + multi-filter table, detail modal, **real CSV export of filtered rows**.
- **Tasks:** Kanban (Backlog → Done) with keyboard-accessible card movement, create/edit/delete/complete, persisted.
- **Reports:** 5 report types, live previews computed from mock data, print, CSV export, mock generation flow.
- **Notifications:** category filters, grouping, persisted read/unread state.
- **Settings:** profile, preferences, appearance (theme/density/sidebar/motion) — all persisted.
- **Theme:** light / dark / system with an inline head script — no flash of the wrong theme.
- **Mobile:** slide-out nav, bottom tab bar, card-transformed tables, drawer filters, touch-friendly controls.
- **Accessibility:** semantic HTML, skip link, focus-visible rings, aria-labeled dialogs/menus/tabs, keyboard-operable Kanban and palette.

## Deployment

```bash
npm run build   # verify green
```

Deploy to Vercel: import the repository, framework preset **Next.js**, no env vars needed.
Every push to `main` redeploys. The app is fully static-friendly (all dynamic routes use
`generateStaticParams`).

## Design decisions

- **No Redux / no data-fetching library.** React state + Context + URL params + localStorage cover
  every state need; URL params make filters shareable.
- **Client components only where interactivity requires it.** List pages and islands are client;
  detail pages and marketing pages are server components.
- **Recharts 2.15** (not v3): stable API, React 19 compatible, no migration risk.
- **Buttons move Kanban cards** instead of drag-and-drop: fully keyboard accessible and dependency-free,
  as the spec allows.
- **Single accent color** (indigo `brand-*`) + slate neutrals; no gradient soup, no random colors.
- **Tailwind v3** (not v4): stable PostCSS pipeline with Next.js 15.

## Known limitations

- All data is fictional and resets to the mock baseline on a fresh browser (localStorage overlays are per-browser).
- "Create Project / Add Customer" persist only as toasts in this mock build — tasks are the fully persisted entity.
- No real authentication: sign-in/out are mock affordances.
- Charts use generated series (seeded) rather than the transaction ledger, to keep range switching instant.
- Search is local and prefix/substring based — no full-text index.
