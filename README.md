# 🕌 FetvaBul - İslami Fetva Arama Motoru

[![Netlify Status](https://api.netlify.com/api/v1/badges/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/deploy-status)](https://app.netlify.com/sites/fetvabul/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13.5.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

FetvaBul, İslami din hakkında sorularınıza hızlı ve güvenilir cevaplar bulmanızı sağlayan modern bir arama motorudur. 497'den fazla fetva, 11 ana kategoriye düzenlenmiş şekilde kullanıcılarla buluşuyor.

## ✨ Özellikler

### 🔍 Gelişmiş Arama
- **Akıllı arama algoritması** ile kelimelerin tamamı ve kısımları eşleştirilir
- **Autocomplete** önerileri ile hızlı arama
- **Anahtar kelime vurgulama** (highlighting)
- **Sıralama seçenekleri:** İlgili, En Yeni, En Popüler, En Çok Görüntülenen

### 📱 Modern Kullanıcı Deneyimi
- **%100 Mobil Uyumlu** - Responsive tasarım
- **Progressive Web App** desteği
- **Hızlı yüklenme** - Core Web Vitals optimize
- **Erişilebilirlik** - WCAG 2.1AA standards
- **Dark/Light tema** desteği

### 🗂️ Kategori Sistemi
11 ana kategori altında fetvalar düzenlenmiştir:
1. **İbadet** - Namaz, abdest, oruç, zekât, hac
2. **İnanç** - Allah, iman, küfür, şirk, tevhid
3. **Ahlak & Tasavvuf** - Ahlak, adab, tasavvuf, terbiye
4. **Aile Hukuku** - Evlilik, boşanma, nafaka, miras
5. **Muamelat & Ekonomi** - Alım-satım, kira, faiz, rüşvet
6. **Helal Gıda** - Beslenme, kasaplık, içecekler
7. **Sağlık** - Tedavi, tıbbi müdahale, ilaç
8. **Mahremiyet & Tesettür** - Örtünme, mahremiyet, bakış
9. **İslam İlimleri** - Kur'an, hadis, fıkıh, tefsir
10. **Ölüm & Ahiret** - Cenaze, mezar, kabir, ahiret
11. **Genel Sorular** - Genel İslami konular

### 🚀 Teknik Özellikler
- **Next.js 13.5.1** App Router
- **TypeScript** ile type-safety
- **Tailwind CSS** ile modern UI
- **Radix UI** ile accessible components
- **Server-Side Rendering** (SSR)
- **Static Site Generation** (SSG)
- **API Routes** ile backend

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18.0+
- npm, yarn, veya pnpm

### Adımlar
```bash
# 1. Repoyu klonlayın
git clone https://github.com/mtgsoftworks/FetvaBul.git
cd FetvaBul

# 2. Dependencies'leri yükleyin
npm install

# 3. Veri dosyasını indirin (2.7MB)
# data/consolidated_fetvas.jsonl dosyasının olduğundan emin olun

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

### Environment Variables
`.env.local` dosyası oluşturun:
```env
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATA_FILE=./data/consolidated_fetvas.jsonl
```

## 📊 Proje İstatistikleri

| Metrik | Değer |
|--------|-------|
| 📄 Toplam Fetva | 497 |
| 🗂️ Kategori Sayısı | 11 |
| 🔍 Arama Terimleri | 237,470 |
| 📱 Mobil Uyumlu | ✅ |
| ⚡ Lighthouse Skoru | 95+ |

## 🌐 Deployment

### Netlify (Önerilen)
1. Repoyu GitHub'a push edin
2. [Netlify](https://app.netlify.com)'da "New site from Git"
3. Repository seçin
4. Build settings: `npm run build` / `.next`
5. Deploy!

### Vercel
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t fetvabul .
docker run -p 3000:3000 fetvabul
```

## 📁 Proje Yapısı

```
fetva-web/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (pages)/           # Sayfalar
│   └── globals.css        # Global styles
├── components/            # React Components
│   ├── ui/               # Shadcn/ui components
│   └──.layout/           # Layout components
├── lib/                   # Utilities
│   ├── search-index.ts   # Arama algoritması
│   └── data-service.ts   # Veri yönetimi
├── data/                  # Veri dosyaları
└── public/               # Static assets
```

## 🔧 API Endpoints

### Search API
```typescript
GET /api/search?q={query}&category={cat}&sortBy={sort}&page={page}&limit={limit}
```

### Categories API
```typescript
GET /api/categories        // Tüm kategoriler
GET /api/categories/{slug} // Kategori detayı
```

### Autocomplete API
```typescript
GET /api/autocomplete?q={query}
```

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Primary:** Islamic Green (#4caf50)
- **Secondary:** Light Green variants
- **Neutral:** Gray scale
- **Accent:** Gold/yellow for highlights

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 300-700
- **Responsive:** clamp() fonksiyonu ile

### Components
- **Header:** Sticky navigation
- **Search:** Advanced input with autocomplete
- **Cards:** Islamic design patterns
- **Footer:** 4-column layout

## 🧪 Testing

```bash
# Test çalıştır
npm test

# Coverage raporu
npm run test:coverage

# UI tests
npm run test:ui
```

## 📈 Performans

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Optimizasyonlar
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Caching headers
- ✅ Minification
- ✅ Compression

## 🔍 Arama Algoritması

### Full-Text Search
- **Stemming:** Kelime köklerine inme
- **Fuzzy matching:** Yaklaşık eşleşme
- **Weighting:** Relevance scoring
- **Indexing:** Inverted search index

### Search Features
- **Diathesis (vowel) insensitive:** Arapça harfler
- **Turkish characters support:** Ç, Ş, İ, Ğ, Ü, Ö
- **Multi-word search:** Tüm kelimeler eşleşir
- **Highlighting:** Sonuçlarda kelime vurgulama

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

## 🌍 Multi-Language

Proje şu anda Türkçe dilinde bulunmaktadır.
- ✅ Türkçe interface
- 🔄 İngilizce (planlanıyor)
- 🔄 Arapça (planlanıyor)

## 🔒 Güvenlik

- **XSS Protection:** Input sanitization
- **CSRF Protection:** Same-token verification
- **Content Security Policy:** Strict headers
- **Rate Limiting:** API request limits

## 📝 Geliştirme

### Git Workflow
```bash
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Pull request oluştur
```

### Code Style
- **ESLint + Prettier:** Auto-formatting
- **TypeScript:** Strict mode
- **Conventional Commits:** feat:, fix:, docs:, etc.

## 🤝 Katkıda Bulunma

Katkılarınızı bekleriz! Lütfen:

1. Fork yapın
2. Feature branch'i oluşturun
3. Değişiklikleri commit edin
4. Push edin
5. Pull request açın

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 👨‍💻 Ekibimiz

- **[Necati Koçkeseni](https://github.com/necatikock)** - Fıkıh Uzmanı
- **[Mesut Taha Güven](https://github.com/mtgsoftworks)** - Teknoloji Direktörü
- **[Abdullah Güven](https://github.com)** - İçerik Editörü

## 📞 İletişim

- **E-posta:** info@fetvabul.com
- **Web Sitesi:** https://fetvabul.com
- **GitHub:** https://github.com/mtgsoftworks/FetvaBul

## 🙏 Teşekkürler

- **Next.js Team** - Harika framework için
- **Tailwind CSS** - Utility-first CSS için
- **Radix UI** - Accessible components için
- **Lucide React** - Icons için
- **Tüm fetva kaynakları** - İçerik için

## 🚀 Roadmap

### v2.0 (Yakında)
- [ ] İngilizce dil desteği
- [ ] Kullanıcı hesapları
- [ ] Favori fetvalar
- [ ] PDF export
- [ ] Mobil uygulama (React Native)
- [ ] API rate limiting
- [ ] Advanced filters

### v3.0 (Planlanıyor)
- [ ] Arapça dil desteği
- [ ] Video fetvalar
- [ ] AI-powered suggestions
- [ ] Community Q&A
- [ ] Scholar verification

---

**Made with ❤️ for the Muslim Ummah**

<div align="center">
  <sub>Built with ⚡ by <a href="https://github.com/mtgsoftworks">mtgsoftworks</a></sub>
</div>