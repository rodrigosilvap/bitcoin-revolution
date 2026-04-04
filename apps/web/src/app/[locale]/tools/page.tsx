import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, ArrowLeftRight, TrendingUp, Key, Shield, Building2, Layers, Search, QrCode, Activity, Share2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('tools');
  return { title: t('title'), description: t('subtitle') };
}

export default async function ToolsPage() {
  const t = await getTranslations('tools');

  const tools = [
    {
      href: '/tools/market-data',
      icon: BarChart2,
      titleKey: 'marketData' as const,
      descKey: 'marketDataDesc' as const,
    },
    {
      href: '/tools/price-converter',
      icon: ArrowLeftRight,
      titleKey: 'priceConverter' as const,
      descKey: 'priceConverterDesc' as const,
    },
    {
      href: '/tools/dca-simulator',
      icon: TrendingUp,
      titleKey: 'dcaSimulator' as const,
      descKey: 'dcaSimulatorDesc' as const,
    },
    {
      href: '/tools/bip39-seed',
      icon: Key,
      titleKey: 'bip39Seed' as const,
      descKey: 'bip39SeedDesc' as const,
    },
    {
      href: '/tools/address-validator',
      icon: Shield,
      titleKey: 'addressValidator' as const,
      descKey: 'addressValidatorDesc' as const,
    },
    {
      href: '/tools/btc-treasuries',
      icon: Building2,
      titleKey: 'btcTreasuries' as const,
      descKey: 'btcTreasuriesDesc' as const,
    },
    {
      href: '/tools/xpub-address-generator',
      icon: Layers,
      titleKey: 'xpubGenerator' as const,
      descKey: 'xpubGeneratorDesc' as const,
    },
    {
      href: '/tools/block-explorer',
      icon: Search,
      titleKey: 'blockExplorer' as const,
      descKey: 'blockExplorerDesc' as const,
    },
    {
      href: '/tools/payment-uri',
      icon: QrCode,
      titleKey: 'paymentUri' as const,
      descKey: 'paymentUriDesc' as const,
    },
    {
      href: '/tools/payment-monitor',
      icon: Activity,
      titleKey: 'paymentMonitor' as const,
      descKey: 'paymentMonitorDesc' as const,
    },
    {
      href: '/tools/checkout-creator',
      icon: Share2,
      titleKey: 'checkoutCreator' as const,
      descKey: 'checkoutCreatorDesc' as const,
    },
  ];

  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="mb-3 text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ href, icon: Icon, titleKey, descKey }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">
                    {t(titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
