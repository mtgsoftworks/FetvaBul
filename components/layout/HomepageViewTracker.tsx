'use client';

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'fetvabul_homepage_view';
const TTL_MS = 10 * 60 * 1000;
const OFFLINE_BUILD = process.env.NEXT_PUBLIC_OFFLINE_BUILD === '1';

function shouldTrackHomepageView(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const now = Date.now();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const last = raw ? Number.parseInt(raw, 10) : 0;

    if (Number.isFinite(last) && last > 0 && now - last < TTL_MS) {
      return false;
    }

    window.localStorage.setItem(STORAGE_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

export function HomepageViewTracker() {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    if (OFFLINE_BUILD) {
      return;
    }

    hasTrackedRef.current = true;

    if (!shouldTrackHomepageView()) {
      return;
    }

    fetch('/api/site/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch((error) => {
      console.error('Failed to track homepage view:', error);
    });
  }, []);

  return null;
}
