'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './hooks';
import { baseNotifications } from '@/data/notifications';

const READ_KEY = 'nexora-notifications-read-v1';

export const NOTIFICATION_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'project', label: 'Projects' },
  { id: 'task', label: 'Tasks' },
  { id: 'transaction', label: 'Transactions' },
  { id: 'team', label: 'Team' },
  { id: 'system', label: 'System' },
];

export function useNotifications() {
  const [readIds, setReadIds] = useLocalStorage(READ_KEY, []);

  const notifications = useMemo(() => {
    const readSet = new Set(readIds || []);
    return baseNotifications.map((n) => ({ ...n, read: n.read || readSet.has(n.id) }));
  }, [readIds]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markRead = useCallback(
    (id) => {
      setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [setReadIds]
  );

  const markUnread = useCallback(
    (id) => {
      setReadIds((prev) => prev.filter((x) => x !== id));
    },
    [setReadIds]
  );

  const markAllRead = useCallback(() => {
    setReadIds(baseNotifications.map((n) => n.id));
  }, [setReadIds]);

  const toggleRead = useCallback(
    (id) => {
      const n = notifications.find((x) => x.id === id);
      if (n && n.read) markUnread(id);
      else markRead(id);
    },
    [notifications, markRead, markUnread]
  );

  return { notifications, unreadCount, markRead, markUnread, markAllRead, toggleRead };
}
