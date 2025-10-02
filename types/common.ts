import { z } from 'zod';

// Common utility types
export type Language = 'tr' | 'en';

export type SortOrder = 'asc' | 'desc';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userMessage: string;
}

export class DataServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DataServiceError';
  }
}

// Validation schemas
export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const LanguageSchema = z.enum(['tr', 'en']);

export const SortOrderSchema = z.enum(['asc', 'desc']);

// Site statistics
export interface SiteStats {
  totalFatwas: number;
  totalCategories: number;
  totalViews: number;
  popularCategories: string[];
}

export const SiteStatsSchema = z.object({
  totalFatwas: z.number().min(0),
  totalCategories: z.number().min(0),
  totalViews: z.number().min(0),
  popularCategories: z.array(z.string()),
});