'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, MessageCircle } from 'lucide-react';

interface FetvaCardProps {
  id: string;
  question: string;
  answer: string;
  category: string;
  source?: string;
  date?: string | Date;
  views: number;
  likes: number;
}

const STORAGE_KEY = 'fetvabul_liked_fatwas';
const OFFLINE_BUILD = process.env.NEXT_PUBLIC_OFFLINE_BUILD === '1';

function formatSource(value?: string): string {
  const clean = value?.trim();
  return clean && clean.length > 0 ? clean : 'Kaynak belirtilmedi';
}

function formatDate(value?: string | Date): string {
  if (!value) return 'Tarih belirtilmedi';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Tarih belirtilmedi';
  }
  return date.toLocaleDateString('tr-TR', { dateStyle: 'long' });
}

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

export function FetvaCard({ id, question, answer, category, source, date, views, likes }: FetvaCardProps) {
  const [likeCount, setLikeCount] = useState<number>(likes);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const sourceLabel = formatSource(source);
  const dateLabel = formatDate(date);

  useEffect(() => {
    if (OFFLINE_BUILD) {
      setCommentsCount(0);
      return;
    }

    let cancelled = false;

    const fetchInteraction = async () => {
      try {
        const res = await fetch(`/api/fetva/${encodeURIComponent(id)}/like`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (typeof data?.likes === 'number') {
          setLikeCount(data.likes);
        }
        if (typeof data?.commentsCount === 'number') {
          setCommentsCount(data.commentsCount);
        }
      } catch (error) {
        console.error('Failed to load interactions for card', error);
      }
    };

    fetchInteraction();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const stored = getStoredLikes();
    const liked = stored.has(id);
    setIsLiked(liked);

    if (OFFLINE_BUILD) {
      setLikeCount(Math.max(0, likes + (liked ? 1 : 0)));
    }
  }, [id, likes]);

  const handleLike = useCallback(async () => {
    if (pending) return;

    const stored = getStoredLikes();
    const willLike = !stored.has(id);
    const action = willLike ? 'like' : 'unlike';

    setPending(true);
    const previousLiked = isLiked;
    const previousCountRef = likeCount;
    setIsLiked(willLike);
    setLikeCount(prev => Math.max(0, prev + (willLike ? 1 : -1)));

    try {
      if (OFFLINE_BUILD) {
        const nextSet = new Set(stored);
        if (willLike) {
          nextSet.add(id);
        } else {
          nextSet.delete(id);
        }
        persistLikes(nextSet);
        return;
      }

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
      console.error('Like toggle failed', error);
      setIsLiked(previousLiked);
      setLikeCount(previousCountRef);
    } finally {
      setPending(false);
    }
  }, [id, pending, isLiked, likeCount]);

  const truncatedAnswer = answer.length > 200 ? answer.substring(0, 200) + '...' : answer;

  return (
    <div className="group bg-card rounded-[20px] border border-clean-border hover:shadow-[0_10px_30px_rgba(95,113,97,0.08)] hover:-translate-y-0.5 transition-all overflow-hidden">
      {/* Body */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 text-[11px] text-muted uppercase tracking-[1px] mb-4">
          <span className="text-accent font-medium">{category}</span>
          <span className="text-clean-border">·</span>
          <span>{dateLabel}</span>
        </div>

        <Link href={`/fetva/${id}`} className="block">
          <h3 className="font-serif text-lg text-main mb-3 line-clamp-2 group-hover:text-accent transition-colors leading-[1.4]">
            {question}
          </h3>
        </Link>

        <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">
          {truncatedAnswer}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-clean-border">
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="text-xs">{sourceLabel}</span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>{views}</span>
            </div>
            <button
              onClick={handleLike}
              disabled={pending}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isLiked ? 'text-red-500' : 'text-muted hover:text-red-500'
              } disabled:opacity-60`}
              aria-pressed={isLiked}
              aria-label={isLiked ? 'Beğeniyi geri al' : 'Beğen'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <Link
              href={`/fetva/${id}#yorumlar`}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{commentsCount}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}