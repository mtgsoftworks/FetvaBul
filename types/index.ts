export type SearchSort = 'relevance' | 'date' | 'popular' | 'views';

export interface RawFetvaData {
  id?: string;
  _id?: string;
  q_in_file?: number;
  question: string;
  answer: string;
  categories: string[];
  source?: string;
  date?: string;
  views?: number;
  likes?: number;
  searchKeywords?: string[];
  arabicText?: string;
  references?: string[];
  relatedFatwas?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  normalizedText?: string;
}

export interface Fetva {
  id: string;
  q_in_file?: number;
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
  normalizedText?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  fatwaCount: number;
}

export interface SiteStats {
  totalFatwas: number;
  totalCategories: number;
  totalViews: number;
  popularCategories: string[];
}

export interface InternalSearchOptions {
  query: string;
  category?: string;
  sortBy?: SearchSort;
  limit?: number;
  offset?: number;
  minScore?: number;
}

export interface InternalSearchResult {
  fetva: Fetva;
  score: number;
  matchedTerms: string[];
  highlightedQuestion?: string;
  highlightedAnswer?: string;
}

export interface SearchOptions {
  fuzzy?: boolean;
  stemming?: boolean;
  maxResults?: number;
  minScore?: number;
}

export interface SearchIndexDocumentEntry {
  id: string;
  frequency: number;
  positions: number[];
  fieldWeights: {
    question: number;
    answer: number;
    categories: number;
  };
}

export interface SearchIndexEntry {
  term: string;
  documents: Map<string, SearchIndexDocumentEntry>;
}

export interface SearchQuery {
  q?: string;
  category?: string;
  sortBy?: SearchSort;
  limit?: number;
  page?: number;
  minScore?: number;
}

const SORT_BY_VALUES = new Set<SearchSort>(['relevance', 'date', 'popular', 'views']);

export function isValidSearchQuery(value: unknown): value is SearchQuery {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (record.q !== undefined && typeof record.q !== 'string') {
    return false;
  }

  if (record.category !== undefined && typeof record.category !== 'string') {
    return false;
  }

  if (record.sortBy !== undefined && (typeof record.sortBy !== 'string' || !SORT_BY_VALUES.has(record.sortBy as SearchSort))) {
    return false;
  }

  if (record.limit !== undefined && (typeof record.limit !== 'number' || !Number.isFinite(record.limit))) {
    return false;
  }

  if (record.page !== undefined && (typeof record.page !== 'number' || !Number.isFinite(record.page))) {
    return false;
  }

  if (record.minScore !== undefined && (typeof record.minScore !== 'number' || !Number.isFinite(record.minScore))) {
    return false;
  }

  return true;
}

export function isValidRawFetvaData(value: unknown): value is RawFetvaData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.question !== 'string' || !record.question.trim()) {
    return false;
  }

  if (typeof record.answer !== 'string' || !record.answer.trim()) {
    return false;
  }

  if (!Array.isArray(record.categories) || record.categories.length === 0) {
    return false;
  }

  if (!record.categories.every(category => typeof category === 'string' && category.trim().length > 0)) {
    return false;
  }

  if (record.q_in_file !== undefined && typeof record.q_in_file !== 'number') {
    return false;
  }

  if (record.views !== undefined && (typeof record.views !== 'number' || Number.isNaN(record.views) || record.views < 0)) {
    return false;
  }

  if (record.likes !== undefined && (typeof record.likes !== 'number' || Number.isNaN(record.likes) || record.likes < 0)) {
    return false;
  }

  if (record.searchKeywords !== undefined) {
    if (!Array.isArray(record.searchKeywords)) {
      return false;
    }
    if (!record.searchKeywords.every(keyword => typeof keyword === 'string')) {
      return false;
    }
  }

  if (record.references !== undefined) {
    if (!Array.isArray(record.references)) {
      return false;
    }
    if (!record.references.every(reference => typeof reference === 'string')) {
      return false;
    }
  }

  if (record.relatedFatwas !== undefined) {
    if (!Array.isArray(record.relatedFatwas)) {
      return false;
    }
    if (!record.relatedFatwas.every(fatwa => typeof fatwa === 'string')) {
      return false;
    }
  }

  if (record.arabicText !== undefined && typeof record.arabicText !== 'string') {
    return false;
  }

  if (record.normalizedText !== undefined && typeof record.normalizedText !== 'string') {
    return false;
  }

  return true;
}

export class DataServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'DataServiceError';
    this.code = code;
    this.statusCode = statusCode;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DataServiceError);
    }
  }
}

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  i: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

function normalizeTurkishCharacters(value: string): string {
  return value.replace(/[çÇğĞıİiöÖşŞüÜI]/g, char => TURKISH_CHAR_MAP[char] ?? char);
}

export function createCategorySlug(name: string): string {
  const normalized = normalizeTurkishCharacters(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'kategori';
}
