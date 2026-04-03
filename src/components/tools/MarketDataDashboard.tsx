'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateHalving, formatCountdown } from '@/lib/services/halving-service';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { MarketData, PriceHistory, BlockchainInfo } from '@/lib/services/bitcoin-service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TIME_RANGES = [
  { label: '7d', days: '7' },
  { label: '30d', days: '30' },
  { label: '6m', days: '180' },
  { label: '1y', days: '365' },
  { label: '5y', days: '1825' },
];

export function MarketDataDashboard() {
  const t = useTranslations('marketData');

  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null);
  const [selectedDays, setSelectedDays] = useState('7');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarketData = useCallback(async () => {
    try {
      const [mdRes, biRes] = await Promise.all([
        fetch('/api/bitcoin/market-data'),
        fetch('/api/bitcoin/blockchain-info'),
      ]);
      if (mdRes.ok) setMarketData(await mdRes.json());
      if (biRes.ok) setBlockchainInfo(await biRes.json());
    } catch {
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (days: string) => {
    try {
      const res = await fetch(`/api/bitcoin/price-history?days=${days}`);
      if (res.ok) setHistory(await res.json());
    } catch {
      // keep existing history
    }
  }, []);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60_000);
    return () => clearInterval(interval);
  }, [loadMarketData]);

  useEffect(() => {
    loadHistory(selectedDays);
  }, [selectedDays, loadHistory]);

  const halvingInfo = calculateHalving();
  const countdown = formatCountdown(halvingInfo);

  const chartData = history
    ? {
        labels: history.prices.map((p) =>
          new Date(p.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        ),
        datasets: [
          {
            label: 'BTC Price (USD)',
            data: history.prices.map((p) => p.price),
            borderColor: '#FF6600',
            backgroundColor: 'rgba(255, 102, 0, 0.08)',
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
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { maxTicksLimit: 6, color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: {
        ticks: {
          color: '#888',
          callback: (v: number | string) => `$${Number(v).toLocaleString()}`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  const change = marketData?.priceChange24h.percentage ?? 0;
  const up = change >= 0;

  return (
    <div className="space-y-6">
      {/* Current price */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <div>
            <p className="text-sm text-muted-foreground">{t('currentPrice')}</p>
            <p className="text-4xl font-bold text-primary">
              {marketData ? formatCurrency(marketData.currentPrice.usd) : '—'}
            </p>
          </div>
          {marketData && (
            <Badge variant={up ? 'success' : 'destructive'} className="text-sm">
              {up ? '+' : ''}{change.toFixed(2)}% 24h
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Market stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('marketCap'), value: marketData ? formatCurrency(marketData.marketCap.usd, 'USD', true) : '—' },
          { label: t('volume24h'), value: marketData ? formatCurrency(marketData.totalVolume.usd, 'USD', true) : '—' },
          { label: t('high24h'), value: marketData ? formatCurrency(marketData.high24h.usd) : '—' },
          { label: t('low24h'), value: marketData ? formatCurrency(marketData.low24h.usd) : '—' },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Halving countdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('halvingCountdown')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{countdown.days}</p>
            <p className="text-xs text-muted-foreground">Days</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{countdown.hours}</p>
            <p className="text-xs text-muted-foreground">Hours</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{countdown.minutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div className="ml-auto flex flex-col items-end justify-center gap-1 text-sm text-muted-foreground">
            <p>{t('lastBlock')} {formatNumber(halvingInfo.currentBlock)}</p>
            <p>{t('blocksRemaining')} {formatNumber(halvingInfo.blocksRemaining)}</p>
            <p>{t('currentReward')} {halvingInfo.currentReward} BTC</p>
          </div>
        </CardContent>
      </Card>

      {/* Price chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('priceChart')}</CardTitle>
            <Tabs value={selectedDays} onValueChange={setSelectedDays}>
              <TabsList>
                {TIME_RANGES.map(({ label, days }) => (
                  <TabsTrigger key={days} value={days}>{label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {chartData ? (
            <Line data={chartData} options={chartOptions as never} height={80} />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </CardContent>
      </Card>

      {/* Fee estimates (from blockchain info) */}
      {blockchainInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('feeEstimates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: t('lowPriority'), fee: '1-5 sat/vB', time: '~60 min' },
                { label: t('mediumPriority'), fee: '5-20 sat/vB', time: '~30 min' },
                { label: t('highPriority'), fee: '20+ sat/vB', time: '~10 min' },
              ].map(({ label, fee, time }) => (
                <div key={label} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-lg font-bold text-primary">{fee}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t('feeNote')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
