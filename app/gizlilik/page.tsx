import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Gizlilik Politikası | FetvaBul",
  description: "FetvaBul gizlilik politikası ve KVKK kapsamındaki aydınlatma metni.",
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="space-y-16 pb-16">
          <section className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent py-16">
            <div className="container mx-auto max-w-4xl px-4">
              <div className="rounded-[30px] border border-primary/20 bg-background/95 p-10 text-center shadow-sm">
                <span className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Gizlilik Politikası
                </span>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Verilerinizi şeffaflıkla koruyoruz
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Bu sayfa, hangi verileri topladığımızı, nasıl sakladığımızı ve yasal haklarınızı nasıl kullanabileceğinizi açıklar.
                </p>
                <p className="mt-6 text-sm text-muted-foreground/80">Güncellenme tarihi: 4 Ekim 2025</p>
              </div>
            </div>
          </section>

          <section className="container mx-auto max-w-4xl px-4">
            <article className="space-y-10 rounded-3xl border border-border/40 bg-background/95 p-10 shadow-sm">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Topladığımız Veriler</h2>
                <p className="text-muted-foreground">
                  FetvaBul üzerinde hesap oluşturma veya üyelik zorunluluğu bulunmamaktadır. Buna rağmen ziyaret deneyimini iyileştirmek amacıyla sınırlı ölçüde teknik veri (cihaz bilgisi, tarayıcı türü, anonim kullanım istatistikleri) toplanabilir. Formlar aracılığıyla ilettiğiniz ad, e-posta veya mesaj içerikleri yalnızca talebinizi değerlendirmek için kullanılır.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Verilerin Kullanım Amaçları</h2>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Teknik altyapının çalışmasını sağlamak ve güvenliğini korumak</li>
                  <li>Soru veya geribildirimlerinize dönüş yapmak</li>
                  <li>Hizmet kalitesini ölçmek ve geliştirmek</li>
                  <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Çerezler</h2>
                <p className="text-muted-foreground">
                  FetvaBul, kullanıcı deneyimini iyileştirmek amacıyla zorunlu ve performans odaklı çerezler kullanabilir. Tarayıcı ayarlarınızı değiştirerek çerezleri yönetebilir veya devre dışı bırakabilirsiniz. Çerezleri devre dışı bırakmanız durumunda bazı özellikler kısıtlanabilir.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Veri Saklama Süresi</h2>
                <p className="text-muted-foreground">
                  Ziyaretçi verileri, işleme amaçları ortadan kalktığında veya ilgili mevzuatta belirtilen süreler dolduğunda silinir. İletişim formları üzerinden gönderdiğiniz içerikler, destek süreci tamamlandıktan sonra makul bir süre içerisinde anonimleştirilir veya imha edilir.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Haklarınız</h2>
                <p className="text-muted-foreground">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca; işlenen verilerinize erişme, düzeltilmesini veya silinmesini talep etme, işlenmesine itiraz etme ve izin verdiğiniz işlemleri geri çekme haklarına sahipsiniz. Taleplerinizi aşağıdaki iletişim kanallarından iletebilirsiniz.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">İletişim</h2>
                <p className="text-muted-foreground">
                  Gizlilik politikamızla ilgili sorularınız için bize{' '}
                  <a href="mailto:info@fetvabul.com" className="text-primary transition hover:underline">
                    info@fetvabul.com
                  </a>{' '}
                  adresinden ulaşabilirsiniz.
                </p>
              </div>

              <div className="rounded-2xl bg-primary/10 p-6 text-sm text-muted-foreground">
                <p>
                  Bu politika gerektiğinde güncellenebilir. Güncel sürümü her zaman bu sayfadan takip edebilirsiniz.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground/80">Sorularınız için her zaman buradayız.</span>
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
