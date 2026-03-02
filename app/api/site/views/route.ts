import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';
import { DataServiceError } from '@/types';
import { applyRateLimit } from '@/lib/rate-limit';

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const ip = xf.split(',')[0]?.trim();
    if (ip) return ip;
  }
  return (req as unknown as { ip?: string }).ip || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const r = await applyRateLimit({
      namespace: 'homepage-view',
      identifier: ip,
      windowMs: 60_000,
      max: 20,
    });
    if (!r.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: r.retryAfter ? { 'Retry-After': String(r.retryAfter) } : undefined }
      );
    }

    const dataService = DataService.getInstance();
    await dataService.initialize();
    const homepageViews = await dataService.incrementHomepageViews();

    return NextResponse.json({
      success: true,
      homepageViews,
    });
  } catch (error) {
    console.error('Error incrementing homepage view count:', error);

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
