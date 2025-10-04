'use client';

import { Search, Filter, Clock, Tag, Loader2, BookOpen, Calendar } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
    loadMoreResults,
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

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-islamic-green-600" />
          <h3 className="font-semibold">Filtreler</h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Kategori</h4>
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Yükleniyor...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={selectedCategory === ''}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-islamic-green-600 focus:ring-islamic-green-500"
                  />
                  <span className="text-sm">Tümü</span>
                </label>
                {categories.map((category) => (
                  <label key={category.name} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.name}
                      checked={selectedCategory === category.name}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-islamic-green-600 focus:ring-islamic-green-500"
                    />
                    <span className="text-sm">{category.name} ({category.count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-3">Sıralama</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 border border-islamic-green-200 rounded-lg focus:border-islamic-green-500 focus:ring-2 focus:ring-islamic-green-100"
            >
              <option value="relevance">İlgili Olanlar</option>
              <option value="date">En Yeni</option>
              <option value="popular">En Popüler</option>
              <option value="views">En Çok Görüntülenen</option>
            </select>
          </div>

          {searchStats && (
            <div className="p-4 bg-islamic-green-50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">İstatistikler</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Toplam Fetva: {searchStats.totalFatwas.toLocaleString('tr-TR')}</div>
                <div>Toplam Anahtar Kelime: {searchStats.totalKeywords.toLocaleString('tr-TR')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (!hasMoreResults || isSearching) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          loadMoreResults();
        }
      },
      { rootMargin: '200px' }
    );
    const node = sentinelRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [hasMoreResults, isSearching, loadMoreResults]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span>Arama Sonuçları</span>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-container mb-8 w-full lg:max-w-3xl lg:mx-0">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sorunuzu yazın..."
              className="search-input"
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={handleKeyDown}
              aria-controls={listboxId}
              aria-expanded={inputFocused && autocompleteSuggestions.length > 0}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="search-icon-button disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Ara"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin text-islamic-green-600" />
              ) : (
                <Search className="w-5 h-5 text-islamic-green-600" />
              )}
            </button>
          </div>

          {/* Autocomplete Suggestions */}
          {inputFocused && autocompleteSuggestions.length > 0 && (
            <div
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 z-10 mt-2 bg-white border border-islamic-green-200 rounded-xl shadow-lg"
            >
              {autocompleteSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  role="option"
                  aria-selected={index === activeIdx}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-3 cursor-pointer border-b border-islamic-green-100 last:border-b-0 ${
                    index === activeIdx ? 'bg-islamic-green-50' : 'hover:bg-islamic-green-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-islamic-green-600" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="card-islamic p-6 sticky top-24">
              <FiltersPanel />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Arama Sonuçları</h2>
                <p className="text-muted-foreground">
                  &quot;{query}&quot; için {totalResults.toLocaleString('tr-TR')} sonuç bulundu
                </p>
                {/* A11y: announce result updates */}
                <span className="sr-only" aria-live="polite">
                  {isSearching ? 'Arama sürüyor' : `${totalResults} sonuç bulundu`}
                </span>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center space-x-2 lg:hidden"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtreler</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                  <div className="mt-2 space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Filtreler</h2>
                    <FiltersPanel />
                    <SheetClose asChild>
                      <Button className="w-full bg-islamic-green-600 hover:bg-islamic-green-700 text-white">
                        Uygula
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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
                <div className="space-y-6">
                  {searchResults.map((result, index) => (
                    <Link key={`${result.fetva.id}-${index}`} href={`/fetva/${result.fetva.id}`}>
                      <div className="fetva-card group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-islamic-green-600" />
                            <span className="text-sm text-islamic-green-600 font-medium">
                              {result.fetva.categories[0]}
                            </span>
                            {result.fetva.categories.length > 1 && (
                              <span className="text-xs text-muted-foreground">
                                +{result.fetva.categories.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            %{Math.round(result.score)} eşleşme
                          </div>
                        </div>

                        <h3
                          className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: result.highlightedQuestion || result.fetva.question
                          }}
                        />

                        <p
                          className="text-muted-foreground mb-4 line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: result.highlightedAnswer || result.fetva.answer
                          }}
                        />

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            {result.fetva.source && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{result.fetva.source}</span>
                              </div>
                            )}
                            {result.fetva.date && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(result.fetva.date)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span>{result.fetva.views || 0} görüntülenme</span>
                            <span>•</span>
                            <span>{result.matchedTerms.length} eşleşme</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Infinite Scroll Sentinel */}
                <div ref={sentinelRef} className="h-1" />
                {/* Load More Button */}
                {currentPage < totalPages && (
                  <div className="flex items-center justify-center mt-12">
                    <button
                      onClick={loadMoreResults}
                      disabled={isSearching}
                      className="px-6 py-3 bg-islamic-green-600 text-white rounded-lg hover:bg-islamic-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <span>Daha Fazla Sonuç Yükle</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-islamic-green-200 rounded-lg hover:bg-islamic-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-islamic-green-600 text-white'
                              : 'border border-islamic-green-200 hover:bg-islamic-green-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-islamic-green-200 rounded-lg hover:bg-islamic-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}