'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Plus, Pencil, Trash2, TrendingUp, TrendingDown, Info,
  Wallet, RefreshCw, ChevronUp, ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { fetchBitcoinPrice, fetchTreasuryData } from '@/lib/services/bitcoin-service';
import type { TreasuryCompany } from '@/lib/services/bitcoin-service';
import { BTC_ETFS } from '@/lib/etf-data';
import {
  loadPortfolio, addEntry, updateEntry, deleteEntry,
  type PortfolioEntry, type AssetType,
} from '@/lib/portfolio-storage';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtUsd(n: number): string {
  if (Math.abs(n) >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3)  return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtBtc(n: number): string {
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(8);
}

function pnlClass(v: number): string {
  if (v > 0) return 'text-green-600 dark:text-green-400';
  if (v < 0) return 'text-red-500 dark:text-red-400';
  return 'text-muted-foreground';
}

// ─── Per-entry value calculation ──────────────────────────────────────────────

interface ComputedRow extends PortfolioEntry {
  totalInvested: number;
  impliedBtc: number;
  currentValue: number | null;   // null for companies without marketCap
  pnlUsd: number | null;
  pnlPct: number | null;
}

function computeRow(
  entry: PortfolioEntry,
  btcPrice: number,
  companyMap: Map<string, TreasuryCompany>,
): ComputedRow {
  const totalInvested = entry.shares * entry.costPerShare;

  if (entry.assetType === 'etf') {
    const etf = BTC_ETFS.find(e => e.ticker === entry.ticker);
    const btcPerShare = etf?.btcPerShare ?? 0;
    const impliedBtc = entry.shares * btcPerShare;
    const currentValue = impliedBtc * btcPrice;
    const pnlUsd = currentValue - totalInvested;
    const pnlPct = totalInvested > 0 ? (pnlUsd / totalInvested) * 100 : 0;
    return { ...entry, totalInvested, impliedBtc, currentValue, pnlUsd, pnlPct };
  }

  if (entry.assetType === 'btc') {
    const impliedBtc = entry.shares;
    const currentValue = btcPrice > 0 ? impliedBtc * btcPrice : null;
    const pnlUsd = currentValue !== null ? currentValue - totalInvested : null;
    const pnlPct = totalInvested > 0 && pnlUsd !== null ? (pnlUsd / totalInvested) * 100 : null;
    return { ...entry, totalInvested, impliedBtc, currentValue, pnlUsd, pnlPct };
  }

  // Company: use BTC book value as proxy for current value
  const company = companyMap.get(entry.ticker.toUpperCase());
  if (company?.marketCapUsd && company.marketCapUsd > 0) {
    const proRataFraction = totalInvested / company.marketCapUsd;
    const impliedBtc = company.totalHoldings * proRataFraction;
    const currentValue = impliedBtc * btcPrice;
    const pnlUsd = currentValue - totalInvested;
    const pnlPct = totalInvested > 0 ? (pnlUsd / totalInvested) * 100 : 0;
    return { ...entry, totalInvested, impliedBtc, currentValue, pnlUsd, pnlPct };
  }

  // Fallback: no live value available
  const impliedBtc = totalInvested > 0 && btcPrice > 0 ? totalInvested / btcPrice : 0;
  return { ...entry, totalInvested, impliedBtc, currentValue: null, pnlUsd: null, pnlPct: null };
}

// ─── Add / Edit sheet form ────────────────────────────────────────────────────

interface FormState {
  assetType: AssetType;
  ticker: string;
  name: string;
  shares: string;
  costPerShare: string;
  purchaseDate: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  assetType: 'btc', ticker: 'BTC', name: 'Bitcoin', shares: '', costPerShare: '', purchaseDate: '', notes: '',
};

function entryToForm(e: PortfolioEntry): FormState {
  return {
    assetType: e.assetType,
    ticker: e.ticker,
    name: e.name,
    shares: String(e.shares),
    costPerShare: String(e.costPerShare),
    purchaseDate: e.purchaseDate ?? '',
    notes: e.notes ?? '',
  };
}

interface AddEditSheetProps {
  open: boolean;
  editing: PortfolioEntry | null;
  companies: TreasuryCompany[];
  onClose: () => void;
  onSave: () => void;
  t: ReturnType<typeof useTranslations>;
}

function AddEditSheet({ open, editing, companies, onClose, onSave, t }: AddEditSheetProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    setForm(editing ? entryToForm(editing) : EMPTY_FORM);
    setErrors({});
  }, [editing, open]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleAssetSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const ticker = e.target.value;
    if (form.assetType === 'etf') {
      const etf = BTC_ETFS.find(f => f.ticker === ticker);
      set('ticker', ticker);
      if (etf) set('name', etf.name);
    } else {
      const company = companies.find(c => c.symbol === ticker);
      set('ticker', ticker);
      if (company) set('name', company.name);
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.ticker) errs.ticker = t('formRequired');
    if (!form.shares || isNaN(Number(form.shares)) || Number(form.shares) <= 0)
      errs.shares = t('formInvalidShares');
    if (!form.costPerShare || isNaN(Number(form.costPerShare)) || Number(form.costPerShare) <= 0)
      errs.costPerShare = t('formInvalidCost');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const payload = {
      assetType: form.assetType,
      ticker: form.ticker,
      name: form.name || form.ticker,
      shares: Number(form.shares),
      costPerShare: Number(form.costPerShare),
      purchaseDate: form.purchaseDate || undefined,
      notes: form.notes || undefined,
    };
    if (editing) updateEntry(editing.id, payload);
    else addEntry(payload);
    onSave();
  }

  const etfOptions = BTC_ETFS.map(e => ({ value: e.ticker, label: `${e.ticker} — ${e.name}` }));
  const companyOptions = companies.map(c => ({ value: c.symbol, label: `${c.symbol} — ${c.name}` }));
  const options = form.assetType === 'etf' ? etfOptions : companyOptions;

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>{editing ? t('editHolding') : t('addHolding')}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 flex-1">
          {/* Asset type */}
          <div className="flex gap-2">
            {(['btc', 'etf', 'company'] as AssetType[]).map(type => (
              <button
                key={type}
                onClick={() => { set('assetType', type); set('ticker', type === 'btc' ? 'BTC' : ''); set('name', type === 'btc' ? 'Bitcoin' : ''); }}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  form.assetType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {type === 'etf' ? t('typeEtf') : type === 'company' ? t('typeCompany') : t('typeBtc')}
              </button>
            ))}
          </div>

          {/* Asset picker */}
          {form.assetType !== 'btc' && (
          <div className="flex flex-col gap-1.5">
            <Label>{t('formAsset')}</Label>
            <select
              value={form.ticker}
              onChange={handleAssetSelect}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">{t('formSelectAsset')}</option>
              {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.ticker && <p className="text-xs text-destructive">{errors.ticker}</p>}
          </div>
          )}

          {/* Shares */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pt-shares">{form.assetType === 'btc' ? t('formAmountBtc') : t('formShares')}</Label>
            <Input
              id="pt-shares"
              type="number"
              min="0"
              step={form.assetType === 'btc' ? '0.00000001' : '0.001'}
              value={form.shares}
              onChange={e => set('shares', e.target.value)}
              placeholder="e.g. 100"
            />
            {errors.shares && <p className="text-xs text-destructive">{errors.shares}</p>}
          </div>

          {/* Cost per share */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pt-cost">{form.assetType === 'btc' ? t('formCostPerBtc') : t('formCostPerShare')}</Label>
            <Input
              id="pt-cost"
              type="number"
              min="0"
              step="0.01"
              value={form.costPerShare}
              onChange={e => set('costPerShare', e.target.value)}
              placeholder="e.g. 55.00"
            />
            {errors.costPerShare && <p className="text-xs text-destructive">{errors.costPerShare}</p>}
          </div>

          {/* Purchase date */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pt-date">{t('formPurchaseDate')}</Label>
            <Input
              id="pt-date"
              type="date"
              value={form.purchaseDate}
              onChange={e => set('purchaseDate', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pt-notes">{t('formNotes')}</Label>
            <Input
              id="pt-notes"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder={t('formNotesPlaceholder')}
            />
          </div>

          {/* ETF note */}
          {form.assetType === 'etf' && form.ticker && (
            <p className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              {t('etfNavNote')}
            </p>
          )}
          {form.assetType === 'company' && (
            <p className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              {t('companyNote')}
            </p>
          )}
          {form.assetType === 'btc' && (
            <p className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              {t('btcNote')}
            </p>
          )}
        </div>

        <SheetFooter className="mt-6 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
          <Button onClick={handleSave} className="flex-1">{editing ? t('save') : t('add')}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Sort state ───────────────────────────────────────────────────────────────

type SortKey = 'name' | 'assetType' | 'shares' | 'totalInvested' | 'currentValue' | 'pnlUsd' | 'pnlPct' | 'impliedBtc';

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <ChevronUp className="h-3 w-3 opacity-25" />;
  return asc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PortfolioTracker() {
  const t = useTranslations('portfolioTracker');

  const [entries, setEntries]       = useState<PortfolioEntry[]>([]);
  const [companies, setCompanies]   = useState<TreasuryCompany[]>([]);
  const [btcPrice, setBtcPrice]     = useState(0);
  const [loading, setLoading]       = useState(true);
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [editing, setEditing]       = useState<PortfolioEntry | null>(null);
  const [sortKey, setSortKey]       = useState<SortKey>('totalInvested');
  const [sortAsc, setSortAsc]       = useState(false);

  const reload = useCallback(() => setEntries(loadPortfolio()), []);

  useEffect(() => {
    reload();
    Promise.allSettled([fetchBitcoinPrice(), fetchTreasuryData()]).then(([price, treasury]) => {
      if (price.status === 'fulfilled') setBtcPrice(price.value.price);
      if (treasury.status === 'fulfilled') setCompanies(treasury.value.companies);
      setLoading(false);
    });
  }, [reload]);

  const companyMap = useMemo(
    () => new Map(companies.map(c => [c.symbol.toUpperCase(), c])),
    [companies],
  );

  const rows: ComputedRow[] = useMemo(
    () => entries.map(e => computeRow(e, btcPrice, companyMap)),
    [entries, btcPrice, companyMap],
  );

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const va = a[sortKey] ?? -Infinity;
      const vb = b[sortKey] ?? -Infinity;
      if (typeof va === 'number' && typeof vb === 'number') return sortAsc ? va - vb : vb - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [rows, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  function openAdd() { setEditing(null); setSheetOpen(true); }
  function openEdit(e: PortfolioEntry) { setEditing(e); setSheetOpen(true); }
  function handleDelete(id: string) { deleteEntry(id); reload(); }
  function handleSave() { reload(); setSheetOpen(false); }

  // ── Summary totals ──────────────────────────────────────────────────────────
  const totalInvested   = rows.reduce((s, r) => s + r.totalInvested, 0);
  const totalCurrentVal = rows.reduce((s, r) => s + (r.currentValue ?? r.totalInvested), 0);
  const totalPnl        = totalCurrentVal - totalInvested;
  const totalPnlPct     = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const totalImpliedBtc = rows.reduce((s, r) => s + r.impliedBtc, 0);

  const thClass = 'px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap';
  const tdClass = 'px-3 py-3 text-sm align-top';

  if (!loading && entries.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-semibold text-muted-foreground">{t('emptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">{t('emptySubtitle')}</p>
          </div>
          <Button onClick={openAdd} className="gap-2 mt-2">
            <Plus className="h-4 w-4" />
            {t('addHolding')}
          </Button>
        </div>
        <AddEditSheet
          open={sheetOpen} editing={editing} companies={companies}
          onClose={() => setSheetOpen(false)} onSave={handleSave} t={t}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* ── Header action ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('holdingsCount', { count: entries.length })}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); Promise.allSettled([fetchBitcoinPrice(), fetchTreasuryData()]).then(([price, treasury]) => { if (price.status === 'fulfilled') setBtcPrice(price.value.price); if (treasury.status === 'fulfilled') setCompanies(treasury.value.companies); setLoading(false); }); }} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              {t('refresh')}
            </Button>
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              {t('addHolding')}
            </Button>
          </div>
        </div>

        {/* ── Summary cards ────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-4">
            {[1,2,3,4].map(i => (
              <Card key={i}><CardContent className="pt-6"><div className="h-7 w-20 animate-pulse rounded bg-muted mb-2" /><div className="h-4 w-28 animate-pulse rounded bg-muted" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{t('totalInvested')}</p>
                <p className="text-2xl font-bold">{fmtUsd(totalInvested)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{t('currentValue')}</p>
                <p className="text-2xl font-bold">{fmtUsd(totalCurrentVal)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{t('unrealizedPnl')}</p>
                <p className={`text-2xl font-bold flex items-center gap-1 ${pnlClass(totalPnl)}`}>
                  {totalPnl >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {totalPnl >= 0 ? '+' : ''}{fmtUsd(totalPnl)}
                </p>
                <p className={`text-sm ${pnlClass(totalPnlPct)}`}>
                  {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{t('impliedBtc')}</p>
                <p className="text-2xl font-bold">₿ {fmtBtc(totalImpliedBtc)}</p>
                {btcPrice > 0 && (
                  <p className="text-sm text-muted-foreground">@ {fmtUsd(btcPrice)}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Holdings table ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('holdingsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    {(
                      [
                        ['name',         t('colAsset')],
                        ['assetType',    t('colType')],
                        ['shares',       t('colShares')],
                        ['totalInvested',t('colInvested')],
                        ['currentValue', t('colCurrentValue')],
                        ['pnlUsd',       t('colPnl')],
                        ['impliedBtc',   t('colBtc')],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <th key={key} className={thClass} onClick={() => handleSort(key)}>
                        <span className="inline-flex items-center gap-1">
                          {label}
                          <SortIcon active={sortKey === key} asc={sortAsc} />
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-2 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sorted.map(row => (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className={tdClass}>
                        <div className="font-medium leading-tight">{row.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{row.ticker}</div>
                        {row.purchaseDate && (
                          <div className="text-xs text-muted-foreground">{row.purchaseDate}</div>
                        )}
                      </td>
                      <td className={tdClass}>
                        <Badge
                          variant="secondary"
                          className={
                            row.assetType === 'etf'
                              ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20'
                              : row.assetType === 'btc'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          }
                        >
                          {row.assetType === 'etf' ? t('typeEtf') : row.assetType === 'btc' ? t('typeBtc') : t('typeCompany')}
                        </Badge>
                      </td>
                      <td className={`${tdClass} font-mono`}>{row.shares.toLocaleString('en-US')}</td>
                      <td className={`${tdClass} font-mono`}>
                        <div>{fmtUsd(row.totalInvested)}</div>
                        <div className="text-xs text-muted-foreground">{fmtUsd(row.costPerShare)}/share</div>
                      </td>
                      <td className={`${tdClass} font-mono`}>
                        {row.currentValue !== null ? fmtUsd(row.currentValue) : (
                          <span className="text-xs text-muted-foreground">{t('noLivePrice')}</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        {row.pnlUsd !== null ? (
                          <div className={`font-mono ${pnlClass(row.pnlUsd)}`}>
                            {row.pnlUsd >= 0 ? '+' : ''}{fmtUsd(row.pnlUsd)}
                            <div className="text-xs">
                              {row.pnlPct! >= 0 ? '+' : ''}{row.pnlPct!.toFixed(2)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className={`${tdClass} font-mono`}>₿ {fmtBtc(row.impliedBtc)}</td>
                      <td className={`${tdClass}`}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(row.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── Disclaimer ───────────────────────────────────────────────── */}
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          {t('disclaimer')}
        </p>

      </div>

      <AddEditSheet
        open={sheetOpen} editing={editing} companies={companies}
        onClose={() => setSheetOpen(false)} onSave={handleSave} t={t}
      />
    </>
  );
}
