'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Copy, Check, ExternalLink, Clock, Hash, Layers, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TxStatus { confirmed: boolean; block_height?: number; block_hash?: string; block_time?: number }
interface Vout { scriptpubkey_address?: string; scriptpubkey_type: string; value: number }
interface Vin  { txid: string; vout: number; is_coinbase: boolean; prevout: Vout | null }

interface MempoolTx {
  txid: string; version: number; locktime: number; size: number; weight: number;
  fee: number; vin: Vin[]; vout: Vout[]; status: TxStatus;
}
interface MempoolBlock {
  id: string; height: number; timestamp: number; tx_count: number;
  size: number; weight: number; merkle_root: string; previousblockhash: string | null;
  nonce: number; bits: number; difficulty: number;
}
interface AddressStats { funded_txo_count: number; funded_txo_sum: number; spent_txo_count: number; spent_txo_sum: number; tx_count: number }
interface MempoolAddress {
  address: string; chain_stats: AddressStats; mempool_stats: AddressStats; recentTxs: MempoolTx[];
}

type ExplorerResult =
  | { type: 'tx';      data: MempoolTx }
  | { type: 'block';   data: MempoolBlock }
  | { type: 'address'; data: MempoolAddress };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sat(n: number) { return n.toLocaleString('en-US') + ' sat'; }
function btc(n: number) { return (n / 1e8).toFixed(8) + ' BTC'; }
function ts(unix: number) { return new Date(unix * 1000).toLocaleString(); }
function short(s: string, n = 12) { return s.length > n * 2 + 3 ? `${s.slice(0, n)}…${s.slice(-n)}` : s; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 font-mono text-xs break-all">{value}<CopyButton text={value} /></span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

// ─── Result panels ────────────────────────────────────────────────────────────

function TxPanel({ tx }: { tx: MempoolTx }) {
  const totalOut = tx.vout.reduce((s, v) => s + v.value, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={tx.status.confirmed ? 'default' : 'secondary'} className={tx.status.confirmed ? 'bg-green-500/15 text-green-400 border-green-500/30' : ''}>
          {tx.status.confirmed ? 'Confirmed' : 'Unconfirmed'}
        </Badge>
        {tx.status.block_height && <Badge variant="outline">Block #{tx.status.block_height.toLocaleString()}</Badge>}
        {tx.vin[0]?.is_coinbase && <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Coinbase</Badge>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Details</CardTitle></CardHeader>
          <CardContent className="space-y-0 pt-0">
            <HashRow label="TXID" value={tx.txid} />
            {tx.status.block_hash && <HashRow label="Block Hash" value={tx.status.block_hash} />}
            <StatRow label="Size" value={`${tx.size} bytes / ${tx.weight} WU`} />
            <StatRow label="Fee" value={tx.fee ? `${sat(tx.fee)} (${(tx.fee / tx.size).toFixed(1)} sat/vB)` : '0 (coinbase)'} />
            <StatRow label="Version" value={tx.version} />
            <StatRow label="Locktime" value={tx.locktime} />
            {tx.status.block_time && <StatRow label="Time" value={ts(tx.status.block_time)} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Value</CardTitle></CardHeader>
          <CardContent className="space-y-0 pt-0">
            <StatRow label="Inputs" value={tx.vin.length} />
            <StatRow label="Outputs" value={tx.vout.length} />
            <StatRow label="Total output" value={btc(totalOut)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider"><ArrowDownLeft className="h-3.5 w-3.5" />Inputs ({tx.vin.length})</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {tx.vin.slice(0, 8).map((vin, i) => (
              <div key={i} className="rounded-md bg-muted/30 p-2 text-xs">
                {vin.is_coinbase
                  ? <span className="text-yellow-400">Coinbase (newly minted BTC)</span>
                  : <>
                      <div className="flex items-center gap-1 font-mono text-muted-foreground">
                        {short(vin.txid, 10)}:{vin.vout}<CopyButton text={vin.txid} />
                      </div>
                      {vin.prevout?.scriptpubkey_address && (
                        <div className="mt-0.5 flex items-center gap-1 font-mono">
                          {short(vin.prevout.scriptpubkey_address, 10)}
                          <span className="ml-auto text-muted-foreground">{btc(vin.prevout.value)}</span>
                        </div>
                      )}
                    </>
                }
              </div>
            ))}
            {tx.vin.length > 8 && <p className="text-xs text-muted-foreground text-center">+{tx.vin.length - 8} more inputs</p>}
          </CardContent>
        </Card>

        {/* Outputs */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider"><ArrowUpRight className="h-3.5 w-3.5" />Outputs ({tx.vout.length})</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {tx.vout.slice(0, 8).map((vout, i) => (
              <div key={i} className="rounded-md bg-muted/30 p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono truncate">
                    {vout.scriptpubkey_address ? short(vout.scriptpubkey_address, 10) : <span className="text-muted-foreground">{vout.scriptpubkey_type}</span>}
                  </span>
                  <span className="shrink-0 text-green-400">{btc(vout.value)}</span>
                </div>
              </div>
            ))}
            {tx.vout.length > 8 && <p className="text-xs text-muted-foreground text-center">+{tx.vout.length - 8} more outputs</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BlockPanel({ block }: { block: MempoolBlock }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="default">Block #{block.height.toLocaleString()}</Badge>
        <Badge variant="outline">{block.tx_count.toLocaleString()} transactions</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Block Info</CardTitle></CardHeader>
          <CardContent className="space-y-0 pt-0">
            <HashRow label="Hash" value={block.id} />
            <HashRow label="Merkle Root" value={block.merkle_root} />
            {block.previousblockhash && <HashRow label="Previous Block" value={block.previousblockhash} />}
            <StatRow label="Timestamp" value={ts(block.timestamp)} />
            <StatRow label="Transactions" value={block.tx_count.toLocaleString()} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Technical</CardTitle></CardHeader>
          <CardContent className="space-y-0 pt-0">
            <StatRow label="Size" value={`${(block.size / 1024).toFixed(1)} KB`} />
            <StatRow label="Weight" value={`${(block.weight / 1000).toFixed(1)} KWU`} />
            <StatRow label="Difficulty" value={block.difficulty.toExponential(3)} />
            <StatRow label="Bits" value={block.bits} />
            <StatRow label="Nonce" value={block.nonce.toLocaleString()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AddressPanel({ addr }: { addr: MempoolAddress }) {
  const balance = addr.chain_stats.funded_txo_sum - addr.chain_stats.spent_txo_sum;
  const mempoolBalance = addr.mempool_stats.funded_txo_sum - addr.mempool_stats.spent_txo_sum;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono">{addr.address}</Badge>
        <CopyButton text={addr.address} />
        {mempoolBalance !== 0 && (
          <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
            {mempoolBalance > 0 ? '+' : ''}{btc(mempoolBalance)} pending
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Balance', value: btc(balance), sub: sat(balance) },
          { label: 'Total Received', value: btc(addr.chain_stats.funded_txo_sum) },
          { label: 'Total Sent', value: btc(addr.chain_stats.spent_txo_sum) },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-mono text-sm font-bold text-primary">{value}</p>
              {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">
            On-chain Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 pt-0">
          <StatRow label="Total transactions" value={addr.chain_stats.tx_count.toLocaleString()} />
          <StatRow label="UTXOs received" value={addr.chain_stats.funded_txo_count.toLocaleString()} />
          <StatRow label="UTXOs spent" value={addr.chain_stats.spent_txo_count.toLocaleString()} />
          <StatRow label="Unspent UTXOs" value={(addr.chain_stats.funded_txo_count - addr.chain_stats.spent_txo_count).toLocaleString()} />
        </CardContent>
      </Card>

      {addr.recentTxs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">
              Recent Transactions (last {addr.recentTxs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">TXID</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Block</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {addr.recentTxs.map((tx) => (
                  <tr key={tx.txid} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono">{short(tx.txid, 10)}<CopyButton text={tx.txid} /></td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {tx.status.block_height ? `#${tx.status.block_height.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Badge variant={tx.status.confirmed ? 'default' : 'secondary'} className={`text-xs ${tx.status.confirmed ? 'bg-green-500/15 text-green-400 border-green-500/30' : ''}`}>
                        {tx.status.confirmed ? 'Confirmed' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const EXAMPLES = [
  { label: 'Genesis Block', value: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f' },
  { label: 'Genesis Tx (Coinbase)', value: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b' },
  { label: 'Satoshi Address', value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  { label: 'Block Height', value: '840000' },
];

export function BlockExplorer() {
  const t = useTranslations('blockExplorer');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ExplorerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(q?: string) {
    const val = (q ?? query).trim();
    if (!val) return;
    if (q) setQuery(q);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/bitcoin/explorer?q=${encodeURIComponent(val)}`);
      const json = await res.json() as ExplorerResult & { error?: string };
      if (!res.ok || json.error) throw new Error((json as { error?: string }).error ?? t('notFound'));
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('notFound'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder={t('placeholder')}
              className="font-mono text-sm"
            />
            <Button onClick={() => search()} disabled={!query.trim() || loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader><CardTitle className="text-sm">{t('examples')}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {EXAMPLES.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => search(value)}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{label}</span>
              <span className="font-mono text-muted-foreground">{short(value, 8)}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {/* Result */}
      {!loading && result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {result.type === 'tx'      && <><Hash className="h-3.5 w-3.5" /><span>{t('resultTx')}</span></>}
            {result.type === 'block'   && <><Layers className="h-3.5 w-3.5" /><span>{t('resultBlock')}</span></>}
            {result.type === 'address' && <><ExternalLink className="h-3.5 w-3.5" /><span>{t('resultAddress')}</span></>}
            <a
              href={`https://mempool.space/${result.type === 'tx' ? 'tx' : result.type === 'block' ? 'block' : 'address'}/${result.type === 'tx' ? result.data.txid : result.type === 'block' ? result.data.id : result.data.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />{t('viewOnMempool')}
            </a>
          </div>

          {result.type === 'tx'      && <TxPanel tx={result.data} />}
          {result.type === 'block'   && <BlockPanel block={result.data} />}
          {result.type === 'address' && <AddressPanel addr={result.data} />}
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Clock className="h-12 w-12 opacity-20" />
          <p className="text-sm">{t('emptyState')}</p>
        </div>
      )}
    </div>
  );
}
