import { getTranslations } from 'next-intl/server';
import { TrendingUp, TrendingDown, Timer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { MarketData } from '@/lib/services/bitcoin-service';
import type { HalvingInfo } from '@/lib/services/halving-service';

interface MarketStatsBarProps {
  market: MarketData | null;
  halving: HalvingInfo;
}

function formatCompact(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function formatHalving(halving: HalvingInfo): string {
  const days = Math.floor(halving.daysRemaining);
  const hours = Math.floor(halving.hoursRemaining % 24);
  return `${days}d ${hours}h`;
}

export async function MarketStatsBar({ market, halving }: MarketStatsBarProps) {
  const t = await getTranslations('home');

  const isPositive = (market?.priceChange24h.percentage ?? 0) >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const stats = [
    {
      label: t('statsPrice'),
      value: market
        ? `$${market.currentPrice.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : '—',
      accent: false,
    },
    {
      label: t('statsChange24h'),
      value: market
        ? `${isPositive ? '+' : ''}${market.priceChange24h.percentage.toFixed(2)}%`
        : '—',
      accent: true,
      colorClass: changeColor,
      icon: market ? <TrendIcon className="h-3.5 w-3.5" /> : null,
    },
    {
      label: t('statsMarketCap'),
      value: market ? formatCompact(market.marketCap.usd) : '—',
      accent: false,
    },
    {
      label: t('statsVolume'),
      value: market ? formatCompact(market.totalVolume.usd) : '—',
      accent: false,
    },
    {
      label: t('statsHalving'),
      value: formatHalving(halving),
      accent: false,
      icon: <Timer className="h-3.5 w-3.5 text-primary" />,
    },
  ];

  return (
    <div className="border-y border-border bg-card">
      <div className="container py-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  className={`flex items-center gap-1 text-sm font-semibold ${stat.colorClass ?? 'text-foreground'}`}
                >
                  {stat.icon}
                  {stat.value}
                </span>
              </div>
              {i < stats.length - 1 && (
                <Separator orientation="vertical" className="hidden h-8 sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
