import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';
import { getCategoryIconComponent } from '@/lib/category-icons';

const CATEGORY_ARTWORK: Record<string, string> = {
  Prayer: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
  Fasting: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
  Zekat: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
  Family: 'linear-gradient(135deg, #fce4ec, #f8bbd0)',
  Daily: 'linear-gradient(135deg, #f4f4f5, #e4e4e7)',
};

const CATEGORY_IMAGES: Record<string, string> = {
  ibadet: '/images/category-prayer.svg',
  'helal-gida-beslenme': '/images/category-fasting.svg',
  'muamelat-ekonomi': '/images/category-zakat.svg',
};

const FALLBACK_ART = [
  'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
  'linear-gradient(135deg, #fff3e0, #ffe0b2)',
  'linear-gradient(135deg, #e3f2fd, #bbdefb)',
  'linear-gradient(135deg, #f3e5f5, #e1bee7)',
  'linear-gradient(135deg, #ede7f6, #d1c4e9)',
];

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
    .slice(0, 8);

  const recentFatwas = allFatwas
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  const popularQuestions = popularFatwas.map((fetva) => ({
    id: fetva.id,
    question: fetva.question,
    asker: fetva.source,
    date: fetva.date ?? fetva.createdAt,
  }));

  return {
    stats,
    popularCategories,
    recentFatwas,
    popularQuestions,
  } as const;
}

function Hero({
  stats,
}: {
  stats: Awaited<ReturnType<typeof getHomepageData>>['stats'];
}) {
  const formatted = {
    fatwas: (stats?.totalFatwas ?? 0).toLocaleString('tr-TR'),
    categories: (stats?.totalCategories ?? 0).toLocaleString('tr-TR'),
    views: (stats?.totalViews ?? 0).toLocaleString('tr-TR'),
  };

  return (
    <section className="islamic-pattern">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center sm:py-20">
        <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
          Güvenilir İslami Bilgi Platformu
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Sorularınıza güvenilir fetvalarla cevap bulun
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Uzman hocalar tarafından hazırlanan binlerce fetva içinde arama yapın, sık sorulan soruları keşfedin ve İslami konularda hızlıca rehberlik alın.
        </p>

        <form action="/arama" className="mt-8 w-full max-w-2xl">
          <label htmlFor="hero-search" className="sr-only">
            Fetva ara
          </label>
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-5 h-5 w-5 text-primary" />
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Fetva veya soru arayın..."
              className="h-14 w-full rounded-full border border-primary/20 bg-background px-12 text-base shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </form>

        <dl className="mt-10 grid w-full max-w-3xl gap-4 rounded-3xl bg-background/80 p-6 shadow-sm backdrop-blur sm:grid-cols-3">
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Toplam Fetva</dt>
            <dd className="text-2xl font-semibold text-foreground">{formatted.fatwas}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kategori</dt>
            <dd className="text-2xl font-semibold text-foreground">{formatted.categories}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Toplam Görüntülenme</dt>
            <dd className="text-2xl font-semibold text-foreground">{formatted.views}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function FeaturedCategories({
  categories,
}: {
  categories: Awaited<ReturnType<typeof getHomepageData>>['popularCategories'];
}) {
  const getStyle = (name: string, index: number) => {
    const key = Object.keys(CATEGORY_ARTWORK).find((preset) => name.toLowerCase().includes(preset.toLowerCase()));
    const fallback = FALLBACK_ART[index % FALLBACK_ART.length];
    return CATEGORY_ARTWORK[key ?? ''] ?? fallback;
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-col gap-3 text-left sm:text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">Kategoriler</span>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Öne çıkan konular</h2>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:mx-auto">
          İbadet, muamelat, aile hayatı ve daha fazlası. İhtiyacınız olan fetvayı hızlıca bulmak için popüler kategorileri keşfedin.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {categories.slice(0, 5).map((category, index) => {
          const Icon = getCategoryIconComponent(category.name);
          const imageSrc = CATEGORY_IMAGES[category.slug as keyof typeof CATEGORY_IMAGES];
          return (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="group flex flex-col gap-4 rounded-2xl border border-border/40 bg-background/90 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-primary"
            >
              <div className="overflow-hidden rounded-2xl border border-border/30 bg-primary/5">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={`${category.name} kategorisi görseli`}
                    width={320}
                    height={200}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="flex h-40 w-full items-center justify-center text-primary"
                    style={{ background: getStyle(category.name, index) }}
                  >
                    <Icon className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description ?? 'Konuyu keşfetmeye başlayın.'}
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                {category.fatwaCount} fetva
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RecentFatwas({
  fatwas,
}: {
  fatwas: Awaited<ReturnType<typeof getHomepageData>>['recentFatwas'];
}) {
  return (
    <section className="bg-background-light py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">En Yeni Fetvalar</span>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">Güncel fetvalardan öne çıkanlar</h2>
          </div>
          <Link href="/arama" className="text-sm font-semibold text-primary hover:underline">
            Tüm fetvaları görüntüle
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {fatwas.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary"
            >
              <div className="flex items-start gap-4">
                <div className="hidden h-20 w-28 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 md:block" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 'Tarih belirtilmedi'}</span>
                    <span className="hidden md:inline">•</span>
                    <span>{(item.views ?? 0).toLocaleString('tr-TR')} görüntülenme</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{item.question}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  {item.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {cat}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/fetva/${item.id}`}
                  className="inline-flex items-center gap-2 text-primary transition hover:gap-3"
                  aria-label={`${item.question} fetvasını oku`}
                >
                  Oku
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularQuestions({
  questions,
}: {
  questions: Awaited<ReturnType<typeof getHomepageData>>['popularQuestions'];
}) {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-col gap-3 text-left sm:text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">Sık Sorulanlar</span>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Topluluğumuzun gündemindeki sorular</h2>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:mx-auto">
          Diğer kullanıcıların sıkça sorduğu soruları inceleyin, konular hakkında hızlıca bilgi edinin.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {questions.map((question, index) => (
          <Link
            key={question.id}
            href={`/fetva/${question.id}`}
            className="group flex items-center justify-between rounded-2xl border border-border/40 bg-background/90 px-5 py-4 transition hover:border-primary hover:bg-primary/5"
          >
            <div className="flex flex-1 items-center gap-4 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                #{index + 1}
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                  {question.question}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {question.asker ?? 'Anonim'} • {question.date ? new Date(question.date).toLocaleDateString('tr-TR') : 'Tarih belirtilmedi'}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const data = await getHomepageData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex flex-col gap-0">
        <Hero stats={data.stats} />
        <FeaturedCategories categories={data.popularCategories} />
        <RecentFatwas fatwas={data.recentFatwas} />
        <PopularQuestions questions={data.popularQuestions} />
      </main>
      <Footer />
    </div>
  );
}