'use client';

import { Search, BookOpen, Users, Star, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createCategorySlug } from '@/types';
import { getCategoryIconComponent } from '@/lib/category-icons';
import type { LucideIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';

type UICategory = { name: string; slug?: string; count: number; Icon: LucideIcon; href: string };

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularCategories, setPopularCategories] = useState<UICategory[]>([]);
  const [commonKeywords, setCommonKeywords] = useState<string[]>([]);
  const [stats, setStats] = useState<{ totalFatwas: number; totalCategories: number; totalViews: number } | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/categories?includeStats=true', { cache: 'no-store' });
        const data = await res.json();
        const cats = Array.isArray(data.categories) ? data.categories : [];
        if (active) {

          const topCategories: UICategory[] = cats
            .slice()
            .sort((a: any, b: any) => (b.fatwaCount ?? 0) - (a.fatwaCount ?? 0))
            .map((c: any) => {
              const slug = c.slug || createCategorySlug(c.name);
              const href = slug ? `/kategori/${slug}` : `/arama?q=${encodeURIComponent(c.name)}`;
              return {
                name: c.name,
                slug,
                count: c.fatwaCount ?? 0,
                Icon: getCategoryIconComponent(c.name),
                href,
              };
            })
            .slice(0, 12);

          setPopularCategories(topCategories);
          if (data.stats) {
            setStats({
              totalFatwas: data.stats.totalFatwas ?? 0,
              totalCategories: data.stats.totalCategories ?? 0,
              totalViews: data.stats.totalViews ?? 0,
            });
          }
        }
      } catch {}
      try {
        const rs = await fetch('/api/search/stats', { cache: 'no-store' });
        const d = await rs.json();
        const list = Array.isArray(d.stats?.mostCommonKeywords) ? d.stats.mostCommonKeywords : [];
        if (active) setCommonKeywords(list.slice(0, 4).map((k: any) => k.keyword));
      } catch {}
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Arama sayfasına yönlendir
      window.location.href = `/arama?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header bileşenini kullan */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-6">
              İslami Sorularınıza
              <br />
              <span className="text-islamic-green-600">Güvenilir Cevaplar</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Binlerce fetva arasından aradığınız soruların cevaplarını kolayca bulun. 
              Güvenilir kaynaklardan derlenmiş İslami bilgi arşivi.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-container mb-12">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sorunuzu yazın... (örn: namaz kaç rekattır?)"
                  className="search-input"
                />
                <button
                  type="submit"
                  className="search-button"
                >
                  <Search className="w-5 h-5 mr-2 text-islamic-green-700" />
                  Ara
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{(stats?.totalFatwas ?? 0).toLocaleString('tr-TR')}</div>
                <div className="text-muted-foreground">Fetva</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{(stats?.totalCategories ?? 0).toLocaleString('tr-TR')}</div>
                <div className="text-muted-foreground">Kategori</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{(stats?.totalViews ?? 0).toLocaleString('tr-TR')}</div>
                <div className="text-muted-foreground">Görüntülenme</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4">Popüler Kategoriler</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              En çok aranan konulara göz atın ve ihtiyacınız olan bilgiyi hızlıca bulun.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {popularCategories.map((category) => {
              const Icon = category.Icon;
              return (
                <Link key={`${category.slug || category.name}`} href={category.href} className="card-islamic p-6 text-center group cursor-pointer">
                  <div className="w-10 h-10 bg-islamic-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-islamic-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} fetva</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Searches */}
      <section className="py-16 px-4 bg-islamic-green-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">Sık Aranan Sorular</h2>
              <p className="text-muted-foreground">
                Diğer kullanıcıların en çok merak ettiği konular
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonKeywords.map((search, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl border border-islamic-green-200 hover:border-islamic-green-300 cursor-pointer transition-all duration-200 hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {search}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4">Neden FetvaBul?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              İslami sorularınıza en doğru ve güvenilir cevapları bulmanız için tasarlandı.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-islamic-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-islamic-green-600" />
              </div>
              <h3 className="mb-4">Hızlı Arama</h3>
              <p className="text-muted-foreground">
                Gelişmiş arama algoritması ile saniyeler içinde aradığınız fetvaları bulun.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-islamic-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-islamic-green-600" />
              </div>
              <h3 className="mb-4">Güvenilir Kaynaklar</h3>
              <p className="text-muted-foreground">
                Tüm fetvalar güvenilir İslami kaynaklardan derlenmiş ve doğrulanmıştır.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-islamic-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-islamic-green-600" />
              </div>
              <h3 className="mb-4">Kolay Kullanım</h3>
              <p className="text-muted-foreground">
                Sade ve kullanıcı dostu arayüz ile herkes kolayca kullanabilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-islamic-green-900 text-islamic-green-100 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-islamic-green-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">FetvaBul</h3>
              </div>
              <p className="text-islamic-green-300 mb-4">
                İslami sorularınıza güvenilir cevaplar bulmanın en kolay yolu.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Kategoriler</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">İbadet</a></li>
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">Muamelat</a></li>
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">Aile</a></li>
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">Ticaret</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Hakkında</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">İletişim</a></li>
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">Gizlilik</a></li>
                <li><a href="#" className="text-islamic-green-300 hover:text-white transition-colors">Kullanım Şartları</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">İletişim</h4>
              <p className="text-islamic-green-300 mb-2">
                info@fetvabul.com
              </p>
              <p className="text-islamic-green-300">
                Sorularınız için bizimle iletişime geçin.
              </p>
            </div>
          </div>

          <div className="border-t border-islamic-green-800 mt-8 pt-8 text-center">
            <p className="text-islamic-green-400">
              © 2025 FetvaBul. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}