# FetvaBul

FetvaBul, İslami fetvaları aramak, listelemek ve detaylı okumak için geliştirilmiş bir Next.js 13 uygulamasıdır.
Kategori filtreleme, otomatik tamamlama, sıralama ve API tabanlı etkileşim özellikleri içerir.

<p align="center">
  <img src="./public/fetvabul_logo.png" alt="FetvaBul Logo" width="200" />
</p>

## Özellikler

- Hızlı arama (`/arama`) ve gelişmiş filtreleme
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
DATA_FILE=data/consolidated_fetvas.jsonl
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
- `GET /api/fatwas/[id]` - fetva detayları
- `GET /api/fatwas/[id]/view` - görüntülenme işlemi
- `POST /api/fetva/[id]/like` - beğeni işlemi
- `POST /api/contact` - iletişim/soru formu

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

- Email: `mtgsoftworks@gmail.com`
- YouTube: `https://www.youtube.com/@davetul_islam`
- Web: `https://fetvabul.com`
- GitHub: `https://github.com/mtgsoftworks/FetvaBul`

## Lisans

MIT
