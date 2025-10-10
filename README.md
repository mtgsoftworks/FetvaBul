# FetvaBul

FetvaBul, İslami sorulara hızlı ve güvenilir cevaplar sunan modern bir arama platformudur. Güncellenen arayüz sayesinde kullanıcılar, binlerce fetvayı kategori bazlı filtreleyebilir, gelişmiş sıralama seçenekleri kullanabilir ve alakalı içeriklere minimal bir deneyimle erişebilir.

<p align="center">
  <img src="./public/fetvabul_logo.png" alt="FetvaBul Logo" width="200" />
</p>

## İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Başlangıç](#başlangıç)
- [Çalışma Zamanı Komutları](#çalışma-zamanı-komutları)
- [Dizin Yapısı](#dizin-yapısı)
- [Arayüz ve Tasarım Notları](#arayüz-ve-tasarım-notları)
- [Veri ve API](#veri-ve-api)
- [Dağıtım](#dağıtım)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans ve İletişim](#lisans-ve-iletişim)

## Özellikler

- **[Arama Deneyimi]** `app/arama/page.tsx` yeni filtre paneli, kategori butonları, sıralama seçenekleri ve istatistik kartları sunar.
- **[Kategori Odaklı İçerik]** `app/kategori/[slug]/page.tsx` modern hero, kartlar ve hızlı sıralama bileşenleriyle yenilendi.
- **[Hukuki Sayfalar]** `app/gizlilik/page.tsx` ve `app/kullanim-sartlari/page.tsx` gradient hero + kart düzeniyle tema uyumlu hale getirildi.
- **[Performans]** `lib/data-service.ts` içinde global önbellek, Firestore isteklerini azaltır ve arama sonuçlarını hızlandırır.
- **[Mobil Uyumluluk]** Tailwind breakpoints (sm/md/lg) ile tüm sayfalar mobil, tablet ve masaüstü için optimize.
- **[UI Bileşenleri]** `components/` dizinindeki `Header`, `Footer`, `Button`, `Sheet` gibi bileşenler aynı görsel dili taşır.

## Teknolojiler

- **Framework**: Next.js 13 (App Router)
- **Dil**: TypeScript
- **Stil**: Tailwind CSS, Radix tabanlı bileşenler
- **Veri**: JSONL veri setleri (`data/`) + Firebase Firestore
- **Arama**: Özel `SearchIndex` implementasyonu (`lib/search-index.ts`)
- **Test**: Vitest (`vitest.config.ts`)

## Başlangıç

### Gereksinimler

- Node.js >= 18.x
- npm veya yarn
- Firebase projesi (Firestore erişimi)

### Kurulum

```bash
git clone https://github.com/mtgsoftworks/FetvaBul.git
cd FetvaBul
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

### Ortam Değişkenleri

`.env.local` dosyasında aşağıdaki anahtarları tanımlayın:

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
DATA_FILE=data/consolidated_fetvas.jsonl
```

## Çalışma Zamanı Komutları

```bash
npm run dev        # Geliştirme sunucusu
npm run build      # Üretim derlemesi
npm run start      # Üretim sunucusunu çalıştır
npm run lint       # ESLint denetimi
npm run test       # Vitest testleri (tanımlandıysa)
```

## Dizin Yapısı

```
app/                # Sayfalar, API rotaları, layout bileşenleri
├── arama/          # Arama sayfası ve filtre paneli
├── kategori/       # Dinamik kategori sayfaları
├── gizlilik/       # Gizlilik politikası
├── kullanim-sartlari/ # Kullanım şartları sayfası
├── soru-sor/       # Soru gönderme formu
├── api/            # Arama, autocomplete, contact vb. API uçları
components/         # Layout, kart, form ve UI bileşenleri
hooks/              # `use-search`, `use-toast` gibi custom hook'lar
lib/                # DataService, search index, firebase, i18n
data/               # JSONL veri dosyaları
public/             # Statik varlıklar
scripts/            # Veri migrasyon ve konsolidasyon betikleri
```

## Arayüz ve Tasarım Notları

- **[Filtre Paneli]** `FiltersPanel` kategorileri kart formatında sunar; aktif seçim, primary (#27C26B) renk ile vurgulanır.
- **[Hero Bölümleri]** Hukuki sayfalar gradient hero ve kart gövdeleriyle yeni görsel dile uyum sağlar.
- **[Kart Tasarımı]** Arama sonuçları ve istatistik kutuları `rounded-3xl`, `border-border/40`, `shadow-sm` gibi ortak sınıflar kullanır.
- **[Mobil Deneyim]** Gridler mobilde tek sütuna düşer; filtreler mobilde `Sheet` bileşeniyle açılır.

## Veri ve API

- **`GET /api/search`**: query, category, sortBy, page, limit parametreleri ile arama.
- **`GET /api/autocomplete`**: otomatik tamamlama önerileri.
- **`GET /api/categories`**: kategoriler ve sayıları.
- **`POST /api/contact`**: iletişim & soru formlarını Firestore’a kaydeder.

`lib/data-service.ts`, JSONL verisini yükler, arama indeksini hazırlar, Firestore görüntülenme sayılarını önbelleğe alır ve tüm arama fonksiyonlarını yönetir.
## Dağıtım

### Vercel

1. Depoyu Vercel’e bağlayın.
2. Environment variable’ları Vercel panelinde tanımlayın (`FIREBASE_*`, `DATA_FILE`).
3. Deploy sırasında `npm run build` otomatik çalışır.

### Self-Hosted

```bash
npm run build
npm run start  # Varsayılan port 3000
```

## Katkıda Bulunma

- Fork oluşturun ve yeni bir branch açın (`feat/...`, `fix/...`).
- Kod stiline uyun ve `npm run lint` komutunu çalıştırın.
- PR açmadan önce `npm run build` ile derlemeyi doğrulayın.
- Açıklayıcı commit mesajları kullanın.

## Lisans ve İletişim

- **Lisans**: MIT
- **E-posta**: info@fetvabul.com
- **Web**: https://fetvabul.com
- **GitHub**: https://github.com/mtgsoftworks/FetvaBul