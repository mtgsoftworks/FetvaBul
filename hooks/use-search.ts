"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DATA_SYNCED_EVENT, getSyncedDatasetText } from "@/lib/data-sync";

const RESULTS_PER_PAGE = 20;
const OFFLINE_BUILD = process.env.NEXT_PUBLIC_OFFLINE_BUILD === "1";
const LOCAL_DATA_URL = "/data/processed_fetvas.jsonl";

const TURKISH_CHAR_MAP: Record<string, string> = {
  "ç": "c",
  "ğ": "g",
  "ı": "i",
  "ö": "o",
  "ş": "s",
  "ü": "u",
};

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
  total?: number;
  totalPages?: number;
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

type LocalFetva = SearchResult["fetva"];

let localFatwasPromise: Promise<LocalFetva[]> | null = null;
let localStatsPromise: Promise<SearchStats> | null = null;
let localCategoriesPromise: Promise<Array<{ name: string; fatwaCount: number }>> | null = null;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[çğıöşü]/g, (char) => TURKISH_CHAR_MAP[char] ?? char)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDateValue(value?: string | Date): number {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toLocalFetva(raw: unknown, index: number): LocalFetva {
  const record = (raw ?? {}) as Record<string, unknown>;
  const id =
    (typeof record.id === "string" && record.id.trim()) ||
    (typeof record._id === "string" && record._id.trim()) ||
    `fetva-${index + 1}`;

  const question = typeof record.question === "string" ? record.question : "";
  const answer = typeof record.answer === "string" ? record.answer : "";
  const categories = toStringArray(record.categories);
  const views = typeof record.views === "number" && Number.isFinite(record.views) ? record.views : 0;
  const likes = typeof record.likes === "number" && Number.isFinite(record.likes) ? record.likes : 0;
  const qInFile = typeof record.q_in_file === "number" && Number.isFinite(record.q_in_file) ? record.q_in_file : index + 1;

  return {
    id,
    q_in_file: qInFile,
    question,
    answer,
    categories: categories.length > 0 ? categories : ["Genel"],
    source: typeof record.source === "string" ? record.source : undefined,
    date: typeof record.date === "string" ? record.date : undefined,
    views,
    likes,
    searchKeywords: toStringArray(record.searchKeywords),
    arabicText: typeof record.arabicText === "string" ? record.arabicText : undefined,
    references: toStringArray(record.references),
    relatedFatwas: toStringArray(record.relatedFatwas),
    createdAt:
      typeof record.createdAt === "string" || record.createdAt instanceof Date
        ? (record.createdAt as string | Date)
        : undefined,
    updatedAt:
      typeof record.updatedAt === "string" || record.updatedAt instanceof Date
        ? (record.updatedAt as string | Date)
        : undefined,
    normalizedText: typeof record.normalizedText === "string" ? record.normalizedText : undefined,
  };
}

function parseJsonl(content: string): LocalFetva[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const fatwas: LocalFetva[] = [];

  lines.forEach((line, index) => {
    try {
      const parsed = JSON.parse(line);
      fatwas.push(toLocalFetva(parsed, index));
    } catch {
      // Ignore malformed rows to keep offline search resilient.
    }
  });

  return fatwas;
}

async function loadLocalFatwas(): Promise<LocalFetva[]> {
  if (!localFatwasPromise) {
    localFatwasPromise = (async () => {
      const syncedDataset = await getSyncedDatasetText();
      if (syncedDataset) {
        const syncedParsed = parseJsonl(syncedDataset);
        if (syncedParsed.length > 0) {
          return syncedParsed;
        }
      }

      const response = await fetch(LOCAL_DATA_URL, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`Local data request failed with status ${response.status}`);
      }

      const text = await response.text();
      const parsed = parseJsonl(text);

      if (parsed.length === 0) {
        throw new Error("Local data file is empty or malformed");
      }

      return parsed;
    })().catch((error) => {
      localFatwasPromise = null;
      throw error;
    });
  }

  return localFatwasPromise;
}

function scoreFetva(fetva: LocalFetva, queryTokens: string[], normalizedQuery: string) {
  if (queryTokens.length === 0) {
    return {
      score: 1,
      matchedTerms: [] as string[],
    };
  }

  const normalizedQuestion = normalizeText(fetva.question);
  const normalizedAnswer = normalizeText(fetva.answer);
  const normalizedCategories = normalizeText(fetva.categories.join(" "));
  const normalizedSource = normalizeText(fetva.source ?? "");

  const matchedTerms = new Set<string>();
  let score = 0;

  for (const token of queryTokens) {
    let matched = false;

    if (normalizedQuestion.includes(token)) {
      score += 6;
      matched = true;
    }
    if (normalizedCategories.includes(token)) {
      score += 4;
      matched = true;
    }
    if (normalizedAnswer.includes(token)) {
      score += 2;
      matched = true;
    }
    if (normalizedSource.includes(token)) {
      score += 1;
      matched = true;
    }

    if (matched) {
      matchedTerms.add(token);
    }
  }

  if (normalizedQuery.length > 2) {
    if (normalizedQuestion.includes(normalizedQuery)) {
      score += 8;
      matchedTerms.add(normalizedQuery);
    } else if (normalizedAnswer.includes(normalizedQuery)) {
      score += 3;
      matchedTerms.add(normalizedQuery);
    }
  }

  return {
    score,
    matchedTerms: Array.from(matchedTerms),
  };
}

async function runLocalSearch(options: SearchOptions): Promise<SearchResponse> {
  const fatwas = await loadLocalFatwas();
  const normalizedQuery = normalizeText(options.query ?? "");
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const normalizedCategory = normalizeText(options.category ?? "");
  const sortBy: SortBy = options.sortBy ?? "relevance";
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.max(1, options.limit ?? RESULTS_PER_PAGE);

  const scored = fatwas
    .filter((fetva) => {
      if (!normalizedCategory) {
        return true;
      }

      return fetva.categories.some((category) => normalizeText(category) === normalizedCategory);
    })
    .map((fetva) => {
      const { score, matchedTerms } = scoreFetva(fetva, queryTokens, normalizedQuery);
      return {
        fetva,
        score,
        matchedTerms,
      };
    })
    .filter((item) => (queryTokens.length === 0 ? true : item.score > 0));

  scored.sort((a, b) => {
    if (sortBy === "date") {
      const bDate = parseDateValue(b.fetva.date ?? b.fetva.createdAt ?? b.fetva.updatedAt);
      const aDate = parseDateValue(a.fetva.date ?? a.fetva.createdAt ?? a.fetva.updatedAt);
      return bDate - aDate || (b.fetva.views ?? 0) - (a.fetva.views ?? 0);
    }

    if (sortBy === "views" || sortBy === "popular") {
      return (b.fetva.views ?? 0) - (a.fetva.views ?? 0) || (b.fetva.likes ?? 0) - (a.fetva.likes ?? 0);
    }

    return b.score - a.score || (b.fetva.views ?? 0) - (a.fetva.views ?? 0) || (b.fetva.likes ?? 0) - (a.fetva.likes ?? 0);
  });

  const total = scored.length;
  const start = (page - 1) * limit;
  const paged = scored.slice(start, start + limit);

  return {
    results: paged.map((item) => ({
      fetva: item.fetva,
      score: item.score,
      matchedTerms: item.matchedTerms,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: start + limit < total,
    },
    success: true,
  };
}

async function getLocalCategories(): Promise<Array<{ name: string; fatwaCount: number }>> {
  if (!localCategoriesPromise) {
    localCategoriesPromise = (async () => {
      const fatwas = await loadLocalFatwas();
      const counts = new Map<string, number>();

      for (const fetva of fatwas) {
        for (const category of fetva.categories) {
          const key = category.trim();
          if (!key) continue;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }

      return Array.from(counts.entries())
        .map(([name, fatwaCount]) => ({ name, fatwaCount }))
        .sort((a, b) => b.fatwaCount - a.fatwaCount || a.name.localeCompare(b.name, "tr"));
    })().catch((error) => {
      localCategoriesPromise = null;
      throw error;
    });
  }

  return localCategoriesPromise;
}

function getKeywordsForStats(fetva: LocalFetva): string[] {
  if (Array.isArray(fetva.searchKeywords) && fetva.searchKeywords.length > 0) {
    return fetva.searchKeywords.map((keyword) => normalizeText(keyword)).filter(Boolean);
  }

  return normalizeText(`${fetva.question} ${fetva.answer}`)
    .split(" ")
    .filter((token) => token.length >= 4)
    .slice(0, 20);
}

async function getLocalSearchStats(): Promise<SearchStats> {
  if (!localStatsPromise) {
    localStatsPromise = (async () => {
      const fatwas = await loadLocalFatwas();
      const keywordCounts = new Map<string, number>();
      let totalKeywordsAcrossFatwas = 0;

      for (const fetva of fatwas) {
        const keywords = getKeywordsForStats(fetva);
        totalKeywordsAcrossFatwas += keywords.length;

        for (const keyword of keywords) {
          keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
        }
      }

      const mostCommonKeywords = Array.from(keywordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([keyword, count]) => ({ keyword, count }));

      return {
        totalFatwas: fatwas.length,
        totalKeywords: keywordCounts.size,
        averageKeywordsPerFatva: fatwas.length > 0 ? totalKeywordsAcrossFatwas / fatwas.length : 0,
        mostCommonKeywords,
      };
    })().catch((error) => {
      localStatsPromise = null;
      throw error;
    });
  }

  return localStatsPromise;
}

async function getLocalAutocomplete(query: string, limit: number): Promise<string[]> {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) {
    return [];
  }

  const fatwas = await loadLocalFatwas();
  const suggestions = new Set<string>();

  for (const fetva of fatwas) {
    if (suggestions.size >= limit) {
      break;
    }

    const question = fetva.question.trim();
    if (question && normalizeText(question).includes(normalizedQuery)) {
      suggestions.add(question);
    }

    for (const keyword of fetva.searchKeywords ?? []) {
      if (suggestions.size >= limit) {
        break;
      }

      const normalizedKeyword = normalizeText(keyword);
      if (normalizedKeyword.includes(normalizedQuery)) {
        suggestions.add(keyword.trim());
      }
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

async function fetchSearchWithFallback(options: SearchOptions, signal?: AbortSignal): Promise<SearchResponse> {
  if (OFFLINE_BUILD) {
    return runLocalSearch(options);
  }

  try {
    const params = buildSearchParams(options);
    return await fetchJson<SearchResponse>(`/api/search?${params}`, { signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    console.warn("[use-search] Falling back to local search dataset", error);
    return runLocalSearch(options);
  }
}

async function fetchStatsWithFallback(): Promise<SearchStats> {
  if (OFFLINE_BUILD) {
    return getLocalSearchStats();
  }

  try {
    const data = await fetchJson<SearchStatsResponse>("/api/search/stats");
    if (data.stats) {
      return data.stats;
    }
  } catch (error) {
    console.warn("[use-search] Falling back to local search stats", error);
  }

  return getLocalSearchStats();
}

async function fetchAutocompleteWithFallback(query: string, limit: number, signal?: AbortSignal): Promise<string[]> {
  if (OFFLINE_BUILD) {
    return getLocalAutocomplete(query, limit);
  }

  try {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    const data = await fetchJson<AutocompleteResponse>(`/api/autocomplete?${params}`, { signal });
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    console.warn("[use-search] Falling back to local autocomplete", error);
    return getLocalAutocomplete(query, limit);
  }
}

async function fetchCategoriesWithFallback(): Promise<Array<{ name: string; fatwaCount?: number }>> {
  if (OFFLINE_BUILD) {
    return getLocalCategories();
  }

  try {
    const data = await fetchJson<{ categories?: Array<{ name: string; fatwaCount?: number }> }>("/api/categories");
    return Array.isArray(data.categories) ? data.categories : [];
  } catch (error) {
    console.warn("[use-search] Falling back to local categories", error);
    return getLocalCategories();
  }
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
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const autocompleteAbortControllerRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const autocompleteRequestIdRef = useRef(0);

  const totalPages = useMemo(() => {
    if (totalResults === 0) {
      return hasMoreResults ? currentPage + 1 : 1;
    }
    return Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE));
  }, [totalResults, hasMoreResults, currentPage]);

  const loadSearchStats = useCallback(async () => {
    try {
      const stats = await fetchStatsWithFallback();
      setSearchStats(stats);
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
        searchAbortControllerRef.current?.abort();
        searchAbortControllerRef.current = null;
        setSearchResults([]);
        setHasMoreResults(false);
        setTotalResults(0);
        setCurrentPageState(1);
        return;
      }

      const requestId = ++searchRequestIdRef.current;
      searchAbortControllerRef.current?.abort();
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setIsSearching(true);
      setSearchError(null);

      try {
        const data = await fetchSearchWithFallback({
          query: trimmedQuery || undefined,
          category: selectedCategory || undefined,
          sortBy,
          limit: RESULTS_PER_PAGE,
          page,
        }, controller.signal);
        if (requestId !== searchRequestIdRef.current) {
          return;
        }
        const results = Array.isArray(data.results) ? data.results : [];
        const hasMore = Boolean(data.pagination?.hasMore);
        const totalFromApi = data.pagination?.total;
        const total = typeof totalFromApi === "number" && Number.isFinite(totalFromApi) && totalFromApi >= 0
          ? totalFromApi
          : (hasMore ? page * RESULTS_PER_PAGE + 1 : (page - 1) * RESULTS_PER_PAGE + results.length);

        setSearchResults(results);
        setHasMoreResults(hasMore);
        setCurrentPageState(page);

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
        autocompleteAbortControllerRef.current?.abort();
        autocompleteAbortControllerRef.current = null;
        setAutocompleteSuggestions([]);
        return;
      }

      const requestId = ++autocompleteRequestIdRef.current;
      autocompleteAbortControllerRef.current?.abort();
      const controller = new AbortController();
      autocompleteAbortControllerRef.current = controller;

      setIsAutocompleteLoading(true);

      try {
        const suggestions = await fetchAutocompleteWithFallback(trimmed, 8, controller.signal);
        if (requestId !== autocompleteRequestIdRef.current) {
          return;
        }

        setAutocompleteSuggestions(suggestions);
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
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    searchAbortControllerRef.current?.abort();
    searchAbortControllerRef.current = null;
    autocompleteAbortControllerRef.current?.abort();
    autocompleteAbortControllerRef.current = null;
    searchRequestIdRef.current += 1;
    autocompleteRequestIdRef.current += 1;

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
      searchAbortControllerRef.current?.abort();
      searchAbortControllerRef.current = null;
      autocompleteAbortControllerRef.current?.abort();
      autocompleteAbortControllerRef.current = null;
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

  useEffect(() => {
    return () => {
      searchAbortControllerRef.current?.abort();
      autocompleteAbortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const handleDataSynced = () => {
      localFatwasPromise = null;
      localStatsPromise = null;
      localCategoriesPromise = null;

      const hasQueryContext = query.trim().length > 0 || selectedCategory.trim().length > 0;
      if (hasQueryContext) {
        void performSearchInternal(1);
      }

      void loadSearchStats();
    };

    window.addEventListener(DATA_SYNCED_EVENT, handleDataSynced);
    return () => {
      window.removeEventListener(DATA_SYNCED_EVENT, handleDataSynced);
    };
  }, [loadSearchStats, performSearchInternal, query, selectedCategory]);

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
        const categories = await fetchCategoriesWithFallback();

        if (isMounted) {
          setCategories(categories.map(item => ({ name: item.name, count: item.fatwaCount ?? 0 })));
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
        const data = await fetchSearchWithFallback({
          sortBy: type === "popular" ? "views" : "date",
          limit,
          page: 1,
        });
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
        const data = await fetchSearchWithFallback({
          query: trimmed,
          sortBy: "relevance",
          limit,
          page: 1,
        });
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
