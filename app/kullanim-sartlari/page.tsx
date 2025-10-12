import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Kullanım Şartları | FetvaBul",
  description: "FetvaBul platformu için kullanım koşulları ve sorumluluk bildirimi.",
};

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="space-y-16 pb-16">
          <section className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent py-16">
            <div className="container mx-auto max-w-4xl px-4">
              <div className="rounded-[30px] border border-primary/20 bg-background/95 p-10 text-center shadow-sm">
                <span className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Kullanım Şartları
                </span>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Platformu güvenle kullanmanız için
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Bu sayfa, FetvaBul hizmetini kullanırken geçerli olan koşulları ve tarafların sorumluluklarını açıklar.
                  Platformu kullanmaya devam ederek aşağıdaki şartları kabul etmiş sayılırsınız.
                </p>
                <p className="mt-6 text-sm text-muted-foreground/80">Güncellenme tarihi: 4 Ekim 2025</p>
              </div>
            </div>
          </section>

          <section className="container mx-auto max-w-4xl px-4">
            <article className="space-y-10 rounded-3xl border border-border/40 bg-background/95 p-10 shadow-sm">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Hizmetin Kapsamı</h2>
                <p className="text-muted-foreground">
                  FetvaBul, İslami içerik ve fetvaları derleyen bilgi amaçlı bir platformdur. Sitede yer alan yanıtlar tavsiye niteliği taşır; nihai karar kullanıcıya aittir. Özel durumlar için yetkili uzmanlara ve resmi makamlara danışmanız önerilir.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Kullanıcı Yükümlülükleri</h2>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Platformu yürürlükteki yasalara aykırı şekilde kullanmamak</li>
                  <li>Hakkında formu veya iletişim kanalları üzerinden gönderilen bilgilerin doğruluğunu sağlamak</li>
                  <li>Diğer kullanıcıların haklarını ihlal edecek yorum ve içeriklerden kaçınmak</li>
                  <li>Platform güvenliğini tehlikeye atacak girişimlerde bulunmamak</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Fikri Mülkiyet</h2>
                <p className="text-muted-foreground">
                  FetvaBul üzerinde yer alan metinler, tasarımlar, logo ve diğer tüm içerikler ilgili hak sahiplerine aittir. Yazılı izin olmaksızın kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Sorumluluk Reddi</h2>
                <p className="text-muted-foreground">
                  Platformda yer alan içerikler düzenli olarak güncellense bile doğruluğu sürekli garanti edilemez. FetvaBul, sunulan bilgilerin kullanımından doğabilecek zararlardan sorumlu tutulamaz. Kullanıcılar, içerikleri referans alırken kendi değerlendirme ve araştırmalarını yapmakla yükümlüdür.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Değişiklikler</h2>
                <p className="text-muted-foreground">
                  FetvaBul, kullanım şartlarında değişiklik yapma hakkını saklı tutar. Güncellemeler bu sayfada yayınlandığı tarihten itibaren geçerlidir. Kullanıcılar düzenli olarak sayfayı kontrol etmekle sorumludur.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">İletişim</h2>
                <p className="text-muted-foreground">
                  Kullanım şartlarıyla ilgili sorularınız için bize{' '}
                  <a href="mailto:info@fetvabul.com" className="text-primary transition hover:underline">
                    info@fetvabul.com
                  </a>{' '}
                  adresinden ulaşabilirsiniz.
                </p>
              </div>

              <div className="rounded-2xl bg-primary/10 p-6 text-sm text-muted-foreground">
                <p>
                  Platformu kullanmaya devam ederek bu şartları kabul etmiş sayılırsınız. Güncel sürümü dilediğiniz zaman bu sayfadan inceleyebilirsiniz.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground/80">Herhangi bir sorunuz için ekip hazır.</span>
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  <Link href="/">Ana sayfaya geri dön</Link>
                </Button>
              </div>
            </article>
          </section>
        </main>

        <Footer />
      </div>
  );
}
