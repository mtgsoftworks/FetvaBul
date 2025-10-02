'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIconComponent, type CategoryIconComponent } from '@/lib/category-icons';
import { Header } from '@/components/layout/Header';

type UIKategori = { name: string; slug: string; count: number; Icon: CategoryIconComponent; description?: string };

export default function KategorilerPage() {
  const [categories, setCategories] = useState<UIKategori[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' });
        const data = await res.json();
        const list = Array.isArray(data.categories) ? data.categories : [];
        if (active) {
          setCategories(
            list.map((c: any) => ({
              name: c.name,
              slug: c.slug,
              count: c.fatwaCount ?? 0,
              Icon: getCategoryIconComponent(c.name),
              description: c.description,
            }))
          );
        }
      } catch {
        if (active) setCategories([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Fetva Kategorileri</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            İslami konulara göre düzenlenmiş fetva kategorilerimizi keşfedin
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className={`grid gap-8 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {filteredCategories.map((category) => {
          const Icon = category.Icon;
          return (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="group"
            >
              <div className={`card-islamic p-6 sm:p-8 h-full transition-all duration-300 hover:shadow-lg hover:border-islamic-green-300 ${
                viewMode === 'list' ? 'flex items-center space-x-8' : 'text-center'
              }`}>
                <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mx-auto'} w-12 h-12 bg-islamic-green-100 rounded-xl flex items-center justify-center ${viewMode === 'list' ? 'mb-0' : 'mb-4'}`}>
                  <Icon className="w-6 h-6 text-islamic-green-600" />
                </div>

                <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'mb-3' : 'mb-3'}`}>
                    <h3 className="category-title text-xl font-semibold text-foreground group-hover:text-islamic-green-700 transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className={`bg-islamic-green-100 text-islamic-green-800 ${
                      viewMode === 'list' ? 'mt-2' : 'mt-2'
                    }`}>
                      {category.count} fetva
                    </Badge>
                  </div>

                  {category.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Aradığınız kriterlere uygun kategori bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}