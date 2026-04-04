'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { classifyBitcoinAddress } from '@/lib/address-validator';
import { Link } from '@/navigation';

// ─── BIP21 URI builder ────────────────────────────────────────────────────────

function buildUri(address: string, amount: string, label: string, message: string): string {
  const params: string[] = [];
  const num = parseFloat(amount);
  if (num > 0) params.push(`amount=${num.toFixed(8).replace(/\.?0+$/, '')}`);
  if (label.trim())   params.push(`label=${encodeURIComponent(label.trim())}`);
  if (message.trim()) params.push(`message=${encodeURIComponent(message.trim())}`);
  return `bitcoin:${address}${params.length ? '?' + params.join('&') : ''}`;
}

// ─── Examples ─────────────────────────────────────────────────────────────────

const EXAMPLE_ADDRESSES = [
  { label: 'Legacy (P2PKH)',     address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  { label: 'Nested SegWit (P2SH)', address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' },
  { label: 'Native SegWit (P2WPKH)', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function PaymentUriGenerator() {
  const t = useTranslations('paymentUri');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');
  const [addrValid, setAddrValid] = useState<boolean | null>(null);
  const [addrType, setAddrType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const uri = useMemo(() => {
    if (!address.trim() || addrValid === false) return '';
    return buildUri(address.trim(), amount, label, message);
  }, [address, amount, label, message, addrValid]);

  async function validateAddress(addr: string) {
    if (!addr.trim()) { setAddrValid(null); setAddrType(null); return; }
    const result = await classifyBitcoinAddress(addr.trim());
    setAddrValid(result.valid);
    setAddrType(result.valid ? result.type : null);
  }

  function handleAddressChange(val: string) {
    setAddress(val);
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    debounceRef[1](setTimeout(() => validateAddress(val), 300));
  }

  function useExample(addr: string) {
    setAddress(addr);
    validateAddress(addr);
  }

  async function copyUri() {
    if (!uri) return;
    await navigator.clipboard.writeText(uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setAddress(''); setAmount(''); setLabel(''); setMessage('');
    setAddrValid(null); setAddrType(null);
  }

  const amountNum = parseFloat(amount);
  const amountValid = !amount || (!isNaN(amountNum) && amountNum > 0 && amountNum <= 21000000);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* ── Left: form ──────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              {t('formTitle')}
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />{t('reset')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address */}
            <div className="space-y-1.5">
              <Label>{t('address')} <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="1A1zP1…  /  3J98t1…  /  bc1q…"
                  className={`font-mono text-sm pr-24 ${addrValid === false ? 'border-destructive focus-visible:ring-destructive' : addrValid === true ? 'border-green-500/50' : ''}`}
                />
                {addrType && (
                  <Badge className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-green-500/15 text-green-400 border-green-500/30">
                    {addrType}
                  </Badge>
                )}
              </div>
              {addrValid === false && (
                <p className="text-xs text-destructive">{t('invalidAddress')}</p>
              )}
              {addrValid === true && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  ✓ {t('validAddress')}
                  {' · '}
                  <Link
                    href={`/tools/address-validator?address=${encodeURIComponent(address)}`}
                    className="underline hover:text-primary transition-colors"
                  >
                    {t('validateLink')}
                  </Link>
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label>{t('amount')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.001"
                  min="0"
                  step="0.00000001"
                  className={`pr-14 ${!amountValid ? 'border-destructive' : ''}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">BTC</span>
              </div>
              {!amountValid && <p className="text-xs text-destructive">{t('invalidAmount')}</p>}
              {amount && amountValid && amountNum > 0 && (
                <p className="text-xs text-muted-foreground">
                  = {(amountNum * 1e8).toLocaleString('en-US', { maximumFractionDigits: 0 })} satoshis
                </p>
              )}
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <Label>{t('label')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t('labelPlaceholder')}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{t('labelHint')}</p>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label>{t('message')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{t('messageHint')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Example addresses */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('exampleAddresses')}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {EXAMPLE_ADDRESSES.map(({ label: lbl, address: addr }) => (
              <button
                key={addr}
                onClick={() => useExample(addr)}
                className="flex w-full items-center gap-3 rounded-md border border-border p-2.5 text-left text-xs hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <Badge variant="outline" className="shrink-0">{lbl}</Badge>
                <span className="truncate font-mono text-muted-foreground">{addr}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* BIP21 info */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">BIP21</span> — {t('bip21Info')}{' '}
              <a
                href="https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                BIP-0021 <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Right: URI + QR ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">

        {/* Generated URI */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('generatedUri')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {uri ? (
              <>
                <div className="group relative rounded-lg bg-muted/50 p-3">
                  <p className="break-all font-mono text-xs leading-relaxed pr-8">{uri}</p>
                  <button
                    onClick={copyUri}
                    className="absolute right-2 top-2 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={copyUri} variant="outline" className="w-full gap-2">
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? t('copied') : t('copyUri')}
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">{t('uriPlaceholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
            {uri ? (
              <>
                <div className="rounded-xl bg-white p-4 shadow-md">
                  <QRCodeSVG
                    value={uri}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {t('qrHint')}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <QrCode className="h-16 w-16 opacity-20" />
                <p className="text-sm">{t('qrPlaceholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
