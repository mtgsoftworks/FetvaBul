'use client';

import { useEffect } from 'react';
import { syncDatasetIfNeeded } from '@/lib/data-sync';

const DEFAULT_BOOTSTRAP_INTERVAL_MS = 15 * 60 * 1000;
const bootstrapIntervalMs = (() => {
  const parsed = Number.parseInt(
    process.env.NEXT_PUBLIC_DATA_SYNC_CHECK_MS ?? `${DEFAULT_BOOTSTRAP_INTERVAL_MS}`,
    10
  );
  return Number.isFinite(parsed) && parsed >= 60_000
    ? parsed
    : DEFAULT_BOOTSTRAP_INTERVAL_MS;
})();

export function DataSyncBootstrap() {
  useEffect(() => {
    const triggerSync = (force = false) => {
      void syncDatasetIfNeeded({ force });
    };

    triggerSync(true);

    const interval = window.setInterval(() => {
      triggerSync(false);
    }, bootstrapIntervalMs);

    const onFocus = () => triggerSync(false);
    const onOnline = () => triggerSync(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerSync(false);
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
