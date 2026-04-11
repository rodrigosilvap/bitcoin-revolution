'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RefreshCw, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// ─── Types ────────────────────────────────────────────────────────────────────

type Zone = 'strong-buy' | 'buy' | 'neutral' | 'caution' | 'sell';

interface Signal {
  key: string;
  value: string;
  zone: Zone;
  detail: string;
}

interface PricePoint { timestamp: number; price: number; }

// ─── Zone helpers ─────────────────────────────────────────────────────────────

const ZONE_LABEL: Record<Zone, string> = {
  'strong-buy': 'Strong Buy',
  'buy':        'Buy',
  'neutral':    'Neutral',
  'caution':    'Caution',
  'sell':       'Sell',
};

const ZONE_COLOR: Record<Zone, string> = {
  'strong-buy': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'buy':        'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
  'neutral':    'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  'caution':    'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
  'sell':       'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
};

const ZONE_SCORE: Record<Zone, number> = {
  'strong-buy': 2, 'buy': 1, 'neutral': 0, 'caution': -1, 'sell': -2,
};

function ZoneIcon({ zone }: { zone: Zone }) {
  if (zone === 'strong-buy' || zone === 'buy') return <TrendingUp className="h-4 w-4" />;
  if (zone === 'sell' || zone === 'caution') return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function sma(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null;
    const slice = prices.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function fmtUsd(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// ─── Signal calculators ───────────────────────────────────────────────────────

function calcMayerMultiple(prices: number[], current: number): Signal {
  const ma200 = sma(prices, 200);
  const last = ma200.filter(v => v !== null).at(-1)!;
  const mayer = current / last;

  let zone: Zone;
  let detail: string;
  if (mayer < 0.8)       { zone = 'strong-buy'; detail = `Below 0.8 — historically rare buying opportunity`; }
  else if (mayer < 1.0)  { zone = 'buy';        detail = `Below 200DMA — undervalued territory`; }
  else if (mayer < 1.5)  { zone = 'neutral';    detail = `Slightly above 200DMA — fair value range`; }
  else if (mayer < 2.4)  { zone = 'caution';    detail = `Extended above 200DMA — elevated risk`; }
  else                   { zone = 'sell';        detail = `Historically above this level = market top territory`; }

  return {
    key: 'mayerMultiple',
    value: mayer.toFixed(3),
    zone,
    detail,
  };
}

function calcVs200WMA(weeklyPrices: number[], current: number): Signal {
  // 200WMA ≈ last 200 weekly closes. We approximate from daily by sampling every 7
  const weekly = weeklyPrices.filter((_, i) => i % 7 === 0);
  const ma200w = sma(weekly, 200).filter(v => v !== null).at(-1) ?? 0;

  const pct = ((current - ma200w) / ma200w) * 100;
  let zone: Zone;
  let detail: string;

  if (pct < -10)      { zone = 'strong-buy'; detail = `Price well below 200WMA — historically generational bottom`; }
  else if (pct < 0)   { zone = 'buy';        detail = `Price below 200WMA (${fmtUsd(ma200w)}) — buy zone`; }
  else if (pct < 50)  { zone = 'neutral';    detail = `${pct.toFixed(1)}% above 200WMA (${fmtUsd(ma200w)}) — mid-cycle`; }
  else if (pct < 150) { zone = 'caution';    detail = `${pct.toFixed(1)}% above 200WMA — late cycle caution`; }
  else                { zone = 'sell';       detail = `${pct.toFixed(1)}% above 200WMA — historically extreme`; }

  return { key: 'wma200', value: fmtUsd(ma200w), zone, detail };
}

function calcPiCycle(prices: number[]): Signal {
  // Pi Cycle: 111DMA vs 350DMA×2
  const ma111 = sma(prices, 111).filter(v => v !== null) as number[];
  const ma350 = sma(prices, 350).filter(v => v !== null) as number[];

  const curr111 = ma111.at(-1)!;
  const curr350x2 = (ma350.at(-1) ?? 0) * 2;
  const gap = ((curr350x2 - curr111) / curr350x2) * 100;

  let zone: Zone;
  let detail: string;
  if (gap < 0)       { zone = 'sell';        detail = `111DMA crossed above 350DMA×2 — historically exact cycle top`; }
  else if (gap < 5)  { zone = 'caution';     detail = `Approaching Pi Cycle top signal (gap: ${gap.toFixed(1)}%)`; }
  else if (gap < 20) { zone = 'neutral';     detail = `Gap: ${gap.toFixed(1)}% — mid-late cycle`; }
  else if (gap < 50) { zone = 'buy';         detail = `Gap: ${gap.toFixed(1)}% — well below top signal`; }
  else               { zone = 'strong-buy';  detail = `Gap: ${gap.toFixed(1)}% — far from cycle top`; }

  return { key: 'piCycle', value: `${gap.toFixed(1)}%`, zone, detail };
}

function calcGoldenRatio(prices: number[], current: number): Signal {
  const ma350 = sma(prices, 350).filter(v => v !== null) as number[];
  const base = ma350.at(-1)!;
  const multipliers = [1.6, 2.0, 3.0, 5.0, 8.0];
  const bands = multipliers.map(m => base * m);

  let phase = 0;
  for (let i = 0; i < bands.length; i++) {
    if (current > bands[i]) phase = i + 1;
  }

  const zones: Zone[] = ['strong-buy', 'buy', 'neutral', 'caution', 'sell'];
  const labels = ['Below 1.6× — Accumulation', '1.6×–2× — Early bull', '2×–3× — Mid cycle', '3×–5× — Late bull', '5×–8× — Euphoria', 'Above 8× — Extreme top'];

  return {
    key: 'goldenRatio',
    value: `Phase ${phase + 1}/6`,
    zone: zones[Math.min(phase, 4)],
    detail: labels[phase] ?? labels[5],
  };
}

function calcDeathGoldenCross(prices: number[]): Signal {
  const ma50  = sma(prices, 50).filter(v => v !== null) as number[];
  const ma200 = sma(prices, 200).filter(v => v !== null) as number[];

  const len = Math.min(ma50.length, ma200.length);
  const curr50  = ma50[len - 1];
  const curr200 = ma200[len - 1];
  const prev50  = ma50[len - 2];
  const prev200 = ma200[len - 2];

  const isGolden = curr50 > curr200;
  const justCrossed = isGolden
    ? (prev50 <= prev200)
    : (prev50 >= prev200);

  const gap = ((curr50 - curr200) / curr200 * 100);

  let zone: Zone;
  let detail: string;
  if (isGolden && justCrossed)   { zone = 'buy';        detail = `Golden Cross just formed! 50DMA crossed above 200DMA`; }
  else if (isGolden)             { zone = gap > 20 ? 'caution' : 'neutral'; detail = `Golden Cross active — 50DMA is ${gap.toFixed(1)}% above 200DMA`; }
  else if (!isGolden && justCrossed) { zone = 'caution'; detail = `Death Cross just formed! 50DMA crossed below 200DMA`; }
  else                           { zone = 'sell';       detail = `Death Cross active — 50DMA is ${Math.abs(gap).toFixed(1)}% below 200DMA`; }

  return {
    key: 'cross',
    value: isGolden ? 'Golden Cross' : 'Death Cross',
    zone,
    detail,
  };
}

function calcFearGreed(score: number): Signal {
  let zone: Zone;
  let label: string;
  if (score <= 20)      { zone = 'strong-buy'; label = 'Extreme Fear'; }
  else if (score <= 40) { zone = 'buy';        label = 'Fear'; }
  else if (score <= 60) { zone = 'neutral';    label = 'Neutral'; }
  else if (score <= 80) { zone = 'caution';    label = 'Greed'; }
  else                  { zone = 'sell';       label = 'Extreme Greed'; }

  return {
    key: 'fearGreed',
    value: `${score} — ${label}`,
    zone,
    detail: `Contrarian indicator: Extreme Fear historically precedes major rallies. Extreme Greed = caution.`,
  };
}

// ─── Composite score ──────────────────────────────────────────────────────────

function compositeZone(signals: Signal[]): { label: string; zone: Zone; score: number } {
  const total = signals.reduce((s, sig) => s + ZONE_SCORE[sig.zone], 0);
  const max = signals.length * 2;
  const pct = (total / max) * 100;

  let zone: Zone;
  let label: string;
  if (pct >= 60)       { zone = 'strong-buy'; label = 'Strong Accumulation Zone'; }
  else if (pct >= 20)  { zone = 'buy';        label = 'Accumulation Zone'; }
  else if (pct >= -20) { zone = 'neutral';    label = 'Neutral / Watch'; }
  else if (pct >= -60) { zone = 'caution';    label = 'Caution Zone'; }
  else                 { zone = 'sell';       label = 'Distribution Zone'; }

  return { label, zone, score: total };
}

// ─── Key names (signal name + description) ───────────────────────────────────

const SIGNAL_META: Record<string, { name: string; desc: string }> = {
  fearGreed:    { name: 'Fear & Greed Index',         desc: 'Market sentiment from 0 (Extreme Fear) to 100 (Extreme Greed). Contrarian signal.' },
  mayerMultiple:{ name: 'Mayer Multiple',              desc: 'Current price ÷ 200-day moving average. Values < 1.0 historically = undervalued.' },
  wma200:       { name: '200-Week Moving Average',     desc: 'Long-term price floor. Below it = generational buying opportunity historically.' },
  piCycle:      { name: 'Pi Cycle Top Indicator',      desc: '111DMA vs 350DMA×2. Gap closing → approaching cycle top. Has called tops within days.' },
  goldenRatio:  { name: 'Golden Ratio Multiplier',     desc: 'Price vs 350DMA × Fibonacci multiples (1.6, 2, 3, 5, 8). Shows cycle phase.' },
  cross:        { name: '50/200 DMA Cross',            desc: 'Golden Cross (50DMA > 200DMA) = bullish trend. Death Cross = bearish trend.' },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function MarketSignals() {
  const t = useTranslations('marketSignals');

  const [signals, setSignals]       = useState<Signal[]>([]);
  const [composite, setComposite]   = useState<ReturnType<typeof compositeZone> | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [priceData, setPriceData]   = useState<number[]>([]);
  const [ma50Data, setMa50Data]     = useState<(number|null)[]>([]);
  const [ma200Data, setMa200Data]   = useState<(number|null)[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [histRes, fgRes] = await Promise.all([
        fetch('/api/bitcoin/price-history?days=365'),
        fetch('https://api.alternative.me/fng/?limit=1'),
      ]);

      if (!histRes.ok) throw new Error('Failed to fetch price history');
      const hist = await histRes.json() as { prices: PricePoint[] };
      const prices = hist.prices.map(p => p.price);
      const labels = hist.prices.map(p =>
        new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      const current = prices.at(-1) ?? 0;
      setCurrentPrice(current);
      setChartLabels(labels);
      setPriceData(prices);
      setMa50Data(sma(prices, 50));
      setMa200Data(sma(prices, 200));

      // Fear & Greed
      let fgScore = 50;
      if (fgRes.ok) {
        const fgData = await fgRes.json() as { data: [{ value: string }] };
        fgScore = parseInt(fgData.data[0].value, 10);
      }

      const computed: Signal[] = [
        calcFearGreed(fgScore),
        calcMayerMultiple(prices, current),
        calcVs200WMA(prices, current),
        calcPiCycle(prices),
        calcGoldenRatio(prices, current),
        calcDeathGoldenCross(prices),
      ];

      setSignals(computed);
      setComposite(compositeZone(computed));
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bullish  = signals.filter(s => s.zone === 'strong-buy' || s.zone === 'buy').length;
  const bearish  = signals.filter(s => s.zone === 'sell' || s.zone === 'caution').length;
  const neutral  = signals.filter(s => s.zone === 'neutral').length;

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'BTC Price',
        data: priceData,
        borderColor: 'rgba(249,115,22,0.9)',
        backgroundColor: 'rgba(249,115,22,0.05)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
        order: 0,
      },
      {
        label: '50 DMA',
        data: ma50Data,
        borderColor: 'rgba(139,92,246,0.8)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
        order: 1,
      },
      {
        label: '200 DMA',
        data: ma200Data,
        borderColor: 'rgba(59,130,246,0.8)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
        order: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            if (ctx.parsed.y == null) return '';
            return `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 8 }, grid: { color: 'rgba(128,128,128,0.1)' } },
      y: {
        grid: { color: 'rgba(128,128,128,0.1)' },
        ticks: {
          callback: (v: string | number) =>
            `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}><CardContent className="pt-6">
              <div className="h-5 w-32 animate-pulse rounded bg-muted mb-3" />
              <div className="h-7 w-24 animate-pulse rounded bg-muted mb-2" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={load}>{t('retry')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Composite score ───────────────────────────────────────────── */}
      {composite && (
        <Card className="overflow-hidden">
          <div className={`h-1.5 w-full ${
            composite.zone === 'strong-buy' ? 'bg-emerald-500' :
            composite.zone === 'buy'        ? 'bg-green-500' :
            composite.zone === 'neutral'    ? 'bg-yellow-500' :
            composite.zone === 'caution'    ? 'bg-orange-500' : 'bg-red-500'
          }`} />
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('compositeScore')}</p>
              <h2 className="text-2xl font-bold">{composite.label}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {bullish} bullish · {neutral} neutral · {bearish} bearish
                <span className="mx-2">·</span>
                {fmtUsd(currentPrice)} BTC
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={`text-base px-4 py-1.5 ${ZONE_COLOR[composite.zone]}`}>
                <ZoneIcon zone={composite.zone} />
                <span className="ml-1.5">{ZONE_LABEL[composite.zone]}</span>
              </Badge>
              <Button variant="ghost" size="sm" onClick={load} className="gap-1.5 text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                {lastUpdated ? lastUpdated.toLocaleTimeString() : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Signal cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signals.map(sig => {
          const meta = SIGNAL_META[sig.key];
          return (
            <Card key={sig.key} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm font-medium">
                  {meta.name}
                  <Badge variant="secondary" className={`text-xs ${ZONE_COLOR[sig.zone]}`}>
                    <ZoneIcon zone={sig.zone} />
                    <span className="ml-1">{ZONE_LABEL[sig.zone]}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0 flex-1">
                <p className="text-xl font-bold font-mono">{sig.value}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{sig.detail}</p>
                <p className="mt-auto text-xs text-muted-foreground/60 italic pt-2 border-t">{meta.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Price + MA chart ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={chartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        {t('disclaimer')}
      </p>

    </div>
  );
}
