/**
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const { applyRateLimitMock } = vi.hoisted(() => ({
  applyRateLimitMock: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: applyRateLimitMock,
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  doc: vi.fn(),
  getDoc: vi.fn(),
  runTransaction: vi.fn(),
}));

import { POST as postContact } from '@/app/api/contact/route';
import { POST as postLike } from '@/app/api/fetva/[id]/like/route';
import { POST as postComment } from '@/app/api/fetva/[id]/comments/route';

describe('write endpoint rate limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    applyRateLimitMock.mockResolvedValue({ allowed: false, retryAfter: 30 });
  });

  it('returns 429 for contact form when rate limit is exceeded', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Bu bir test mesajidir.',
      }),
    }) as unknown as NextRequest;

    const response = await postContact(request);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
  });

  it('returns 429 for like action when rate limit is exceeded', async () => {
    const request = new Request('http://localhost/api/fetva/f1/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({ action: 'like' }),
    }) as unknown as NextRequest;

    const response = await postLike(request, { params: { id: 'f1' } });

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
  });

  it('returns 429 for comment create when rate limit is exceeded', async () => {
    const request = new Request('http://localhost/api/fetva/f1/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({ name: 'Test', message: 'Yorum metni' }),
    }) as unknown as NextRequest;

    const response = await postComment(request, { params: { id: 'f1' } });

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
  });
});