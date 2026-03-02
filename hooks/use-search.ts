"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
=======
import { useState, useEffect, useCallback, useMemo } from "react";
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f

const RESULTS_PER_PAGE = 20;

type SortBy = "relevance" | "date" | "popular" | "views";

type SearchResult = {
  fetva: {
    id: string;
    q_in_file: number;
    question: string;
    answer: string;
    categories: string[];
    source?: string;
    date?: string;
    views: number;
    likes: number;
    searchKeywords?: string[];
    arabicText?: string;
    references?: string[];
    relatedFatwas?: string[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
    normalizedText?: string;
  };
  score: number;
  matchedTerms: string[];
  highlightedQuestion?: string;
  highlightedAnswer?: string;
};

type SearchStats = {
  totalFatwas: number;
  totalKeywords: number;
  averageKeywordsPerFatva: number;
  mostCommonKeywords: Array<{ keyword: string; count: number }>;
};

type SearchPagination = {
  page: number;
  limit: number;
<<<<<<< HEAD
  total?: number;
  totalPages?: number;
=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
  hasMore?: boolean;
};

type SearchResponse = {
  results?: SearchResult[];
  pagination?: SearchPagination;
  success?: boolean;
};

type SearchStatsResponse = {
  stats?: SearchStats;
  success?: boolean;
};

type AutocompleteResponse = {
  suggestions?: string[];
  success?: boolean;
};

type SearchOptions = {
  query?: string;
  category?: string;
  sortBy?: SortBy;
  limit?: number;
  page?: number;
};

export type UseSearchReturn = {
  query: string;
  setQuery: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;

  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;

  currentPage: number;
  totalPages: number;
  totalResults: number;
  setCurrentPage: (page: number) => void;

  performSearch: () => void;
  clearSearch: () => void;
  autocompleteSuggestions: string[];
  isAutocompleteLoading: boolean;

  searchStats: SearchStats | null;
  hasMoreResults: boolean;
};

function buildSearchParams(options: SearchOptions): string {
  const params = new URLSearchParams();

  if (options.query) {
    params.set("q", options.query);
  }

  if (options.category) {
    params.set("category", options.category);
  }

  if (options.sortBy) {
    params.set("sortBy", options.sortBy);
  }

  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }

  if (typeof options.page === "number") {
    params.set("page", String(options.page));
  }

  return params.toString();
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");

  const [currentPage, setCurrentPageState] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(false);

  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);

  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
<<<<<<< HEAD
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const autocompleteAbortControllerRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const autocompleteRequestIdRef = useRef(0);
=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f

  const totalPages = useMemo(() => {
    if (totalResults === 0) {
      return hasMoreResults ? currentPage + 1 : 1;
    }
    return Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE));
  }, [totalResults, hasMoreResults, currentPage]);

  const loadSearchStats = useCallback(async () => {
    try {
<<<<<<< HEAD
      const data = await fetchJson<SearchStatsResponse>("/api/search/stats");
=======
      const data = await fetchJson<SearchStatsResponse>("/api/search/stats", { cache: "no-store" });
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      if (data.stats) {
        setSearchStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load search stats:", error);
    }
  }, []);

  useEffect(() => {
    void loadSearchStats();
  }, [loadSearchStats]);

  const performSearchInternal = useCallback(
    async (page: number) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery && !selectedCategory) {
<<<<<<< HEAD
        searchAbortControllerRef.current?.abort();
        searchAbortControllerRef.current = null;
=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
        setSearchResults([]);
        setHasMoreResults(false);
        setTotalResults(0);
        setCurrentPageState(1);
        return;
      }

<<<<<<< HEAD
      const requestId = ++searchRequestIdRef.current;
      searchAbortControllerRef.current?.abort();
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      setIsSearching(true);
      setSearchError(null);

      try {
        const params = buildSearchParams({
          query: trimmedQuery || undefined,
          category: selectedCategory || undefined,
          sortBy,
          limit: RESULTS_PER_PAGE,
          page,
        });

<<<<<<< HEAD
        const data = await fetchJson<SearchResponse>(`/api/search?${params}`, {
          signal: controller.signal,
        });
        if (requestId !== searchRequestIdRef.current) {
          return;
        }
        const results = Array.isArray(data.results) ? data.results : [];
        const hasMore = Boolean(data.pagination?.hasMore);
        const totalFromApi = data.pagination?.total;
        const total = typeof totalFromApi === "number" && Number.isFinite(totalFromApi) && totalFromApi >= 0
          ? totalFromApi
          : (hasMore ? page * RESULTS_PER_PAGE + 1 : (page - 1) * RESULTS_PER_PAGE + results.length);
=======
        const data = await fetchJson<SearchResponse>(`/api/search?${params}`, { cache: "no-store" });
        const results = Array.isArray(data.results) ? data.results : [];
        const hasMore = Boolean(data.pagination?.hasMore);
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f

        setSearchResults(results);
        setHasMoreResults(hasMore);
        setCurrentPageState(page);

<<<<<<< HEAD
        setTotalResults(total);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        if (requestId !== searchRequestIdRef.current) {
          return;
        }
        console.error("Search error:", error);
        setSearchError("Arama sırasında bir hata oluştu");
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
=======
        const estimatedTotal = hasMore
          ? page * RESULTS_PER_PAGE + 1
          : (page - 1) * RESULTS_PER_PAGE + results.length;
        setTotalResults(estimatedTotal);
      } catch (error) {
        console.error("Search error:", error);
        setSearchError("Arama sırasında bir hata oluştu");
      } finally {
        setIsSearching(false);
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      }
    },
    [query, selectedCategory, sortBy]
  );

  const performSearch = useCallback(() => {
    void performSearchInternal(1);
  }, [performSearchInternal]);

  const loadAutocompleteSuggestions = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (trimmed.length < 2) {
<<<<<<< HEAD
        autocompleteAbortControllerRef.current?.abort();
        autocompleteAbortControllerRef.current = null;
=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
        setAutocompleteSuggestions([]);
        return;
      }

<<<<<<< HEAD
      const requestId = ++autocompleteRequestIdRef.current;
      autocompleteAbortControllerRef.current?.abort();
      const controller = new AbortController();
      autocompleteAbortControllerRef.current = controller;

=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      setIsAutocompleteLoading(true);

      try {
        const params = new URLSearchParams({ q: trimmed, limit: "8" });
<<<<<<< HEAD
        const data = await fetchJson<AutocompleteResponse>(`/api/autocomplete?${params}`, {
          signal: controller.signal,
        });
        if (requestId !== autocompleteRequestIdRef.current) {
          return;
        }

        setAutocompleteSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        if (requestId !== autocompleteRequestIdRef.current) {
          return;
        }
        console.error("Autocomplete error:", error);
        setAutocompleteSuggestions([]);
      } finally {
        if (requestId === autocompleteRequestIdRef.current) {
          setIsAutocompleteLoading(false);
        }
=======
        const data = await fetchJson<AutocompleteResponse>(`/api/autocomplete?${params}`, { cache: "no-store" });
        setAutocompleteSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (error) {
        console.error("Autocomplete error:", error);
        setAutocompleteSuggestions([]);
      } finally {
        setIsAutocompleteLoading(false);
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
<<<<<<< HEAD
    searchAbortControllerRef.current?.abort();
    searchAbortControllerRef.current = null;
    autocompleteAbortControllerRef.current?.abort();
    autocompleteAbortControllerRef.current = null;
    searchRequestIdRef.current += 1;
    autocompleteRequestIdRef.current += 1;

=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
    setQuery("");
    setSelectedCategory("");
    setSortBy("relevance");
    setSearchResults([]);
    setCurrentPageState(1);
    setTotalResults(0);
    setHasMoreResults(false);
    setAutocompleteSuggestions([]);
    setSearchError(null);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed && !selectedCategory) {
<<<<<<< HEAD
      searchAbortControllerRef.current?.abort();
      searchAbortControllerRef.current = null;
      autocompleteAbortControllerRef.current?.abort();
      autocompleteAbortControllerRef.current = null;
=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      setSearchResults([]);
      setTotalResults(0);
      setHasMoreResults(false);
      setAutocompleteSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      void performSearchInternal(1);

      if (trimmed.length >= 2) {
        void loadAutocompleteSuggestions(trimmed);
      } else {
        setAutocompleteSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, selectedCategory, sortBy, performSearchInternal, loadAutocompleteSuggestions]);

<<<<<<< HEAD
  useEffect(() => {
    return () => {
      searchAbortControllerRef.current?.abort();
      autocompleteAbortControllerRef.current?.abort();
    };
  }, []);

=======
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || isSearching) {
        return;
      }

      void performSearchInternal(page);
    },
    [isSearching, performSearchInternal]
  );

  return {
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
    setCurrentPage: goToPage,

    performSearch,
    clearSearch,
    autocompleteSuggestions,
    isAutocompleteLoading,

    searchStats,
    hasMoreResults,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
<<<<<<< HEAD
        const data = await fetchJson<{ categories?: Array<{ name: string; fatwaCount?: number }> }>("/api/categories");
=======
        const data = await fetchJson<{ categories?: Array<{ name: string; fatwaCount?: number }> }>("/api/categories", {
          cache: "no-store",
        });
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f

        if (isMounted) {
          const list = Array.isArray(data.categories) ? data.categories : [];
          setCategories(list.map(item => ({ name: item.name, count: item.fatwaCount ?? 0 })));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (isMounted) {
          setError("Kategoriler yüklenemedi");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading, error };
}

export function useFetvas(type: "popular" | "recent" = "popular", limit = 10) {
  const [fetvas, setFetvas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFetvas = async () => {
      try {
        const params = buildSearchParams({
          sortBy: type === "popular" ? "views" : "date",
          limit,
          page: 1,
        });

<<<<<<< HEAD
        const data = await fetchJson<SearchResponse>(`/api/search?${params}`);
=======
        const data = await fetchJson<SearchResponse>(`/api/search?${params}`, { cache: "no-store" });
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
        const results = Array.isArray(data.results) ? data.results : [];

        if (isMounted) {
          setFetvas(results.map(item => item.fetva ?? item));
        }
      } catch (err) {
        console.error(`Failed to load ${type} fetvas:`, err);
        if (isMounted) {
          setError(`${type === "popular" ? "Popüler" : "Yeni"} fetvalar yüklenemedi`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchFetvas();

    return () => {
      isMounted = false;
    };
  }, [type, limit]);

  return { fetvas, loading, error };
}

export function useSimilarQuestions(question: string, limit = 5) {
  const [similarQuestions, setSimilarQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = question.trim();

    if (trimmed.length < 3) {
      setSimilarQuestions([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSimilar = async () => {
      try {
        const params = buildSearchParams({
          query: trimmed,
          sortBy: "relevance",
          limit,
          page: 1,
        });

<<<<<<< HEAD
        const data = await fetchJson<SearchResponse>(`/api/search?${params}`);
=======
        const data = await fetchJson<SearchResponse>(`/api/search?${params}`, { cache: "no-store" });
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
        const results = Array.isArray(data.results) ? data.results : [];

        if (isMounted) {
          setSimilarQuestions(results.map(item => item.fetva ?? item));
        }
      } catch (err) {
        console.error("Failed to load similar questions:", err);
        if (isMounted) {
          setError("Benzer sorular yüklenemedi");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchSimilar();

    return () => {
      isMounted = false;
    };
  }, [question, limit]);

  return { similarQuestions, loading, error };
}
