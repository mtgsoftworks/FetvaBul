'use client';

import Link from 'next/link';
import { BookOpen, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40 bg-background-light/85 backdrop-blur-xl dark:bg-background-dark/85">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-islamic shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </span>
              <span className="text-2xl font-bold tracking-tight text-foreground">FetvaBul</span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Güvenilir İslami bilgi kaynağınız
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Kategoriler</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/category/ibadet" className="transition-colors hover:text-primary">İbadet</Link></li>
              <li><Link href="/category/muamelat" className="transition-colors hover:text-primary">Muamelat</Link></li>
              <li><Link href="/category/aile" className="transition-colors hover:text-primary">Aile</Link></li>
              <li><Link href="/category/ticaret" className="transition-colors hover:text-primary">Ticaret</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">İletişim</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <span>info@fetvabul.com</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </span>
                <span>+90 212 555 0123</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Bizi Takip Edin</h4>
            <p className="text-sm text-muted-foreground">Güncel fetvalar ve duyurular için sosyal medya hesaplarımızı takip edin.</p>
            <div className="flex items-center gap-3">
              <Link
                href="https://twitter.com"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 transition-colors hover:border-primary hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://facebook.com"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 transition-colors hover:border-primary hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 transition-colors hover:border-primary hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 text-center text-sm text-muted-foreground md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link href="/kullanim-sartlari" className="transition-colors hover:text-primary">
              Kullanım Şartları
            </Link>
            <span className="hidden text-border/60 md:inline">|</span>
            <Link href="/gizlilik" className="transition-colors hover:text-primary">
              Gizlilik Sözleşmesi
            </Link>
          </div>
          <p className="text-muted-foreground/80">© 2025 FetvaBul. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}