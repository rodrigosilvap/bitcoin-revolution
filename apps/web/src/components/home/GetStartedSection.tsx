import { getTranslations } from 'next-intl/server';
import { Wallet, CreditCard, Lock } from 'lucide-react';

export async function GetStartedSection() {
  const t = await getTranslations('home');

  const steps = [
    {
      num: 1,
      Icon: Wallet,
      titleKey: 'createWallet' as const,
      descKey: 'createWalletDesc' as const,
    },
    {
      num: 2,
      Icon: CreditCard,
      titleKey: 'buyBitcoin' as const,
      descKey: 'buyBitcoinDesc' as const,
    },
    {
      num: 3,
      Icon: Lock,
      titleKey: 'secureManage' as const,
      descKey: 'secureManageDesc' as const,
    },
  ];

  return (
    <section className="border-t border-border bg-card py-24">
      <div className="container">
        <h2 className="mb-12 text-2xl font-semibold tracking-tight text-foreground">
          {t('getStartedTitle')}
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ num, Icon, titleKey, descKey }) => (
            <div key={num} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {num}
                </span>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
