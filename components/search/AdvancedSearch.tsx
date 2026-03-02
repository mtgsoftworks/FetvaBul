'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  category: string;
  source: string;
  dateRange: string;
}

export function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    source: '',
    dateRange: ''
  });

  const categories = [
    'İbadet', 'Muamelat', 'Aile', 'Ticaret', 'Tesettür', 
    'Kadın Erkek İlişkileri', 'Cuma Namazı', 'Hadis İnkarcıları'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Arama işlemi
  };

  const clearFilters = () => {
    setFilters({ category: '', source: '', dateRange: '' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Ana Arama */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="İslami sorularınızı buraya yazın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-20 h-14 text-lg border-2 border-islamic-green-200 focus:border-islamic-green-500 rounded-2xl"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-16 top-1/2 transform -translate-y-1/2"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-islamic"
          >
            Ara
          </Button>
        </div>

        {/* Filtreler */}
        {showFilters && (
          <div className="bg-islamic-green-50 p-6 rounded-xl border border-islamic-green-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Gelişmiş Filtreler</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Temizle
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.source} onValueChange={(value) => setFilters({...filters, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Kaynak seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diyanet">Diyanet İşleri</SelectItem>
                  <SelectItem value="fetva-komitesi">Fetva Komitesi</SelectItem>
                  <SelectItem value="alimlerin-gorusleri">Alimlerin Görüşleri</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tarih aralığı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-month">Son 1 ay</SelectItem>
                  <SelectItem value="last-year">Son 1 yıl</SelectItem>
                  <SelectItem value="all-time">Tüm zamanlar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aktif Filtreler */}
            {(filters.category || filters.source || filters.dateRange) && (
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="bg-islamic-green-100 text-islamic-green-800">
                    {filters.category}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilters({...filters, category: ''})} />
                  </Badge>
                )}
                {filters.source && (
                  <Badge variant="secondary" className="bg-islamic-green-100 text-islamic-green-800">
                    {filters.source}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilters({...filters, source: ''})} />
                  </Badge>
                )}
                {filters.dateRange && (
                  <Badge variant="secondary" className="bg-islamic-green-100 text-islamic-green-800">
                    {filters.dateRange}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilters({...filters, dateRange: ''})} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}