import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Kullanım Şartları | FetvaBul',
  description: 'FetvaBul platformu için kullanım koşulları ve sorumluluk bildirimi.',
};

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />

      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        <section className="mb-10 pb-10 border-b border-clean-border">
          <h1 className="font-serif font-normal text-main mb-3">Kullanım Şartları</h1>
          <p className="text-sm text-muted leading-relaxed max-w-lg">
            Bu sayfa, FetvaBul hizmetini kullanırken geçerli olan koşulları ve tarafların sorumluluklarını açıklar.
            Platformu kullanmaya devam ederek aşağıdaki şartları kabul etmiş sayılırsınız.
          </p>
          <p className="mt-4 text-[11px] text-muted uppercase tracking-[1px]">Güncellenme tarihi: 2 Mart 2026</p>
        </section>

        <article className="space-y-10">
          <div className="space-y-3">
            <h2 className="font-serif text-xl text-main">Hizmet Sağlayıcı</h2>
            <p className="text-sm text-muted leading-relaxed">
              Bu platform, Niğde Merkez (NİKEM) NİĞDE İLİM KÜLTÜR EĞİTİM MERKEZİ tarafından yönetilmektedir.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Adres: Selçuk, Deniz Sk. Emanet Apt No: 7/1, 51100 Niğde Merkez/Niğde
              <br />
              Telefon: 0544 175 71 51
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Hizmetin Kapsamı</h2>
            <p className="text-sm text-muted leading-relaxed">
              FetvaBul, İslami içerik ve fetvaları derleyen bilgi amaçlı bir platformdur. Sitede yer alan yanıtlar tavsiye niteliği taşır;
              nihai karar kullanıcıya aittir. Özel durumlar için yetkili uzmanlara ve resmi makamlara danışmanız önerilir.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Kullanıcı Yükümlülükleri</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted leading-relaxed">
              <li>Platformu yürürlükteki yasalara aykırı şekilde kullanmamak</li>
              <li>Hakkında formu veya iletişim kanalları üzerinden gönderilen bilgilerin doğruluğunu sağlamak</li>
              <li>Diğer kullanıcıların haklarını ihlal edecek yorum ve içeriklerden kaçınmak</li>
              <li>Platform güvenliğini tehlikeye atacak girişimlerde bulunmamak</li>
            </ul>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Fikri Mülkiyet</h2>
            <p className="text-sm text-muted leading-relaxed">
              FetvaBul üzerinde yer alan metinler, tasarımlar, logo ve diğer tüm içerikler ilgili hak sahiplerine aittir.
              Yazılı izin olmaksızın kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Sorumluluk Reddi</h2>
            <p className="text-sm text-muted leading-relaxed">
              Platformda yer alan içerikler düzenli olarak güncellense bile doğruluğu sürekli garanti edilemez.
              FetvaBul, sunulan bilgilerin kullanımından doğabilecek zararlardan sorumlu tutulamaz.
              Kullanıcılar, içerikleri referans alırken kendi değerlendirme ve araştırmalarını yapmakla yükümlüdür.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Değişiklikler</h2>
            <p className="text-sm text-muted leading-relaxed">
              FetvaBul, kullanım şartlarında değişiklik yapma hakkını saklı tutar. Güncellemeler bu sayfada yayınlandığı tarihten itibaren geçerlidir.
              Kullanıcılar düzenli olarak sayfayı kontrol etmekle sorumludur.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">İletişim</h2>
            <p className="text-sm text-muted leading-relaxed">
              Kullanım şartlarıyla ilgili sorularınız için bize{' '}
              <a href="mailto:support@mtgsoftworks.com" className="text-accent transition hover:underline">
                support@mtgsoftworks.com
              </a>{' '}
              adresinden ulaşabilirsiniz.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Telefon: 0544 175 71 51
              <br />
              Adres: Selçuk, Deniz Sk. Emanet Apt No: 7/1, 51100 Niğde Merkez/Niğde
            </p>
          </div>

          <div className="border-l-2 border-accent/30 pl-5 py-3 text-sm text-muted italic">
            Platformu kullanmaya devam ederek bu şartları kabul etmiş sayılırsınız.
            Güncel sürümü dilediğiniz zaman bu sayfadan inceleyebilirsiniz.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-10 border-t border-clean-border">
            <span className="text-sm text-muted">Herhangi bir sorunuz için ekip hazır.</span>
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-accent text-white px-6 py-3 text-[13px] font-medium uppercase tracking-[1.5px] hover:bg-accent-hover transition-colors"
            >
              Ana sayfaya geri dön
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
