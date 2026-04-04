'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, Link2, Share2, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { classifyBitcoinAddress } from '@/lib/address-validator';

// ─── BIP21 URI builder ────────────────────────────────────────────────────────

function buildBip21Uri(address: string, amount: string, label: string, message: string): string {
  const params: string[] = [];
  const num = parseFloat(amount);
  if (num > 0) params.push(`amount=${num.toFixed(8).replace(/\.?0+$/, '')}`);
  if (label.trim())   params.push(`label=${encodeURIComponent(label.trim())}`);
  if (message.trim()) params.push(`message=${encodeURIComponent(message.trim())}`);
  return `bitcoin:${address}${params.length ? '?' + params.join('&') : ''}`;
}

function buildShareableUrl(address: string, amount: string, label: string, message: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams();
  params.set('address', address);
  if (parseFloat(amount) > 0) params.set('amount', amount);
  if (label.trim())   params.set('label', label.trim());
  if (message.trim()) params.set('message', message.trim());
  return `${base}/pay?${params.toString()}`;
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text, label, variant = 'outline' }: { text: string; label: string; variant?: 'outline' | 'default' }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button size="sm" variant={variant} onClick={copy} className="gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : label}
    </Button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CheckoutCreator() {
  const t = useTranslations('checkoutCreator');

  const [address, setAddress] = useState('');
  const [amount, setAmount]   = useState('');
  const [label, setLabel]     = useState('');
  const [message, setMessage] = useState('');
  const [addrValid, setAddrValid] = useState<boolean | null>(null);
  const [addrType, setAddrType]   = useState<string | null>(null);
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const isReady = addrValid === true && address.trim().length > 0;

  const bip21Uri = useMemo(
    () => isReady ? buildBip21Uri(address.trim(), amount, label, message) : '',
    [address, amount, label, message, isReady]
  );

  const shareableUrl = useMemo(
    () => isReady ? buildShareableUrl(address.trim(), amount, label, message) : '',
    [address, amount, label, message, isReady]
  );

  const validateAddress = useCallback(async (addr: string) => {
    if (!addr.trim()) { setAddrValid(null); setAddrType(null); return; }
    const result = await classifyBitcoinAddress(addr.trim());
    setAddrValid(result.valid);
    setAddrType(result.valid ? result.type ?? null : null);
  }, []);

  function handleAddressChange(val: string) {
    setAddress(val);
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    debounceRef[1](setTimeout(() => validateAddress(val), 400));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* ── Left: Form ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('paymentDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-address">{t('addressLabel')}</Label>
              <div className="relative">
                <Input
                  id="cc-address"
                  value={address}
                  onChange={e => handleAddressChange(e.target.value)}
                  placeholder={t('addressPlaceholder')}
                  className={
                    addrValid === false ? 'border-destructive focus-visible:ring-destructive' :
                    addrValid === true  ? 'border-green-500 focus-visible:ring-green-500' : ''
                  }
                />
                {addrType && (
                  <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {addrType}
                  </Badge>
                )}
              </div>
              {addrValid === false && (
                <p className="text-xs text-destructive">{t('addressInvalid')}</p>
              )}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-amount">{t('amountLabel')}</Label>
              <Input
                id="cc-amount"
                type="number"
                min="0"
                step="0.00000001"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={t('amountPlaceholder')}
              />
            </div>

            {/* Label */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-label">{t('recipientLabel')}</Label>
              <Input
                id="cc-label"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder={t('recipientPlaceholder')}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cc-message">{t('messageLabel')}</Label>
              <Input
                id="cc-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
              />
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ── Right: Output ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {!isReady ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
              <QrCode className="h-10 w-10 opacity-30" />
              <p className="text-sm">{t('enterAddressPrompt')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Shareable checkout URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="h-4 w-4 text-primary" />
                  {t('shareableLinkTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
                  {shareableUrl}
                </p>
                <div className="flex flex-wrap gap-2">
                  <CopyBtn text={shareableUrl} label={t('copyLink')} />
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => window.open(shareableUrl, '_blank')}
                    className="gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('openCheckout')}
                  </Button>
                </div>
                {/* QR of the shareable URL */}
                <div className="mt-2 flex justify-center">
                  <div className="rounded-xl border bg-white p-3 shadow-sm dark:border-white/10">
                    <QRCodeSVG
                      value={shareableUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#0a0a0a"
                      level="M"
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">{t('qrLinkHint')}</p>
              </CardContent>
            </Card>

            {/* BIP21 URI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="h-4 w-4 text-primary" />
                  {t('bip21UriTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
                  {bip21Uri}
                </p>
                <div className="flex flex-wrap gap-2">
                  <CopyBtn text={bip21Uri} label={t('copyUri')} />
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <a href={bip21Uri}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t('openInWallet')}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
