import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Globe2, TrendingUp } from 'lucide-react';

export async function WhyBitcoinSection() {
  const t = await getTranslations('home');

  const cards = [
    {
      Icon: Shield,
      titleKey: 'decentralizedSecure' as const,
      descKey: 'decentralizedSecureDesc' as const,
      href: '/blog/decentralized-secure-network',
    },
    {
      Icon: Globe2,
      titleKey: 'borderlessPayments' as const,
      descKey: 'borderlessPaymentsDesc' as const,
      href: '/blog/future-digital-payments',
    },
    {
      Icon: TrendingUp,
      titleKey: 'storeOfValue' as const,
      descKey: 'storeOfValueDesc' as const,
      href: '/blog/bitcoin-store-of-value',
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        <h2 className="mb-12 text-2xl font-semibold tracking-tight text-foreground">
          {t('whyBitcoin')}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ Icon, titleKey, descKey, href }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full p-6 transition-colors duration-200 hover:border-primary/40">
                <CardContent className="p-0 flex flex-col gap-4">
                  <Icon className="h-6 w-6 text-primary" />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t(titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
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
