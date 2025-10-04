"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Copy,
  Facebook,
  Loader2,
  MessageCircle,
  Share2,
  Tag,
  ThumbsUp,
  Twitter,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { FetvaCard } from "@/components/cards/FetvaCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Fetva } from "@/types";

type CommentEntry = {
  id: string;
  name: string;
  message: string;
  createdAt?: string | null;
};

type FetvaDetailResponse = {
  fatwa?: Fetva;
  relatedFatwas?: Fetva[];
  success?: boolean;
  error?: string;
};

type InteractionResponse = {
  likes?: number;
  commentsCount?: number;
};

type CommentsResponse = {
  comments?: CommentEntry[];
  success?: boolean;
  error?: string;
};

const STORAGE_KEY = "fetvabul_liked_fatwas";

function getStoredLikes(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(String));
    }
  } catch (error) {
    console.warn("Failed to parse stored likes", error);
  }
  return new Set();
}

function persistLikes(set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
}

export default function FetvaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const id = params?.id ?? "";

  const [fetva, setFetva] = useState<Fetva | null>(null);
  const [relatedFatwas, setRelatedFatwas] = useState<Fetva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likeCount, setLikeCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likePending, setLikePending] = useState<boolean>(false);

  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const [commentName, setCommentName] = useState<string>("");
  const [commentMessage, setCommentMessage] = useState<string>("");
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setIsLiked(getStoredLikes().has(id));
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const loadFetva = async () => {
      if (!id) {
        setError("Geçersiz fetva kimliği.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/fatwas/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as FetvaDetailResponse;
          throw new Error(data.error ?? "Fetva yüklenemedi");
        }

        const data = (await response.json()) as FetvaDetailResponse;
        if (cancelled) return;

        setFetva(data.fatwa ?? null);
        setRelatedFatwas(Array.isArray(data.relatedFatwas) ? data.relatedFatwas : []);
        setLikeCount(data.fatwa?.likes ?? 0);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load fetva", err);
        setError(err instanceof Error ? err.message : "Fetva yüklenemedi");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFetva();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadInteractions = async () => {
      try {
        const response = await fetch(`/api/fetva/${encodeURIComponent(id)}/like`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as InteractionResponse;
        if (cancelled) return;
        if (typeof data.likes === "number") {
          setLikeCount(data.likes);
        }
        if (typeof data.commentsCount === "number") {
          setCommentsCount(data.commentsCount);
        }
      } catch (err) {
        console.error("Failed to load interactions", err);
      }
    };

    void loadInteractions();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadComments = useCallback(async () => {
    if (!id) return;

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const response = await fetch(`/api/fetva/${encodeURIComponent(id)}/comments`, { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as CommentsResponse;
        throw new Error(data.error ?? "Yorumlar yüklenemedi");
      }

      const data = (await response.json()) as CommentsResponse;
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (err) {
      console.error("Failed to load comments", err);
      setCommentsError(err instanceof Error ? err.message : "Yorumlar yüklenemedi");
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleLike = useCallback(async () => {
    if (!id || likePending) return;

    const stored = getStoredLikes();
    const willLike = !stored.has(id);
    const action = willLike ? "like" : "unlike";

    setLikePending(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(willLike);
    setLikeCount(prev => Math.max(0, prev + (willLike ? 1 : -1)));

    try {
      const response = await fetch(`/api/fetva/${encodeURIComponent(id)}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json().catch(() => null)) as InteractionResponse | null;

      if (willLike) {
        stored.add(id);
      } else {
        stored.delete(id);
      }
      persistLikes(stored);

      if (data && typeof data.likes === "number") {
        setLikeCount(data.likes);
      }
    } catch (err) {
      console.error("Like toggle failed", err);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      toast({ title: "Hata", description: "Beğeni işlemi gerçekleştirilemedi.", duration: 2500 });
    } finally {
      setLikePending(false);
    }
  }, [id, isLiked, likeCount, likePending, toast]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Bağlantı kopyalandı", description: "Link panonuza kopyalandı.", duration: 2000 });
    } catch (err) {
      console.error("Clipboard copy failed", err);
      toast({ title: "Hata", description: "Bağlantı kopyalanamadı.", duration: 2500 });
    }
  }, [toast]);

  const handleShare = useCallback(async () => {
    if (typeof navigator === "undefined") return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: fetva?.question ?? "Fetva",
          text: "Bu fetvayı inceleyin",
          url: window.location.href,
        });
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Share failed", err);
          toast({ title: "Hata", description: "Paylaşım başarısız oldu.", duration: 2500 });
        }
      }
    } else {
      await handleCopyLink();
    }
  }, [fetva?.question, handleCopyLink, toast]);

  const handleCommentSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!id || commentSubmitting) return;

      const trimmedMessage = commentMessage.trim();
      if (trimmedMessage.length < 3) {
        toast({ title: "Uyarı", description: "Yorum en az 3 karakter olmalıdır.", duration: 2500 });
        return;
      }

      setCommentSubmitting(true);

      try {
        const response = await fetch(`/api/fetva/${encodeURIComponent(id)}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: commentName.trim() || undefined,
            message: trimmedMessage,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as CommentsResponse;
          throw new Error(data.error ?? "Yorum gönderilemedi");
        }

        const data = (await response.json()) as { comment?: CommentEntry };
        if (!data.comment) {
          throw new Error("Yorum gönderilemedi");
        }

        setComments(prev => [data.comment!, ...prev]);
        setCommentsCount(prev => prev + 1);
        setCommentMessage("");
        toast({ title: "Teşekkürler", description: "Yorumunuz alındı.", duration: 2500 });
      } catch (err) {
        console.error("Failed to submit comment", err);
        toast({ title: "Hata", description: err instanceof Error ? err.message : "Yorum gönderilemedi.", duration: 2500 });
      } finally {
        setCommentSubmitting(false);
      }
    },
    [commentMessage, commentName, commentSubmitting, id, toast]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-islamic-green-600" />
        </div>
      </div>
    );
  }

  if (error || !fetva) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="mb-3 text-2xl font-semibold text-red-800">Fetva bulunamadı</h1>
            <p className="mb-6 text-red-700">{error ?? "Aradığınız fetva mevcut değil veya kaldırılmış olabilir."}</p>
            <Button onClick={() => router.push("/")} className="bg-islamic-green-600 hover:bg-islamic-green-700">
              Ana sayfaya dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const answerParagraphs = fetva.answer
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" className="flex items-center space-x-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span>Geri</span>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="card-islamic p-6 md:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-islamic-green-100 text-islamic-green-700">
                <Tag className="mr-1 h-3.5 w-3.5" />
                {fetva.categories?.[0] ?? "Genel"}
              </Badge>
              {fetva.source && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{fetva.source}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span>{likeCount.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{commentsCount.toLocaleString("tr-TR")}</span>
              </div>
            </div>

            <h1 className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {fetva.question}
            </h1>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              {answerParagraphs.length > 0 ? (
                answerParagraphs.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed text-foreground">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap text-foreground">{fetva.answer}</p>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                className={`flex items-center space-x-2 ${
                  isLiked ? "bg-red-500 hover:bg-red-600" : "border-islamic-green-200"
                }`}
                onClick={handleLike}
                disabled={likePending}
              >
                <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span>{isLiked ? "Beğendiniz" : "Beğen"}</span>
              </Button>

              <Button variant="outline" className="flex items-center space-x-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                <span>Paylaş</span>
              </Button>

              <Button variant="outline" className="flex items-center space-x-2" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
                <span>Bağlantıyı Kopyala</span>
              </Button>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.href : ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rounded-lg border border-blue-200 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  fetva.question
                )}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rounded-lg border border-sky-200 px-4 py-2 text-sky-600 transition-colors hover:bg-sky-50"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </a>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="card-islamic p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Yorum Yaz</h2>
              <form className="space-y-4" onSubmit={handleCommentSubmit}>
                <div>
                  <label htmlFor="comment-name" className="mb-2 block text-sm font-medium text-foreground">
                    İsim (opsiyonel)
                  </label>
                  <Input
                    id="comment-name"
                    name="name"
                    value={commentName}
                    onChange={event => setCommentName(event.target.value)}
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label htmlFor="comment-message" className="mb-2 block text-sm font-medium text-foreground">
                    Yorumunuz
                  </label>
                  <Textarea
                    id="comment-message"
                    name="message"
                    required
                    rows={4}
                    value={commentMessage}
                    onChange={event => setCommentMessage(event.target.value)}
                    placeholder="Düşüncelerinizi paylaşın..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={commentSubmitting}
                  className="w-full bg-islamic-green-600 hover:bg-islamic-green-700"
                >
                  {commentSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    "Gönder"
                  )}
                </Button>
              </form>
            </div>

            <div className="card-islamic p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Yorumlar</h2>
              {commentsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-islamic-green-600" />
                </div>
              ) : commentsError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {commentsError}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz yorum yapılmamış. İlk yorumu siz yazın!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => {
                    const created = comment.createdAt ? new Date(comment.createdAt) : null;
                    const formatted = created && !Number.isNaN(created.getTime())
                      ? created.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })
                      : "";

                    return (
                      <div key={comment.id} className="rounded-lg border border-islamic-green-100 bg-white p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">{comment.name || "Anonim"}</span>
                          {formatted && <span className="text-xs text-muted-foreground">{formatted}</span>}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>

        {relatedFatwas.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Benzer Fetvalar</h2>
              <Link href="/arama" className="text-sm text-islamic-green-600 hover:underline">
                Tümünü gör
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedFatwas.map(item => (
                <FetvaCard
                  key={item.id}
                  id={item.id}
                  question={item.question}
                  answer={item.answer}
                  category={item.categories?.[0] ?? "Genel"}
                  source={item.source ?? ""}
                  date={item.date ?? ""}
                  views={item.views ?? 0}
                  likes={item.likes ?? 0}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


