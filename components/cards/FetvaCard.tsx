'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Eye, Heart, MessageCircle, Share2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FetvaCardProps {
  id: string;
  question: string;
  answer: string;
  category: string;
  source: string;
  date: string;
  views: number;
  likes: number;
}

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

export function FetvaCard({ id, question, answer, category, source, date, views, likes }: FetvaCardProps) {
  const [likeCount, setLikeCount] = useState<number>(likes);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
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
    setIsLiked(stored.has(id));
  }, [id]);

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
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-islamic-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <Badge variant="secondary" className="bg-islamic-green-100 text-islamic-green-800 hover:bg-islamic-green-200">
            <Tag className="w-3 h-3 mr-1" />
            {category}
          </Badge>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <Link href={`/fetva/${id}`} className="block">
          <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-islamic-green-700 transition-colors">
            {question}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {truncatedAnswer}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{source}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{views}</span>
            </div>
            <button
              onClick={handleLike}
              disabled={pending}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              } disabled:opacity-60`}
              aria-pressed={isLiked}
              aria-label={isLiked ? 'Beğeniyi geri al' : 'Beğen'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <Link
              href={`/fetva/${id}#yorumlar`}
              className="flex items-center space-x-1 text-muted-foreground hover:text-islamic-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentsCount}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}