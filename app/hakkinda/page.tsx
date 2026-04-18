import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataService } from '@/lib/data-service';

export const revalidate = 300;

export const metadata = {
  title: 'Hakkımızda | FetvaBul',
  description:
    'FetvaBul platformunun misyonu, vizyonu, değerleri ve ekibi hakkında bilgi edinin. İslami sorularınıza güvenilir cevaplar sunuyoruz.',
};

const compactFormatter = new Intl.NumberFormat('tr-TR', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

function formatNumber(value: number): string {
  return compactFormatter.format(Math.max(0, value));
}

async function getAboutStats() {
  const dataService = DataService.getInstance();
  await dataService.initialize();

  const [stats, searchStats] = await Promise.all([
    dataService.getStats(),
    dataService.getSearchStats(),
  ]);

  return [
    { value: formatNumber(stats.totalFatwas), label: 'Fetva Kaydı' },
    { value: stats.totalCategories.toLocaleString('tr-TR'), label: 'Ana Kategori' },
    { value: formatNumber(searchStats.totalKeywords), label: 'Anahtar Kelime' },
    { value: '%100', label: 'Mobil Uyumluluk' },
  ] as const;
}

const TEAM: { name: string; role: string; bio: string }[] = [
  {
    name: 'Necati Koçkeseni',
    role: 'Fıkıh Uzmanı',
    bio: 'Fetvaların fıkhi değerlendirmesini yürütür, cevapların kaynaklarla tutarlı olmasını sağlar.',
  },
  {
    name: 'Mesut Taha Güven',
    role: 'Teknoloji Direktörü',
    bio: 'Arama altyapısı ve veri yönetiminden sorumlu, kullanıcı deneyimini sürekli geliştirir.',
  },
  {
    name: 'Abdullah Güven',
    role: 'İçerik Editörü',
    bio: 'Cevapların dilini sadeleştirir, metinleri yayımlanmadan önce son kontrole tabi tutar.',
  },
];

const JOURNEY: { year: string; title: string; description: string }[] = [
  {
    year: '2018',
    title: 'FetvaBul hayata geçti',
    description: 'İslami rehberliğe hızlı erişim sağlama vizyonuyla yola çıktık.',
  },
  {
    year: '2020',
    title: 'Arşiv büyüdü',
    description: 'Farklı konularda binlerce fetvayı kapsayan kapsamlı bir arşiv oluşturduk.',
  },
  {
    year: '2022',
    title: 'Mobil deneyim',
    description: 'Her cihazda hızlı ve erişilebilir bir arayüz sunmak için mobil uyumluluğu güçlendirdik.',
  },
];

export default async function AboutPage() {
  const stats = await getAboutStats();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />
      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        {/* Hero */}
        <section className="mb-16">
          <h1 className="font-serif font-normal text-main mb-4">Hakkımızda</h1>
          <p className="text-base text-muted leading-relaxed max-w-lg">
            FetvaBul, güvenilir İslami bilgiye kolay erişim sağlamak için oluşturulmuş dijital bir rehber.
            Teknoloji ve ilmi bir araya getirerek binlerce fetvayı tek platformda buluşturuyoruz.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16 pb-16 border-b border-clean-border">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-2xl text-accent mb-1">{stat.value}</div>
              <p className="text-[11px] text-muted uppercase tracking-[1px] font-medium">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Mission */}
        <section className="mb-16 pb-16 border-b border-clean-border">
          <h2 className="font-serif font-normal text-main mb-6">Misyonumuz ve Vizyonumuz</h2>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-sm text-muted leading-relaxed">
                Kullanıcılarımızın aradıkları fetvaya hızlı, güvenilir ve anlaşılır biçimde ulaşabilmeleri için çalışıyoruz.
                Arama teknolojilerimizi sürekli geliştirerek bilgiye erişim bariyerlerini ortadan kaldırıyoruz.
              </p>
              <p className="text-sm text-muted leading-relaxed">
                Hedefimiz, dünyanın her yerindeki Müslümanların sorularına kaynak odaklı çözümler bulabilecekleri bir platform sunmak.
                Bilgiye erişimi demokratikleştirirken, güvenilirliği ve ilmî titizliği koruyoruz.
              </p>
            </div>
            <div className="border-l-2 border-accent/30 pl-6 flex items-center">
              <p className="text-base text-accent/80 italic font-serif leading-relaxed">
                İman, ilim ve teknolojiyi aynı çizgide buluşturarak bilgiye erişimi kolaylaştırıyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16 pb-16 border-b border-clean-border">
          <h2 className="font-serif font-normal text-main mb-3">Uzman Ekibimiz</h2>
          <p className="text-sm text-muted mb-10">
            İlmî titizliği ve kullanıcı odaklı yaklaşımı benimseyen kadromuz.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-card rounded-[20px] border border-clean-border p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent text-lg font-serif font-bold mb-4">
                  {member.name.slice(0, 1)}
                </div>
                <h3 className="font-serif text-lg text-main mb-1">{member.name}</h3>
                <p className="text-[11px] text-accent uppercase tracking-[1px] font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Journey */}
        <section>
          <h2 className="font-serif font-normal text-main mb-3">Yolculuğumuz</h2>
          <p className="text-sm text-muted mb-10">FetvaBul&apos;un gelişim sürecine kısa bir bakış.</p>
          <div className="space-y-0">
            {JOURNEY.map((item) => (
              <div key={item.year} className="flex gap-6 py-6 border-b border-clean-border last:border-b-0">
                <span className="font-serif text-xl text-accent shrink-0 w-16">{item.year}</span>
                <div>
                  <h3 className="font-serif text-lg text-main mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
