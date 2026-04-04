'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, Shield, KeyRound, ExternalLink } from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { parseExtendedKey, type DerivedAddress, type AddressType, type Network } from '@/lib/xpub-service';

// ─── Example keys ─────────────────────────────────────────────────────────────
// All derived from an all-zeros 64-byte seed for safe public demonstration.

const EXAMPLE_KEYS = [
  {
    prefix: 'xpub',
    label: 'xpub — Legacy P2PKH (BIP44)',
    network: 'mainnet' as Network,
    key: 'xpub6CmEVMqHxkaGqdu3zxNRTx3fuExwg95T3HN3dY5t9oi3sLYzVupt6HTJXXZGWVjBQTwD7ZJi6HyM8BxxUhF8aqA14PBkzX6su56szCmxJ5o',
  },
  {
    prefix: 'ypub',
    label: 'ypub — Nested SegWit P2SH-P2WPKH (BIP49)',
    network: 'mainnet' as Network,
    key: 'ypub6XurjiXvLSZEcopUo3R4rGXWxj15Kq9UcDcPhE9pPMiWDNoXwhcngr37yNrWDp3zeDnMYS66hy11grP5fXW5wcFU4jTkLgRAVUosiWW5RHk',
  },
  {
    prefix: 'zpub',
    label: 'zpub — Native SegWit P2WPKH (BIP84)',
    network: 'mainnet' as Network,
    key: 'zpub6rrCCKCXLy8rWS4CYZN8rw8uLnefWzSAF2EJkCBLPoXLH4vzPJDntjtDABCtHrq6vky6Uu1xdq6hKcPD4DahNn49TYhdgW8MNpekg99MvkT',
  },
  {
    prefix: 'tpub',
    label: 'tpub — Testnet Legacy P2PKH (BIP44)',
    network: 'testnet' as Network,
    key: 'tpubDD8s1beyg2Xj7S5uT9MWfsP3EN4bfXaWauxLz692ViTwcdDha8fyEj88mZe42zgRCNU7j8padPoPpNTZsZ6NUGcJ7yw4g3m7V2hHkCmHLGP',
  },
  {
    prefix: 'upub',
    label: 'upub — Testnet Nested SegWit (BIP49)',
    network: 'testnet' as Network,
    key: 'upub5EaoX3rFjiPKDd41TcGa1v9WGrRHZMBUwmXWZeaGsLCyzyYcw4xYCbQZtZ2AEBSK1fK8YXhrsKap9hvpnjr2kfX4bNg4139DQaZJAJrgHtu',
  },
  {
    prefix: 'vpub',
    label: 'vpub — Testnet Native SegWit (BIP84)',
    network: 'testnet' as Network,
    key: 'vpub5ZX8yeWrkExw7FHjD8De2aktev4skWUAaa9Rccbnsn1p4fg5NfZYQVFf5MNYJEDRJCVsUzdioBgVnTvxBRveBqKjzBuwLrrQHvQB7qKTCZF',
  },
] as const;

// ─── Styling maps ─────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<AddressType, string> = {
  'P2PKH':        'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'P2SH-P2WPKH':  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'P2WPKH':       'bg-green-500/15 text-green-400 border-green-500/30',
  'P2SH-P2WSH':   'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'P2WSH':        'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

const PREFIX_BADGE: Record<string, string> = {
  xpub: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25',
  ypub: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
  zpub: 'bg-green-500/10 text-green-300 border-green-500/25',
  tpub: 'bg-orange-500/10 text-orange-300 border-orange-500/25',
  upub: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  vpub: 'bg-teal-500/10 text-teal-300 border-teal-500/25',
};

interface KeyMeta {
  addressType: AddressType;
  network: Network;
  derivationPath: string;
}

export function XpubAddressGenerator() {
  const t = useTranslations('xpubGenerator');
  const [xpub, setXpub] = useState('');
  const [addresses, setAddresses] = useState<DerivedAddress[]>([]);
  const [meta, setMeta] = useState<KeyMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  function generate(key?: string) {
    const input = (key ?? xpub).trim();
    if (key) setXpub(key);
    setError(null);
    try {
      const info = parseExtendedKey(input);
      setMeta({
        addressType: info.addressType,
        network: info.network,
        derivationPath: info.derivationPath,
      });
      setAddresses(
        Array.from({ length: 10 }, (_, i) => ({
          index: i,
          address: info.getAddress(i),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidXpub'));
      setAddresses([]);
      setMeta(null);
    }
  }

  function loadMore() {
    try {
      const info = parseExtendedKey(xpub.trim());
      setAddresses((prev) => [
        ...prev,
        ...Array.from({ length: 10 }, (_, i) => ({
          index: prev.length + i,
          address: info.getAddress(prev.length + i),
        })),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalidXpub'));
    }
  }

  async function copyAddress(index: number, address: string) {
    await navigator.clipboard.writeText(address);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* ── Left column ─────────────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" />
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xpub-input">{t('placeholder')}</Label>
              <Textarea
                id="xpub-input"
                value={xpub}
                onChange={(e) => { setXpub(e.target.value); setError(null); }}
                placeholder="xpub6… / ypub6… / zpub6… / tpub… / upub… / vpub…"
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={() => generate()} disabled={!xpub.trim()}>
              {t('generate')}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Detected key metadata */}
        {meta && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('detectedType')}</p>
                  <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[meta.addressType]}`}>
                    {meta.addressType}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('network')}</p>
                  <Badge variant={meta.network === 'mainnet' ? 'default' : 'secondary'}>
                    {meta.network === 'mainnet' ? t('mainnet') : t('testnet')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('derivationPath')}</p>
                  <span className="font-mono text-xs text-muted-foreground">{meta.derivationPath}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Example keys panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('examples')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{t('exampleNote')}</p>
            {EXAMPLE_KEYS.map(({ prefix, label, network, key }) => (
              <button
                key={prefix}
                onClick={() => generate(key)}
                className="flex w-full items-center gap-3 rounded-md border border-border p-2.5 text-left text-sm hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <span className={`shrink-0 inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-semibold ${PREFIX_BADGE[prefix] ?? ''}`}>
                  {prefix}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{label}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{key}</p>
                </div>
                <Badge
                  variant={network === 'mainnet' ? 'default' : 'secondary'}
                  className="shrink-0 text-xs"
                >
                  {network === 'mainnet' ? t('mainnet') : t('testnet')}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Security note */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>{t('securityWarning')}</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
              {([1, 2, 3, 4] as const).map((n) => (
                <li key={n}>{t(`securityTip${n}`)}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* ── Right column — derived addresses ─────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle className="text-base">{t('address')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {addresses.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-16 px-4 py-3 text-left font-medium text-muted-foreground">{t('index')}</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('address')}</th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {addresses.map(({ index, address }) => (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground">{index}</td>
                      <td className="px-4 py-2.5 font-mono text-xs break-all">
                        <Link
                          href={`/tools/address-validator?address=${encodeURIComponent(address)}`}
                          className="inline-flex items-center gap-1 hover:text-primary transition-colors group"
                          title="Validate this address"
                        >
                          {address}
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyAddress(index, address)}
                          aria-label={t('copy')}
                        >
                          {copied === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                <KeyRound className="h-12 w-12 opacity-20" />
                <p className="text-sm">{t('placeholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {addresses.length > 0 && (
          <Button variant="outline" onClick={loadMore}>
            {t('loadMore')}
          </Button>
        )}
      </div>
    </div>
  );
}
