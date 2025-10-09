'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  className?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  successMessage?: string;
  errorMessage?: string;
}

type SubmitState = 'idle' | 'success' | 'error';

export function ContactForm({
  className,
  title = 'Bize Yazın',
  description = 'Görüş ve önerilerinizi paylaşın, en kısa sürede size dönüş yapalım.',
  submitLabel = 'Mesaj Gönder',
  successMessage = 'Mesajınız başarıyla iletildi. En kısa sürede dönüş yapacağız.',
  errorMessage = 'Mesaj gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.',
}: ContactFormProps) {
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setState('error');
      setMessage('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!payload.message || payload.message.trim().length < 10) {
      setState('error');
      setMessage('Mesaj en az 10 karakter olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    setState('idle');
    setMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? errorMessage);
      }

      form.reset();
      setState('success');
      setMessage(successMessage);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('rounded-3xl border border-border/60 bg-background p-8 shadow-lg', className)}>
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {state !== 'idle' && message && (
        <div
          className={cn(
            'mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm',
            state === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          )}
        >
          {state === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Adınız Soyadınız
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Adınız"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-posta Adresiniz
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="ornek@fetvabul.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-foreground">
            Konu
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            placeholder="Sorunuzun konusu"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-foreground">
            Mesajınız
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Sorunuzu veya geri bildiriminizi yazınız..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.01] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>{isSubmitting ? 'Gönderiliyor...' : submitLabel}</span>
        </button>
      </form>
    </div>
  );
}
