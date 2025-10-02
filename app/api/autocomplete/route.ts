import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';

// Simple in-memory rate limiter (per-process). Window: 60s, Max: 30 requests/IP
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateStore: Map<string, { count: number; resetAt: number }> = new Map();

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const ip = xf.split(',')[0]?.trim();
    if (ip) return ip;
  }
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
    // Rate limit
    const ip = getClientIp(request);
    const r = rateLimit(ip);
    if (!r.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: r.retryAfter ? { 'Retry-After': String(r.retryAfter) } : undefined }
      );
    }

    const dataService = DataService.getInstance();
    await dataService.initialize();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        suggestions: [],
        success: true
      });
    }

    if (limit > 50) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 50' },
        { status: 400 }
      );
    }

    // Get autocomplete suggestions
    const suggestions = await dataService.getAutocompleteSuggestions(query, limit);

    return NextResponse.json({
      suggestions,
      query,
      success: true
    });

  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);

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