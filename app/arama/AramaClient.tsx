'use client';

import Link from 'next/link';
import { Loader2, Search, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCategories, useSearch } from '@/hooks/use-search';

type AramaClientProps = {
  initialQuery: string;
};

function formatDate(value?: string | Date): string {
  if (!value) return 'Tarih belirtilmedi';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Tarih belirtilmedi';
  }
  return date.toLocaleDateString('tr-TR', { dateStyle: 'long' });
}

function formatSource(value?: string): string {
  const clean = value?.trim();
  return clean && clean.length > 0 ? clean : 'Kaynak belirtilmedi';
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
  const displayedResultCount = searchResults.length;

  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />

      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        {/* Search Header */}
        <section className="mb-10">
          <h1 className="font-serif font-normal text-main mb-3">Fetva Arama</h1>
          <p className="text-sm text-muted leading-relaxed max-w-lg">
            Soru, cevap veya kategoriye göre arama yaparak ilgili fetvaları hızlıca bulabilirsiniz.
          </p>

          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              performSearch();
            }}
          >
            <div className="relative max-w-[600px]">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Örn: zekat kimlere verilir?"
                className="w-full py-4 px-7 pr-24 rounded-[40px] border-[1.5px] border-clean-border bg-card text-base text-main outline-none focus:border-accent shadow-[0_10px_30px_rgba(95,113,97,0.05)] transition-all placeholder:text-muted"
                aria-label="Fetva arama kutusu"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-main transition-colors"
                  aria-label="Aramayı temizle"
                >
                  <X size={16} />
                </button>
              ) : null}
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-accent transition-colors"
                aria-label="Ara"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>

            {isAutocompleteLoading && query.trim().length >= 2 ? (
              <p className="mt-2 text-xs text-muted" role="status" aria-live="polite">
                Öneriler yükleniyor...
              </p>
            ) : autocompleteSuggestions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {autocompleteSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full border border-clean-border bg-card px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </form>
        </section>

        {/* Filters Row */}
        <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8 pb-8 border-b border-clean-border">
          <div className="text-sm text-muted">
            <span className="font-medium text-main">{totalResults.toLocaleString('tr-TR')}</span> sonuç
          </div>
          <div className="flex gap-3 sm:ml-auto">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-10 rounded-full border border-clean-border bg-card px-4 text-sm text-muted outline-none focus:border-accent transition"
              disabled={categoriesLoading}
            >
              <option value="">Tüm kategoriler</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'relevance' | 'date' | 'popular' | 'views')}
              className="h-10 rounded-full border border-clean-border bg-card px-4 text-sm text-muted outline-none focus:border-accent transition"
            >
              <option value="relevance">Alaka</option>
              <option value="date">Tarih</option>
              <option value="popular">Popüler</option>
              <option value="views">Görüntülenme</option>
            </select>
          </div>
        </section>

        {/* Keywords */}
        {topKeywords.length > 0 ? (
          <section className="mb-8">
            <p className="text-[11px] font-medium uppercase tracking-[1px] text-muted mb-3">Öne çıkan kelimeler</p>
            <div className="flex flex-wrap gap-2">
              {topKeywords.map((item) => (
                <button
                  key={item.keyword}
                  type="button"
                  onClick={() => setQuery(item.keyword)}
                  className="rounded-full border border-clean-border bg-card px-3 py-1 text-xs text-accent transition hover:bg-accent-light"
                >
                  {item.keyword} ({item.count})
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Error */}
        {searchError ? (
          <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="status" aria-live="polite">
            {searchError}
          </section>
        ) : null}

        {/* Results */}
        <section className="space-y-0">
          {isSearching && searchResults.length === 0 ? (
            <div className="flex items-center gap-3 py-12 text-muted" role="status" aria-live="polite">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sonuçlar yükleniyor...</span>
            </div>
          ) : null}

          {!isSearching && searchResults.length === 0 && hasAnyFilter ? (
            <div className="py-16 text-center">
              <h2 className="font-serif text-xl text-main mb-2">Sonuç bulunamadı</h2>
              <p className="text-sm text-muted">Farklı bir sorgu yazın veya kategori filtresini sıfırlayın.</p>
            </div>
          ) : null}

          {!hasAnyFilter ? (
            <div className="py-16 text-center">
              <h2 className="font-serif text-xl text-main mb-2">Aramaya başlayın</h2>
              <p className="text-sm text-muted">
                Üstteki arama kutusuna bir soru veya anahtar kelime yazarak sonuçları görüntüleyin.
              </p>
            </div>
          ) : null}

          {searchResults.map((result) => {
            const fetva = result.fetva;
            const displayDate = formatDate(fetva.updatedAt ?? fetva.createdAt ?? fetva.date);
            const sourceLabel = formatSource(fetva.source);

            return (
              <article
                key={fetva.id}
                className="group py-8 border-b border-clean-border last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted uppercase tracking-[1px] mb-3">
                  <span>{displayDate}</span>
                  <span className="text-clean-border">·</span>
                  <span>{(fetva.views ?? 0).toLocaleString('tr-TR')} görüntülenme</span>
                  <span className="text-clean-border">·</span>
                  <span>{sourceLabel}</span>
                </div>

                <Link href={`/fetva/${fetva.id}`}>
                  <h2 className="font-serif text-xl text-main mb-3 group-hover:text-accent transition-colors cursor-pointer">
                    {fetva.question}
                  </h2>
                </Link>

                <p className="text-sm text-muted leading-relaxed mb-4">{truncate(fetva.answer)}</p>

                <div className="flex flex-wrap items-center gap-2">
                  {fetva.categories.slice(0, 3).map((category) => (
                    <span
                      key={`${fetva.id}-${category}`}
                      className="text-[11px] text-accent uppercase tracking-[1px] font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        {/* Pagination */}
        {hasAnyFilter && (currentPage > 1 || hasMoreResults || totalPages > 1) ? (
          <section className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1 || isSearching}
              className="text-[13px] font-medium uppercase tracking-[1.5px] text-muted hover:text-accent disabled:opacity-30 transition-colors"
            >
              Önceki
            </button>
            <span className="text-sm text-muted">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={isSearching || (!hasMoreResults && currentPage >= totalPages)}
              className="text-[13px] font-medium uppercase tracking-[1.5px] text-muted hover:text-accent disabled:opacity-30 transition-colors"
            >
              Sonraki
            </button>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
