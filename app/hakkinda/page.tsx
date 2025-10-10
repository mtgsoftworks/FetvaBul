import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Hakkımızda | FetvaBul',
  description:
    'FetvaBul platformunun misyonu, vizyonu, değerleri ve ekibi hakkında bilgi edinin. İslami sorularınıza güvenilir cevaplar sunuyoruz.',
};

const STATS: { value: string; label: string }[] = [
  { value: '12.000+', label: 'Fetva Kaydı' },
  { value: '11', label: 'Ana Kategori' },
  { value: '237K+', label: 'Anahtar Kelime Dizini' },
  { value: '%100', label: 'Mobil Uyumluluk' },
];

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <svg
              className="h-8 w-8"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 10h24a2 2 0 0 1 2 2v28l-14-8-14 8V12a2 2 0 0 1 2-2Z"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M12 10h24a2 2 0 0 1 2 2v26.667L24 32l-14 6.667V12a2 2 0 0 1 2-2Zm0-2a4 4 0 0 0-4 4v28a2 2 0 0 0 2.92 1.79L24 35.382l13.08 6.408A2 2 0 0 0 40 40V12a4 4 0 0 0-4-4H12Z"
                fill="currentColor"
              />
              <path
                d="M17 17h14v2H17v-2Zm0 6h14v2H17v-2Zm0 6h10v2H17v-2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">FetvaBul Hakkında</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            FetvaBul, güvenilir İslami bilgiye kolay erişim sağlamak için oluşturulmuş dijital bir rehber.
            Teknoloji ve ilmi bir araya getirerek binlerce fetvayı tek platformda buluşturuyoruz.
          </p>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-border/30 bg-background/80 p-6 text-center shadow-sm backdrop-blur"
            >
              <div className="text-2xl font-semibold text-primary">{stat.value}</div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Misyonumuz & Vizyonumuz</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Kullanıcılarımızın aradıkları fetvaya hızlı, güvenilir ve anlaşılır biçimde ulaşabilmeleri için çalışıyoruz.
              Arama teknolojilerimizi sürekli geliştirerek bilgiye erişim bariyerlerini ortadan kaldırıyoruz.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Hedefimiz, dünyanın her yerindeki Müslümanların sorularına kaynak odaklı çözümler bulabilecekleri bir platform sunmak.
              Bilgiye erişimi demokratikleştirirken, güvenilirliği ve ilmî titizliği koruyoruz.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-primary/20 bg-primary/10 p-10 text-center text-primary">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-background text-primary">
              <svg
                className="h-10 w-10"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="24" cy="24" r="16" fill="currentColor" opacity="0.1" />
                <path
                  d="M24 14c.552 0 1 .448 1 1v4.382l3.535-3.536a1 1 0 1 1 1.414 1.415L26.414 20H30a1 1 0 1 1 0 2h-4a2 2 0 0 1-2-2v-6a1 1 0 0 1 1-1Zm-5.657 6.757a1 1 0 0 1 1.414 0L24 24.001l4.243-4.244a1 1 0 0 1 1.414 1.415L25.414 25.414l2.829 2.829a1 1 0 0 1-1.414 1.414L24 26.828l-2.829 2.829a1 1 0 1 1-1.414-1.414l2.829-2.829-4.243-4.243a1 1 0 0 1 0-1.414Z"
                  fill="currentColor"
                />
                <path
                  d="M15 32a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H16a1 1 0 0 1-1-1Z"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-primary/80">
              İman, ilim ve teknolojiyi aynı çizgide buluşturarak bilgiye erişimi kolaylaştırıyoruz.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Uzman Ekibimiz</h2>
            <p className="mt-3 mx-auto max-w-2xl text-sm text-muted-foreground">
              İlmî titizliği ve kullanıcı odaklı yaklaşımı benimseyen kadromuz, sorularınızı titizlikle değerlendiriyor.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.name} className="rounded-3xl border border-border/30 bg-background/90 p-6 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                  {member.name.slice(0, 1)}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm font-medium text-primary/80">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Yolculuğumuz</h2>
            <p className="mt-3 text-sm text-muted-foreground">FetvaBul’un gelişim sürecine kısa bir bakış.</p>
          </div>
          <div className="mt-12 space-y-10">
            {JOURNEY.map((item) => (
              <div key={item.year} className="relative rounded-3xl border border-border/30 bg-background/90 p-6 shadow-sm">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">{item.year}</span>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
