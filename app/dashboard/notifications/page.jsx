'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { SearchInput, FilterSelect } from '@/components/ui/fields';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/states';
import { useToast } from '@/components/providers';
import { useNotifications, NOTIFICATION_CATEGORIES } from '@/hooks/useNotifications';
import { useDebounce } from '@/hooks/hooks';
import { simulateFetch } from '@/lib/api';
import { cn, timeAgo, formatDateTime } from '@/lib/utils';

const CATEGORY_ICON = {
  project: 'projects',
  task: 'tasks',
  transaction: 'transactions',
  team: 'team',
  system: 'bell',
};

function dayGroup(iso) {
  const atMidnight = (value) => {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const day = atMidnight(iso);
  const today = atMidnight(new Date());
  if (day === today) return 'Today';
  if (day === today - 86400000) return 'Yesterday';
  return 'Earlier';
}

function categoryLabel(id) {
  return NOTIFICATION_CATEGORIES.find((c) => c.id === id)?.label || id;
}

function NotificationRow({ notification, onToggleRead, onMarkRead }) {
  const n = notification;
  return (
    <article
      aria-label={`${n.read ? '' : 'Unread: '}${n.title}`}
      className={cn(
        'flex items-start gap-3.5 rounded-xl border p-4 transition',
        n.read
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'border-brand-200 bg-brand-50/50 dark:border-brand-900/60 dark:bg-brand-950/25'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          n.read
            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            : 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300'
        )}
      >
        <Icon name={CATEGORY_ICON[n.category] || 'bell'} className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {!n.read && <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
          <h3
            className={cn(
              'min-w-0 flex-1 text-sm',
              n.read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'
            )}
          >
            <Link
              href={n.link}
              onClick={onMarkRead}
              className="transition hover:text-brand-600 hover:underline dark:hover:text-brand-400"
            >
              {n.title}
            </Link>
          </h3>
          <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-slate-500" title={formatDateTime(n.createdAt)}>
            {timeAgo(n.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{n.message}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge variant="neutral" size="sm">
            {categoryLabel(n.category)}
          </Badge>
          <Link
            href={n.link}
            onClick={onMarkRead}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 transition hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            View
            <Icon name="arrowRight" className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Button variant="ghost" size="xs" onClick={onToggleRead} className="ml-auto">
            {n.read ? 'Mark as unread' : 'Mark as read'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const { notifications, unreadCount, markRead, markAllRead, toggleRead } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let live = true;
    simulateFetch(() => true, 500).then(() => {
      if (live) setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  const unreadByCategory = useMemo(() => {
    const counts = { all: 0 };
    notifications.forEach((n) => {
      if (!n.read) {
        counts.all += 1;
        counts[n.category] = (counts[n.category] || 0) + 1;
      }
    });
    return counts;
  }, [notifications]);

  const tabs = useMemo(
    () =>
      NOTIFICATION_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        icon: c.id === 'all' ? null : <Icon name={CATEGORY_ICON[c.id]} className="h-4 w-4" aria-hidden="true" />,
        badge: unreadByCategory[c.id] > 0 ? unreadByCategory[c.id] : undefined,
      })),
    [unreadByCategory]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return notifications.filter((n) => {
      if (category !== 'all' && n.category !== category) return false;
      if (readFilter === 'unread' && n.read) return false;
      if (readFilter === 'read' && !n.read) return false;
      if (q && !`${n.title} ${n.message}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notifications, category, readFilter, debouncedSearch]);

  const groups = useMemo(() => {
    const buckets = { Today: [], Yesterday: [], Earlier: [] };
    filtered.forEach((n) => {
      buckets[dayGroup(n.createdAt)].push(n);
    });
    return ['Today', 'Yesterday', 'Earlier']
      .filter((g) => buckets[g].length > 0)
      .map((g) => ({ label: g, items: buckets[g] }));
  }, [filtered]);

  const filtersActive = category !== 'all' || readFilter !== 'all' || debouncedSearch.trim() !== '';

  const clearFilters = () => {
    setCategory('all');
    setReadFilter('all');
    setSearch('');
  };

  const handleMarkAllRead = () => {
    markAllRead();
    toast({ title: 'All caught up', description: 'Every notification was marked as read.', variant: 'success' });
  };

  const emptyCopy = (() => {
    if (debouncedSearch.trim()) {
      return {
        title: `No results for “${debouncedSearch.trim()}”`,
        description: 'Try a different keyword or clear your filters.',
      };
    }
    if (readFilter === 'unread') {
      return {
        title: "You're all caught up",
        description:
          category === 'all'
            ? 'You have no unread notifications.'
            : `You have no unread ${categoryLabel(category).toLowerCase()} notifications.`,
      };
    }
    if (readFilter === 'read') {
      return { title: 'No read notifications', description: 'Notifications you mark as read will appear here.' };
    }
    if (category !== 'all') {
      return {
        title: `No ${categoryLabel(category).toLowerCase()} notifications`,
        description: 'New updates in this category will show up here.',
      };
    }
    return { title: 'No notifications', description: 'New updates will show up here.' };
  })();

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay on top of projects, tasks, payments, and team updates."
        actions={
          <>
            <Badge variant={unreadCount > 0 ? 'primary' : 'neutral'} dot={unreadCount > 0} size="md">
              {unreadCount === 0 ? 'All read' : `${unreadCount} unread`}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              leftIcon={<Icon name="check" className="h-4 w-4" aria-hidden="true" />}
            >
              Mark all as read
            </Button>
          </>
        }
      />

      <Tabs tabs={tabs} value={category} onChange={setCategory} ariaLabel="Notification categories" className="mb-4" />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search notifications…"
          className="min-w-[180px] flex-1 sm:max-w-xs"
        />
        <FilterSelect label="Status" value={readFilter} onChange={(e) => setReadFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </FilterSelect>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<Icon name="x" className="h-4 w-4" aria-hidden="true" />}>
            Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.label} aria-label={`${group.label} notifications`}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {group.label}
                </h2>
                <Badge variant="neutral" size="sm">
                  {group.items.length}
                </Badge>
              </div>
              <div className="space-y-2.5">
                {group.items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onToggleRead={() => toggleRead(n.id)}
                    onMarkRead={() => markRead(n.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
