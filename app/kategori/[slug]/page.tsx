'use client';

import { BookOpen, Tag, Clock, ArrowRight, Filter, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getCategoryIconInfo } from '@/lib/category-icons';

export default function KategoriPage({ params }: { params: { slug: string } }) {
  const [sortBy, setSortBy] = useState<'relevance'|'date'|'popular'|'views'|'alphabetical'|'most-liked'>('popular');
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
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:text-primary transition-colors">Kategoriler</Link>
          <span>/</span>
          <span>{category?.name || 'Kategori'}</span>
        </div>

        {/* Category Header */}
        <div className="card-islamic p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="text-6xl" aria-hidden="true">{categoryIcon}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary mb-4">{category?.name || 'Kategori'}</h1>
              {category?.description && (
                <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                  {category.description}
                </p>
              )}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-islamic-green-600" />
                  <span className="font-semibold">{(category?.fatwaCount ?? 0).toLocaleString('tr-TR')} Fetva</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Sort Options */}
              <div className="card-islamic p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="w-5 h-5 text-islamic-green-600" />
                  <h3 className="font-semibold">Sıralama</h3>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-3 border border-islamic-green-200 rounded-lg focus:border-islamic-green-500 focus:ring-2 focus:ring-islamic-green-100"
                >
                  <option value="popular">En Popüler</option>
                  <option value="recent">En Yeni</option>
                  <option value="alphabetical">Alfabetik</option>
                  <option value="most-liked">En Beğenilen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* JSON-LD: BreadcrumbList + ItemList */}
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
                        { '@type': 'ListItem', position: 3, name: category.name }
                      ]
                    })
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
                          url: `/fetva/${f.id}`
                        }))
                      })
                    }}
                  />
                )}
              </>
            )}
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{category?.name || 'Kategori'} Fetvaları</h2>
                <p className="text-muted-foreground">
                  Toplam {(category?.fatwaCount ?? 0).toLocaleString('tr-TR')} fetvadan {fatwas.length.toLocaleString('tr-TR')} gösteriliyor
                </p>
              </div>
            </div>

            {/* Loading/Error States */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>
            )}
            {loading && fatwas.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="fetva-card group h-full animate-pulse p-4">
                    <div className="h-4 w-3/4 bg-islamic-green-50 rounded mb-3" />
                    <div className="h-3 w-full bg-islamic-green-50 rounded mb-2" />
                    <div className="h-3 w-11/12 bg-islamic-green-50 rounded mb-2" />
                    <div className="h-3 w-10/12 bg-islamic-green-50 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Fetvalar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fatwas.map((fetva) => (
                <Link key={fetva.id} href={`/fetva/${fetva.id}`}>
                  <div className="fetva-card group h-full">
                    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {fetva.question}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                      {fetva.answer}
                    </p>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{fetva.source || 'Kaynak Belirtilmemiş'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{fetva.date ? new Date(fetva.date).toLocaleDateString('tr-TR') : 'Tarih Belirtilmemiş'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {(fetva.views || 0).toLocaleString('tr-TR')} görüntülenme
                        </span>
                        <span className="text-islamic-green-600 font-medium">
                          {(fetva.likes || 0).toLocaleString('tr-TR')} beğeni
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading || !hasMore}
                className="px-8 py-3 bg-islamic-green-600 hover:bg-islamic-green-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{hasMore ? 'Daha Fazla Yükle' : 'Hepsi yüklendi'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}