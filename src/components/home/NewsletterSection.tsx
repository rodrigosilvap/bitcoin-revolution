'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterSection() {
  const t = useTranslations('home');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    // In production, post to your newsletter API here
    setStatus('success');
    setEmail('');
  }

  return (
    <section className="border-t border-border bg-background py-20">
      <div className="container max-w-2xl text-center">
        <h2 className="mb-3 text-3xl font-bold">{t('newsletterTitle')}</h2>
        <p className="mb-8 text-muted-foreground">{t('newsletterSubtitle')}</p>

        {status === 'success' ? (
          <p className="font-medium text-green-400">{t('newsletterSuccess')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletterPlaceholder')}
              className="flex-1"
            />
            <Button type="submit" size="lg">
              {t('newsletterSubscribe')}
            </Button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-2 text-sm text-red-400">{t('newsletterError')}</p>
        )}
      </div>
    </section>
  );
}
