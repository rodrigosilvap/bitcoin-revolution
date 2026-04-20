import { Link } from '@/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { HeroPriceTicker } from './HeroPriceTicker';
import type { MarketData } from '@/lib/services/bitcoin-service';

interface HeroSectionProps {
  market: MarketData | null;
  sparklinePrices?: number[];
}

export async function HeroSection({ market }: HeroSectionProps) {
  const t = await getTranslations('home');

  const heroStats = market
    ? [
        {
          label: 'Price',
          value: `$${market.currentPrice.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
          showSparkline: true,
        },
        { label: 'Market Cap', value: formatCompact(market.marketCap.usd), showSparkline: false },
        { label: '24h Volume', value: formatCompact(market.totalVolume.usd), showSparkline: false },
      ]
    : [];

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Radial orange glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,102,0,0.12) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="container relative py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — text */}
          <div className="flex flex-col gap-7">
            <span className="w-fit rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Bitcoin
            </span>

            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground lg:text-7xl">
              {t('heroHeadline')}
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              {t('heroSubtitle')}
            </p>

            {/* Live price pill */}
            {market && (
              <HeroPriceTicker
                initialPrice={market.currentPrice.usd}
                initialChange={market.priceChange24h.percentage}
              />
            )}

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/blog">{t('heroCtaBlog')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tools">{t('heroCtaTools')}</Link>
              </Button>
            </div>
          </div>

          {/* Right — hero image */}
          <div className="relative flex justify-center">
            <div className="relative h-[400px] w-full max-w-[520px] overflow-hidden rounded-3xl shadow-2xl shadow-primary/10">
              <Image
                src="/images/blog/digital-gold-enhanced.png"
                alt="Bitcoin — Digital Gold"
                fill
                className="object-cover"
                priority
              />
              {/* Subtle overlay to blend with dark theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Bottom stats strip with sparklines */}
        {heroStats.length > 0 && (
          <div className="mt-16 border-t border-border/50 pt-8">
            <div className="grid grid-cols-3 gap-4">
              {heroStats.map(({ label, value, showSparkline }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-base font-semibold text-foreground sm:text-lg">
                      {value}
                    </span>
                    {showSparkline && sparklinePrices.length > 0 && (
                      <HeroSparkline prices={sparklinePrices} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
