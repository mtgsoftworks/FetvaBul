'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const NAVIGATION = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Kategoriler', href: '/kategoriler' },
  { label: 'Soru Sor', href: '/soru-sor' },
  { label: 'Hakkında', href: '/hakkinda' },
  { label: 'İletişim', href: '/iletisim' },
];

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-card/95 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.05)] py-5'
            : 'bg-transparent py-8'
        )}
      >
        <div className="max-w-editorial mx-auto px-8 flex justify-between items-center w-full">
          <Link
            href="/"
            className="font-serif text-[28px] font-bold tracking-[-0.5px] text-accent no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
            aria-label="FetvaBul ana sayfası"
          >
            FetvaBul
          </Link>

          <nav className="hidden md:flex items-center space-x-8" aria-label="Ana navigasyon">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-[13px] font-medium uppercase tracking-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded',
                  isActive(item.href) ? 'text-accent' : 'text-muted hover:text-accent'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            className="flex items-center justify-center p-2 text-muted hover:text-main md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-bg/98 backdrop-blur-sm md:hidden">
          <div className="flex justify-between items-center px-8 py-8">
            <Link
              href="/"
              className="font-serif text-[28px] font-bold tracking-[-0.5px] text-accent no-underline"
              onClick={() => setMobileOpen(false)}
            >
              FetvaBul
            </Link>
            <button
              className="flex items-center justify-center p-2 text-muted hover:text-main"
              onClick={() => setMobileOpen(false)}
              aria-label="Menüyü kapat"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col items-center gap-6 pt-12 mobile-safe-bottom" aria-label="Mobil navigasyon">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-[15px] font-medium uppercase tracking-[2px] transition-colors',
                  isActive(item.href) ? 'text-accent' : 'text-muted hover:text-accent'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/arama"
              onClick={() => setMobileOpen(false)}
              className="mt-4 text-[13px] font-medium uppercase tracking-[1.5px] border border-clean-border rounded-full px-6 py-3 text-muted hover:text-accent hover:border-accent transition-colors"
            >
              Ara
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
