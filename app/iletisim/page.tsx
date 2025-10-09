import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/about/ContactForm';

export const metadata = {
  title: 'İletişim | FetvaBul',
  description:
    'FetvaBul ekibine sorularınız, iş birlikleri veya geri bildirimleriniz için ulaşın. İletişim bilgilerimize ve formumuza buradan erişin.',
};

const CONTACT_POINTS = [
  {
    icon: Mail,
    title: 'E-posta',
    description: 'Genel sorular ve iş birlikleri',
    details: ['destek@fetvabul.com', 'info@fetvabul.com'],
  },
  {
    icon: Phone,
    title: 'Telefon',
    description: 'Hafta içi 09:00-18:00 arası ulaşabilirsiniz',
    details: ['+90 212 555 0123'],
  },
  {
    icon: MapPin,
    title: 'Adres',
    description: 'Merkez ofisimiz',
    details: ['Fatih, İstanbul', 'Detaylı adres için randevu iletniz'],
  },
  {
    icon: Clock,
    title: 'Yanıt Süresi',
    description: 'E-posta taleplerini 24 saat içinde yanıtlamaya çalışıyoruz.',
    details: [],
  },
  {
    icon: MessageCircle,
    title: 'Topluluk',
    description: 'Güncellemeleri takip etmek için sosyal medya hesaplarımıza katılın.',
    details: ['twitter.com/fetvabul', 'instagram.com/fetvabul'],
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <section className="text-center">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Bize Ulaşın
          </span>
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
