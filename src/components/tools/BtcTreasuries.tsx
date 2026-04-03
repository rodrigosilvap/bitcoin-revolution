'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function BtcTreasuries() {
  const t = useTranslations('btcTreasuries');

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('disclaimer')}{' '}
          <a
            href="https://bitcointreasuries.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            bitcointreasuries.net
          </a>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </CardHeader>
        <CardContent className="p-0">
          <iframe
            src="https://bitcointreasuries.net"
            className="h-[600px] w-full rounded-b-lg border-0"
            title="BTC Treasuries"
            loading="lazy"
          />
        </CardContent>
      </Card>
    </div>
  );
}
