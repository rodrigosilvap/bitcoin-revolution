'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchTreasuryData, type TreasuryCompany, type TreasuryData } from '@/lib/services/bitcoin-service';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COUNTRY_FLAG: Record<string, string> = {
  US: '🇺🇸', JP: '🇯🇵', CA: '🇨🇦', GB: '🇬🇧', DE: '🇩🇪', AU: '🇦🇺',
  SG: '🇸🇬', HK: '🇭🇰', SE: '🇸🇪', NO: '🇳🇴', FR: '🇫🇷', NL: '🇳🇱',
  KR: '🇰🇷', CN: '🇨🇳', BR: '🇧🇷', AR: '🇦🇷', MX: '🇲🇽', CH: '🇨🇭',
  AE: '🇦🇪', IL: '🇮🇱', TR: '🇹🇷', TH: '🇹🇭', PL: '🇵🇱', ES: '🇪🇸',
  CY: '🇨🇾', MT: '🇲🇹', GI: '🇬🇮', JE: '🇯🇪', KY: '🇰🇾', VG: '🇻🇬',
};

function flag(code: string) {
  return COUNTRY_FLAG[code] ?? '🏳️';
}

function formatBtc(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' BTC';
}

function formatUsd(n: number, compact = false) {
  if (compact) {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  }
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function avgEntryPrice(c: TreasuryCompany): number | null {
  if (!c.totalEntryValueUsd || !c.totalHoldings) return null;
  return c.totalEntryValueUsd / c.totalHoldings;
}

function pnl(c: TreasuryCompany): { usd: number; pct: number } | null {
  if (!c.totalEntryValueUsd) return null;
  const usd = c.totalCurrentValueUsd - c.totalEntryValueUsd;
  const pct = (usd / c.totalEntryValueUsd) * 100;
  return { usd, pct };
}

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortKey = 'rank' | 'name' | 'totalHoldings' | 'percentageOfTotalSupply' | 'totalCurrentValueUsd' | 'totalEntryValueUsd' | 'avgEntry' | 'pnlUsd' | 'pnlPct' | 'mnav';
type SortDir = 'asc' | 'desc';

function sortCompanies(companies: TreasuryCompany[], key: SortKey, dir: SortDir): TreasuryCompany[] {
  return [...companies].sort((a, b) => {
    let av: number, bv: number;
    switch (key) {
      case 'rank':
      case 'totalHoldings':           av = a.totalHoldings; bv = b.totalHoldings; break;
      case 'name':                    return dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      case 'percentageOfTotalSupply': av = a.percentageOfTotalSupply; bv = b.percentageOfTotalSupply; break;
      case 'totalCurrentValueUsd':    av = a.totalCurrentValueUsd; bv = b.totalCurrentValueUsd; break;
      case 'totalEntryValueUsd':      av = a.totalEntryValueUsd; bv = b.totalEntryValueUsd; break;
      case 'avgEntry':                av = avgEntryPrice(a) ?? -1; bv = avgEntryPrice(b) ?? -1; break;
      case 'pnlUsd':                  av = pnl(a)?.usd ?? -Infinity; bv = pnl(b)?.usd ?? -Infinity; break;
      case 'pnlPct':                  av = pnl(a)?.pct ?? -Infinity; bv = pnl(b)?.pct ?? -Infinity; break;
      case 'mnav':                    av = (a.marketCapUsd && a.totalCurrentValueUsd) ? a.marketCapUsd / a.totalCurrentValueUsd : -1; bv = (b.marketCapUsd && b.totalCurrentValueUsd) ? b.marketCapUsd / b.totalCurrentValueUsd : -1; break;
      default:                        av = 0; bv = 0;
    }
    return dir === 'asc' ? av - bv : bv - av;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold text-primary">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function SortIcon({ col, current, dir }: { col: SortKey; current: SortKey; dir: SortDir }) {
  if (col !== current) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  return dir === 'asc'
    ? <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    : <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BtcTreasuries() {
  const t = useTranslations('btcTreasuries');
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchTreasuryData());
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = useMemo(() => {
    if (!data) return [];
    const filtered = search.trim()
      ? data.companies.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.symbol.toLowerCase().includes(search.toLowerCase()) ||
            c.country.toLowerCase().includes(search.toLowerCase()),
        )
      : data.companies;
    return sortCompanies(filtered, sortKey, sortDir);
  }, [data, sortKey, sortDir, search]);

  // Chart: top-10 holdings bar
  const top10 = useMemo(() => {
    if (!data) return null;
    const top = [...data.companies]
      .sort((a, b) => b.totalHoldings - a.totalHoldings)
      .slice(0, 10);
    return {
      labels: top.map((c) => c.name.length > 18 ? c.name.slice(0, 16) + '…' : c.name),
      datasets: [{
        label: 'BTC Held',
        data: top.map((c) => c.totalHoldings),
        backgroundColor: 'rgba(255, 102, 0, 0.75)',
        borderColor: '#FF6600',
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }, [data]);

  // Chart: country distribution doughnut
  const countryChart = useMemo(() => {
    if (!data) return null;
    const byCountry: Record<string, number> = {};
    for (const c of data.companies) {
      byCountry[c.country] = (byCountry[c.country] ?? 0) + c.totalHoldings;
    }
    const entries = Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const COLORS = ['#3B82F6', '#10B981', '#A78BFA', '#F59E0B', '#60A5FA', '#34D399', '#C084FC', '#FBBF24'];
    return {
      labels: entries.map(([code]) => `${flag(code)} ${code}`),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: COLORS,
        borderColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
      }],
    };
  }, [data]);

  const Th = ({ col, children, className = '' }: { col: SortKey; children: React.ReactNode; className?: string }) => (
    <th
      className={`px-3 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center">
        {children}
        <SortIcon col={col} current={sortKey} dir={sortDir} />
      </span>
    </th>
  );

  if (loading) return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center">
      <p className="text-sm text-destructive">{error}</p>
      <button onClick={load} className="mt-3 text-sm text-primary underline">{t('retry')}</button>
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-6">

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('totalHoldings')}
          value={formatBtc(data.totalHoldings)}
          sub={formatUsd(data.totalValueUsd, true)}
        />
        <StatCard
          label={t('totalValueUsd')}
          value={formatUsd(data.totalValueUsd, true)}
        />
        <StatCard
          label={t('publicCompanies')}
          value={String(data.companies.length)}
          sub={t('companyCount')}
        />
        <StatCard
          label={t('supplyDominance')}
          value={`${data.marketCapDominance.toFixed(2)}%`}
          sub={t('ofCirculatingSupply')}
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('top10Chart')}</CardTitle>
          </CardHeader>
          <CardContent>
            {top10 && (
              <Bar
                data={top10}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      ticks: { color: '#888', callback: (v: unknown) => `${Number(v).toLocaleString()}` },
                      grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                    y: { ticks: { color: '#ccc', font: { size: 11 } }, grid: { display: false } },
                  },
                } as never}
                height={220}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('countryChart')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {countryChart && (
              <Doughnut
                data={countryChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'right' as const, labels: { color: '#ccc', font: { size: 11 }, padding: 12 } },
                    tooltip: {
                      callbacks: {
                        label: (ctx: { label: string; parsed: number }) =>
                          ` ${ctx.label}: ${ctx.parsed.toLocaleString()} BTC`,
                      },
                    },
                  },
                } as never}
                height={220}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-sm">{t('allCompanies')} ({sorted.length})</CardTitle>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-8 w-48 rounded-md border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th col="rank" className="w-10 text-center">#</Th>
                <Th col="name">{t('company')}</Th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{t('ticker')}</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{t('country')}</th>
                <Th col="totalHoldings">{t('btcHeld')}</Th>
                <Th col="percentageOfTotalSupply">{t('supplyPct')}</Th>
                <Th col="totalEntryValueUsd">{t('entryValue')}</Th>
                <Th col="avgEntry">{t('avgEntry')}</Th>
                <Th col="totalCurrentValueUsd">{t('currentValue')}</Th>
                <Th col="pnlUsd">{t('pnl')}</Th>
                <Th col="pnlPct">{t('pnlPct')}</Th>
                <Th col="mnav">{t('mnav')}</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => {
                const gain = pnl(c);
                const entry = avgEntryPrice(c);
                return (
                  <tr key={c.symbol + c.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium whitespace-nowrap max-w-[180px] truncate" title={c.name}>{c.name}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{c.symbol}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm whitespace-nowrap">
                      <span title={c.country}>{flag(c.country)} {c.country}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs whitespace-nowrap">
                      {c.totalHoldings.toLocaleString('en-US')}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(c.percentageOfTotalSupply / 4 * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {c.percentageOfTotalSupply.toFixed(3)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs whitespace-nowrap text-muted-foreground">
                      {c.totalEntryValueUsd ? formatUsd(c.totalEntryValueUsd, true) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs whitespace-nowrap text-muted-foreground">
                      {entry ? formatUsd(entry, true) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs whitespace-nowrap">
                      {formatUsd(c.totalCurrentValueUsd, true)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs whitespace-nowrap">
                      {gain ? (
                        <span className={gain.usd >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {gain.usd >= 0 ? '+' : ''}{formatUsd(gain.usd, true)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {gain ? (
                        <Badge
                          variant={gain.pct >= 0 ? 'default' : 'destructive'}
                          className={`text-xs gap-0.5 ${gain.pct >= 0 ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}
                        >
                          {gain.pct >= 0
                            ? <TrendingUp className="h-3 w-3" />
                            : <TrendingDown className="h-3 w-3" />}
                          {gain.pct >= 0 ? '+' : ''}{gain.pct.toFixed(1)}%
                        </Badge>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs whitespace-nowrap font-mono">
                      {c.marketCapUsd && c.totalCurrentValueUsd ? (() => {
                        const mnav = c.marketCapUsd / c.totalCurrentValueUsd;
                        const colour = mnav <= 1.5 ? 'text-green-400' : mnav <= 3 ? 'text-yellow-400' : 'text-red-400';
                        return <span className={colour}>{mnav.toFixed(2)}×</span>;
                      })() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Footer attribution ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t('dataSource')}{' '}
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            CoinGecko
          </a>
        </span>
        <button onClick={load} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
          <RefreshCw className="h-3 w-3" />
          {t('lastUpdated')}: {new Date(data.fetchedAt).toLocaleTimeString()}
        </button>
      </div>
    </div>
  );
}
