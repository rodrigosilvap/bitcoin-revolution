'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Activity, Copy, Check, ExternalLink, RefreshCw, Square } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { classifyBitcoinAddress } from '@/lib/address-validator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonitorTx {
  txid: string;
  valueSat: number;
  confirmed: boolean;
  confirmations: number;
  blockHeight: number | null;
  blockTime: number | null;
}

interface MonitorData {
  address: string;
  balanceSat: number;
  receivedSat: number;
  pendingSat: number;
  tipHeight: number;
  txs: MonitorTx[];
}

type WatchStatus = 'idle' | 'watching' | 'unconfirmed' | 'confirmed';

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 15; // seconds
const CONFIRM_THRESHOLD = 6;

const EXAMPLE_ADDRESSES = [
  {
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf3',
    label: 'Satoshi genesis block',
  },
  {
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    label: 'Binance cold wallet',
  },
  {
    address: '3FHNBLobJnbCPujupCCabgx3ViZNJryquN',
    label: 'MicroStrategy treasury',
  },
  {
    address: 'bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6',
    label: 'Grayscale GBTC',
  },
  {
    address: '385cR5DM96n1HvBDMnLKZgKv66xs37g1aZ',
    label: 'Bitfinex hot wallet',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sat(n: number) { return n.toLocaleString('en-US') + ' sat'; }
function btc(n: number) { return (n / 1e8).toFixed(8) + ' BTC'; }
function short(s: string, n = 10) { return s.length > n * 2 + 3 ? `${s.slice(0, n)}…${s.slice(-n)}` : s; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      aria-label="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function ConfirmProgress({ confirmations }: { confirmations: number }) {
  const filled = Math.min(confirmations, CONFIRM_THRESHOLD);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: CONFIRM_THRESHOLD }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-4 rounded-sm transition-colors ${
            i < filled ? 'bg-green-500' : 'bg-muted'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {confirmations >= CONFIRM_THRESHOLD ? `${CONFIRM_THRESHOLD}+` : `${confirmations}/${CONFIRM_THRESHOLD}`}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PaymentMonitor() {
  const t = useTranslations('paymentMonitor');
  const searchParams = useSearchParams();

  const [address, setAddress] = useState('');
  const [amountBtc, setAmountBtc] = useState('');
  const [addrValid, setAddrValid] = useState<boolean | null>(null);
  const [status, setStatus] = useState<WatchStatus>('idle');
  const [data, setData] = useState<MonitorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(POLL_INTERVAL);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const seenTxIds = useRef<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const addrDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Pre-fill from URL params ──
  useEffect(() => {
    const a = searchParams.get('address');
    const amt = searchParams.get('amount');
    if (a) { setAddress(a); validateAddress(a); }
    if (amt) setAmountBtc(amt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Address validation (debounced) ──
  const validateAddress = useCallback((val: string) => {
    if (addrDebounceRef.current) clearTimeout(addrDebounceRef.current);
    if (!val.trim()) { setAddrValid(null); return; }
    addrDebounceRef.current = setTimeout(async () => {
      try {
        const result = await classifyBitcoinAddress(val.trim());
        setAddrValid(result.valid);
      } catch {
        setAddrValid(false);
      }
    }, 300);
  }, []);

  function handleAddressChange(val: string) {
    setAddress(val);
    validateAddress(val);
  }

  // ── Poll ──
  const poll = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`/api/bitcoin/payment-monitor?address=${encodeURIComponent(addr)}`);
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? t('errorFetching'));
      }
      const json = (await res.json()) as MonitorData;
      setData(json);
      setError(null);
      setLastChecked(new Date());

      // Detect incoming txs and update status
      const newTxs = json.txs.filter((tx) => !seenTxIds.current.has(tx.txid));
      newTxs.forEach((tx) => seenTxIds.current.add(tx.txid));

      const anyConfirmed = json.txs.some((tx) => tx.confirmations >= CONFIRM_THRESHOLD);
      const anyUnconfirmed = json.txs.some((tx) => tx.valueSat > 0 && !anyConfirmed);

      setStatus(anyConfirmed ? 'confirmed' : anyUnconfirmed ? 'unconfirmed' : 'watching');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorFetching'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // ── Start / Stop ──
  function startWatching() {
    if (!address.trim() || addrValid !== true) return;
    seenTxIds.current.clear();
    setData(null);
    setError(null);
    setStatus('watching');
    setCountdown(POLL_INTERVAL);
    setLoading(true);

    poll(address.trim());

    pollRef.current = setInterval(() => {
      setLoading(true);
      poll(address.trim());
      setCountdown(POLL_INTERVAL);
    }, POLL_INTERVAL * 1000);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : POLL_INTERVAL));
    }, 1000);

    // Update URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set('address', address.trim());
    if (amountBtc.trim()) url.searchParams.set('amount', amountBtc.trim());
    else url.searchParams.delete('amount');
    window.history.replaceState({}, '', url.toString());
  }

  function stopWatching() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    pollRef.current = null;
    countdownRef.current = null;
    setStatus('idle');
    setCountdown(POLL_INTERVAL);
  }

  // Cleanup on unmount
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // ── Computed ──
  const isWatching = status !== 'idle';
  const expectedSat = amountBtc ? Math.round(parseFloat(amountBtc) * 1e8) : null;
  const incomingTxs = data?.txs.filter((tx) => tx.valueSat > 0) ?? [];
  const totalReceivedMatchSat = incomingTxs.reduce((s, tx) => s + tx.valueSat, 0);

  function getMatchBadge() {
    if (!expectedSat || incomingTxs.length === 0) return null;
    if (totalReceivedMatchSat >= expectedSat) {
      return totalReceivedMatchSat > expectedSat
        ? <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">{t('matchExcess')}</Badge>
        : <Badge className="bg-green-500/15 text-green-400 border-green-500/30">{t('matchFull')}</Badge>;
    }
    return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">{t('matchPartial')}</Badge>;
  }

  function getStatusBadge() {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-sm px-3 py-1">{t('statusConfirmed')}</Badge>;
      case 'unconfirmed':
        return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-sm px-3 py-1">{t('statusUnconfirmed')}</Badge>;
      case 'watching':
        return <Badge variant="secondary" className="text-sm px-3 py-1">{t('statusWaiting')}</Badge>;
      default:
        return null;
    }
  }

  async function copyShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('address', address.trim());
    if (amountBtc.trim()) url.searchParams.set('amount', amountBtc.trim());
    else url.searchParams.delete('amount');
    await navigator.clipboard.writeText(url.toString());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  }

  return (
    <div className="space-y-6">

      {/* ── Input card ── */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pm-address">{t('address')}</Label>
            <div className="relative flex items-center gap-2">
              <Input
                id="pm-address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder={t('addressPlaceholder')}
                className="font-mono text-sm pr-24"
                disabled={isWatching}
              />
              {addrValid === true && (
                <Badge className="absolute right-3 bg-green-500/15 text-green-400 border-green-500/30 text-xs pointer-events-none">
                  <Check className="h-3 w-3 mr-1" /> Valid
                </Badge>
              )}
              {addrValid === false && (
                <Badge className="absolute right-3 bg-destructive/15 text-destructive border-destructive/30 text-xs pointer-events-none">
                  {t('invalidAddress')}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm-amount">
              {t('expectedAmount')}
              <span className="ml-1 text-xs text-muted-foreground">({t('optional')})</span>
            </Label>
            <Input
              id="pm-amount"
              type="number"
              min="0"
              step="0.00000001"
              value={amountBtc}
              onChange={(e) => setAmountBtc(e.target.value)}
              placeholder={t('amountPlaceholder')}
              className="font-mono text-sm"
              disabled={isWatching}
            />
          </div>

          <div className="flex gap-2 pt-1">
            {!isWatching ? (
              <Button
                onClick={startWatching}
                disabled={!address.trim() || addrValid !== true}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                {t('startWatching')}
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopWatching} className="gap-2">
                <Square className="h-4 w-4" />
                {t('stopWatching')}
              </Button>
            )}

            {address.trim() && addrValid === true && (
              <Button variant="outline" size="icon" onClick={copyShareUrl} title={t('copyUrl')}>
                {copiedUrl ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Example addresses panel ── */}
      {!isWatching && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('examplesTitle')}</CardTitle>
              <span className="text-xs text-muted-foreground">{t('examplesHint')}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {EXAMPLE_ADDRESSES.map(({ address: addr, label }) => (
              <button
                key={addr}
                onClick={() => handleAddressChange(addr)}
                className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-xs hover:bg-muted/60 transition-colors group border border-transparent hover:border-border"
              >
                <span className="font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate mr-3">
                  {addr}
                </span>
                <span className="shrink-0 text-muted-foreground/70 group-hover:text-muted-foreground text-[11px]">
                  {label}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Status banner ── */}
      {isWatching && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-3">
            {loading
              ? <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              : <Activity className="h-4 w-4 text-primary" />
            }
            {getStatusBadge()}
            {getMatchBadge()}
          </div>
          <div className="flex flex-col items-end text-xs text-muted-foreground">
            {!loading && <span>{t('nextCheck', { seconds: countdown })}</span>}
            {lastChecked && <span>{t('lastChecked', { time: lastChecked.toLocaleTimeString() })}</span>}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* ── Loading skeleton ── */}
      {loading && !data && (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {/* ── Summary cards ── */}
      {data && !loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Balance', value: btc(data.balanceSat), sub: sat(data.balanceSat) },
            { label: t('receivedLabel'), value: btc(data.receivedSat), sub: sat(data.receivedSat) },
            { label: 'Pending', value: btc(data.pendingSat), sub: sat(data.pendingSat) },
          ].map(({ label, value, sub }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-mono text-sm font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Incoming transactions ── */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('incomingTxs')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {incomingTxs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('noPayments')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('txid')}</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">{t('received')}</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('confirmations')}</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">{t('blockTime')}</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingTxs.map((tx) => (
                      <tr key={tx.txid} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-3 font-mono">
                          <span className="flex items-center gap-1">
                            {short(tx.txid)}
                            <CopyButton text={tx.txid} />
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-green-400">
                          +{btc(tx.valueSat)}
                        </td>
                        <td className="px-3 py-3">
                          {tx.confirmed
                            ? <ConfirmProgress confirmations={tx.confirmations} />
                            : <Badge variant="secondary" className="text-xs">{t('unconfirmed')}</Badge>
                          }
                        </td>
                        <td className="px-3 py-3 text-right text-muted-foreground">
                          {tx.blockTime
                            ? new Date(tx.blockTime * 1000).toLocaleString()
                            : '—'
                          }
                        </td>
                        <td className="px-3 py-3 text-right">
                          <a
                            href={`https://mempool.space/tx/${tx.txid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Empty state ── */}
      {!isWatching && !data && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Activity className="h-12 w-12 opacity-20" />
          <p className="text-sm">{t('emptyState')}</p>
        </div>
      )}
    </div>
  );
}
