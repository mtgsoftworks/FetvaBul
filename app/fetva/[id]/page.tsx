import type { Metadata } from 'next';

export const revalidate = 300;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';
import { FetvaEngagement } from '@/components/fetva/FetvaEngagement';
import { FetvaViewTracker } from '@/components/fetva/FetvaViewTracker';
import { FetvaComments } from '@/components/fetva/FetvaComments';
import { FetvaStructuredData } from '@/components/seo/StructuredData';

function formatDate(value?: string | Date | null): string {
  if (!value) return 'Tarih belirtilmedi';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Tarih belirtilmedi';
  }
  return date.toLocaleDateString('tr-TR', { dateStyle: 'long' });
}

function extractParagraphs(answer: string) {
  const normalized = answer.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [] as string[];

  const blocks = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (blocks.length > 1) {
    return blocks;
  }

  return normalized
    .split(/\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function formatSource(source?: string | null): string {
  const clean = source?.trim();
  return clean && clean.length > 0 ? clean : 'Kaynak belirtilmedi';
}

async function getFetvaDetail(id: string) {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const fetva = await dataService.getFetvaById(id);
  if (!fetva) {
    return null;
  }

  const relatedFatwas = await dataService.findSimilarQuestions(fetva.question, 3, fetva.id);

  return { fetva, relatedFatwas } as const;
}

export async function generateStaticParams() {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const fatwas = await dataService.getAllFatwas();
  return fatwas.map((fetva) => ({ id: fetva.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const fetva = await dataService.getFetvaById(params.id);
  if (!fetva) {
    return {
      title: 'Fetva | FetvaBul',
      description: 'Güvenilir İslami bilgi kaynağınız',
    };
  }

  return {
    title: `${fetva.question} | FetvaBul`,
    description: fetva.answer.replace(/\s+/g, ' ').slice(0, 160),
  };
}

export default async function FetvaDetailPage({ params }: { params: { id: string } }) {
  const data = await getFetvaDetail(params.id);

  if (!data) {
    return notFound();
  }

  const { fetva, relatedFatwas } = data;
  const paragraphs = extractParagraphs(fetva.answer);
  const publishedAtLabel = formatDate(fetva.createdAt ?? fetva.date);
  const updatedAtLabel = formatDate(fetva.updatedAt ?? fetva.createdAt ?? fetva.date);
  const sourceLabel = formatSource(fetva.source);
  const primaryCategory = fetva.categories?.[0] ?? 'Genel';
  const shareBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fetvabul.com';
  const shareUrl = `${shareBase}/fetva/${fetva.id}`;
  const structuredDateRaw = fetva.updatedAt ?? fetva.createdAt ?? fetva.date;
  const structuredDate = structuredDateRaw
    ? (structuredDateRaw instanceof Date ? structuredDateRaw.toISOString() : structuredDateRaw)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />
      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        <FetvaViewTracker id={fetva.id} />
        <FetvaStructuredData
          fetva={{
            id: fetva.id,
            question: fetva.question,
            answer: fetva.answer,
            categories: fetva.categories ?? [],
            source: sourceLabel,
            date: structuredDate,
          }}
        />

        {/* Back Link */}
        <Link
          href="/arama"
          className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[1.5px] text-muted hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Fetvalara geri dön
        </Link>

        <article>
          {/* Metadata Line */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted uppercase tracking-[1px] mb-6">
            <span className="text-accent font-medium">{primaryCategory}</span>
            <span className="text-clean-border">·</span>
            <span>Kaynak: {sourceLabel}</span>
            <span className="text-clean-border">·</span>
            <span>{publishedAtLabel}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif font-normal text-main leading-[1.2] mb-8">
            {fetva.question}
          </h1>

          {/* Disclaimer */}
          <div className="border-l-2 border-accent/30 pl-5 py-2 mb-10 text-sm text-muted italic">
            Bu içerik bilgilendirme amaçlıdır. Özel ve bağlayıcı durumlar için yetkili mercilere danışmanız önerilir.
          </div>

          {/* Answer Body */}
          <section className="space-y-5 mb-10">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-main leading-[1.8]">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="whitespace-pre-wrap text-base text-main leading-[1.8]">{fetva.answer}</p>
            )}
          </section>

          {/* Update Info */}
          <div className="border-t border-clean-border pt-6 mb-10 text-[11px] text-muted uppercase tracking-[1px]">
            Son güncelleme: {updatedAtLabel}
          </div>

          {/* Engagement */}
          <FetvaEngagement
            id={fetva.id}
            initialLikes={fetva.likes ?? 0}
            views={fetva.views ?? 0}
            categories={fetva.categories ?? []}
            shareUrl={shareUrl}
            question={fetva.question}
          />

          {/* Comments */}
          <FetvaComments fetvaId={fetva.id} />
        </article>

        {/* Related Fatwas */}
        {relatedFatwas.length > 0 && (
          <section className="mt-16 pt-10 border-t border-clean-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif font-normal text-main">Benzer Fetvalar</h2>
              <Link
                href="/arama"
                className="text-[13px] font-medium uppercase tracking-[1.5px] text-muted hover:text-accent transition-colors"
              >
                Daha fazla
              </Link>
            </div>

            <div className="space-y-0">
              {relatedFatwas.map((item) => (
                <Link
                  key={item.id}
                  href={`/fetva/${item.id}`}
                  className="group block py-6 border-b border-clean-border last:border-b-0"
                >
                  <h3 className="font-serif text-lg text-main mb-2 leading-[1.4] group-hover:text-accent transition-colors">
                    {item.question}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">
                    {item.answer}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
