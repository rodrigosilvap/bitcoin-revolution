import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DcaSimulator = dynamic(
  () => import('@/components/tools/DcaSimulator').then((m) => ({ default: m.DcaSimulator })),
  { ssr: false, loading: () => <Skeleton className="h-96 w-full" /> },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dcaSimulator');
  return { title: t('title'), description: t('subtitle') };
}

export default async function Page() {
  const t = await getTranslations('dcaSimulator');
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <DcaSimulator />
    </div>
  );
}
