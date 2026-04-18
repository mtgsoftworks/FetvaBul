# Android Runtime Sync Checklist

Bu checklist, Android cihazda gercek senaryo ile offline paket + online veri guncelleme akisinin dogru calistigini test etmek icindir.

## 1) Build ve Android sync

1. Asagidaki komutu calistir:

npm run mobile:android:sync

2. Beklenen sonuc:
- Build log icinde su satir gorunmeli: [mobile-android-sync] Using remote sync base URL: https://fetvabul.netlify.app
- Android assets senkronizasyonu hatasiz tamamlanmali.

## 2) Manifest ve data endpoint kontrolu (yayindaki site)

Tarayicidan su adresleri acilmali:
- https://fetvabul.netlify.app/data/manifest.json
- https://fetvabul.netlify.app/data/processed_fetvas.jsonl

Opsiyonel (server route aktif deploy ise):
- https://fetvabul.netlify.app/api/data/manifest

Beklenen sonuc:
- manifest.json icinde version, sha256, relativePath, recordCount alanlari dolu olmali.
- data dosyasi bos donmemeli.

## 3) Cihaza kurulum

1. Android Studio ac:

npm run mobile:android:open

2. Uygulamayi debug cihazina yukle.
3. Ilk test icin uygulama verisini temizle (Clear Storage).

## 4) Baslangic offline testi

1. Cihazda ucak modunu ac.
2. Uygulamayi ac.
3. Arama ve kategori ekranlarini gez.

Beklenen sonuc:
- Uygulama acilmaya devam etmeli.
- Arama sonuclari local paket verisinden gelmeli.
- Kritik sayfalar beyaz ekranda kalmamali.

## 5) Online sync testi (ilk sync)

1. Ucak modunu kapat, interneti ac.
2. Uygulamayi foreground yap (yeniden ac veya ekrana geri don).
3. 10-30 saniye bekle.

Beklenen sonuc:
- Sync hatasiz tamamlanirsa IndexedDB icine yeni dataset yazilir.
- Sonraki aramalarda synced dataset kullanilir.

## 6) Gercek guncelleme testi

1. Sunucuda (https://fetvabul.netlify.app) veri guncellenmis bir deploy yayinla.
2. Cihazda uygulamayi tekrar foreground yap.
3. Eger throttling suresi dolmadiysa bekle veya uygulamayi bir sure sonra tekrar ac.

Beklenen sonuc:
- Yeni version algilanir ve dataset tekrar indirilir.
- Arama sonuclari yeni veriyle uyumlu degisir.

## 7) Debug dogrulama (Chrome inspect)

1. chrome://inspect uzerinden WebView'e baglan.
2. Asagidaki depolari kontrol et:
- localStorage key: fetvabul-data-sync-meta
- localStorage key: fetvabul-data-sync-last-check
- IndexedDB: fetvabul-data-sync
- Object store: datasets
- Record key: fatwas-jsonl

Beklenen sonuc:
- Meta version ile manifest version eslesmeli.
- IndexedDB kaydinda content bos olmamali.

## 8) Hata senaryolari

1. Interneti kes, uygulamayi tekrar kullan.
2. Beklenen sonuc: Son synced veri ile uygulama calismaya devam eder.

3. Manifest URL gecici erisilemez olursa:
- Sync denemesi pas gecilir.
- Uygulama mevcut local/synced dataset ile devam eder.

## 9) Kabul kriterleri

- Uygulama ilk acilista offline calisiyor.
- Online oldugunda remote manifest kontrolu yapiliyor.
- Yeni version varsa dataset indiriliyor ve saklaniyor.
- Uygulama tekrar offline olsa bile son synced veri kullanilabiliyor.
- Kritik akislarda (arama, kategori, fetva detay) regression yok.
