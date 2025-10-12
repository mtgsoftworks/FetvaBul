import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { DataService } from '@/lib/data-service';
import { incrementSearchCount } from '@/lib/firebase';
import { SearchQuery, DataServiceError, isValidSearchQuery } from '@/types';

// Simple in-memory rate limiter (per-process). Window: 60s, Max: 60 requests/IP
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateStore: Map<string, { count: number; resetAt: number }> = new Map();

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const ip = xf.split(',')[0]?.trim();
    if (ip) return ip;
  }
  // NextRequest may provide ip via geo or ip, fallback
  // @ts-ignore
  return (req as any).ip || 'unknown';
}

function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const r = rateLimit(ip);
    if (!r.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: r.retryAfter ? { 'Retry-After': String(r.retryAfter) } : undefined }
      );
    }

    // Initialize DataService
    const dataService = DataService.getInstance();
    await dataService.initialize();

    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate parameters
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' },
        { status: 400 }
      );
    }

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    const allowedSort: Record<string, true> = {
      relevance: true,
      date: true,
      popular: true,
      views: true,
    };
    if (!allowedSort[sortBy]) {
      return NextResponse.json(
        { error: 'Invalid sortBy. Allowed: relevance, date, popular, views' },
        { status: 400 }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Telemetry start
    const t0 = Date.now();

    // Perform search using new DataService
    const searchResults = await dataService.search({
      query,
      category: category || undefined,
      sortBy: sortBy as any,
      limit,
      offset
    });

    if (query.trim().length > 0) {
      const incrementPromise =
        typeof (dataService as DataService & { incrementSearches?: () => Promise<number> }).incrementSearches === 'function'
          ? (dataService as DataService & { incrementSearches: () => Promise<number> }).incrementSearches()
          : incrementSearchCount();

      incrementPromise.catch((error) => {
        console.error('Failed to track search count:', error);
      });
    }

    // Telemetry end
    const durationMs = Date.now() - t0;

    // Simple response - no complex pagination calculations
    return NextResponse.json({
      results: searchResults,
      pagination: {
        page,
        limit,
        hasMore: searchResults.length === limit // Simple check for more results
      },
      meta: {
        durationMs,
        resultCount: searchResults.length,
      },
      success: true
    });

  } catch (error) {
    console.error('Error performing search:', error);

    if (error instanceof DataServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}