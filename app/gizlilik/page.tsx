import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Gizlilik Politikası | FetvaBul',
  description: 'FetvaBul gizlilik politikası ve KVKK kapsamındaki aydınlatma metni.',
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />

      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        <section className="mb-10 pb-10 border-b border-clean-border">
          <h1 className="font-serif font-normal text-main mb-3">Gizlilik Politikası</h1>
          <p className="text-sm text-muted leading-relaxed max-w-lg">
            Bu sayfa, hangi verileri topladığımızı, nasıl sakladığımızı ve yasal haklarınızı nasıl kullanabileceğinizi açıklar.
          </p>
          <p className="mt-4 text-[11px] text-muted uppercase tracking-[1px]">Güncellenme tarihi: 2 Mart 2026</p>
        </section>

        <article className="space-y-10">
          <div className="space-y-3">
            <h2 className="font-serif text-xl text-main">Veri Sorumlusu</h2>
            <p className="text-sm text-muted leading-relaxed">
              KVKK kapsamında veri sorumlusu Niğde Merkez (NİKEM) NİĞDE İLİM KÜLTÜR EĞİTİM MERKEZİ&apos;dir.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Adres: Selçuk, Deniz Sk. Emanet Apt No: 7/1, 51100 Niğde Merkez/Niğde
              <br />
              Telefon: 0544 175 71 51
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Topladığımız Veriler</h2>
            <p className="text-sm text-muted leading-relaxed">
              FetvaBul üzerinde hesap oluşturma veya üyelik zorunluluğu bulunmamaktadır. Buna rağmen ziyaret deneyimini iyileştirmek amacıyla
              sınırlı ölçüde teknik veri (cihaz bilgisi, tarayıcı türü, anonim kullanım istatistikleri) toplanabilir.
              Formlar aracılığıyla ilettiğiniz ad, e-posta veya mesaj içerikleri yalnızca talebinizi değerlendirmek için kullanılır.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Verilerin Kullanım Amaçları</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted leading-relaxed">
              <li>Teknik altyapının çalışmasını sağlamak ve güvenliğini korumak</li>
              <li>Soru veya geribildirimlerinize dönüş yapmak</li>
              <li>Hizmet kalitesini ölçmek ve geliştirmek</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            </ul>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Çerezler</h2>
            <p className="text-sm text-muted leading-relaxed">
              FetvaBul, kullanıcı deneyimini iyileştirmek amacıyla zorunlu ve performans odaklı çerezler kullanabilir.
              Tarayıcı ayarlarınızı değiştirerek çerezleri yönetebilir veya devre dışı bırakabilirsiniz.
              Çerezleri devre dışı bırakmanız durumunda bazı özellikler kısıtlanabilir.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Veri Saklama Süresi</h2>
            <p className="text-sm text-muted leading-relaxed">
              Ziyaretçi verileri, işleme amaçları ortadan kalktığında veya ilgili mevzuatta belirtilen süreler dolduğunda silinir.
              İletişim formları üzerinden gönderdiğiniz içerikler, destek süreci tamamlandıktan sonra makul bir süre içerisinde anonimleştirilir veya imha edilir.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">Haklarınız</h2>
            <p className="text-sm text-muted leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca; işlenen verilerinize erişme, düzeltilmesini veya silinmesini talep etme,
              işlenmesine itiraz etme ve izin verdiğiniz işlemleri geri çekme haklarına sahipsiniz.
              Taleplerinizi aşağıdaki iletişim kanallarından iletebilirsiniz.
            </p>
          </div>

          <div className="space-y-3 pt-10 border-t border-clean-border">
            <h2 className="font-serif text-xl text-main">İletişim</h2>
            <p className="text-sm text-muted leading-relaxed">
              Gizlilik politikamızla ilgili sorularınız için bize{' '}
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
            Bu politika gerektiğinde güncellenebilir.
            Güncel sürümü her zaman bu sayfadan takip edebilirsiniz.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-10 border-t border-clean-border">
            <span className="text-sm text-muted">Sorularınız için her zaman buradayız.</span>
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
