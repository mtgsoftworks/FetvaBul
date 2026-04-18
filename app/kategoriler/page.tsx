import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';
import { getCategoryIconComponent } from '@/lib/category-icons';

async function getCategories() {
  const dataService = DataService.getInstance();
  await dataService.initialize();
  return dataService.getAllCategories();
}

export default async function KategorilerPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const initialSearch = process.env.STATIC_EXPORT === '1' ? '' : searchParams?.q?.trim() ?? '';
  const categories = await getCategories();

  const filtered = initialSearch
    ? categories.filter((category) => category.name.toLowerCase().includes(initialSearch.toLowerCase()))
    : categories;

  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />
      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        <section className="mb-10">
          <h1 className="font-serif font-normal text-main mb-3">Kategoriler</h1>
          <p className="text-sm text-muted leading-relaxed max-w-lg">
            İbadet, muamelat, aile hayatı ve günlük yaşama dair binlerce fetvayı kategoriler halinde keşfedin.
          </p>
        </section>

        <form action="/kategoriler" className="relative max-w-[400px] mb-12">
          <label htmlFor="category-search" className="sr-only">
            Kategori ara
          </label>
          <input
            id="category-search"
            name="q"
            defaultValue={initialSearch}
            placeholder="Kategori ara..."
            className="w-full py-3 px-5 rounded-full border-[1.5px] border-clean-border bg-card text-sm text-main outline-none focus:border-accent transition-all placeholder:text-muted"
          />
        </form>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-serif text-xl text-main mb-2">Sonuç bulunamadı</h2>
            <p className="text-sm text-muted">Farklı bir anahtar kelimeyle aramayı deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((category) => {
              const Icon = getCategoryIconComponent(category.name);
              return (
                <Link
                  key={category.id}
                  href={`/kategori/${category.slug}`}
                  className="group flex flex-col py-8 px-6 bg-card rounded-[20px] border border-clean-border hover:shadow-[0_10px_30px_rgba(95,113,97,0.08)] hover:-translate-y-1 transition-all"
                >
                  <div className="mb-4 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-lg text-main mb-2 leading-tight group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2 mb-4">
                    {category.description ?? 'Bu kategoriye ait fetvaları inceleyin.'}
                  </p>
                  <span className="mt-auto text-[11px] text-accent uppercase tracking-[1px] font-medium">
                    {category.fatwaCount.toLocaleString('tr-TR')} fetva
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}