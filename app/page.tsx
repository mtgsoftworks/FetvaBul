export const revalidate = 300;

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';
import { getCategoryIconComponent } from '@/lib/category-icons';
import { HomepageViewTracker } from '@/components/layout/HomepageViewTracker';

function toTimestamp(value?: string | Date): number {
  if (!value) return 0;
  const d = value instanceof Date ? value : new Date(value);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

function formatRelativeDate(value?: string | Date): string {
  const ts = toTimestamp(value);
  if (!ts) return '';
  const now = Date.now();
  const diffMs = now - ts;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return '1 Gün Önce';
  if (diffDays < 7) return `${diffDays} Gün Önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} Hafta Önce`;
  return new Date(ts).toLocaleDateString('tr-TR', { dateStyle: 'long' });
}

async function getHomepageData() {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const [stats, categories, allFatwas, popularFatwas] = await Promise.all([
    dataService.getStats(),
    dataService.getAllCategories(),
    dataService.getAllFatwas(),
    dataService.getPopularFatwas(6),
  ]);

  const popularCategories = categories
    .slice()
    .sort((a, b) => b.fatwaCount - a.fatwaCount)
    .slice(0, 5);

  const recentFatwas = allFatwas
    .slice()
    .sort((a, b) => toTimestamp(b.updatedAt ?? b.createdAt ?? b.date) - toTimestamp(a.updatedAt ?? a.createdAt ?? a.date))
    .slice(0, 4);

  const popularQuestions = popularFatwas.map((fetva) => ({
    id: fetva.id,
    question: fetva.question,
    answer: fetva.answer,
    source: fetva.source?.trim() || 'Kaynak belirtilmedi',
    date: fetva.updatedAt ?? fetva.createdAt ?? fetva.date,
    categories: fetva.categories ?? [],
  }));

  return {
    stats,
    popularCategories,
    recentFatwas,
    popularQuestions,
  } as const;
}

/* ─── Hero Section ─── */
function Hero() {
  return (
    <section className="relative pt-[150px] mb-[50px]">
      <div className="max-w-[700px] mx-auto px-8 text-center">
        <h1 className="font-serif font-normal text-main leading-[1.2] mb-6">
          İslami Sorularınıza <br className="hidden md:block" /> Güvenilir ve Modern Rehber
        </h1>

        <form action="/arama" className="relative w-full max-w-[600px] mx-auto mt-6">
          <label htmlFor="hero-search" className="sr-only">
            Fetva ara
          </label>
          <input
            id="hero-search"
            name="q"
            type="search"
            className="w-full py-5 px-8 rounded-[40px] border-[1.5px] border-clean-border bg-card text-base text-main outline-none focus:border-accent shadow-[0_10px_30px_rgba(95,113,97,0.05)] transition-all placeholder:text-muted"
            placeholder="Aklınızdaki soruyu buraya yazın..."
          />
          <div className="absolute inset-y-0 right-6 flex items-center text-muted pointer-events-none">
            <Search size={20} />
          </div>
        </form>
      </div>
    </section>
  );
}

/* ─── Categories Grid ─── */
function FeaturedCategories({
  categories,
}: {
  categories: Awaited<ReturnType<typeof getHomepageData>>['popularCategories'];
}) {
  return (
    <section className="max-w-editorial mx-auto w-full px-8 mb-16">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        {categories.map((category) => {
          const Icon = getCategoryIconComponent(category.name);
          return (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="flex flex-col items-center py-8 px-5 bg-card rounded-[20px] border border-clean-border text-center hover:shadow-[0_10px_30px_rgba(95,113,97,0.08)] hover:-translate-y-1 transition-all"
            >
              <div className="mb-4 text-accent">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg text-main mb-2 leading-tight">{category.name}</h3>
              <span className="text-[11px] text-muted uppercase tracking-[1px] font-medium">
                {category.fatwaCount}+ Fetva
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Magazine-Style Content Split ─── */
function ContentSplit({
  recentFatwas,
  popularQuestions,
}: {
  recentFatwas: Awaited<ReturnType<typeof getHomepageData>>['recentFatwas'];
  popularQuestions: Awaited<ReturnType<typeof getHomepageData>>['popularQuestions'];
}) {
  return (
    <section className="max-w-editorial mx-auto w-full px-8 border-t border-clean-border pt-10 mb-16">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column: Recent Fatwas */}
        <div className="space-y-10">
          {recentFatwas.map((item, idx) => {
            const relDate = formatRelativeDate(item.updatedAt ?? item.createdAt ?? item.date);
            const snippet =
              item.answer.length > 120
                ? item.answer.substring(0, 120) + '...'
                : item.answer;

            return (
              <article key={item.id} className="flex gap-5 items-start group">
                <div className="font-sans text-[12px] text-accent font-bold [writing-mode:vertical-rl] rotate-180 border-l border-accent pl-2 uppercase shrink-0 tracking-[1px]">
                  {idx === 0 ? 'GÜNÜN SORUSU' : 'YENİ EKLENEN'}
                </div>
                <div>
                  <Link href={`/fetva/${item.id}`}>
                    <h3 className="m-0 mb-2 font-serif text-lg leading-[1.4] text-main group-hover:text-accent transition-colors cursor-pointer">
                      {item.question}
                    </h3>
                  </Link>
                  <p className="m-0 text-sm text-muted leading-relaxed">
                    {snippet}
                  </p>
                  {relDate && (
                    <span className="inline-block mt-2 text-[11px] text-muted/70 uppercase tracking-[1px]">
                      {relDate}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Right Column: Trending Questions */}
        <div className="space-y-10">
          {popularQuestions.slice(0, 3).map((question) => {
            const snippet =
              question.answer.length > 120
                ? question.answer.substring(0, 120) + '...'
                : question.answer;

            return (
              <article key={question.id} className="flex gap-5 items-start group">
                <div className="font-sans text-[12px] text-accent font-bold [writing-mode:vertical-rl] rotate-180 border-l border-accent pl-2 uppercase shrink-0 tracking-[1px]">
                  GÜNDEM
                </div>
                <div>
                  <Link href={`/fetva/${question.id}`}>
                    <h3 className="m-0 mb-2 font-serif text-lg leading-[1.4] text-main group-hover:text-accent transition-colors cursor-pointer">
                      {question.question}
                    </h3>
                  </Link>
                  <p className="m-0 text-sm text-muted leading-relaxed">
                    {snippet}
                  </p>
                  {question.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {question.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat}
                          className="text-[11px] text-accent/80 uppercase tracking-[1px] font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const data = await getHomepageData();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <HomepageViewTracker />
      <Header />
      <main className="flex flex-col">
        <Hero />
        <FeaturedCategories categories={data.popularCategories} />
        <ContentSplit
          recentFatwas={data.recentFatwas}
          popularQuestions={data.popularQuestions}
        />
      </main>
      <Footer />
    </div>
  );
}
