import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PriceConverter = dynamic(
  () => import('@/components/tools/PriceConverter').then((m) => ({ default: m.PriceConverter })),
  { ssr: false, loading: () => <Skeleton className="h-96 w-full" /> },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('priceConverter');
  return { title: t('title'), description: t('subtitle') };
}

export default async function Page() {
  const t = await getTranslations('priceConverter');
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <PriceConverter />
    </div>
  );
}
