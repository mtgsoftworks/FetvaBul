'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, Phone, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40 bg-background-light/85 backdrop-blur-xl dark:bg-background-dark/85">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Image
                src="/fetvabul_logo.png"
                alt="FetvaBul logosu"
                width={512}
                height={512}
                className="h-16 w-auto sm:h-20"
              />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Güvenilir İslami bilgi kaynağınız
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Kategoriler</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/kategori/ibadet"
                  className="rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  İbadet
                </Link>
              </li>
              <li>
                <Link
                  href="/kategori/muamelat-ekonomi"
                  className="rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Muamelat ve Ekonomi
                </Link>
              </li>
              <li>
                <Link
                  href="/kategori/aile-hukuku-sosyal-iliskiler"
                  className="rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Aile Hukuku
                </Link>
              </li>
              <li>
                <Link
                  href="/kategori/helal-gida-beslenme"
                  className="rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Helal Gıda
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">İletişim</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <span>support@mtgsoftworks.com</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </span>
                <span>0544 175 71 51</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>Niğde Merkez (NİKEM)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Bizi Takip Edin</h4>
            <p className="text-sm text-muted-foreground">
              Güncel fetvalar ve duyurular için sosyal medya hesaplarımızı takip edin.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="https://www.youtube.com/@davetul_islam"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 text-center text-sm text-muted-foreground md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link
              href="/kullanim-sartlari"
              className="rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Kullanım Şartları
            </Link>
            <span className="hidden text-border/60 md:inline">|</span>
            <Link
              href="/gizlilik"
              className="rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Gizlilik Sözleşmesi
            </Link>
          </div>
          <p className="text-muted-foreground/80">© 2026 FetvaBul. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

