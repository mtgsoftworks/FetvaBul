'use client';

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'fetvabul_view_events';
const VIEW_EVENT_TTL_MS = 30 * 60 * 1000;
const OFFLINE_BUILD = process.env.NEXT_PUBLIC_OFFLINE_BUILD === '1';

type ViewEventMap = Record<string, number>;

function shouldTrackView(id: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const now = Date.now();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ViewEventMap) : {};
    const lastTrackedAt = parsed[id] ?? 0;

    if (now - lastTrackedAt < VIEW_EVENT_TTL_MS) {
      return false;
    }

    parsed[id] = now;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch {
    return true;
  }
}

interface FetvaViewTrackerProps {
  id: string;
}

export function FetvaViewTracker({ id }: FetvaViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!id || hasTrackedRef.current) {
      return;
    }

    if (OFFLINE_BUILD) {
      return;
    }

    hasTrackedRef.current = true;

    if (!shouldTrackView(id)) {
      return;
    }

    fetch(`/api/fatwas/${encodeURIComponent(id)}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch((error) => {
      console.error('Failed to track view:', error);
    });
  }, [id]);

  return null;
}
