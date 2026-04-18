'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface FetvaComment {
  id: string;
  name: string;
  message: string;
  createdAt: string | null;
}

interface FetvaCommentsResponse {
  comments?: FetvaComment[];
  error?: string;
}

interface CreateCommentResponse {
  comment?: FetvaComment | null;
  error?: string;
}

interface FetvaCommentsProps {
  fetvaId: string;
}

const OFFLINE_BUILD = process.env.NEXT_PUBLIC_OFFLINE_BUILD === '1';
const COMMENT_STORAGE_PREFIX = 'fetvabul_comments_';

function getCommentStorageKey(fetvaId: string): string {
  return `${COMMENT_STORAGE_PREFIX}${fetvaId}`;
}

function loadOfflineComments(fetvaId: string): FetvaComment[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getCommentStorageKey(fetvaId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is FetvaComment => {
        if (!item || typeof item !== 'object') return false;
        const record = item as Record<string, unknown>;
        return typeof record.id === 'string' && typeof record.name === 'string' && typeof record.message === 'string';
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        message: item.message,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : null,
      }));
  } catch {
    return [];
  }
}

function saveOfflineComments(fetvaId: string, comments: FetvaComment[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getCommentStorageKey(fetvaId), JSON.stringify(comments));
}

function formatCommentDate(value: string | null): string {
  if (!value) return 'Az önce';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Az önce';
  }

  return date.toLocaleDateString('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function FetvaComments({ fetvaId }: FetvaCommentsProps) {
  const [comments, setComments] = useState<FetvaComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      if (OFFLINE_BUILD) {
        if (!cancelled) {
          setComments(loadOfflineComments(fetvaId));
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/fetva/${encodeURIComponent(fetvaId)}/comments?limit=50`, {
          cache: 'no-store',
        });

        const data = (await response.json().catch(() => null)) as FetvaCommentsResponse | null;

        if (!response.ok) {
          throw new Error(data?.error || 'Yorumlar yüklenemedi');
        }

        if (!cancelled) {
          setComments(Array.isArray(data?.comments) ? data!.comments : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Yorumlar yüklenemedi');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchComments();

    return () => {
      cancelled = true;
    };
  }, [fetvaId]);

  const commentCountLabel = useMemo(() => `${comments.length} yorum`, [comments.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedMessage = message.trim();
    if (normalizedMessage.length < 3) {
      setError('Yorum en az 3 karakter olmalı.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (OFFLINE_BUILD) {
        const nextComment: FetvaComment = {
          id: `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          name: name.trim() || 'Anonim',
          message: normalizedMessage,
          createdAt: new Date().toISOString(),
        };

        setComments((prev) => {
          const next = [nextComment, ...prev];
          saveOfflineComments(fetvaId, next);
          return next;
        });

        setMessage('');
        setName('');
        return;
      }

      const response = await fetch(`/api/fetva/${encodeURIComponent(fetvaId)}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || 'Anonim',
          message: normalizedMessage,
        }),
      });

      const data = (await response.json().catch(() => null)) as CreateCommentResponse | null;

      if (!response.ok) {
        throw new Error(data?.error || 'Yorum gönderilemedi');
      }

      if (data?.comment) {
        setComments((prev) => [data.comment as FetvaComment, ...prev]);
      }

      setMessage('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yorum gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="yorumlar" className="rounded-3xl border border-border/50 bg-background/90 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-foreground">
          <MessageCircle className="h-5 w-5 text-primary" />
          Yorumlar
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{commentCountLabel}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Adınız (opsiyonel)"
            maxLength={80}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Yorumunuzu yazın..."
            rows={3}
            maxLength={2000}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Yorumlar yayımlanmadan önce kontrol edilebilir.</p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Gönderiliyor' : 'Yorum Gönder'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Yorumlar yükleniyor...</div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Henüz yorum yok. İlk yorumu siz bırakın.
          </div>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-border/70 bg-background px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">{comment.name || 'Anonim'}</span>
                <span className="text-xs text-muted-foreground">{formatCommentDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{comment.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}