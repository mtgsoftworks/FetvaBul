'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';
const OFFLINE_BUILD = process.env.NEXT_PUBLIC_OFFLINE_BUILD === '1';
const OFFLINE_CONTACT_STORAGE_KEY = 'fetvabul_offline_contact_messages';

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
      if (OFFLINE_BUILD) {
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem(OFFLINE_CONTACT_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(existing) ? existing : [];
          next.push({
            name: form.name,
            email: form.email,
            subject: form.subject || category,
            message: form.message,
            createdAt: new Date().toISOString(),
          });
          window.localStorage.setItem(OFFLINE_CONTACT_STORAGE_KEY, JSON.stringify(next));
        }

        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
        setCategory('');
        return;
      }

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
  const inputClass = 'w-full h-12 rounded-full border-[1.5px] border-clean-border bg-card px-5 text-sm text-main outline-none focus:border-accent transition-all placeholder:text-muted';
  const labelClass = 'text-[11px] font-medium uppercase tracking-[1px] text-muted';

  return (
    <div className="min-h-screen flex flex-col bg-bg text-main font-sans">
      <Header />
      <main className="max-w-[700px] mx-auto w-full px-8 pt-[140px] pb-16">
        <section className="mb-10">
          <h1 className="font-serif font-normal text-main mb-3">Soru Sor</h1>
          <p className="text-sm text-muted leading-relaxed">
            İbadet, aile hayatı ve ekonomi gibi konulardaki sorularınızı bize gönderebilirsiniz.
            Her mesaj alanında uzman hocalarımız tarafından titizlikle değerlendirilir.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className={labelClass}>Adınız (isteğe bağlı)</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Adınızı giriniz"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className={labelClass}>E-posta adresiniz *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange('email')}
                placeholder="ornek@eposta.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className={labelClass}>Konu Başlığı</label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange('subject')}
                placeholder="Sorunuz için kısa bir başlık"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className={labelClass}>Kategori</label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
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
            <label htmlFor="message" className={labelClass}>Sorunuz *</label>
            <textarea
              id="message"
              name="message"
              required
              value={form.message}
              onChange={handleChange('message')}
              rows={6}
              placeholder="Sorunuzu ayrıntılı şekilde yazınız..."
              className="w-full rounded-[20px] border-[1.5px] border-clean-border bg-card px-5 py-4 text-sm text-main outline-none focus:border-accent transition-all placeholder:text-muted resize-none"
            />
            <p className="text-[11px] text-muted tracking-wide">
              Sorularınızı arşivimize eklemeden önce anonimize eder, kişisel bilgilerinizi üçüncü kişilerle paylaşmayız.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-clean-border">
            <p className="text-[11px] text-muted uppercase tracking-[1px]">* İşaretli alanlar zorunludur</p>
            <button
              type="submit"
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-3 text-[13px] font-medium uppercase tracking-[1.5px] hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
              Sorumu Gönder
            </button>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-3 border-l-2 border-accent pl-5 py-3 text-sm text-accent">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>
                {OFFLINE_BUILD
                  ? 'Sorunuz çevrimdışı olarak kaydedildi.'
                  : 'Sorunuz başarıyla iletildi. En kısa sürede size dönüş yapacağız.'}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 border-l-2 border-red-400 pl-5 py-3 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{errorMessage ?? 'Sorunuz gönderilirken bir sorun oluştu.'}</p>
            </div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}
