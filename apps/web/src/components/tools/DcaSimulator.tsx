'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchPriceHistory } from '@/lib/services/bitcoin-service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface SimResult {
  dcaFinalValue: number;
  lumpSumFinalValue: number;
  totalInvested: number;
  bestStrategy: string;
  chartLabels: string[];
  dcaSeries: number[];
  lumpSumSeries: number[];
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

export function DcaSimulator() {
  const t = useTranslations('dcaSimulator');
  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(daysAgo(90));
  const [endDate, setEndDate] = useState(today);
  const [totalAmount, setTotalAmount] = useState('1000');
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setPreset(months: number) {
    setStartDate(daysAgo(months * 30));
    setEndDate(today);
  }

  async function calculate() {
    setLoading(true);
    setError(null);
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const days = Math.round((end - start) / 86400000);
      if (days <= 0 || !totalAmount) return;

      const { prices } = await fetchPriceHistory(String(Math.min(days, 1825)));

      // Filter to date range
      const filtered = prices.filter(
        (p) => p.timestamp >= start && p.timestamp <= end,
      );
      if (filtered.length < 2) throw new Error('Not enough data');

      const amount = parseFloat(totalAmount);
      const perInterval = amount / filtered.length;

      // DCA: buy same USD amount each day
      let dcaBtc = 0;
      const dcaSeries: number[] = [];
      filtered.forEach((p, i) => {
        dcaBtc += perInterval / p.price;
        dcaSeries.push(dcaBtc * filtered[filtered.length - 1].price);
      });

      // Lump sum: buy everything on day 1
      const lumpBtc = amount / filtered[0].price;
      const lumpSumSeries = filtered.map((p) => lumpBtc * p.price);

      const dcaFinal = dcaBtc * filtered[filtered.length - 1].price;
      const lumpFinal = lumpBtc * filtered[filtered.length - 1].price;

      setResult({
        dcaFinalValue: dcaFinal,
        lumpSumFinalValue: lumpFinal,
        totalInvested: amount,
        bestStrategy: dcaFinal >= lumpFinal ? t('dcaTitle') : t('lumpSumTitle'),
        chartLabels: filtered.map((p) =>
          new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ),
        dcaSeries,
        lumpSumSeries,
      });
    } catch {
      setError('Failed to calculate. Try a different date range.');
    } finally {
      setLoading(false);
    }
  }

  const chartData = result
    ? {
        labels: result.chartLabels,
        datasets: [
          {
            label: t('dcaTitle'),
            data: result.dcaSeries,
            borderColor: '#FF6600',
            backgroundColor: 'rgba(255,102,0,0.08)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
          },
          {
            label: t('lumpSumTitle'),
            data: result.lumpSumSeries,
            borderColor: '#0080FF',
            backgroundColor: 'rgba(0,128,255,0.06)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('investmentParameters')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets */}
          <div className="flex gap-2">
            {[3, 6, 12].map((m) => (
              <Button key={m} variant="outline" size="sm" onClick={() => setPreset(m)}>
                {m === 3 ? t('last3Months') : m === 6 ? t('last6Months') : t('last12Months')}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{t('startDate')}</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} max={today} />
            </div>
            <div className="space-y-1">
              <Label>{t('endDate')}</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} max={today} />
            </div>
            <div className="space-y-1">
              <Label>{t('totalAmount')}</Label>
              <Input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <Button onClick={calculate} disabled={loading}>
            {loading ? <Skeleton className="h-4 w-24" /> : t('calculate')}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('totalInvested'), value: formatCurrency(result.totalInvested) },
              { label: t('dcaFinalValue'), value: formatCurrency(result.dcaFinalValue) },
              { label: t('lumpSumFinalValue'), value: formatCurrency(result.lumpSumFinalValue) },
              { label: t('bestStrategy'), value: result.bestStrategy },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-bold text-primary">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('growthComparison')}</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' } },
                    scales: {
                      x: { ticks: { maxTicksLimit: 6, color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                      y: {
                        ticks: { color: '#888', callback: (v: unknown) => `$${Number(v).toLocaleString()}` },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                      },
                    },
                  } as never}
                  height={80}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
