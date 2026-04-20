import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Globe2, TrendingUp, Coins } from 'lucide-react';

export async function WhyBitcoinSection() {
  const t = await getTranslations('home');

  const cards = [
    {
      Icon: Coins,
      titleKey: 'soundMoney' as const,
      descKey: 'soundMoneyDesc' as const,
      statKey: 'soundMoneyStat' as const,
      href: '/blog/why-bitcoin-best-money',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      statBg: 'bg-amber-500/8 text-amber-600 dark:text-amber-400',
    },
    {
      Icon: Shield,
      titleKey: 'decentralizedSecure' as const,
      descKey: 'decentralizedSecureDesc' as const,
      statKey: 'decentralizedStat' as const,
      href: '/blog/decentralized-secure-network',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      statBg: 'bg-blue-500/8 text-blue-600 dark:text-blue-400',
    },
    {
      Icon: Globe2,
      titleKey: 'borderlessPayments' as const,
      descKey: 'borderlessPaymentsDesc' as const,
      statKey: 'borderlessStat' as const,
      href: '/blog/future-digital-payments',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      statBg: 'bg-emerald-500/8 text-emerald-600 dark:text-emerald-400',
    },
    {
      Icon: TrendingUp,
      titleKey: 'storeOfValue' as const,
      descKey: 'storeOfValueDesc' as const,
      statKey: 'storeOfValueStat' as const,
      href: '/blog/bitcoin-store-of-value',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      statBg: 'bg-primary/8 text-primary',
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-12 flex flex-col gap-3">
          <Badge variant="outline" className="w-fit border-primary/40 text-primary">
            WHY BITCOIN
          </Badge>
          <h2 className="text-3xl font-bold">{t('whyBitcoin')}</h2>
          <p className="max-w-2xl text-muted-foreground">{t('whyBitcoinSubtitle')}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, titleKey, descKey, statKey, href, iconBg, iconColor, statBg }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                      {t(titleKey)}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(descKey)}
                    </p>
                  </div>
                  <div className={`mt-auto rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground`}>
                    {t(statKey)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
