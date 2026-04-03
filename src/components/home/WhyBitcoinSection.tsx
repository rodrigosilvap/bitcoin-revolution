import { Link } from '@/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';

export async function WhyBitcoinSection() {
  const t = await getTranslations('home');

  const cards = [
    {
      icon: '/images/icons/shield.png',
      titleKey: 'decentralizedSecure' as const,
      descKey: 'decentralizedSecureDesc' as const,
      href: '/blog/decentralized-secure-network',
    },
    {
      icon: '/images/icons/globe.png',
      titleKey: 'borderlessPayments' as const,
      descKey: 'borderlessPaymentsDesc' as const,
      href: '/blog/future-digital-payments',
    },
    {
      icon: '/images/icons/vault.png',
      titleKey: 'storeOfValue' as const,
      descKey: 'storeOfValueDesc' as const,
      href: '/blog/bitcoin-store-of-value',
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <h2 className="mb-12 flex items-center gap-4 text-3xl font-bold">
          <span className="h-px w-12 bg-primary" />
          {t('whyBitcoin')}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon, titleKey, descKey, href }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="relative -mt-4 w-full h-40 bg-primary/5">
                  <Image src={icon} alt="" fill className="object-contain p-6" />
                </div>
                <CardContent className="flex flex-col gap-2 p-6">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
