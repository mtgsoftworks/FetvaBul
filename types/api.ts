import { z } from 'zod';
import { Fetva, FetvaSearchResult } from './fetva';
import { Category } from './category';
import { SearchResult, SearchSuggestion } from './search';
import { SiteStats } from './common';

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

// API error interface
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

// API endpoints response types
export interface SearchApiResponse extends ApiResponse<SearchResult> {}

export interface FetvaApiResponse extends ApiResponse<Fetva> {}

export interface FetvaListApiResponse extends ApiResponse<{
  fatwas: Fetva[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}> {}

export interface CategoryApiResponse extends ApiResponse<Category> {}

export interface CategoryListApiResponse extends ApiResponse<Category[]> {}

export interface SuggestionsApiResponse extends ApiResponse<SearchSuggestion[]> {}

export interface StatsApiResponse extends ApiResponse<SiteStats> {}

// Request validation schemas
export const SearchRequestSchema = z.object({
  q: z.string().min(1).max(500),
  categories: z.string().optional().transform((val) => 
    val ? val.split(',').filter(Boolean) : undefined
  ),
  sort: z.enum(['relevance', 'date', 'views', 'likes', 'alphabetical']).default('relevance'),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
  lang: z.enum(['tr', 'en']).default('tr'),
});

export const FetvaRequestSchema = z.object({
  id: z.string().min(1),
});

export const CategoryRequestSchema = z.object({
  slug: z.string().min(1),
});

export const PopularFatwaRequestSchema = z.object({
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  category: z.string().optional(),
});

export const RelatedFatwaRequestSchema = z.object({
  id: z.string().min(1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 5),
});

// API response helpers
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

// Common API error codes
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_SEARCH_QUERY: 'INVALID_SEARCH_QUERY',
  DATA_LOADING_ERROR: 'DATA_LOADING_ERROR',
  SEARCH_INDEX_ERROR: 'SEARCH_INDEX_ERROR',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  TOO_MANY_REQUESTS: 429,
} as const;

// Type guards for API responses
export function isApiError(response: ApiResponse): response is ApiResponse & { error: ApiError } {
  return !response.success && !!response.error;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && !!response.data;
}

// Request validation helpers
export type SearchRequestParams = z.infer<typeof SearchRequestSchema>;
export type FetvaRequestParams = z.infer<typeof FetvaRequestSchema>;
export type CategoryRequestParams = z.infer<typeof CategoryRequestSchema>;
export type PopularFatwaRequestParams = z.infer<typeof PopularFatwaRequestSchema>;
export type RelatedFatwaRequestParams = z.infer<typeof RelatedFatwaRequestSchema>;