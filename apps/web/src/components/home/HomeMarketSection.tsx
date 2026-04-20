'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchMarketData, fetchPriceHistory } from '@/lib/services/bitcoin-service';
import { formatCurrency } from '@/lib/utils';
import type { MarketData, PriceHistory } from '@/lib/services/bitcoin-service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const TIME_RANGES = [
  { label: '7d', days: '7' },
  { label: '30d', days: '30' },
  { label: '1y', days: '365' },
];

interface HomeMarketSectionProps {
  initialMarket: MarketData | null;
}

export function HomeMarketSection({ initialMarket }: HomeMarketSectionProps) {
  const [market, setMarket] = useState<MarketData | null>(initialMarket);
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [selectedDays, setSelectedDays] = useState('7');
  const [chartLoading, setChartLoading] = useState(true);

  const loadHistory = useCallback(async (days: string) => {
    setChartLoading(true);
    try {
      setHistory(await fetchPriceHistory(days));
    } catch {
      // keep existing
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(selectedDays);
  }, [selectedDays, loadHistory]);

  useEffect(() => {
    const refresh = () =>
      fetchMarketData()
        .then(setMarket)
        .catch(() => {});
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  const change = market?.priceChange24h.percentage ?? 0;
  const isUp = change >= 0;

  const chartData = history
    ? {
        labels: history.prices.map((p) =>
          new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ),
        datasets: [
          {
            data: history.prices.map((p) => p.price),
            borderColor: '#FF6600',
            backgroundColor: 'rgba(255,102,0,0.08)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => `$${ctx.parsed.y.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 6, color: '#888', font: { size: 11 } },
        grid: { color: 'rgba(128,128,128,0.08)' },
      },
      y: {
        position: 'right' as const,
        ticks: {
          color: '#888',
          font: { size: 11 },
          callback: (v: number | string) =>
            `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        },
        grid: { color: 'rgba(128,128,128,0.08)' },
      },
    },
  };

  return (
    <section className="border-y border-border bg-card py-12">
      <div className="container">
        <Card className="overflow-hidden border-border/60">
          <CardContent className="p-0">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border/60 px-6 py-5">
              {/* Price */}
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">BTC Price</p>
                  <p className="text-3xl font-extrabold tracking-tight text-foreground">
                    {market ? formatCurrency(market.currentPrice.usd) : '—'}
                  </p>
                </div>
                {market && (
                  <Badge
                    variant={isUp ? 'success' : 'destructive'}
                    className="mb-1 flex items-center gap-1 text-sm"
                  >
                    {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {isUp ? '+' : ''}{change.toFixed(2)}%
                  </Badge>
                )}
              </div>

              <div className="h-8 w-px bg-border/60 hidden sm:block" />

              {/* Secondary stats */}
              {[
                { label: 'Market Cap', value: market ? formatCurrency(market.marketCap.usd, 'USD', true) : '—' },
                { label: '24h Volume', value: market ? formatCurrency(market.totalVolume.usd, 'USD', true) : '—' },
                { label: '24h High', value: market ? formatCurrency(market.high24h.usd) : '—' },
                { label: '24h Low', value: market ? formatCurrency(market.low24h.usd) : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">{value}</p>
                </div>
              ))}

              {/* Time range selector — pushed right */}
              <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
                {TIME_RANGES.map(({ label, days }) => (
                  <button
                    key={days}
                    onClick={() => setSelectedDays(days)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      selectedDays === days
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="px-6 pb-6 pt-4">
              {chartLoading || !chartData ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div style={{ height: 260 }}>
                  <Line data={chartData} options={chartOptions as never} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
