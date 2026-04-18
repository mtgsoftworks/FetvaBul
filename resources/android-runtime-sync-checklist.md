# Android Runtime Data Mode Checklist

Bu checklist, Android cihazda uygulamanin kalici olarak remote runtime sync kapali durumda dogru calistigini dogrulamak icindir.

## 1) Build ve Android sync

1. Asagidaki komutu calistir:

npm run mobile:android:sync

2. Beklenen sonuc:
- Build log icinde su satir gorunmeli: [mobile-android-sync] Runtime remote data sync is disabled.
- Android assets senkronizasyonu hatasiz tamamlanmali.

## 2) Cihaza kurulum

1. Android Studio ac:

npm run mobile:android:open

2. Uygulamayi debug cihazina yukle.
3. Ilk test icin uygulama verisini temizle (Clear Storage).

## 3) Offline ve online davranis testi

1. Ucak modunu ac ve uygulamayi baslat.
2. Arama, kategori ve fetva detay ekranlarini gez.
3. Ucak modunu kapat, uygulamayi tekrar foreground yap.

Beklenen sonuc:
- Uygulama hem offline hem online durumda acilmaya devam etmeli.
- Arama sonuclari paketlenmis/local veri ile tutarli olmali.
- Online oldugunda otomatik remote manifest veya dataset indirme akisi baslamamali.

## 4) Debug dogrulama (Chrome inspect)

1. chrome://inspect uzerinden WebView'e baglan.
2. Network panelde manifest/dataset endpoint cagrilarini kontrol et.

Beklenen sonuc:
- Otomatik remote sync cagrisi gorulmemeli.
- Uygulama davranisi local veri ile stabil kalmali.

## 5) Kabul kriterleri

- Runtime remote data sync kalici olarak kapali.
- Uygulama offline-first sekilde stabil.
- Kritik akislarda (arama, kategori, fetva detay) regression yok.
