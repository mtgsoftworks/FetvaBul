'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAVIGATION = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Soru Sor', href: '/soru-sor' },
  { label: 'Kategoriler', href: '/kategoriler' },
  { label: 'Hakkında', href: '/hakkinda' },
  { label: 'İletişim', href: '/iletisim' },
];

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const renderNavLinks = (onClick?: () => void) =>
    NAVIGATION.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={cn(
          'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
          isActive(item.href) && 'text-primary'
        )}
      >
        {item.label}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-20">
        <Link href="/" className="flex items-center gap-2 text-primary" aria-label="Fetvabul ana sayfası">
          <svg className="h-7 w-7" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-foreground">Fetvabul</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden h-10 w-10 rounded-full border border-primary/20 text-primary sm:inline-flex"
          >
            <Link href="/arama" aria-label="Arama sayfasına git">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex h-10 w-10 rounded-full border border-border/50 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background">
              <div className="mt-12 flex flex-col gap-5">
                {renderNavLinks(() => {})}
              </div>
              <Button asChild className="mt-8 w-full rounded-full border border-primary/20 bg-primary/10 text-primary">
                <Link href="/arama">Ara</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}