import Link from 'next/link';
import { Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';

const CARD_BACKGROUNDS = [
  'linear-gradient(135deg, rgba(23,207,23,0.08), rgba(23,207,23,0.12))',
  'linear-gradient(135deg, rgba(255,193,7,0.08), rgba(255,213,79,0.15))',
  'linear-gradient(135deg, rgba(33,150,243,0.08), rgba(33,150,243,0.15))',
  'linear-gradient(135deg, rgba(244,143,177,0.12), rgba(244,143,177,0.18))',
  'linear-gradient(135deg, rgba(156,39,176,0.08), rgba(156,39,176,0.15))',
];

async function getCategories() {
  const dataService = DataService.getInstance();
  await dataService.initialize();
  return dataService.getAllCategories();
}

function CategoryCard({
  name,
  slug,
  count,
  description,
  index,
}: {
  name: string;
  slug: string;
  count: number;
  description?: string;
  index: number;
}) {
  const art = CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length];

  return (
    <Link
      href={`/kategori/${slug}`}
      className="group flex flex-col justify-between rounded-3xl border border-border/30 bg-background/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary"
    >
      <div className="space-y-4">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary"
          style={{ background: art }}
        >
          <span className="text-lg font-semibold">#{index + 1}</span>
        </span>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description ?? 'Bu kategoriye ait fetvaları inceleyin.'}
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-primary/80">
        <span>{count.toLocaleString('tr-TR')} fetva</span>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Keşfet</span>
      </div>
    </Link>
  );
}

export default async function KategorilerPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const initialSearch = searchParams?.q?.trim() ?? '';
  const categories = await getCategories();

  const filtered = initialSearch
    ? categories.filter((category) => category.name.toLowerCase().includes(initialSearch.toLowerCase()))
    : categories;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-16">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <svg
              className="h-8 w-8"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 10a2 2 0 0 1 2-2h10l4 4h14a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10Z"
                fill="currentColor"
                opacity="0.15"
              />
              <path
                d="M10 8h10l4 4h14a2 2 0 0 1 2 2v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V10a2 2 0 0 1 2-2Zm0 2v26a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V14H23.172a2 2 0 0 1-1.414-.586L18 10H10Z"
                fill="currentColor"
              />
              <path
                d="M17 20h14v2H17v-2Zm0 6h14v2H17v-2Zm0 6h10v2H17v-2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="mt-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Kategoriler
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            İslami konuları kolayca keşfedin
          </h1>
          <p className="mt-3 mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground">
            İbadet, muamelat, aile hayatı ve günlük yaşama dair binlerce fetvayı kategoriler halinde sunuyoruz. Hızlı arama ile ihtiyacınız olan konuyu bulun.
          </p>
        </section>

        <form action="/kategoriler" className="relative mx-auto mt-10 w-full max-w-xl">
          <label htmlFor="category-search" className="sr-only">
            Kategori ara
          </label>
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          <input
            id="category-search"
            name="q"
            defaultValue={initialSearch}
            placeholder="Örn: aile, ibadet, ekonomi..."
            className="h-14 w-full rounded-full border border-primary/20 bg-background pl-14 pr-24 text-base shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex h-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.02] hover:bg-primary/90"
          >
            Ara
          </button>
        </form>

        <section className="mt-12">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-border/40 bg-background/90 p-12 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Aramanızla eşleşen kategori bulunamadı</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Farklı bir anahtar kelimeyle aramayı deneyebilir veya tüm kategorileri gözden geçirebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  count={category.fatwaCount}
                  description={category.description}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}