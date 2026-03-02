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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(request);
    const r = await applyRateLimit({
      namespace: 'fatwa-view',
      identifier: `${ip}:${params.id}`,
      windowMs: 60_000,
      max: 30,
    });
    if (!r.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: r.retryAfter ? { 'Retry-After': String(r.retryAfter) } : undefined }
      );
    }

    const { id } = params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid fatwa ID' },
        { status: 400 }
      );
    }

    const dataService = DataService.getInstance();
    await dataService.initialize();

    const fatwa = await dataService.getFetvaById(id);
    if (!fatwa) {
      return NextResponse.json(
        { error: 'Fatwa not found' },
        { status: 404 }
      );
    }

    await dataService.incrementViews(id);
    const updated = await dataService.getFetvaById(id);

    return NextResponse.json({
      success: true,
      views: updated?.views ?? fatwa.views,
    });
  } catch (error) {
    console.error('Error incrementing fatwa views:', error);

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
