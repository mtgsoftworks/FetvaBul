import { z } from 'zod';
import { Fetva, FetvaSearchResult } from './fetva';
import { Category } from './category';
import { PaginationParams, PaginationResult, Language } from './common';

// Search query interface
export interface SearchQuery {
  query: string;
  categories?: string[];
  sortBy?: SearchSortBy;
  page?: number;
  limit?: number;
  language?: Language;
  filters?: SearchFilters;
}

// Search sort options
export type SearchSortBy = 'relevance' | 'date' | 'views' | 'likes' | 'alphabetical';

// Search filters
export interface SearchFilters {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  minViews?: number;
  hasArabicText?: boolean;
  categories?: string[];
}

// Search result interface
export interface SearchResult {
  fatwas: FetvaSearchResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  suggestions?: string[];
  relatedCategories?: Category[];
  searchTime: number;
  query: string;
}

// Search suggestions
export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'fatwa';
  count?: number;
  category?: string;
}

// Search analytics
export interface SearchAnalytics {
  query: string;
  resultCount: number;
  searchTime: number;
  timestamp: Date;
  language: Language;
  filters?: SearchFilters;
}

// Search index entry for internal use
export interface SearchIndexEntry {
  term: string;
  documents: Map<string, {
    id: string;
    frequency: number;
    positions: number[];
    fieldWeights: {
      question: number;
      answer: number;
      categories: number;
    };
  }>;
}

// Search options for internal search engine
export interface SearchOptions {
  fuzzy?: boolean;
  stemming?: boolean;
  synonyms?: boolean;
  maxResults?: number;
  minScore?: number;
}

// Internal search options for data service
export interface InternalSearchOptions {
  query: string;
  category?: string;
  sortBy?: 'relevance' | 'date' | 'popular' | 'views';
  limit?: number;
  offset?: number;
  minScore?: number;
}

// Internal search result for data service
export interface InternalSearchResult {
  fetva: Fetva;
  score: number;
  matchedTerms: string[];
  highlightedQuestion?: string;
  highlightedAnswer?: string;
}

// Validation schemas
export const SearchSortBySchema = z.enum(['relevance', 'date', 'views', 'likes', 'alphabetical']);

export const SearchFiltersSchema = z.object({
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  minViews: z.number().min(0).optional(),
  hasArabicText: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  categories: z.array(z.string()).optional(),
  sortBy: SearchSortBySchema.default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  language: z.enum(['tr', 'en']).default('tr'),
  filters: SearchFiltersSchema.optional(),
});

export const SearchSuggestionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['query', 'category', 'fatwa']),
  count: z.number().min(0).optional(),
  category: z.string().optional(),
});

export const SearchAnalyticsSchema = z.object({
  query: z.string().min(1),
  resultCount: z.number().min(0),
  searchTime: z.number().min(0),
  timestamp: z.date(),
  language: z.enum(['tr', 'en']),
  filters: SearchFiltersSchema.optional(),
});

// Type guards
export function isValidSearchQuery(data: unknown): data is SearchQuery {
  return SearchQuerySchema.safeParse(data).success;
}

export function isValidSearchFilters(data: unknown): data is SearchFilters {
  return SearchFiltersSchema.safeParse(data).success;
}

// Search utility functions
export function createEmptySearchResult(query: string): SearchResult {
  return {
    fatwas: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    searchTime: 0,
    query,
  };
}

export function calculatePagination(
  totalCount: number,
  page: number,
  limit: number
): PaginationResult {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// Search term normalization for Turkish text
export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .trim()
    .replace(/[çğıöşü]/g, (match) => {
      const map: Record<string, string> = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
      };
      return map[match] || match;
    })
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}