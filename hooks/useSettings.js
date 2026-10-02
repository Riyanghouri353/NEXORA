'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './hooks';

/* Global user settings, persisted. */

export const DEFAULT_SETTINGS = {
  profile: {
    name: 'Alex Morgan',
    email: 'alex.morgan@nexora.io',
    role: 'Operations Manager',
    company: 'Nexora Inc.',
    phone: '+1 (415) 555-0132',
    bio: 'Operations lead focused on turning data into decisions.',
  },
  preferences: {
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    weekStartsOn: 'monday',
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    taskReminders: true,
  },
  appearance: {
    density: 'comfortable', // comfortable | compact
    sidebarCollapsed: false,
    reducedMotion: false,
  },
};

const KEY = 'nexora-settings-v1';

function deepMerge(base, over) {
  if (!over || typeof over !== 'object') return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(over)) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base && typeof base[k] === 'object') {
      out[k] = deepMerge(base[k], over[k]);
    } else {
      out[k] = over[k];
    }
  }
  return out;
}

export function useSettings() {
  const [settings, setSettings, hydrated, remove] = useLocalStorage(KEY, DEFAULT_SETTINGS);
  const merged = deepMerge(DEFAULT_SETTINGS, settings || {});

  const updateSection = useCallback(
    (section, patch) => {
      setSettings((prev) => {
        const base = deepMerge(DEFAULT_SETTINGS, prev || {});
        return { ...base, [section]: { ...(base[section] || {}), ...patch } };
      });
    },
    [setSettings]
  );

  const resetSettings = useCallback(() => {
    remove();
  }, [remove]);

  return { settings: merged, updateSection, resetSettings, hydrated };
}
