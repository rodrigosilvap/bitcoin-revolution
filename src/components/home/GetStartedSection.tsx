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
            <Card key={num} className="relative overflow-hidden">
              {/* Step number badge */}
              <div className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md">
                {num}
              </div>
              <div className="relative -mt-4 w-full h-40 bg-primary/5">
                <Image src={icon} alt="" fill className="object-contain p-6" />
              </div>
              <CardContent className="flex flex-col gap-2 p-6">
                <h3 className="text-lg font-semibold">{t(titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
