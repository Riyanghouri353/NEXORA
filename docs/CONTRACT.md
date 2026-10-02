# NEXORA — Agent Contract

You are implementing pages for the Nexora Next.js app at `~/workspace/nexora-nextjs-stress-test/`.
The foundation (design system, theme, hooks, data, shell, charts) is **already built**. Read this entire
document before writing any code.

## Hard rules

- **JavaScript only.** No TypeScript, no `.ts`/`.tsx` files. Use `.js`/`.jsx`.
- **App Router.** Server components by default; add `'use client'` ONLY to components that need
  interactivity (state, effects, event handlers, browser APIs).
- **Client pages cannot export `metadata`.** If your page is a client component and needs metadata,
  create a sibling `layout.jsx` (server component) in the same route folder that exports `metadata`
  and renders `{children}`. Dashboard routes already have metadata from `app/dashboard/layout.jsx`,
  so metadata there is optional.
- **No new npm dependencies.** Use what's installed: `next@15.5.27`, `react@19`, `recharts@2.15.3`, `tailwindcss@3`.
- **Never re-implement a foundation component.** Import from the paths below. No duplicated Button/Table/Modal/etc.
- Path alias `@/` maps to the project root (e.g. `@/components/ui/Button`).
- Dark mode: always pair classes, e.g. `text-slate-900 dark:text-white`, `bg-white dark:bg-slate-900`,
  `border-slate-200 dark:border-slate-800`. Use `brand-*` (indigo) as the single accent color.
  No gradients except the logo mark; no random colors.
- Every interactive element must be keyboard reachable with visible focus (foundation handles `:focus-visible`).
- No placeholder pages, no dead buttons, no `TODO`s. If a button can't do something real, don't render it.

## Design system imports

```js
import { Button, IconButton } from '@/components/ui/Button';
import { Input, Textarea, Select, FilterSelect, SearchInput } from '@/components/ui/fields';
import { Checkbox, Switch } from '@/components/ui/toggles';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonChart } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Pagination } from '@/components/ui/Pagination';
import { DataTable } from '@/components/ui/DataTable';
import { KpiCard } from '@/components/ui/KpiCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon'; // <Icon name="projects" className="h-5 w-5" />
```

Icon names: overview, analytics, projects, customers, transactions, team, tasks, reports,
notifications, settings, help, search, plus, menu, x, chevronDown/Left/Right, sun, moon, monitor,
bell, check, calendar, download, printer, filter, pencil, trash, dots, arrowRight, clock, user,
logout, globe, doc, currency, eye, refresh, sparkles, command, grid, list.

## Key component APIs

- `<Button variant="primary|secondary|outline|ghost|danger|success" size="xs|sm|md|lg" loading disabled leftIcon rightIcon onClick>`
- `<Input label required error hint placeholder value onChange />` (same props for Textarea, Select)
- `<FilterSelect label="Status" value onChange>` with `<option>` children — for filter bars.
- `<SearchInput value onChange placeholder />`
- `<Checkbox label description checked onChange />`, `<Switch label description checked onChange />`
- `<Badge variant="neutral|primary|success|warning|danger|info" size="sm|md" dot>`, `<StatusBadge status="active" />`, `<PriorityBadge priority="high" />`
- `<Modal open onClose title description footer size="sm|md|lg|xl">`, `<Drawer open onClose title description footer position="right|left" size>`
- `<Dropdown trigger={<span/>} items={[{label, icon, href, onClick, danger, divider:true}]} align="left|right" label="Menu" />`
- `<Tabs tabs={[{id,label,icon,badge}]} value onChange />` + `<TabPanel id active={value==='x'}>`
- `<DataTable columns={[{key,label,sortable,render:(row)=>node,align:'left|right|center'}]} data keyField="id" sortKey sortDir onSort isLoading emptyTitle emptyDescription emptyAction rowHref={(row)=>'/path'} onRowClick mobileCard={(row)=>node} />`
- `<Pagination page totalPages onChange pageSize pageSizeOptions onPageSizeChange totalItems />`
- `<KpiCard title value change="+12.4%" changeLabel="vs last month" changeTone="up|down|neutral" icon description spark onClick />`
- `<PageHeader title description actions breadcrumbs={[{label, href}]} />`
- `<Progress value={0-100} variant showLabel />`, `<Avatar name size />`, `<AvatarStack names max />`
- `<EmptyState title description action />`, `<ErrorState title description onRetry retryLabel />`
- `<Tooltip content position="top">`

## Providers / hooks (all `'use client'`-safe)

```js
import { useTheme, useToast, useCommandPalette } from '@/components/providers';
// useTheme() -> { theme: 'light|dark|system', resolvedTheme, setTheme }
// useToast() -> { toast({title, description, variant: 'success|error|warning|info'}) }
// useCommandPalette() -> { open, setOpen, toggle }
import { useLocalStorage, useDebounce, useMediaQuery, useIsMobile } from '@/hooks/hooks';
import { useTasks, TASK_STATUSES, TASK_PRIORITIES } from '@/hooks/useTasks';
// useTasks() -> { tasks, addTask(input), updateTask(id, patch), deleteTask(id), moveTask(id,status), toggleComplete(id), resetAll() }
import { useNotifications, NOTIFICATION_CATEGORIES } from '@/hooks/useNotifications';
// -> { notifications, unreadCount, markRead(id), markUnread(id), markAllRead(), toggleRead(id) }
import { useDashboardLayout, DEFAULT_WIDGETS } from '@/hooks/useDashboardLayout';
// -> { widgets, visibleWidgets, toggleWidget(id), moveWidget(id,'up|down'), resetLayout() }
import { useSettings, DEFAULT_SETTINGS } from '@/hooks/useSettings';
// -> { settings, updateSection('profile'|'preferences'|'appearance', patch), resetSettings(), hydrated }
```

Quick-create: fire `window.dispatchEvent(new CustomEvent('nexora:quick-create', { detail: { kind: 'project'|'customer'|'task' } }))`
to open the global New Project / Add Customer / Create Task modal. Also exported: `import { TaskForm } from '@/components/shell/QuickCreate'` — reusable for editing tasks (accepts `defaults`).

## Data layer (`@/data/*`) — all synchronous, import directly

```js
import { customers, customerById, industries, CUSTOMER_STATUSES } from '@/data/customers';
// customer: { id, company, contact, email, phone, industry, city, status, revenue, joinedAt, lastActivity, address, notes }
import { projects, projectById, PROJECT_STATUSES, PROJECT_PRIORITIES, projectsForCustomer, projectsForMember } from '@/data/projects';
// project: { id, name, clientId, description, status, priority, progress, teamIds, leadId, budget, spent, startDate, deadline, tags, files }
import { transactions, transactionById, TRANSACTION_TYPES, TRANSACTION_STATUSES, transactionsForCustomer } from '@/data/transactions';
// transaction: { id, customerId, amount, type, status, method, date, description, reference }
import { baseTasks, taskById, tasksForProject, tasksForMember } from '@/data/tasks';
// task: { id, title, description, assigneeId, projectId, priority, dueDate, status, createdAt } — status: backlog|todo|in-progress|review|done
import { teamMembers, teamById, departments } from '@/data/team';
// member: { id, name, role, department, email, status: active|away|offline, lastActive, tasksCompleted, productivity }
import { baseNotifications } from '@/data/notifications';
// notification: { id, category: project|task|transaction|team|system, title, message, read, createdAt, link }
import { activities, activitiesForProject, activitiesForCustomer } from '@/data/activities';
// activity: { id, type, text, actorId, projectId, customerId, createdAt }
import { reports, REPORT_TYPES, buildReportPreview } from '@/data/reports';
// report: { id, type, title, description, generatedAt, status: ready|draft, period }
import { revenueSeries, customerGrowthSeries, projectCompletionSeries, funnelStages, geoDistribution, teamProductivitySeries } from '@/data/index';
// revenueSeries('7d'|'30d'|'90d'|'12m') -> [{ label, revenue, expenses, profit }]
```

Simulated async: `import { simulateFetch, simulateMutation, simulateFetchWithError, delay } from '@/lib/api'`.
Use for loading/error states: `const data = await simulateFetch(() => computeExpensiveThing())` inside `useEffect`,
or `simulateFetchWithError(selector, shouldFail)` for the error-simulation toggle.

## Charts

```js
import { RevenueChart, Sparkline, BarsChart } from '@/components/charts/charts';
// <RevenueChart data={revenueSeries('30d')} height={320} showExpenses showProfit />
// <Sparkline data={[..numbers]} color="#4f46e5" height={44} width={120} />
// <BarsChart data={[{label, a, b}]} dataKeys={[{key:'a', name:'A', color:'#4f46e5'}]} height={300} layout="horizontal|vertical" />
import { DonutChart, FunnelChart } from '@/components/charts/distribution';
// <DonutChart data={[{label, value, color?}]} height={260} centerLabel centerValue />
// <FunnelChart stages={funnelStages()} />
```
All chart components are `'use client'` and theme-aware. Charts MUST be interactive where the spec says so
(range selectors that change `data`).

## Formatting utils (`@/lib/utils`)

`cn`, `formatCurrency`, `formatCompactCurrency`, `formatNumber`, `formatPercent`, `formatDate`,
`formatDateTime`, `timeAgo`, `initials`.

CSV: `import { toCSV, downloadCSV } from '@/lib/csv'` →
`downloadCSV('transactions.csv', toCSV(rows, [{label:'ID', key:'id'}, {label:'Amount', get:(r)=>r.amount}]))`.

## Standard page patterns

**List page** (`'use client'`): read initial filter state from `useSearchParams`, keep filters in the URL
via `router.replace` (shareable filters), debounce search with `useDebounce`, filter/sort/paginate with
`useMemo`, render `PageHeader` + filter bar + `DataTable` (with `mobileCard`) + `Pagination`.
Simulate loading on first mount with `simulateFetch`; support `?simulate=error` or a local "Simulate error"
toggle rendering `ErrorState` with retry.

**Detail page** (server component): import data directly, `notFound()` when the id is unknown,
`PageHeader` with breadcrumbs, tabbed sections with a small client `Tabs` island where needed.

**Forms**: validate on submit, show inline `error` props, simulate latency, toast on success.

**Density**: respect `settings.appearance.density` only if trivial (skip is fine — layout handles base).

**Reduced motion**: animations are CSS-based and disabled via `prefers-reduced-motion` in globals.css.

## Public pages

Under `app/(public)/` — server components with exported `metadata` (title, description, openGraph).
Use `SiteHeader`/`SiteFooter` from the `(public)/layout.jsx` automatically; just export page content.

## What NOT to do

- Don't create `components/ui/*` files or re-implement Badge/Button/Table/etc.
- Don't add `'use client'` to pure presentational components.
- Don't fetch from any URL. No `fetch()` to external APIs. Everything is local.
- Don't leave console.log statements.
