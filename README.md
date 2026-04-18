# FetvaBul

FetvaBul, İslami fetvaları aramak, listelemek ve detaylı okumak için geliştirilmiş bir Next.js 13 uygulamasıdır.
Kategori filtreleme, otomatik tamamlama, sıralama ve API tabanlı etkileşim özellikleri içerir.

<p align="center">
  <img src="./public/fetvabul_logo.png" alt="FetvaBul Logo" width="200" />
</p>

## Özellikler

- Hızlı arama (`/arama`) ve kategori filtreleme
- Kategori sayfaları (`/kategori/[slug]`)
- Fetva detay sayfası (`/fetva/[id]`)
- Otomatik tamamlama ve arama istatistikleri
- İletişim/soru gönderme API'si
- Beğeni, görüntülenme ve sağlık kontrolü endpointleri
- Mobil uyumlu arayüz

## Teknoloji Yığını

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS + Radix UI
- Firebase Firestore
- Vitest

## Gereksinimler

- Node.js 18+
- npm

## Kurulum

```bash
git clone https://github.com/mtgsoftworks/FetvaBul.git
cd FetvaBul
npm install
npm run dev
```

Varsayılan yerel adres: `http://localhost:3000`

PowerShell politika kısıtı olan makinelerde `npm` yerine `npm.cmd` kullanın:

```bash
npm.cmd run dev
```

## Ortam Değişkenleri

Kök dizinde `.env.local` oluşturun:

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_SITE_URL=https://fetvabul.com
NEXT_PUBLIC_SYNC_BASE_URL=https://fetvabul.netlify.app
NEXT_PUBLIC_ENABLE_DATA_SYNC=1
NEXT_PUBLIC_DATA_SYNC_CHECK_MS=900000
DATA_FILE=data/consolidated_fetvas.jsonl
ENABLE_DATA_AUTO_REFRESH=true
DATA_REFRESH_CHECK_MS=30000
```

## Scriptler

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run start
```

## API Özeti

- `GET /api/health` - sistem sağlık durumu
- `GET /api/search` - arama (`query`, `category`, `sortBy`, `page`, `limit`)
- `GET /api/search/stats` - arama indeks istatistikleri
- `GET /api/autocomplete` - arama önerileri
- `GET /api/categories` - kategori listesi/sayıları
- `GET /api/categories/[slug]` - tek kategori detayları
- `GET /api/data/manifest` - veri versiyonu/hash manifesti
- `GET /api/fatwas/[id]` - fetva detayları
- `POST /api/fatwas/[id]/view` - görüntülenme işlemi
- `POST /api/fetva/[id]/like` - beğeni işlemi
- `GET /api/fetva/[id]/comments` - yorumları listele
- `POST /api/fetva/[id]/comments` - yorum ekle
- `POST /api/contact` - iletişim/soru formu

## Veri Akışı

- Ana veri dosyası: `data/consolidated_fetvas.jsonl`
- Build sırasında `scripts/build.mjs`, `scripts/copy-data-file.mjs` çalıştırır
- Bu adım `consolidated_fetvas.jsonl` dosyasını `processed_fetvas.jsonl` ve hashli `processed_fetvas.<version>.jsonl` olarak kopyalar
- `public/data/manifest.json` üretilir ve `/api/data/manifest` üzerinden version/hash metadata sunulur
- Client tarafında sync aktifse (`NEXT_PUBLIC_ENABLE_DATA_SYNC=1`) yeni sürüm çevrimiçi iken IndexedDB'ye çekilir
- Uygulama varsayılan olarak `DATA_FILE` ile verilen dosyayı okur; env verilmezse `consolidated_fetvas.jsonl` kullanılır

## Proje Yapısı

```text
app/         sayfalar + API route'ları
components/  UI bileşenleri
hooks/       özel React hook'ları
lib/         veri servisi, arama indeksi, firebase, yardımcılar
data/        JSONL veri dosyaları
public/      statik dosyalar
scripts/     build ve veri scriptleri
test/        vitest testleri
```

## Build ve Çalıştırma

```bash
npm run build
npm run start
```

Port çakışmasında:

```bash
npx next start -p 3010
```

## Android Gerçek Cihaz Sync Testi

- Android sync ve runtime doğrulama checklisti: `resources/android-runtime-sync-checklist.md`
- `npm run mobile:android:sync` komutu varsayılan olarak remote sync kaynağını `https://fetvabul.netlify.app` olarak ayarlar.
- Farklı bir kaynak için komutu çalıştırmadan önce `NEXT_PUBLIC_SYNC_BASE_URL` env değişkenini override edebilirsiniz.

## Sık Karşılaşılan Sorunlar

### `Server Error: Cannot find module './xxxx.js'`

Bu hata genellikle bozuk/eski `.next` cache çıktısından oluşur.

1. Çalışan dev sunucuyu durdurun
2. `.next` klasörünü temizleyin
3. Yeniden build/dev çalıştırın

```bash
rm -rf .next
npm run build
npm run dev
```

Windows PowerShell:

```bash
Remove-Item -Recurse -Force .next
npm.cmd run build
npm.cmd run dev
```

### `EADDRINUSE` (port kullanımda)

Farklı port kullanın:

```bash
npm run dev -- -p 3999
```

## İletişim

- Email: `support@mtgsoftworks.com`
- YouTube: `https://www.youtube.com/@davetul_islam`
- Web: `https://fetvabul.com`
- GitHub: `https://github.com/mtgsoftworks/FetvaBul`

## Lisans

MIT
