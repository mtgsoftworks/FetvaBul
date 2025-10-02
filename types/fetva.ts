import { z } from 'zod';

// Core Fetva interface based on JSONL data structure
export interface Fetva {
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
  createdAt?: Date;
  updatedAt?: Date;
  normalizedText?: string;
}

// Raw JSONL data structure
export interface RawFetvaData {
  q_in_file: number;
  question: string;
  answer: string;
  categories: string[];
}

// Fetva metadata for display
export interface FetvaMetadata {
  id: string;
  title: string;
  excerpt: string;
  categories: string[];
  views: number;
  likes: number;
  createdAt?: Date;
}

// Fetva with highlighted search terms
export interface FetvaSearchResult extends Fetva {
  highlightedQuestion?: string;
  highlightedAnswer?: string;
  relevanceScore: number;
  matchedTerms: string[];
}

// Validation schemas
export const RawFetvaDataSchema = z.object({
  q_in_file: z.number().positive(),
  question: z.string().min(1),
  answer: z.string().min(1),
  categories: z.array(z.string()).min(1),
});

export const FetvaSchema = z.object({
  id: z.string().min(1),
  q_in_file: z.number().positive(),
  question: z.string().min(1),
  answer: z.string().min(1),
  categories: z.array(z.string()).min(1),
  source: z.string().optional(),
  date: z.string().optional(),
  views: z.number().min(0).default(0),
  likes: z.number().min(0).default(0),
  searchKeywords: z.array(z.string()).optional(),
  arabicText: z.string().optional(),
  references: z.array(z.string()).optional(),
  relatedFatwas: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  normalizedText: z.string().optional(),
});

export const FetvaMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  categories: z.array(z.string()).min(1),
  views: z.number().min(0),
  likes: z.number().min(0),
  createdAt: z.date().optional(),
});

export const FetvaSearchResultSchema = FetvaSchema.extend({
  highlightedQuestion: z.string().optional(),
  highlightedAnswer: z.string().optional(),
  relevanceScore: z.number().min(0).max(1),
  matchedTerms: z.array(z.string()),
});

// Type guards
export function isValidRawFetvaData(data: unknown): data is RawFetvaData {
  return RawFetvaDataSchema.safeParse(data).success;
}

export function isValidFetva(data: unknown): data is Fetva {
  return FetvaSchema.safeParse(data).success;
}