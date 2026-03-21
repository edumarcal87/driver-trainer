import { useState, useEffect } from 'react';

/**
 * Like useState but persists to localStorage under key `bt_${key}`.
 */
export default function usePersistedState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const v = localStorage.getItem(`bt_${key}`);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  });

  useEffect(() => {
    try { localStorage.setItem(`bt_${key}`, JSON.stringify(value)); } catch {}
  }, [key, value]);

  return [value, setValue];
}
