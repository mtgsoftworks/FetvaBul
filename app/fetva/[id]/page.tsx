export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Tag } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';
import { FetvaCard } from '@/components/cards/FetvaCard';
import { Badge } from '@/components/ui/badge';
import type { Fetva } from '@/types';
import { FetvaEngagement } from '@/components/fetva/FetvaEngagement';

function formatDate(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('tr-TR', { dateStyle: 'long' });
}

function extractParagraphs(answer: string) {
  return answer
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

async function getFetvaDetail(id: string) {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const existing = await dataService.getFetvaById(id);
  if (!existing) {
    return null;
  }

  await dataService.incrementViews(id);
  const fetva = (await dataService.getFetvaById(id)) ?? existing;

  const relatedFatwas = await dataService.findSimilarQuestions(fetva.question, 3);

  return { fetva, relatedFatwas } as const;
}

export default async function FetvaDetailPage({ params }: { params: { id: string } }) {
  const data = await getFetvaDetail(params.id);

  if (!data) {
    return notFound();
  }

  const { fetva, relatedFatwas } = data;
  const paragraphs = extractParagraphs(fetva.answer);
  const createdAt = formatDate(fetva.createdAt ?? fetva.date);
  const updatedAt = formatDate(fetva.updatedAt);
  const primaryCategory = fetva.categories?.[0] ?? 'Genel';
  const shareBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fetvabul.com';
  const shareUrl = `${shareBase}/fetva/${fetva.id}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <Link
          href="/arama"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Fetvalara geri dön
        </Link>

        <article className="mt-8 space-y-12 rounded-3xl border border-border/40 bg-background/80 p-8 shadow-lg backdrop-blur">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-primary/10 px-4 py-2 text-primary">
                <Tag className="mr-2 h-4 w-4" />
                {primaryCategory}
              </Badge>
              {fetva.source && (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {fetva.source}
                </span>
              )}
              {createdAt && (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {createdAt}
                </span>
              )}
              {updatedAt && (
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  Güncellendi: {updatedAt}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {fetva.question}
            </h1>
          </header>

          <section className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="text-foreground">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="whitespace-pre-wrap text-foreground">{fetva.answer}</p>
            )}
          </section>

          <FetvaEngagement
            id={fetva.id}
            initialLikes={fetva.likes ?? 0}
            views={fetva.views ?? 0}
            categories={fetva.categories ?? []}
            shareUrl={shareUrl}
            question={fetva.question}
          />
        </article>

        {relatedFatwas.length > 0 && (
          <section className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Benzer fetvalar</h2>
              <Link href="/arama" className="text-sm font-semibold text-primary transition hover:underline">
                Daha fazla fetva
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {relatedFatwas.map((item) => (
                <FetvaCard
                  key={item.id}
                  id={item.id}
                  question={item.question}
                  answer={item.answer}
                  category={item.categories?.[0] ?? 'Genel'}
                  source={item.source ?? ''}
                  date={item.date ?? ''}
                  views={item.views ?? 0}
                  likes={item.likes ?? 0}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
