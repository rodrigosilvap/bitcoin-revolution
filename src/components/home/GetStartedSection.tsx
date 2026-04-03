import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';

export async function GetStartedSection() {
  const t = await getTranslations('home');

  const steps = [
    {
      num: 1,
      icon: '/images/icons/wallet.png',
      titleKey: 'createWallet' as const,
      descKey: 'createWalletDesc' as const,
    },
    {
      num: 2,
      icon: '/images/icons/phone.png',
      titleKey: 'buyBitcoin' as const,
      descKey: 'buyBitcoinDesc' as const,
    },
    {
      num: 3,
      icon: '/images/icons/lock.png',
      titleKey: 'secureManage' as const,
      descKey: 'secureManageDesc' as const,
    },
  ];

  return (
    <section className="bg-card py-20">
      <div className="container">
        <h2 className="mb-12 flex items-center gap-4 text-3xl font-bold">
          <span className="h-px w-12 bg-primary" />
          {t('getStartedTitle')}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ num, icon, titleKey, descKey }) => (
            <Card key={num} className="relative overflow-visible">
              {/* Step number badge */}
              <div className="absolute -top-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md">
                {num}
              </div>
              <CardContent className="flex flex-col gap-4 p-6 pt-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Image src={icon} alt="" width={28} height={28} />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">{t(titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
