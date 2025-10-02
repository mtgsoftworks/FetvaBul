'use client';

import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';
import { useI18n } from '@/components/providers/I18nProvider';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-islamic-green-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-islamic-green-600" />
              </div>
              <h3 className="text-2xl font-bold">{t('header.title')}</h3>
            </div>
            <p className="text-islamic-green-100 mb-6 max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="font-semibold mb-4">{t('common.categories')}</h4>
            <ul className="space-y-2 text-islamic-green-100">
              <li><Link href="/kategori/ibadet" className="hover:text-white transition-colors">İbadet</Link></li>
              <li><Link href="/kategori/muamelat" className="hover:text-white transition-colors">Muamelat</Link></li>
              <li><Link href="/kategori/aile" className="hover:text-white transition-colors">Aile</Link></li>
              <li><Link href="/kategori/ticaret" className="hover:text-white transition-colors">Ticaret</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="font-semibold mb-4">{t('about.contact')}</h4>
            <ul className="space-y-2 text-islamic-green-100">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@fetvabul.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+90 212 555 0123</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-islamic-green-800 mt-8 pt-8 text-center">
          <p className="text-islamic-green-100">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}