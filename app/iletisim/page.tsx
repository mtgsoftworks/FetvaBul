import type { LucideIcon } from 'lucide-react';
import { Clock, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/about/ContactForm';

export const metadata = {
  title: 'İletişim | FetvaBul',
  description:
    'FetvaBul ekibine sorularınız, iş birlikleri veya geri bildirimleriniz için ulaşın. İletişim bilgilerimize ve formumuza buradan erişin.',
};

type ContactLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

type ContactPoint = {
  icon: LucideIcon;
  title: string;
  description?: string;
  details: string[];
  links?: ContactLink[];
};

const CONTACT_POINTS: ContactPoint[] = [
  {
    icon: Mail,
    title: 'E-posta',
    description: 'Genel sorular ve iş birlikleri',
    details: ['Genel talepleriniz için e-posta kanalını kullanabilirsiniz.'],
    links: [{ label: 'support@mtgsoftworks.com', href: 'mailto:support@mtgsoftworks.com', icon: Mail }],
  },
  {
    icon: Phone,
    title: 'Telefon',
    description: 'İletişim hattı',
    details: ['Mesai saatleri içinde telefonla doğrudan ulaşabilirsiniz.'],
    links: [{ label: '0544 175 71 51', href: 'tel:+905441757151', icon: Phone }],
  },
  {
    icon: MapPin,
    title: 'Adres',
    description: 'Niğde Merkez (NİKEM)',
    details: [
      'NİĞDE İLİM KÜLTÜR EĞİTİM MERKEZİ',
      'Adres: Selçuk, Deniz Sk. Emanet Apt No: 7/1, 51100 Niğde Merkez/Niğde',
      'Telefon: 0544 175 71 51',
    ],
  },
  {
    icon: Clock,
    title: 'Çalışma Saatleri',
    description: 'Telefon hattı çalışma saatleri',
    details: [
      'Pazartesi - Cuma: 09:00–22:00',
      'Cumartesi (Gündüz): 09:00–17:00',
      'Cumartesi (Gece): 22:00–00:00',
      'Pazar: 00:00–17:00',
    ],
  },
  {
    icon: MessageCircle,
    title: 'Topluluk',
    description: 'Güncellemeleri takip etmek için sosyal medya hesaplarımıza katılın.',
    details: ['Sosyal kanallarımızdan güncel paylaşımlarımızı takip edebilirsiniz.'],
    links: [
      {
        label: 'YouTube: @davetul_islam',
        href: 'https://www.youtube.com/@davetul_islam',
        icon: Youtube,
      },
    ],
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <MessageCircle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sorularınızı bekliyoruz
          </h1>
          <p className="mt-3 mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            FetvaBul ekibi olarak görüş, öneri ve iş birliklerinizi dinlemekten memnuniyet duyarız.
            Aşağıdaki iletişim kanallarından bize ulaşabilir veya formu doldurabilirsiniz.
          </p>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/30 bg-background/90 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-foreground">İletişim Bilgileri</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                İhtiyacınıza en uygun kanalı seçin, size en kısa sürede dönüş yapalım.
              </p>

              <div className="mt-8 space-y-6">
                {CONTACT_POINTS.map((point) => (
                  <div key={point.title} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <point.icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">{point.title}</div>
                      {point.description ? (
                        <p className="text-xs text-muted-foreground">{point.description}</p>
                      ) : null}
                      {point.details.length > 0 ? (
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {point.details.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : null}
                      {point.links && point.links.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm">
                          {point.links.map((link) => {
                            const isExternal = /^https?:\/\//i.test(link.href);
                            const LinkIcon = link.icon;
                            return (
                              <li key={`${point.title}-${link.href}`}>
                                <a
                                  href={link.href}
                                  target={isExternal ? '_blank' : undefined}
                                  rel={isExternal ? 'noopener noreferrer' : undefined}
                                  className="inline-flex items-center gap-2 text-primary transition hover:underline"
                                >
                                  {LinkIcon ? <LinkIcon className="h-4 w-4" /> : null}
                                  <span>{link.label}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ContactForm
            className="border border-border/30 bg-background/95 shadow-sm"
            title="İletişim Formu"
            description="Sorununuzu, iş birliği teklifinizi veya görüşlerinizi bizimle paylaşın. İlgili ekip en kısa sürede size dönüş yapacaktır."
            submitLabel="Mesaj Gönder"
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}


