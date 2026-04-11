'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { RefreshCw, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { fetchTreasuryData, fetchBitcoinPrice } from '@/lib/services/bitcoin-service';
import { BTC_ETFS, BTC_ETF_DATA_AS_OF, type EtfFund } from '@/lib/etf-data';
import type { TreasuryCompany } from '@/lib/services/bitcoin-service';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ─── Unified holder row ───────────────────────────────────────────────────────

type RowType = 'etf' | 'company';

interface HolderRow {
  type: RowType;
  name: string;
  subtitle: string;  // issuer (ETF) or country (company)
  ticker: string;
  btcHoldings: number;
  supplyPct: number;
  currentValueUsd: number;
}

function buildRows(
  etfs: EtfFund[],
  companies: TreasuryCompany[],
  btcPrice: number,
): HolderRow[] {
  const etfRows: HolderRow[] = etfs.map(e => ({
    type: 'etf',
    name: e.name,
    subtitle: e.issuer,
    ticker: e.ticker,
    btcHoldings: e.btcHoldings,
    supplyPct: (e.btcHoldings / 21_000_000) * 100,
    currentValueUsd: e.btcHoldings * btcPrice,
  }));
  const companyRows: HolderRow[] = companies.map(c => ({
    type: 'company',
    name: c.name,
    subtitle: c.country,
    ticker: c.symbol,
    btcHoldings: c.totalHoldings,
    supplyPct: c.percentageOfTotalSupply,
    currentValueUsd: c.totalHoldings * btcPrice,
  }));
  return [...etfRows, ...companyRows];
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtBtc(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

// ─── Sort state ───────────────────────────────────────────────────────────────

type SortKey = 'name' | 'ticker' | 'type' | 'btcHoldings' | 'supplyPct' | 'currentValueUsd';

function sortRows(rows: HolderRow[], key: SortKey, asc: boolean): HolderRow[] {
  return [...rows].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === 'number' && typeof vb === 'number') return asc ? va - vb : vb - va;
    return asc
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });
}

// ─── Table ────────────────────────────────────────────────────────────────────

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <ChevronUp className="h-3 w-3 opacity-30" />;
  return asc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
}

function HolderTable({ rows, t }: { rows: HolderRow[]; t: ReturnType<typeof useTranslations> }) {
  const [sortKey, setSortKey] = useState<SortKey>('btcHoldings');
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = useMemo(() => sortRows(rows, sortKey, sortAsc), [rows, sortKey, sortAsc]);

  const thClass = 'px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap';
  const tdClass = 'px-3 py-3 text-sm';

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b bg-muted/30">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-10">#</th>
            {(
              [
                ['name',           t('colName')],
                ['ticker',         t('colTicker')],
                ['type',           t('colType')],
                ['btcHoldings',    t('colBtcHeld')],
                ['supplyPct',      t('colSupplyPct')],
                ['currentValueUsd', t('colCurrentValue')],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <th key={key} className={thClass} onClick={() => handleSort(key)}>
                <span className="inline-flex items-center gap-1">
                  {label}
                  <SortIcon active={sortKey === key} asc={sortAsc} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((row, i) => (
            <tr key={`${row.type}-${row.ticker}`} className="hover:bg-muted/20 transition-colors">
              <td className={`${tdClass} text-muted-foreground`}>{i + 1}</td>
              <td className={tdClass}>
                <div className="font-medium leading-tight">{row.name}</div>
                <div className="text-xs text-muted-foreground">{row.subtitle}</div>
              </td>
              <td className={`${tdClass} font-mono text-xs`}>{row.ticker}</td>
              <td className={tdClass}>
                <Badge
                  variant="secondary"
                  className={
                    row.type === 'etf'
                      ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }
                >
                  {row.type === 'etf' ? t('typeEtf') : t('typeCompany')}
                </Badge>
              </td>
              <td className={`${tdClass} font-mono`}>₿ {fmtBtc(row.btcHoldings)}</td>
              <td className={`${tdClass} text-muted-foreground`}>{row.supplyPct.toFixed(4)}%</td>
              <td className={`${tdClass} font-mono`}>{fmtUsd(row.currentValueUsd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EtfComparison() {
  const t = useTranslations('etfComparison');

  const [companies, setCompanies]   = useState<TreasuryCompany[]>([]);
  const [btcPrice, setBtcPrice]     = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [treasury, price] = await Promise.allSettled([
        fetchTreasuryData(),
        fetchBitcoinPrice(),
      ]);
      if (price.status === 'fulfilled') setBtcPrice(price.value.price);
      if (treasury.status === 'fulfilled') {
        setCompanies(treasury.value.companies);
      } else {
        setError(t('fetchError'));
      }
      setLastUpdated(new Date());
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allRows = useMemo(
    () => buildRows(BTC_ETFS, companies, btcPrice),
    [companies, btcPrice],
  );

  const etfRows     = useMemo(() => allRows.filter(r => r.type === 'etf'),     [allRows]);
  const companyRows = useMemo(() => allRows.filter(r => r.type === 'company'), [allRows]);

  const totalEtfBtc     = BTC_ETFS.reduce((s, e) => s + e.btcHoldings, 0);
  const totalCompanyBtc = companies.reduce((s, c) => s + c.totalHoldings, 0);
  const totalBtc        = totalEtfBtc + totalCompanyBtc;
  const totalEtfUsd     = totalEtfBtc * btcPrice;
  const totalCompanyUsd = totalCompanyBtc * btcPrice;

  // Top-15 chart data
  const top15 = useMemo(
    () => [...allRows].sort((a, b) => b.btcHoldings - a.btcHoldings).slice(0, 15),
    [allRows],
  );

  const chartData = useMemo(() => ({
    labels: top15.map(r => r.ticker),
    datasets: [
      {
        label: t('typeEtf'),
        data: top15.map(r => r.type === 'etf' ? r.btcHoldings : 0),
        backgroundColor: 'rgba(249,115,22,0.7)',
        borderColor: 'rgba(249,115,22,1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: t('typeCompany'),
        data: top15.map(r => r.type === 'company' ? r.btcHoldings : 0),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }), [top15, t]);

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { x: number | null } }) => {
            if (!ctx.parsed.x) return '';
            return `${ctx.dataset.label}: ₿ ${fmtBtc(ctx.parsed.x)}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { color: 'rgba(128,128,128,0.1)' } },
      y: { stacked: true, grid: { display: false } },
    },
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="py-6">
              <div className="h-8 w-24 animate-pulse rounded bg-muted mb-2" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">{t('totalEtfBtc')}</p>
            <p className="text-2xl font-bold">₿ {fmtBtc(totalEtfBtc)}</p>
            <p className="text-sm text-muted-foreground mt-1">{fmtUsd(totalEtfUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">{t('totalTreasuryBtc')}</p>
            <p className="text-2xl font-bold">₿ {fmtBtc(totalCompanyBtc)}</p>
            <p className="text-sm text-muted-foreground mt-1">{fmtUsd(totalCompanyUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">{t('totalInstitutional')}</p>
            <p className="text-2xl font-bold">₿ {fmtBtc(totalBtc)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {((totalBtc / 21_000_000) * 100).toFixed(2)}% {t('ofSupply')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <Info className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Bar chart ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={chartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* ── Table with tabs ───────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between flex-wrap gap-2 px-6 pt-6 pb-4">
            <TabsList>
              <TabsTrigger value="all">{t('tabAll')} ({allRows.length})</TabsTrigger>
              <TabsTrigger value="etfs">{t('tabEtfs')} ({etfRows.length})</TabsTrigger>
              <TabsTrigger value="companies">{t('tabCompanies')} ({companyRows.length})</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="sm" onClick={load} className="gap-1.5 text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              {lastUpdated ? `${t('lastUpdated')}: ${lastUpdated.toLocaleTimeString()}` : ''}
            </Button>
          </div>

          <TabsContent value="all" className="mt-0">
            <HolderTable rows={allRows} t={t} />
          </TabsContent>
          <TabsContent value="etfs" className="mt-0">
            <HolderTable rows={etfRows} t={t} />
          </TabsContent>
          <TabsContent value="companies" className="mt-0">
            <HolderTable rows={companyRows} t={t} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* ── Data note ─────────────────────────────────────────────────── */}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="h-3 w-3 shrink-0" />
        {t('dataNote', { date: BTC_ETF_DATA_AS_OF })}
      </p>

    </div>
  );
}
