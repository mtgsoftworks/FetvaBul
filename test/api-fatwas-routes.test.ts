/**
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const { dataServiceMock, getInstanceMock } = vi.hoisted(() => {
  const serviceMock = {
    initialize: vi.fn(),
    getFetvaById: vi.fn(),
    findSimilarQuestions: vi.fn(),
    incrementViews: vi.fn(),
  };

  return {
    dataServiceMock: serviceMock,
    getInstanceMock: vi.fn(() => serviceMock),
  };
});

vi.mock('@/lib/data-service', () => ({
  DataService: {
    getInstance: getInstanceMock,
  },
}));

import { GET as getFatwaDetail } from '@/app/api/fatwas/[id]/route';
import { POST as postFatwaView } from '@/app/api/fatwas/[id]/view/route';

describe('fatwa routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dataServiceMock.initialize.mockResolvedValue(undefined);
    dataServiceMock.findSimilarQuestions.mockResolvedValue([]);
  });

  it('does not increment views in GET /api/fatwas/[id]', async () => {
    dataServiceMock.getFetvaById.mockResolvedValue({
      id: 'f1',
      question: 'Soru',
      answer: 'Cevap',
      categories: ['İbadet'],
      views: 10,
      likes: 2,
    });

    const request = new Request('http://localhost/api/fatwas/f1') as unknown as NextRequest;
    const response = await getFatwaDetail(request, { params: { id: 'f1' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(dataServiceMock.incrementViews).not.toHaveBeenCalled();
  });

  it('increments views via POST /api/fatwas/[id]/view', async () => {
    dataServiceMock.getFetvaById
      .mockResolvedValueOnce({
        id: 'f1',
        question: 'Soru',
        answer: 'Cevap',
        categories: ['İbadet'],
        views: 10,
        likes: 2,
      })
      .mockResolvedValueOnce({
        id: 'f1',
        question: 'Soru',
        answer: 'Cevap',
        categories: ['İbadet'],
        views: 11,
        likes: 2,
      });

    dataServiceMock.incrementViews.mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/fatwas/f1/view', {
      method: 'POST',
      headers: { 'x-forwarded-for': '127.0.0.1' },
    }) as unknown as NextRequest;

    const response = await postFatwaView(request, { params: { id: 'f1' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(dataServiceMock.incrementViews).toHaveBeenCalledTimes(1);
    expect(dataServiceMock.incrementViews).toHaveBeenCalledWith('f1');
    expect(body.success).toBe(true);
    expect(body.views).toBe(11);
  });

  it('returns 404 from POST /api/fatwas/[id]/view when fatwa is missing', async () => {
    dataServiceMock.getFetvaById.mockResolvedValue(null);

    const request = new Request('http://localhost/api/fatwas/missing/view', {
      method: 'POST',
      headers: { 'x-forwarded-for': '127.0.0.1' },
    }) as unknown as NextRequest;

    const response = await postFatwaView(request, { params: { id: 'missing' } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Fatwa not found');
    expect(dataServiceMock.incrementViews).not.toHaveBeenCalled();
  });
});
