'use client';

import { BookOpen, Clock, Tag, Share2, ArrowLeft, ThumbsUp, MessageCircle, Copy, Facebook, Twitter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createCategorySlug } from '@/types';

export default function FetvaDetailPage({ params }: { params: { id: string } }) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fetva, setFetva] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/fatwas/${encodeURIComponent(params.id)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!active) return;
        setFetva(data.fatwa ?? null);
        setRelated(Array.isArray(data.relatedFatwas) ? data.relatedFatwas : []);
      } catch (e: any) {
        if (active) setError('Fetva yüklenemedi');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [params.id]);

  const handleShare = () => {
    setIsSharing(!isSharing);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-islamic rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary">FetvaBul</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Ana Sayfa
              </Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Kategoriler
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Hakkında
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span>/</span>
          {fetva?.categories?.[0] ? (
            <>
              <Link href="/kategoriler" className="hover:text-primary transition-colors">Kategoriler</Link>
              <span>/</span>
              <Link href={`/kategori/${createCategorySlug(fetva.categories[0])}`} className="hover:text-primary transition-colors">
                {fetva.categories[0]}
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link href="/arama" className="hover:text-primary transition-colors">Arama</Link>
              <span>/</span>
            </>
          )}
          <span>{fetva?.question ? (fetva.question.length > 50 ? fetva.question.slice(0, 50) + '…' : fetva.question) : 'Fetva Detayı'}</span>
        </div>

        {/* Back Button */}
        <Link href="/arama" className="inline-flex items-center space-x-2 text-islamic-green-600 hover:text-islamic-green-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Arama Sonuçlarına Dön</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* JSON-LD: BreadcrumbList + FAQPage */}
            {!loading && fetva && (
              <>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@type': 'BreadcrumbList',
                      itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: '/' },
                        fetva.categories?.[0]
                          ? { '@type': 'ListItem', position: 2, name: 'Kategoriler', item: '/kategoriler' }
                          : { '@type': 'ListItem', position: 2, name: 'Arama', item: '/arama' },
                        fetva.categories?.[0]
                          ? { '@type': 'ListItem', position: 3, name: fetva.categories[0], item: `/kategori/${createCategorySlug(fetva.categories[0])}` }
                          : undefined,
                        { '@type': 'ListItem', position: fetva.categories?.[0] ? 4 : 3, name: fetva.question }
                      ].filter(Boolean)
                    })
                  }}
                />
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@type': 'FAQPage',
                      mainEntity: [
                        {
                          '@type': 'Question',
                          name: fetva.question,
                          acceptedAnswer: {
                            '@type': 'Answer',
                            text: fetva.answer
                          }
                        }
                      ]
                    })
                  }}
                />
              </>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}
            {loading ? (
              <article className="card-islamic p-8 animate-pulse">
                <div className="h-4 w-24 bg-islamic-green-100 rounded mb-4" />
                <div className="h-8 w-3/4 bg-islamic-green-100 rounded mb-6" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-islamic-green-50 rounded" />
                  <div className="h-4 w-11/12 bg-islamic-green-50 rounded" />
                  <div className="h-4 w-10/12 bg-islamic-green-50 rounded" />
                  <div className="h-4 w-9/12 bg-islamic-green-50 rounded" />
                </div>
              </article>
            ) : fetva ? (
              <article className="card-islamic p-8">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-4 h-4 text-islamic-green-600" />
                    <span className="text-sm text-islamic-green-600 font-medium">
                      {fetva.categories?.[0] || 'Kategori'}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    {fetva.question}
                  </h1>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{fetva.source || 'Kaynak Belirtilmemiş'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{fetva.date ? new Date(fetva.date).toLocaleDateString('tr-TR') : 'Tarih Belirtilmemiş'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>{fetva.views || 0} görüntülenme</span>
                      <button className="flex items-center space-x-1 hover:text-islamic-green-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{fetva.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-foreground leading-relaxed">
                    {fetva.answer}
                  </div>
                </div>

                {/* Tags */}
                {Array.isArray(fetva.searchKeywords) && fetva.searchKeywords.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="font-medium mb-3">Anahtar Kelimeler:</h4>
                    <div className="flex flex-wrap gap-2">
                      {fetva.searchKeywords.map((tag: string, index: number) => (
                        <span key={index} className="category-chip">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-islamic-green-100 hover:bg-islamic-green-200 text-islamic-green-700 rounded-lg transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Beğen ({fetva.likes || 0})</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 border border-islamic-green-200 hover:bg-islamic-green-50 text-islamic-green-700 rounded-lg transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>Yorum Yap</span>
                      </button>
                    </div>
                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 px-4 py-2 border border-islamic-green-200 hover:bg-islamic-green-50 text-islamic-green-700 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Paylaş</span>
                      </button>
                      {isSharing && (
                        <div className="absolute right-0 top-12 bg-white border border-border rounded-lg shadow-lg p-4 w-48 z-10">
                          <div className="space-y-2">
                            <button
                              onClick={handleCopy}
                              className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-islamic-green-50 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              <span>{copied ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-islamic-green-50 rounded-lg transition-colors">
                              <Facebook className="w-4 h-4" />
                              <span>Facebook</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full px-3 py-2 hover:bg-islamic-green-50 rounded-lg transition-colors">
                              <Twitter className="w-4 h-4" />
                              <span>Twitter</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Similar Questions */}
              <div className="card-islamic p-6">
                <h3 className="font-semibold mb-4">Benzer Sorular</h3>
                <div className="space-y-3">
                  {loading ? (
                    <>
                      <div className="h-5 w-full bg-islamic-green-50 rounded animate-pulse" />
                      <div className="h-5 w-11/12 bg-islamic-green-50 rounded animate-pulse" />
                      <div className="h-5 w-10/12 bg-islamic-green-50 rounded animate-pulse" />
                    </>
                  ) : related.length > 0 ? (
                    related.map((benzer: any) => (
                      <Link
                        key={benzer.id}
                        href={`/fetva/${benzer.id}`}
                        className="block p-3 hover:bg-islamic-green-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-start space-x-2">
                          <Tag className="w-3 h-3 text-islamic-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                              {benzer.question}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {benzer.categories?.[0] || 'Kategori'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Benzer soru bulunamadı.</p>
                  )}
                </div>
              </div>

              {/* Quick Search */}
              <div className="card-islamic p-6">
                <h3 className="font-semibold mb-4">Hızlı Arama</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Başka bir soru ara..."
                    className="w-full px-4 py-3 border border-islamic-green-200 rounded-lg focus:border-islamic-green-500 focus:ring-2 focus:ring-islamic-green-100 transition-all"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-islamic-green-600 hover:text-islamic-green-700">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="card-islamic p-6">
                <h3 className="font-semibold mb-4">Popüler Kategoriler</h3>
                <div className="space-y-2">
                  {['Namaz', 'Oruç', 'Zekât', 'Hac', 'Nikah', 'Ticaret'].map((kategori) => (
                    <Link
                      key={kategori}
                      href={`/kategori/${kategori.toLowerCase()}`}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-islamic-green-50 rounded-lg transition-colors"
                    >
                      {kategori}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Note: generateMetadata removed due to "use client" directive
// Metadata will be handled differently for client components