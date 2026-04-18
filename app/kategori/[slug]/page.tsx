import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tag, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';
import { getCategoryIconInfo } from '@/lib/category-icons';
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
  const icon = getCategoryIconInfo(category.name).emoji || '🕌';
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasMore ? page + 1 : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:text-primary transition-colors">Kategoriler</Link>
          <span>/</span>
          <span>{category.name}</span>
        </nav>

        <section className="mt-6 rounded-3xl border border-border/30 bg-background/95 p-8 shadow-sm">
          <div className="flex flex-col gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl lg:mx-0" aria-hidden="true">
              {icon}
            </div>
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {category.name}
              </h1>
              <p className="text-base text-muted-foreground">
                {category.description || 'Bu kategoriye ait fetvaları keşfedin ve güncel cevaplara ulaşın.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-semibold text-primary">
                  <Tag className="h-4 w-4" />
                  {total.toLocaleString('tr-TR')} fetva
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Fetva listesi</h2>
              <p className="text-sm text-muted-foreground">
                Toplam {total.toLocaleString('tr-TR')} fetvadan {(fatwas.length + (page - 1) * LIMIT).toLocaleString('tr-TR')} gösteriliyor.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <Link
                    key={option.value}
                    href={`/kategori/${category.slug}?sort=${option.value}&page=1`}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {fatwas.length === 0 ? (
            <div className="rounded-3xl border border-border/30 bg-background/90 p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Bu kategoriye ait fetva bulunamadı</h3>
              <p className="mt-2 text-sm text-muted-foreground">Yeni fetvalar eklendiğinde burada görünecektir.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {fatwas.map((fetva) => (
                <Link
                  key={fetva.id}
                  href={`/fetva/${fetva.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-border/30 bg-background/95 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {parseDate(fetva.updatedAt ?? fetva.createdAt ?? fetva.date) > 0
                          ? new Date((fetva.updatedAt ?? fetva.createdAt ?? fetva.date) as string | Date).toLocaleDateString('tr-TR')
                          : 'Tarih belirtilmedi'}
                      </span>
                      <span>{(fetva.views || 0).toLocaleString('tr-TR')} görüntülenme</span>
                    </div>
                    <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {fetva.question}
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{fetva.answer}</p>
                    <p className="text-xs text-muted-foreground">
                      Kaynak: {fetva.source?.trim() || 'Kaynak belirtilmedi'}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{(fetva.likes || 0).toLocaleString('tr-TR')} beğeni</span>
                    <span className="inline-flex items-center gap-2 text-primary">
                      İncele
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-3">
            {prevPage ? (
              <Link
                href={`/kategori/${category.slug}?sort=${sortBy}&page=${prevPage}`}
                className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                Önceki
              </Link>
            ) : null}
            <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Sayfa {page}
            </span>
            {nextPage ? (
              <Link
                href={`/kategori/${category.slug}?sort=${sortBy}&page=${nextPage}`}
                className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                Sonraki
              </Link>
            ) : null}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
