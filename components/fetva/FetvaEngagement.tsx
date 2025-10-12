'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Facebook, Heart, Share2, ThumbsUp, Twitter, Eye } from 'lucide-react';

const STORAGE_KEY = 'fetvabul_liked_fatwas';

function getStoredLikes(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(String));
    }
    return new Set();
  } catch (error) {
    console.warn('Failed to parse stored likes', error);
    return new Set();
  }
}

function persistLikes(set: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
}

interface FetvaEngagementProps {
  id: string;
  initialLikes: number;
  views: number;
  categories: string[];
  shareUrl: string;
  question: string;
}

export function FetvaEngagement({ id, initialLikes, views, categories, shareUrl, question }: FetvaEngagementProps) {
  const [likeCount, setLikeCount] = useState<number>(initialLikes);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const fetchEngagement = async () => {
      try {
        const res = await fetch(`/api/fetva/${encodeURIComponent(id)}/like`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (typeof data?.likes === 'number') {
          setLikeCount(data.likes);
        }
      } catch (error) {
        console.error('Failed to load engagement data', error);
      }
    };

    fetchEngagement();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const stored = getStoredLikes();
    setIsLiked(stored.has(id));
  }, [id]);

  const handleToggleLike = useCallback(async () => {
    if (pending) return;

    const stored = getStoredLikes();
    const willLike = !stored.has(id);
    const action = willLike ? 'like' : 'unlike';

    setPending(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(willLike);
    setLikeCount(prev => Math.max(0, prev + (willLike ? 1 : -1)));

    try {
      const res = await fetch(`/api/fetva/${encodeURIComponent(id)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const nextSet = new Set(stored);
      if (willLike) {
        nextSet.add(id);
      } else {
        nextSet.delete(id);
      }
      persistLikes(nextSet);

      const data = await res.json().catch(() => null);
      if (data && typeof data.likes === 'number') {
        setLikeCount(data.likes);
      }
    } catch (error) {
      console.error('Failed to toggle like', error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setPending(false);
    }
  }, [id, isLiked, likeCount, pending]);

  const formattedLikes = useMemo(() => likeCount.toLocaleString('tr-TR'), [likeCount]);
  const formattedViews = useMemo(() => (views ?? 0).toLocaleString('tr-TR'), [views]);

  const tweetUrl = useMemo(() => {
    const text = `${question}\n`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  }, [question, shareUrl]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={pending}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            isLiked
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border border-primary/30 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20'
          } disabled:cursor-not-allowed disabled:opacity-70`}
          aria-pressed={isLiked}
        >
          <ThumbsUp className="h-4 w-4" />
          {formattedLikes} beğeni
        </button>

        <span className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground">
          <Eye className="h-4 w-4" />
          {formattedViews} görüntülenme
        </span>

        <a
          href={shareUrl}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary/10"
        >
          <Share2 className="h-4 w-4" />
          Fetvaya git
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          <Facebook className="h-4 w-4" />
          Facebook'ta paylaş
        </a>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-sky-200 px-5 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
        >
          <Twitter className="h-4 w-4" />
          Twitter'da paylaş
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Kategoriler</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">İstatistikler</h2>
          <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <dt>Görüntülenme</dt>
              <dd>{formattedViews}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Beğeni</dt>
              <dd>{formattedLikes}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
