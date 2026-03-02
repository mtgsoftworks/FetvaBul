'use client';

import Link from 'next/link';
import { Loader2, Search, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCategories, useSearch } from '@/hooks/use-search';

type AramaClientProps = {
  initialQuery: string;
};

function formatDate(value?: string | Date): string {
  if (!value) return 'Tarih yok';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Tarih yok';
  }
  return date.toLocaleDateString('tr-TR', { dateStyle: 'long' });
}

function truncate(value: string, maxLength = 260): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export default function AramaClient({ initialQuery }: AramaClientProps) {
  const {
    query,
    setQuery,
    searchResults,
    isSearching,
    searchError,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    currentPage,
    totalPages,
    totalResults,
    setCurrentPage,
    performSearch,
    clearSearch,
    autocompleteSuggestions,
    isAutocompleteLoading,
    searchStats,
    hasMoreResults,
  } = useSearch(initialQuery);

  const { categories, loading: categoriesLoading } = useCategories();
  const topKeywords = searchStats?.mostCommonKeywords?.slice(0, 5) ?? [];
  const hasAnyFilter = query.trim().length > 0 || selectedCategory || sortBy !== 'relevance';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <span className="inline-block rounded-full border border-primary/20 bg-background px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Arama
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Fetva arama merkezi
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Soru, cevap veya kategoriye gore arama yaparak ilgili fetvalari hizlica bulabilirsiniz.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              performSearch();
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Orn: zekat kimlere verilir?"
                className="h-14 w-full rounded-full border border-primary/20 bg-background pl-12 pr-28 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Fetva arama kutusu"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition hover:text-foreground"
                  aria-label="Aramayi temizle"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full px-5"
                  disabled={isSearching}
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ara'}
                </Button>
              )}
            </div>

            {isAutocompleteLoading && query.trim().length >= 2 ? (
              <p className="text-xs text-muted-foreground">Oneriler yukleniyor...</p>
            ) : autocompleteSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {autocompleteSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full border border-primary/20 bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </form>
        </section>

        <section className="mt-6 grid gap-4 rounded-3xl border border-border/40 bg-background/90 p-5 shadow-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Toplam Sonuc</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{totalResults.toLocaleString('tr-TR')}</p>
          </div>
          <div>
            <label htmlFor="category-filter" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Kategori
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={categoriesLoading}
            >
              <option value="">Tum kategoriler</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort-filter" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Siralama
            </label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'relevance' | 'date' | 'popular' | 'views')}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="relevance">Alaka</option>
              <option value="date">Tarih</option>
              <option value="popular">Populer</option>
              <option value="views">Goruntulenme</option>
            </select>
          </div>
        </section>

        {topKeywords.length > 0 ? (
          <section className="mt-4 rounded-2xl border border-border/40 bg-background/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">One cikan anahtar kelimeler</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topKeywords.map((item) => (
                <button
                  key={item.keyword}
                  type="button"
                  onClick={() => setQuery(item.keyword)}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary transition hover:bg-primary/10"
                >
                  {item.keyword} ({item.count})
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {searchError ? (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {searchError}
          </section>
        ) : null}

        <section className="mt-6 space-y-4">
          {isSearching && searchResults.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/90 px-4 py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sonuclar yukleniyor...</span>
            </div>
          ) : null}

          {!isSearching && searchResults.length === 0 && hasAnyFilter ? (
            <div className="rounded-2xl border border-border/40 bg-background/90 px-4 py-8 text-center">
              <h2 className="text-lg font-semibold text-foreground">Sonuc bulunamadi</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Farkli bir sorgu yazin veya kategori filtresini sifirlayin.
              </p>
            </div>
          ) : null}

          {!hasAnyFilter ? (
            <div className="rounded-2xl border border-border/40 bg-background/90 px-4 py-8 text-center">
              <h2 className="text-lg font-semibold text-foreground">Aramaya baslayin</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ustteki arama kutusuna bir soru veya anahtar kelime yazarak sonuclari goruntuleyin.
              </p>
            </div>
          ) : null}

          {searchResults.map((result) => {
            const fetva = result.fetva;

            return (
              <article
                key={fetva.id}
                className="rounded-2xl border border-border/40 bg-background/95 p-5 shadow-sm transition hover:border-primary"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(fetva.createdAt ?? fetva.updatedAt ?? fetva.date)}</span>
                  <span>•</span>
                  <span>{(fetva.views ?? 0).toLocaleString('tr-TR')} goruntulenme</span>
                  {fetva.source ? (
                    <>
                      <span>•</span>
                      <span>{fetva.source}</span>
                    </>
                  ) : null}
                </div>

                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  <Link href={`/fetva/${fetva.id}`} className="transition hover:text-primary">
                    {fetva.question}
                  </Link>
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{truncate(fetva.answer)}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {fetva.categories.slice(0, 3).map((category) => (
                      <Badge key={`${fetva.id}-${category}`} variant="secondary" className="bg-primary/10 text-primary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild size="sm" className="rounded-full px-4">
                    <Link href={`/fetva/${fetva.id}`}>Detay</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </section>

        {hasAnyFilter && (currentPage > 1 || hasMoreResults || totalPages > 1) ? (
          <section className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1 || isSearching}>
              Onceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {currentPage} / {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={isSearching || (!hasMoreResults && currentPage >= totalPages)}
            >
              Sonraki
            </Button>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
