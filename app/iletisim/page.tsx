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
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />
      <main className="max-w-editorial mx-auto w-full px-8 pt-[140px] pb-16">
        {/* Header */}
        <section className="mb-12">
          <h1 className="font-serif font-normal text-main mb-3">İletişim</h1>
          <p className="text-sm text-muted leading-relaxed max-w-lg">
            FetvaBul ekibi olarak görüş, öneri ve iş birliklerinizi dinlemekten memnuniyet duyarız.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {CONTACT_POINTS.map((point) => (
              <div key={point.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0">
                  <point.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-main mb-1">{point.title}</h3>
                  {point.description ? (
                    <p className="text-xs text-muted mb-2">{point.description}</p>
                  ) : null}
                  {point.details.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted">
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
                              className="inline-flex items-center gap-2 text-accent hover:underline transition"
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

          {/* Contact Form */}
          <ContactForm
            className="bg-card rounded-[20px] border border-clean-border shadow-none"
            title="İletişim Formu"
            description="Sorununuzu, iş birliği teklifinizi veya görüşlerinizi bizimle paylaşın."
            submitLabel="Mesaj Gönder"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
