import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Kullanım Şartları | FetvaBul",
  description: "FetvaBul platformu için kullanım koşulları ve sorumluluk bildirimi.",
};

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-12 space-y-10">
        <header>
          <p className="text-sm text-muted-foreground">Güncellenme tarihi: 4 Ekim 2025</p>
          <h1 className="mt-3 text-3xl font-semibold">Kullanım Şartları</h1>
          <p className="mt-4 text-muted-foreground">
            Bu sayfa, FetvaBul hizmetini kullanırken geçerli olan koşulları ve tarafların sorumluluklarını
            açıklar. Platformu kullanmaya devam ederek aşağıdaki şartları kabul etmiş sayılırsınız.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Hizmetin Kapsamı</h2>
          <p className="text-muted-foreground">
            FetvaBul, İslami içerik ve fetvaları derleyen bilgi amaçlı bir platformdur. Sitede yer alan
            yanıtlar tavsiye niteliği taşır; nihai karar kullanıcıya aittir. Özel durumlar için
            yetkili uzmanlara ve resmi makamlara danışmanız önerilir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Kullanıcı Yükümlülükleri</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Platformu yürürlükteki yasalara aykırı şekilde kullanmamak</li>
            <li>Hakkında formu veya iletişim kanalları üzerinden gönderilen bilgilerin doğruluğunu sağlamak</li>
            <li>Diğer kullanıcıların haklarını ihlal edecek yorum ve içeriklerden kaçınmak</li>
            <li>Platform güvenliğini tehlikeye atacak girişimlerde bulunmamak</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Fikri Mülkiyet</h2>
          <p className="text-muted-foreground">
            FetvaBul üzerinde yer alan metinler, tasarımlar, logo ve diğer tüm içerikler ilgili hak
            sahiplerine aittir. Yazılı izin olmaksızın kopyalanamaz, dağıtılamaz veya ticari amaçla
            kullanılamaz.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Sorumluluk Reddi</h2>
          <p className="text-muted-foreground">
            Platformda yer alan içerikler düzenli olarak güncellense bile doğruluğu sürekli garanti
            edilemez. FetvaBul, sunulan bilgilerin kullanımından doğabilecek zararlardan sorumlu tutulamaz.
            Kullanıcılar, içerikleri referans alırken kendi değerlendirme ve araştırmalarını yapmakla yükümlüdür.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Değişiklikler</h2>
          <p className="text-muted-foreground">
            FetvaBul, kullanım şartlarında değişiklik yapma hakkını saklı tutar. Güncellemeler bu sayfada
            yayınlandığı tarihten itibaren geçerlidir. Kullanıcılar düzenli olarak sayfayı kontrol etmekle
            sorumludur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">İletişim</h2>
          <p className="text-muted-foreground">
            Kullanım şartlarıyla ilgili sorularınız için bize{' '}
            <a href="mailto:info@fetvabul.com" className="text-islamic-green-600 hover:underline">
              info@fetvabul.com
            </a>{' '}
            adresinden ulaşabilirsiniz.
          </p>
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            Platformu kullanmaya devam ederek bu şartları kabul etmiş sayılırsınız. Güncel sürümü
            dilediğiniz zaman bu sayfadan inceleyebilirsiniz.
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
