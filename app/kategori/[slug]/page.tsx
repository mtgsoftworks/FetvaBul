'use client';

import { Tag, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getCategoryIconInfo } from '@/lib/category-icons';

type SortValue = 'popular' | 'views' | 'date' | 'alphabetical' | 'most-liked';

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'popular', label: 'En Popüler' },
  { value: 'views', label: 'En Çok Görüntülenen' },
  { value: 'date', label: 'En Yeni' },
  { value: 'alphabetical', label: 'Alfabetik' },
  { value: 'most-liked', label: 'En Beğenilen' },
];

export default function KategoriPage({ params }: { params: { slug: string } }) {
  const [sortBy, setSortBy] = useState<SortValue>('popular');
  const [category, setCategory] = useState<any | null>(null);
  const [fatwas, setFatwas] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const LIMIT = 20;

  // Load category info
  useEffect(() => {
    let active = true;
    const loadCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${encodeURIComponent(params.slug)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!active) return;
        setCategory(data.category ?? null);
      } catch {
        if (active) setCategory(null);
      }
    };
    void loadCategory();
    return () => { active = false; };
  }, [params.slug]);

  // Load fatwas via /api/search with category name
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const name = category?.name || '';
        if (!name) { setFatwas([]); setHasMore(false); setLoading(false); return; }
        const paramsObj = new URLSearchParams({
          category: name,
          sortBy: (sortBy === 'alphabetical' || sortBy === 'most-liked') ? 'relevance' : sortBy,
          limit: String(LIMIT),
          page: String(page),
        });
        const res = await fetch(`/api/search?${paramsObj.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        let items = results.map((r: any) => r.fetva ?? r);
        // Client-side sort for unsupported options
        if (sortBy === 'alphabetical') {
          items = items.slice().sort((a: any, b: any) => a.question.localeCompare(b.question, 'tr'));
        } else if (sortBy === 'most-liked') {
          items = items.slice().sort((a: any, b: any) => (b.likes||0) - (a.likes||0));
        }
        if (!active) return;
        setFatwas(prev => page === 1 ? items : [...prev, ...items]);
        setHasMore(Boolean(data.pagination?.hasMore));
      } catch (e: any) {
        if (active) setError('Fetvalar yüklenemedi');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [category?.name, sortBy, page]);

  // Reset page when sort changes or slug changes
  useEffect(() => { setPage(1); }, [sortBy, params.slug]);

  const categoryIcon = useMemo(() => getCategoryIconInfo(category?.name).emoji, [category?.name]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:text-primary transition-colors">Kategoriler</Link>
          <span>/</span>
          <span>{category?.name || 'Kategori'}</span>
        </nav>

        <section className="mt-6 rounded-3xl border border-border/30 bg-background/95 p-8 shadow-sm">
          <div className="flex flex-col gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl lg:mx-0" aria-hidden="true">
              {categoryIcon || '🕌'}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {category?.name || 'Kategori'}
                </h1>
                {category?.description ? (
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                ) : (
                  <p className="mt-3 text-base text-muted-foreground">
                    Bu kategoriye ait fetvaları keşfedin ve güncel cevaplara ulaşın.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-semibold text-primary">
                  <Tag className="h-4 w-4" />
                  {(category?.fatwaCount ?? 0).toLocaleString('tr-TR')} fetva
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Fetva listesi</h2>
              <p className="text-sm text-muted-foreground">
                Toplam {(category?.fatwaCount ?? 0).toLocaleString('tr-TR')} fetvadan {fatwas.length.toLocaleString('tr-TR')} gösteriliyor.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {!loading && category && (
            <>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: '/' },
                      { '@type': 'ListItem', position: 2, name: 'Kategoriler', item: '/kategoriler' },
                      { '@type': 'ListItem', position: 3, name: category.name },
                    ],
                  }),
                }}
              />
              {fatwas.length > 0 && (
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@type': 'ItemList',
                      itemListElement: fatwas.slice(0, 20).map((f, idx) => ({
                        '@type': 'ListItem',
                        position: idx + 1,
                        name: f.question,
                        url: `/fetva/${f.id}`,
                      })),
                    }),
                  }}
                />
              )}
            </>
          )}

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && fatwas.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-40 flex-col justify-between rounded-3xl border border-border/30 bg-background/80 p-5 shadow-sm"
                >
                  <div className="h-4 w-3/4 rounded-full bg-muted/40" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-full bg-muted/30" />
                    <div className="h-3 w-5/6 rounded-full bg-muted/30" />
                  </div>
                  <div className="h-3 w-1/3 rounded-full bg-muted/20" />
                </div>
              ))}
            </div>
          ) : null}

          {!loading && fatwas.length === 0 ? (
            <div className="rounded-3xl border border-border/30 bg-background/90 p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Bu kategoriye ait fetva bulunamadı</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Yeni fetvalar eklendiğinde sizi bilgilendireceğiz.
              </p>
            </div>
          ) : null}

          {fatwas.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {fatwas.map((fetva) => (
                <Link
                  key={fetva.id}
                  href={`/fetva/${fetva.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-border/30 bg-background/95 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {fetva.createdAt
                          ? new Date(fetva.createdAt).toLocaleDateString('tr-TR')
                          : fetva.date
                          ? new Date(fetva.date).toLocaleDateString('tr-TR')
                          : 'Tarih belirtilmedi'}
                      </span>
                      <span>
                        {(fetva.views || 0).toLocaleString('tr-TR')} görüntülenme
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                      {fetva.question}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {fetva.answer}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{(fetva.likes || 0).toLocaleString('tr-TR')} beğeni</span>
                    <span className="inline-flex items-center gap-2 text-primary">
                      İncele
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {fatwas.length > 0 ? (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || !hasMore}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{hasMore ? 'Daha fazla fetva yükle' : 'Tüm fetvalar listelendi'}</span>
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}