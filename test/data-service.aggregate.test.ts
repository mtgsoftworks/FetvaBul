/**
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataService } from '@/lib/data-service';
import {
  getAllViewCounts,
  getSearchCount,
  getSiteViewCount,
  incrementViewCount,
} from '@/lib/firebase';

vi.mock('@/lib/firebase', () => ({
  incrementViewCount: vi.fn(),
  getViewCount: vi.fn(),
  getAllViewCounts: vi.fn(),
  incrementSiteViewCount: vi.fn(),
  getSiteViewCount: vi.fn(),
  incrementSearchCount: vi.fn(),
  getSearchCount: vi.fn(),
}));

function seedService(): DataService {
  const service = DataService.getInstance();
  const target = service as unknown as object;

  const fetvas = [
    {
      id: 'f1',
      question: 'Soru 1',
      answer: 'Cevap 1',
      categories: ['İbadet'],
      views: 1,
      likes: 2,
      date: '2024-01-01',
    },
    {
      id: 'f2',
      question: 'Soru 2',
      answer: 'Cevap 2',
      categories: ['İbadet'],
      views: 2,
      likes: 1,
      date: '2024-01-02',
    },
    {
      id: 'f3',
      question: 'Soru 3',
      answer: 'Cevap 3',
      categories: ['Aile'],
      views: 3,
      likes: 5,
      date: '2024-01-03',
    },
  ];

  Reflect.set(target, 'isInitialized', true);
  Reflect.set(target, 'fetvas', fetvas);
  Reflect.set(target, 'fetvaById', new Map(fetvas.map((fetva) => [fetva.id, { ...fetva }])));
  const categories = [
    { id: 'ibadet', name: 'İbadet', slug: 'ibadet', fatwaCount: 2 },
    { id: 'aile', name: 'Aile', slug: 'aile', fatwaCount: 1 },
  ];
  Reflect.set(target, 'categories', categories);
  Reflect.set(target, 'categoryBySlug', new Map(categories.map((category: { slug: string }) => [category.slug, category])));
  Reflect.set(target, 'keywordIndex', new Map());
  Reflect.set(target, 'keywordFrequency', new Map());
  Reflect.set(target, 'viewsOverrides', new Map());
  Reflect.set(target, 'viewCountCache', new Map());
  Reflect.set(target, 'searchCache', new Map());
  Reflect.set(target, 'fatwaCache', new Map());
  Reflect.set(target, 'aggregatesSnapshot', undefined);

  return service as DataService;
}

describe('DataService aggregate cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedService();

    vi.mocked(getAllViewCounts).mockResolvedValue(new Map([
      ['f1', 11],
      ['f2', 42],
      ['f3', 7],
    ]));
    vi.mocked(getSiteViewCount).mockResolvedValue(120);
    vi.mocked(getSearchCount).mockResolvedValue(33);
    vi.mocked(incrementViewCount).mockResolvedValue(12);
  });

  it('reuses aggregate snapshot across repeated stats calls', async () => {
    const service = DataService.getInstance();

    const first = await service.getStats();
    const second = await service.getStats();

    expect(first.totalViews).toBe(60);
    expect(first.homepageViews).toBe(120);
    expect(first.totalSearches).toBe(33);
    expect(second.totalViews).toBe(60);
    expect(getAllViewCounts).toHaveBeenCalledTimes(1);
    expect(getSiteViewCount).toHaveBeenCalledTimes(1);
    expect(getSearchCount).toHaveBeenCalledTimes(1);
  });

  it('returns popular fatwas using aggregate view map ordering', async () => {
    const service = DataService.getInstance();

    const popular = await service.getPopularFatwas(2);

    expect(popular).toHaveLength(2);
    expect(popular.map((item) => item.id)).toEqual(['f2', 'f1']);
    expect(popular[0].views).toBe(42);
    expect(popular[1].views).toBe(11);
  });

  it('invalidates aggregate snapshot after view increment', async () => {
    const service = DataService.getInstance();

    await service.getStats();
    expect(getAllViewCounts).toHaveBeenCalledTimes(1);

    await service.incrementViews('f1');

    vi.mocked(getAllViewCounts).mockResolvedValue(new Map([
      ['f1', 12],
      ['f2', 42],
      ['f3', 7],
    ]));

    const updated = await service.getStats();

    expect(getAllViewCounts).toHaveBeenCalledTimes(2);
    expect(updated.totalViews).toBe(61);
  });
});
