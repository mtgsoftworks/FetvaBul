import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Gizlilik Politikası | FetvaBul",
  description: "FetvaBul gizlilik politikası ve KVKK kapsamındaki aydınlatma metni.",
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-12 space-y-10">
        <header>
          <p className="text-sm text-muted-foreground">Güncellenme tarihi: 4 Ekim 2025</p>
          <h1 className="mt-3 text-3xl font-semibold">Gizlilik Politikası</h1>
          <p className="mt-4 text-muted-foreground">
            FetvaBul olarak ziyaretçilerimizin gizliliğini önemsiyoruz. Bu sayfa, kişisel
            verilerinizi hangi amaçlarla işlediğimizi, nasıl sakladığımızı ve haklarınızı
            nasıl kullanabileceğinizi açıklar.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Topladığımız Veriler</h2>
          <p className="text-muted-foreground">
            FetvaBul üzerinde hesap oluşturma veya üyelik zorunluluğu bulunmamaktadır. Buna rağmen
            ziyaret deneyimini iyileştirmek amacıyla sınırlı ölçüde teknik veri (cihaz bilgisi,
            tarayıcı türü, anonim kullanım istatistikleri) toplanabilir. Formlar aracılığıyla ilettiğiniz
            ad, e-posta veya mesaj içerikleri yalnızca talebinizi değerlendirmek için kullanılır.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Verilerin Kullanım Amaçları</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Teknik altyapının çalışmasını sağlamak ve güvenliğini korumak</li>
            <li>Soru veya geribildirimlerinize dönüş yapmak</li>
            <li>Hizmet kalitesini ölçmek ve geliştirmek</li>
            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Çerezler</h2>
          <p className="text-muted-foreground">
            FetvaBul, kullanıcı deneyimini iyileştirmek amacıyla zorunlu ve performans odaklı çerezler
            kullanabilir. Tarayıcı ayarlarınızı değiştirerek çerezleri yönetebilir veya devre dışı
            bırakabilirsiniz. Çerezleri devre dışı bırakmanız durumunda bazı özellikler kısıtlanabilir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Veri Saklama Süresi</h2>
          <p className="text-muted-foreground">
            Ziyaretçi verileri, işleme amaçları ortadan kalktığında veya ilgili mevzuatta belirtilen
            süreler dolduğunda silinir. İletişim formları üzerinden gönderdiğiniz içerikler, destek
            süreci tamamlandıktan sonra makul bir süre içerisinde anonimleştirilir veya imha edilir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Haklarınız</h2>
          <p className="text-muted-foreground">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca; işlenen verilerinize erişme,
            düzeltilmesini veya silinmesini talep etme, işlenmesine itiraz etme ve izin verdiğiniz
            işlemleri geri çekme haklarına sahipsiniz. Taleplerinizi aşağıdaki iletişim kanallarından
            iletebilirsiniz.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">İletişim</h2>
          <p className="text-muted-foreground">
            Gizlilik politikamızla ilgili sorularınız için bize{' '}
            <a href="mailto:info@fetvabul.com" className="text-islamic-green-600 hover:underline">
              info@fetvabul.com
            </a>{' '}
            adresinden ulaşabilirsiniz.
          </p>
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            Bu politika gerektiğinde güncellenebilir. Güncel sürümü her zaman bu sayfadan takip
            edebilirsiniz.
          </p>
          <div className="mt-4 flex">
            <Button
              asChild
              size="lg"
              className="h-14 px-12 text-lg font-semibold bg-black text-white hover:bg-neutral-900 focus-visible:ring-islamic-green-500"
            >
              <Link href="/">Ana sayfaya geri dön</Link>
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}
