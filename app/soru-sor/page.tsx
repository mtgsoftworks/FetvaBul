'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const CATEGORY_OPTIONS = [
  'İbadet (Namaz, Oruç, Hac)',
  'Aile & Sosyal Hayat',
  'Muamelat & Ekonomi',
  'Ahlak & Tasavvuf',
  'Helal Gıda & Sağlık',
  'Diğer',
];

export default function AskQuestionPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject || category,
          message: form.message,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Mesajınız gönderilemedi. Lütfen tekrar deneyin.');
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setCategory('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Mesajınız gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setTimeout(() => {
        setStatus('idle');
      }, 3500);
    }
  };

  const disabled = status === 'submitting';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <svg
              className="h-8 w-8"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 10a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v28l-8-5-8 5-8-5-8 5V10Z"
                fill="currentColor"
                opacity="0.15"
              />
              <path
                d="M14 6h20a4 4 0 0 1 4 4v28a1 1 0 0 1-1.52.85L28 34.118l-8.48 4.732A1 1 0 0 1 18 38V28h-4a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Zm-2 6v8a2 2 0 0 0 2 2h6a2 2 0 0 1 2 2v7.764l7.48-4.17a1 1 0 0 1 1.04 0L38 31.764V10a2 2 0 0 0-2-2H14a2 2 0 0 0-2 2Zm10 2h8v2h-8v-2Zm0 4h8v2h-8v-2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="mt-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Soru Sor
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sorularınızı uzman ekibimize iletin
          </h1>
          <p className="mt-3 mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            İbadet, aile hayatı ve ekonomi gibi konulardaki sorularınızı bize gönderebilirsiniz. Her mesaj alanında uzman hocalarımız tarafından titizlikle değerlendirilir.
          </p>
        </section>

        <section className="mt-12">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-border/30 bg-background/95 p-8 shadow-sm"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-semibold text-foreground">Adınız (isteğe bağlı)</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Adınızı giriniz"
                  className="h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">E-posta adresiniz *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="ornek@eposta.com"
                  className="h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-sm font-semibold text-foreground">Konu Başlığı</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange('subject')}
                  placeholder="Sorunuz için kısa bir başlık"
                  className="h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="category" className="text-sm font-semibold text-foreground">Kategori</label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Kategori seçin</option>
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-semibold text-foreground">Sorunuz *</label>
              <textarea
                id="message"
                name="message"
                required
                value={form.message}
                onChange={handleChange('message')}
                rows={6}
                placeholder="Sorunuzu ayrıntılı şekilde yazınız. Durumunuzu, size özel koşulları ve varsa önceki fetva kaynaklarını belirtin."
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">Sorularınızı arşivimize eklemeden önce anonimize eder, kişisel bilgilerinizi üçüncü kişilerle paylaşmayız.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">* İşaretli alanların doldurulması zorunludur.</p>
              <Button type="submit" disabled={disabled} className="inline-flex items-center gap-2 rounded-full px-6 py-2">
                {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                Sorumu Gönder
              </Button>
            </div>

            {status === 'success' && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <p>Sorunuz başarıyla iletildi. En kısa sürede size dönüş yapacağız.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{errorMessage ?? 'Sorunuz gönderilirken bir sorun oluştu.'}</p>
              </div>
            )}
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
