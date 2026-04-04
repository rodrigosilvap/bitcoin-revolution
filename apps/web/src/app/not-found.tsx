import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="container flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-2 text-8xl font-bold text-primary">404</p>
      <h2 className="mb-2 text-2xl font-bold">{t('title')}</h2>
      <p className="mb-6 text-muted-foreground">{t('description')}</p>
      <Button asChild>
        <Link href="/">{t('goHome')}</Link>
      </Button>
    </div>
  );
}