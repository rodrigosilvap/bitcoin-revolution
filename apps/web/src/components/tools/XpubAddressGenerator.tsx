'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { deriveAddresses, type DerivedAddress } from '@/lib/xpub-service';

export function XpubAddressGenerator() {
  const t = useTranslations('xpubGenerator');
  const [xpub, setXpub] = useState('');
  const [addresses, setAddresses] = useState<DerivedAddress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  function generate() {
    setError(null);
    try {
      setAddresses(deriveAddresses(xpub.trim(), 0, 10));
    } catch {
      setError(t('invalidXpub'));
      setAddresses([]);
    }
  }

  function loadMore() {
    try {
      const next = deriveAddresses(xpub.trim(), addresses.length, 10);
      setAddresses((prev) => [...prev, ...next]);
    } catch {
      setError(t('invalidXpub'));
    }
  }

  async function copyAddress(index: number, address: string) {
    await navigator.clipboard.writeText(address);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="xpub-input">{t('placeholder')}</Label>
        <Textarea
          id="xpub-input"
          value={xpub}
          onChange={(e) => setXpub(e.target.value)}
          placeholder={t('placeholder')}
          rows={3}
          className="font-mono text-sm"
        />
      </div>

      <Button onClick={generate} disabled={!xpub.trim()}>
        {t('generate')}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {addresses.length > 0 && (
        <Card>
          <CardContent className="p-0">
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
                  <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{index}</td>
                    <td className="px-4 py-3 font-mono break-all">{address}</td>
                    <td className="px-4 py-3">
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
          </CardContent>
        </Card>
      )}

      {addresses.length > 0 && (
        <Button variant="outline" onClick={loadMore}>
          {t('loadMore')}
        </Button>
      )}
    </div>
  );
}
