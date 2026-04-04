import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { BtcTreasuries } from '@/components/tools/BtcTreasuries';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('btcTreasuries');
  return { title: t('title'), description: t('subtitle') };
}

export default async function Page() {
  const t = await getTranslations('btcTreasuries');
  const tTools = await getTranslations('tools');
  return (
    <div className="container py-12">
      <Button variant="ghost" asChild className="mb-8 -ml-2">
        <Link href="/tools">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tTools('backToTools')}
        </Link>
      </Button>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <BtcTreasuries />
    </div>
  );
}
