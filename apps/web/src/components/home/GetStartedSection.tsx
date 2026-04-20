import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CreditCard, Lock } from 'lucide-react';

export async function GetStartedSection() {
  const t = await getTranslations('home');

  const steps = [
    {
      num: 1,
      Icon: BookOpen,
      titleKey: 'stepLearn' as const,
      descKey: 'stepLearnDesc' as const,
      href: '/learn',
      circleBg: 'bg-blue-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      num: 2,
      Icon: CreditCard,
      titleKey: 'stepBuy' as const,
      descKey: 'stepBuyDesc' as const,
      href: '/buy',
      circleBg: 'bg-emerald-500',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      num: 3,
      Icon: Lock,
      titleKey: 'stepSecure' as const,
      descKey: 'stepSecureDesc' as const,
      href: '/secure',
      circleBg: 'bg-primary',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-12 flex flex-col gap-3">
          <Badge variant="outline" className="w-fit border-primary/40 text-primary">
            GET STARTED
          </Badge>
          <h2 className="text-3xl font-bold">{t('getStartedTitle')}</h2>
          <p className="max-w-xl text-muted-foreground">{t('getStartedSubtitle')}</p>
        </div>

        {/* Steps with connector line on desktop */}
        <div className="relative grid gap-8 sm:grid-cols-3">
          {/* Dashed connector — visible only on sm+ */}
          <div
            className="pointer-events-none absolute left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] top-6 hidden border-t-2 border-dashed border-border sm:block"
            aria-hidden
          />

          {steps.map(({ num, Icon, titleKey, descKey, href, circleBg, iconBg, iconColor }) => (
            <Link
              key={num}
              href={href}
              className="group relative flex flex-col items-start gap-4 sm:items-center sm:text-center"
            >
              {/* Number circle + icon stacked */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${circleBg} text-sm font-bold text-white shadow-md transition-transform group-hover:scale-110`}
                >
                  {num}
                </span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-colors`}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {t(titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
