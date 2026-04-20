'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <section className="border-t border-border bg-background py-24">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center lg:p-12">
          <div className="mb-6 flex flex-col items-center gap-3">
            <Badge variant="outline" className="border-primary/40 text-primary">
              {t('newsletterBadge')}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">{t('newsletterTitle')}</h2>
            <p className="text-muted-foreground">{t('newsletterSubtitle')}</p>
          </div>

          {status === 'success' ? (
            <p className="font-medium text-green-500">{t('newsletterSuccess')}</p>
          ) : (
            <>
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
              {status === 'error' && (
                <p className="mt-2 text-sm text-red-400">{t('newsletterError')}</p>
              )}
              <p className="mt-4 text-xs text-muted-foreground">{t('newsletterTrustLine')}</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
