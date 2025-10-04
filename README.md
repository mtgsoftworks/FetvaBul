# FetvaBul

FetvaBul, İslami sorulara güvenilir cevaplar sunan modern bir arama uygulamasıdır. 11 kategori altında derlenmiş yüzlerce fetvaya hızlıca erişebilir, ilgili soruları keşfedebilirsiniz.

## Kurulum

```bash
git clone https://github.com/mtgsoftworks/FetvaBul.git
cd FetvaBul
npm install
npm run dev
```

## Teknolojiler

- Next.js 13 App Router
- TypeScript & React
- Tailwind CSS + Radix UI
- Firebase Firestore
- Netlify / Vercel dağıtım desteği

## Dizin Yapısı

```
app/           # Sayfalar, API rotaları, layout
components/    # Kartlar, layout ve UI bileşenleri
hooks/         # Özel React hook'ları (arama, toast)
lib/           # Veri servisi, arama indexi, yardımcı fonksiyonlar
data/          # JSONL veri dosyaları
public/        # Statik varlıklar
```

## API Uçları

- `GET /api/fatwas/[id]`
- `POST /api/fetva/[id]/like`
- `GET | POST /api/fetva/[id]/comments`
- `GET /api/categories`

## Faydalı Komutlar

```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Üretim derlemesi
npm run lint     # ESLint kontrolü
npm test         # Testler (Vitest yapılandırması varsa)
```

## İletişim

- **E-posta:** info@fetvabul.com
- **Web:** https://fetvabul.com
- **GitHub:** https://github.com/mtgsoftworks/FetvaBul