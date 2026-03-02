'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
=======
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
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

<<<<<<< HEAD
  const renderDesktopLinks = () =>
=======
  const renderNavLinks = (onClick?: () => void) =>
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
    NAVIGATION.map((item) => (
      <Link
        key={item.href}
        href={item.href}
<<<<<<< HEAD
        className={cn(
          'rounded-md px-1.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isActive(item.href) && 'text-primary'
        )}
        aria-current={isActive(item.href) ? 'page' : undefined}
=======
        onClick={onClick}
        className={cn(
          'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
          isActive(item.href) && 'text-primary'
        )}
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
      >
        {item.label}
      </Link>
    ));

<<<<<<< HEAD
  const renderMobileLinks = () =>
    NAVIGATION.map((item) => (
      <SheetClose asChild key={item.href}>
        <Link
          href={item.href}
          className={cn(
            'rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            isActive(item.href) && 'text-primary'
          )}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      </SheetClose>
    ));

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-20">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="FetvaBul ana sayfası"
        >
          <svg className="h-7 w-7" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-foreground">FetvaBul</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Ana navigasyon">
          {renderDesktopLinks()}
=======
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
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
<<<<<<< HEAD
            className="hidden h-10 w-10 rounded-full border border-primary/20 text-primary sm:inline-flex focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
=======
            className="hidden h-10 w-10 rounded-full border border-primary/20 text-primary sm:inline-flex"
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
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
<<<<<<< HEAD
                className="inline-flex h-10 w-10 rounded-full border border-border/50 md:hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Menüyü aç"
=======
                className="inline-flex h-10 w-10 rounded-full border border-border/50 md:hidden"
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background">
<<<<<<< HEAD
              <nav className="mt-12 flex flex-col gap-3" aria-label="Mobil navigasyon">
                {renderMobileLinks()}
              </nav>
              <SheetClose asChild>
                <Button asChild className="mt-8 w-full rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <Link href="/arama">Ara</Link>
                </Button>
              </SheetClose>
=======
              <div className="mt-12 flex flex-col gap-5">
                {renderNavLinks(() => {})}
              </div>
              <Button asChild className="mt-8 w-full rounded-full border border-primary/20 bg-primary/10 text-primary">
                <Link href="/arama">Ara</Link>
              </Button>
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 34d7bb9060bc9befb4eabc47f323d49be6d3478f
