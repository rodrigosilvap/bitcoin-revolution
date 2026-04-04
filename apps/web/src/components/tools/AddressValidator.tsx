'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { classifyBitcoinAddress, type AddressResult } from '@/lib/address-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield, QrCode } from 'lucide-react';

const EXAMPLE_ADDRESSES = [
  { label: 'Legacy P2PKH', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', network: 'mainnet' },
  { label: 'Wrapped SegWit P2SH', address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', network: 'mainnet' },
  { label: 'Native SegWit P2WPKH', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', network: 'mainnet' },
  { label: 'Taproot P2TR', address: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', network: 'mainnet' },
  { label: 'Testnet Legacy', address: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', network: 'testnet' },
];

export function AddressValidator() {
  const t = useTranslations('addressValidator');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<AddressResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = useCallback(async (addr: string) => {
    if (!addr.trim()) {
      setResult(null);
      return;
    }
    try {
      const res = await classifyBitcoinAddress(addr.trim());
      setResult(res);
    } catch {
      setResult(null);
    }
  }, []);

  function handleChange(value: string) {
    setAddress(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validate(value), 300);
  }

  function useExample(addr: string) {
    handleChange(addr);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left column */}
      <div className="space-y-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('label')}</Label>
              <Input
                value={address}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={t('placeholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Alert variant={result.valid ? 'success' : 'destructive'}>
            {result.valid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{result.valid ? t('valid') : t('invalid')}</AlertTitle>
            {result.valid && (
              <AlertDescription>
                <div className="mt-2 grid gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t('addressType')}:</span>
                    <Badge variant="outline">{result.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t('network')}:</span>
                    <Badge variant={result.network === 'mainnet' ? 'default' : 'secondary'}>
                      {result.network === 'mainnet' ? t('mainnet') : t('testnet')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t('length')}:</span>
                    <span>{result.address.length} chars</span>
                  </div>
                </div>
              </AlertDescription>
            )}
          </Alert>
        )}

        {/* Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('examples')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {EXAMPLE_ADDRESSES.map(({ label, address: addr, network }) => (
              <button
                key={addr}
                onClick={() => useExample(addr)}
                className="flex w-full items-center gap-3 rounded-md border border-border p-2 text-left text-sm hover:border-primary/50 hover:bg-muted transition-colors"
              >
                <Badge variant={network === 'mainnet' ? 'default' : 'secondary'} className="shrink-0 text-xs">
                  {label}
                </Badge>
                <span className="truncate font-mono text-xs text-muted-foreground">{addr}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Security warning */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>{t('securityWarning')}</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>{t(`securityTip${n}` as 'securityTip1')}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* Right column — QR Code */}
      <div className="flex flex-col">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center py-12 gap-4 min-h-64">
            {address.trim() && result?.valid ? (
              <>
                <div className="rounded-xl bg-white p-4 shadow-md">
                  <QRCodeSVG
                    value={address.trim()}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
                <p className="text-center font-mono text-xs text-muted-foreground break-all max-w-xs">
                  {address.trim()}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <QrCode className="h-16 w-16 opacity-20" />
                <p className="text-sm">{t('placeholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
