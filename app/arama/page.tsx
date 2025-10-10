'use client';

import { Search, Filter, Clock, Tag, Loader2, BookOpen, Calendar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSearch, useCategories } from '@/hooks/use-search';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export default function AramaPage() {
  const formatDate = (input: string) => {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('tr-TR', { dateStyle: 'long' });
  };

  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

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
  const { toast } = useToast();

  // Autocomplete UI state
  const [inputFocused, setInputFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const listboxId = 'autocomplete-listbox';

  const FiltersPanel = () => (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border/30 bg-background/95 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Filtreler</h3>
          <Filter className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Sonuçları ilgi alanlarınıza göre daraltın ve en uygun cevaplara ulaşın.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Kategori</h4>
          {categoriesLoading ? (
            <div className="flex items-center justify-center rounded-2xl border border-border/40 bg-background/80 py-6">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Yükleniyor...</span>
            </div>
          ) : (
            <div className="grid gap-2">
              {[
                { name: 'Tümü', value: '', count: searchStats?.totalFatwas ?? 0 },
                ...categories.map((category) => ({
                  name: category.name,
                  value: category.name,
                  count: category.count,
                })),
              ].map((category) => {
                const isActive = selectedCategory === category.value;
                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border/50 text-foreground hover:border-primary/60 hover:bg-primary/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-2.5 w-2.5 rounded-full ${
                          isActive ? 'bg-primary' : 'bg-border/70'
                        }`}
                      />
                      {category.name}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {(category.count ?? 0).toLocaleString('tr-TR')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sıralama</h4>
          <div className="rounded-2xl border border-border/40 bg-background/95 p-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-11 w-full rounded-xl border border-transparent bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="relevance">İlgili Olanlar</option>
              <option value="date">En Yeni</option>
              <option value="popular">En Popüler</option>
              <option value="views">En Çok Görüntülenen</option>
            </select>
          </div>
        </div>

        {searchStats && (
          <div className="rounded-3xl border border-border/30 bg-background/95 p-6 shadow-sm">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">İstatistikler</h4>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-primary/5 px-4 py-3">
                <span>Toplam Fetva</span>
                <span className="font-semibold text-primary">
                  {searchStats.totalFatwas.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-primary/5 px-4 py-3">
                <span>Toplam Anahtar Kelime</span>
                <span className="font-semibold text-primary">
                  {searchStats.totalKeywords.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Toast on error
  useEffect(() => {
    if (searchError) {
      toast({ title: 'Arama hatası', description: searchError, duration: 3000 });
    }
  }, [searchError, toast]);

  // Toast on zero results (after search completes)
  useEffect(() => {
    if (!isSearching && query.trim() && searchResults.length === 0) {
      toast({ title: 'Sonuç bulunamadı', description: 'Arama kriterlerinizi değiştirin.', duration: 2500 });
    }
  }, [isSearching, query, searchResults.length, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch();
    setActiveIdx(-1);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const count = autocompleteSuggestions.length;
    if (!count) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev + 1) % count);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev <= 0 ? count - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && activeIdx < count) {
        e.preventDefault();
        handleSuggestionClick(autocompleteSuggestions[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setActiveIdx(-1);
    }
  };

  const displayTotalPages = useMemo(() => {
    if (totalPages <= 1 && !hasMoreResults) {
      return 1;
    }
    return hasMoreResults ? Math.max(totalPages, currentPage + 1) : Math.max(1, totalPages);
  }, [currentPage, hasMoreResults, totalPages]);

  const paginationPages = useMemo(() => {
    const pages: number[] = [];
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(displayTotalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, displayTotalPages]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span>Arama Sonuçları</span>
        </nav>

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-1 shadow-sm">
          <div className="rounded-[26px] bg-background/95 p-10 text-center backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <span>Arama Merkezi</span>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Cevabını aradığınız soruyu bulun
            </h1>
            <p className="mt-3 mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground">
              Binlerce fetva arasında arama yapın, sonuçları kategori ve popülerlik filtreleriyle daraltın.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 w-full max-w-3xl">
              <div className="relative h-16 rounded-full border border-primary/20 bg-background shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Fetva veya soru arayın..."
                  className="h-full w-full rounded-full bg-transparent pl-14 pr-32 text-base outline-none"
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={handleKeyDown}
                  aria-controls={listboxId}
                  aria-expanded={inputFocused && autocompleteSuggestions.length > 0}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 flex h-12 -translate-y-1/2 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ara'}
                </button>
              </div>

              {inputFocused && autocompleteSuggestions.length > 0 && (
                <div
                  id={listboxId}
                  role="listbox"
                  className="absolute left-1/2 z-10 mt-3 w-full max-w-3xl -translate-x-1/2 rounded-2xl border border-border/40 bg-background/95 p-2 text-left shadow-lg"
                >
                  {autocompleteSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion + index}
                      type="button"
                      role="option"
                      aria-selected={index === activeIdx}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                        index === activeIdx ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
                      }`}
                    >
                      <Search className="h-4 w-4" />
                      <span className="text-left text-sm">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            <span className="sr-only" aria-live="polite">
              {isSearching ? 'Arama sürüyor' : `${totalResults} sonuç bulundu`}
            </span>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6">
            <div className="hidden lg:block rounded-3xl border border-border/30 bg-background/95 p-6 shadow-sm sticky top-24">
              <FiltersPanel />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full rounded-full lg:hidden">
                  Filtreleri Göster
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-3xl bg-background">
                <div className="space-y-6 py-6">
                  <h2 className="text-lg font-semibold text-foreground">Filtreler</h2>
                  <FiltersPanel />
                  <SheetClose asChild>
                    <Button className="w-full rounded-full bg-primary text-primary-foreground">Uygula</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </aside>

          <section className="space-y-6">
            <header className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-foreground">Arama Sonuçları</h2>
              <p className="text-sm text-muted-foreground">
                "{query}" için {totalResults.toLocaleString('tr-TR')} sonuç bulundu · Sayfa {currentPage}
              </p>
            </header>

            {/* Error Message */}
            {searchError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{searchError}</p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && searchResults.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-islamic-green-600 mr-3" />
                <span className="text-lg">Aranıyor...</span>
              </div>
            )}

            {/* No Results */}
            {!isSearching && searchResults.length === 0 && query && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-islamic-green-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
                <p className="text-muted-foreground mb-4">
                  &quot;{query}&quot; için hiç sonuç bulunamadı.
                </p>
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-islamic-green-600 text-white rounded-lg hover:bg-islamic-green-700 transition-colors"
                >
                  Aramayı Temizle
                </button>
              </div>
            )}

            {/* Results List */}
            {searchResults.length > 0 && (
              <>
                <div className="flex flex-col gap-6">
                  {searchResults.map((result, index) => (
                    <Link key={`${result.fetva.id}-${index}`} href={`/fetva/${result.fetva.id}`}>
                      <div className="group flex flex-col gap-4 rounded-3xl border border-border/40 bg-background/95 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                            <Tag className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">
                              {result.fetva.categories[0]}
                              {result.fetva.categories.length > 1 ? ` +${result.fetva.categories.length - 1}` : ''}
                            </span>
                          </div>
                          <span className="font-medium text-muted-foreground/80">%{Math.round(result.score)} eşleşme</span>
                        </div>

                        <h3
                          className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
                          dangerouslySetInnerHTML={{
                            __html: result.highlightedQuestion || result.fetva.question
                          }}
                        />

                        <p
                          className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: result.highlightedAnswer || result.fetva.answer
                          }}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-3">
                            {result.fetva.source && (
                              <span className="inline-flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" />
                                {result.fetva.source}
                              </span>
                            )}
                            {result.fetva.date && (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(result.fetva.date)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span>{(result.fetva.views || 0).toLocaleString('tr-TR')} görüntülenme</span>
                            <span>•</span>
                            <span>{result.matchedTerms.length} eşleşme</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {displayTotalPages > 1 && (
                  <nav className="mt-12 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Önceki
                    </button>
                    {paginationPages.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                          page === currentPage
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'border border-border/60 text-muted-foreground hover:border-primary hover:text-primary'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasMoreResults && currentPage === displayTotalPages}
                      className="inline-flex items-center rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}