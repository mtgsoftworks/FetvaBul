'use client';

import { BookOpen, Users, Target, Heart, Mail, Phone, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function HakkindaPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState<string>('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name')?.toString() ?? '',
      email: formData.get('email')?.toString() ?? '',
      subject: formData.get('subject')?.toString() ?? '',
      message: formData.get('message')?.toString() ?? '',
    };

    if (!payload.email || !/.+@.+\..+/.test(payload.email)) {
      setSubmitState('error');
      setFormMessage('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!payload.message || payload.message.trim().length < 10) {
      setSubmitState('error');
      setFormMessage('Mesaj en az 10 karakter olmalıdır.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitState('idle');
      setFormMessage('');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Mesaj gönderilemedi.');
      }

      form.reset();
      setSubmitState('success');
      setFormMessage('Mesajınız başarıyla iletildi. En kısa sürede dönüş yapacağız.');
    } catch (error: any) {
      setSubmitState('error');
      setFormMessage(error?.message ?? 'Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const team = [
    {
      name: 'Necati Koçkeseni',
      role: 'Fıkıh Uzmanı',
      description: 'İslami metinlerin fıkhi değerlendirmesi ve danışmanlık',
      image: ''
    },
    {
      name: 'Mesut Taha Güven',
      role: 'Teknoloji Direktörü',
      description: 'Yazılım geliştirme ve veri yönetimi uzmanı',
      image: ''
    },
    {
      name: 'Abdullah Güven',
      role: 'İçerik Editörü',
      description: 'İslami metinlerin düzenlenmesi ve kontrolü',
      image: ''
    }
  ];

  const values = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Güvenilir Bilgi',
      description: 'Tüm fetvalarımız güvenilir İslami kaynaklardan derlenmiş ve uzmanlar tarafından doğrulanmıştır.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Topluma Hizmet',
      description: 'Müslüman toplumun İslami sorularına kolay erişim sağlayarak dini bilgiyi yaygınlaştırıyoruz.'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Doğruluk',
      description: 'İslami hükümleri olduğu gibi aktarmak ve yanlış bilgilendirmeyi önlemek önceliğimizdir.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Samimi Hizmet',
      description: 'Her kullanıcımıza samimi bir şekilde hizmet etmek ve ihtiyaçlarını karşılamak amacımızdır.'
    }
  ];

  const stats = [
    { number: '497', label: 'Fetva Kaydı' },
    { number: '11', label: 'Kategori' },
    { number: '237K+', label: 'Arama Anahtar Terimi' },
    { number: '100%', label: 'Mobil Uyumluluk' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-islamic rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary">FetvaBul</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/kategoriler" className="text-muted-foreground hover:text-primary transition-colors">
                Kategoriler
              </Link>
              <span className="text-primary font-medium">Hakkında</span>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span>Hakkımızda</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-islamic rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            FetvaBul Hakkında
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            İslami sorularınıza güvenilir cevaplar bulmanın en kolay yolu. Binlerce fetva arasından aradığınızı
            saniyeler içinde bulun.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center card-islamic p-6">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="card-islamic p-8 md:p-12 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary mb-6">Misyonumuz</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              FetvaBul olarak, Müslüman toplumun İslami sorularına hızlı, doğru ve güvenilir cevaplar bulmasını sağlamak
              amacıyla kurulduk. Modern teknolojinin gücünü İslami bilgiyle birleştirerek, dini bilgiye erişimi
              kolaylaştırıyoruz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Vizyonumuz</h3>
                <p className="text-muted-foreground">
                  İslami bilgiye erişimde dünya çapında öncü platform olmak ve Müslüman toplumun dini sorularına en
                  kapsamlı çözümü sunmak.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Hedefimiz</h3>
                <p className="text-muted-foreground">
                  Her Müslümanın dini sorularına kolayca erişebileceği, güvenilir ve kullanıcı dostu bir platform
                  oluşturmak.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Değerlerimiz</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              FetvaBul'u oluştururken benimsediğimiz temel değerler ve ilkeler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="card-islamic p-6 text-center">
                <div className="w-16 h-16 bg-islamic-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-islamic-green-600">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Ekibimiz</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              FetvaBul'u oluşturan uzman ekibimizle tanışın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div key={index} className="card-islamic p-6 text-center">
                <div className="text-4xl mb-4">{member.image}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-islamic-green-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="card-islamic p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-4">İletişim</h2>
              <p className="text-muted-foreground">
                Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçin
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-islamic-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-islamic-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">E-posta</h3>
                <p className="text-muted-foreground">info@fetvabul.com</p>
                <p className="text-muted-foreground">destek@fetvabul.com</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-islamic-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-islamic-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Telefon</h3>
                <p className="text-muted-foreground">+90 212 555 0123</p>
                <p className="text-muted-foreground text-sm">Hafta içi 09:00-18:00</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-islamic-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-islamic-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Adres</h3>
                <p className="text-muted-foreground">İstanbul, Türkiye</p>
                <p className="text-muted-foreground text-sm">Detaylı adres için iletişime geçin</p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-primary text-center mb-6">Bize Yazın</h3>
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="name">
                      Adınız Soyadınız
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Adınız"
                      className="w-full rounded-xl border border-islamic-green-200 bg-white px-4 py-3 focus:border-islamic-green-500 focus:ring-2 focus:ring-islamic-green-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">
                      E-posta Adresiniz
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="ornek@fetvabul.com"
                      className="w-full rounded-xl border border-islamic-green-200 bg-white px-4 py-3 focus:border-islamic-green-500 focus:ring-2 focus:ring-islamic-green-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="subject">
                    Konu
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Mesajınızın konusu"
                    className="w-full rounded-xl border border-islamic-green-200 bg-white px-4 py-3 focus:border-islamic-green-500 focus:ring-2 focus:ring-islamic-green-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2" htmlFor="message">
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Sorunuzu veya geri bildiriminizi yazınız..."
                    className="w-full rounded-xl border border-islamic-green-200 bg-white px-4 py-3 focus:border-islamic-green-500 focus:ring-2 focus:ring-islamic-green-100 resize-none"
                  />
                </div>

                {submitState !== 'idle' && formMessage && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                      submitState === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {submitState === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{formMessage}</span>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 px-8 py-3.5 text-lg font-semibold text-black shadow-[0_15px_35px_-12px_rgba(217,119,6,0.7)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(217,119,6,0.65)] focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                    <span>{submitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}