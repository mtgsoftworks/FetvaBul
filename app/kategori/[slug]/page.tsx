import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';
import type { Fetva } from '@/types';

export const revalidate = 300;

type SortValue = 'popular' | 'views' | 'date' | 'alphabetical' | 'most-liked';

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'popular', label: 'En Popüler' },
  { value: 'views', label: 'En Çok Görüntülenen' },
  { value: 'date', label: 'En Yeni' },
  { value: 'alphabetical', label: 'Alfabetik' },
  { value: 'most-liked', label: 'En Beğenilen' },
];

const LIMIT = 20;

function normalizeSort(value?: string): SortValue {
  const allowed: SortValue[] = ['popular', 'views', 'date', 'alphabetical', 'most-liked'];
  return allowed.includes(value as SortValue) ? (value as SortValue) : 'popular';
}

function normalizePage(value?: string): number {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseDate(value?: string | Date): number {
  if (!value) return 0;
  const d = value instanceof Date ? value : new Date(value);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

function sortFatwas(fatwas: Fetva[], sortBy: SortValue): Fetva[] {
  switch (sortBy) {
    case 'views':
    case 'popular':
      return fatwas
        .slice()
        .sort((a, b) => (b.views ?? 0) - (a.views ?? 0) || (b.likes ?? 0) - (a.likes ?? 0));
    case 'date':
      return fatwas
        .slice()
        .sort((a, b) => parseDate(b.date ?? b.createdAt ?? b.updatedAt) - parseDate(a.date ?? a.createdAt ?? a.updatedAt));
    case 'alphabetical':
      return fatwas.slice().sort((a, b) => a.question.localeCompare(b.question, 'tr'));
    case 'most-liked':
      return fatwas
        .slice()
        .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0) || (b.views ?? 0) - (a.views ?? 0));
    default:
      return fatwas.slice();
  }
}

async function loadCategoryBySlug(slug: string) {
  const dataService = DataService.getInstance();
  await dataService.initialize();
  return dataService.getCategoryBySlug(slug);
}

export async function generateStaticParams() {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const categories = await dataService.getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

async function getPageData(slug: string, sortBy: SortValue, page: number) {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const category = await dataService.getCategoryBySlug(slug);
  if (!category) {
    return null;
  }

  const all = await dataService.getFatwasByCategory(category.name);
  const sorted = sortFatwas(all, sortBy);
  const start = (page - 1) * LIMIT;
  const items = sorted.slice(start, start + LIMIT);

  return {
    category,
    fatwas: items,
    total: sorted.length,
    hasMore: start + LIMIT < sorted.length,
    page,
    sortBy,
  } as const;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await loadCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: 'Kategori | FetvaBul',
      description: 'Kategorilere göre düzenlenmiş fetvalar ve İslami bilgiler.',
    };
  }

  return {
    title: `${category.name} Fetvaları | FetvaBul`,
    description: category.description || 'Kategorilere göre düzenlenmiş fetvalar ve İslami bilgiler.',
  };
}

export default async function KategoriPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { sort?: string; page?: string };
}) {
  const isStaticExport = process.env.STATIC_EXPORT === '1';
  const sortBy = isStaticExport ? 'popular' : normalizeSort(searchParams?.sort);
  const page = isStaticExport ? 1 : normalizePage(searchParams?.page);
  const data = await getPageData(params.slug, sortBy, page);

  if (!data) {
    notFound();
  }

  const { category, fatwas, total, hasMore } = data;
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasMore ? page + 1 : null;

  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />

      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-[1px] mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Anasayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:text-accent transition-colors">Kategoriler</Link>
          <span>/</span>
          <span className="text-main">{category.name}</span>
        </nav>

        {/* Category Header */}
        <section className="mb-10 pb-10 border-b border-clean-border">
          <h1 className="font-serif font-normal text-main mb-3">{category.name}</h1>
          <p className="text-sm text-muted leading-relaxed max-w-lg mb-4">
            {category.description || 'Bu kategoriye ait fetvaları keşfedin ve güncel cevaplara ulaşın.'}
          </p>
          <span className="text-[11px] text-accent uppercase tracking-[1px] font-medium">
            {total.toLocaleString('tr-TR')} fetva
          </span>
        </section>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2 mb-10">
          {SORT_OPTIONS.map((option) => {
            const isActive = sortBy === option.value;
            return (
              <Link
                key={option.value}
                href={`/kategori/${category.slug}?sort=${option.value}&page=1`}
                className={`rounded-full border px-4 py-2 text-[12px] font-medium uppercase tracking-[1px] transition ${
                  isActive
                    ? 'border-accent bg-accent text-white'
                    : 'border-clean-border text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        {/* Fetwa List */}
        {fatwas.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-serif text-xl text-main mb-2">Fetva bulunamadı</h2>
            <p className="text-sm text-muted">Yeni fetvalar eklendiğinde burada görünecektir.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {fatwas.map((fetva) => (
              <Link
                key={fetva.id}
                href={`/fetva/${fetva.id}`}
                className="group block py-8 border-b border-clean-border last:border-b-0"
              >
                <div className="flex items-center gap-3 text-[11px] text-muted uppercase tracking-[1px] mb-3">
                  <span>
                    {parseDate(fetva.updatedAt ?? fetva.createdAt ?? fetva.date) > 0
                      ? new Date((fetva.updatedAt ?? fetva.createdAt ?? fetva.date) as string | Date).toLocaleDateString('tr-TR')
                      : 'Tarih belirtilmedi'}
                  </span>
                  <span className="text-clean-border">·</span>
                  <span>{(fetva.views || 0).toLocaleString('tr-TR')} görüntülenme</span>
                </div>
                <h3 className="font-serif text-lg text-main mb-2 leading-[1.4] group-hover:text-accent transition-colors">
                  {fetva.question}
                </h3>
                <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">{fetva.answer}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">
                    Kaynak: {fetva.source?.trim() || 'Kaynak belirtilmedi'}
                  </span>
                  <span className="inline-flex items-center gap-2 text-[12px] text-accent uppercase tracking-[1px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    İncele
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-4">
          {prevPage ? (
            <Link
              href={`/kategori/${category.slug}?sort=${sortBy}&page=${prevPage}`}
              className="text-[13px] font-medium uppercase tracking-[1.5px] text-muted hover:text-accent transition-colors"
            >
              Önceki
            </Link>
          ) : null}
          <span className="text-sm text-muted">Sayfa {page}</span>
          {nextPage ? (
            <Link
              href={`/kategori/${category.slug}?sort=${sortBy}&page=${nextPage}`}
              className="text-[13px] font-medium uppercase tracking-[1.5px] text-muted hover:text-accent transition-colors"
            >
              Sonraki
            </Link>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
