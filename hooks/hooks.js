'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    // During SSR / first render, return the initial value to avoid hydration mismatch.
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch (e) {
      /* corrupted or unavailable storage */
    }
    setHydrated(true);
  }, [key]);

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch (e) {
          /* storage unavailable */
        }
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      /* ignore */
    }
    setValue(typeof initialValue === 'function' ? initialValue() : initialValue);
  }, [key, initialValue]);

  return [value, set, hydrated, remove];
}

export function useDebounce(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

/* Run an effect only after the component has mounted (skip SSR/first render) */
export function useMountedEffect(effect, deps) {
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* Previous value of a prop/state */
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
