'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const CURRENCIES = ['BTC', 'SAT', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'INR', 'BRL'];
const FIAT = new Set(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'INR', 'BRL']);

export function PriceConverter() {
  const t = useTranslations('priceConverter');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState<string | null>(null);
  const [btcPrices, setBtcPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrices() {
      try {
        const fiats = [...FIAT].join(',');
        const res = await fetch(`/api/bitcoin/price?currencies=${fiats}`);
        if (!res.ok) return;
        const data = await res.json();
        const prices: Record<string, number> = {};
        for (const [key, val] of Object.entries(data)) {
          prices[key] = (val as { price: number }).price;
        }
        setBtcPrices(prices);
      } finally {
        setLoading(false);
      }
    }
    loadPrices();
  }, []);

  const convert = useCallback(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || Object.keys(btcPrices).length === 0) {
      setResult(null);
      return;
    }

    // Normalise to BTC first
    let btcAmount = num;
    if (fromCurrency === 'SAT') btcAmount = num / 1e8;
    else if (FIAT.has(fromCurrency)) btcAmount = num / (btcPrices[fromCurrency] ?? 1);

    // Convert BTC to target
    let output = btcAmount;
    if (toCurrency === 'SAT') output = btcAmount * 1e8;
    else if (FIAT.has(toCurrency)) output = btcAmount * (btcPrices[toCurrency] ?? 1);

    const decimals = toCurrency === 'SAT' ? 0 : toCurrency === 'BTC' ? 8 : 2;
    setResult(output.toFixed(decimals));
  }, [amount, fromCurrency, toCurrency, btcPrices]);

  useEffect(() => {
    convert();
  }, [convert]);

  function swap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t('converterTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          {/* From */}
          <div className="space-y-2">
            <Label>{t('from')}</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'SAT' ? t('satoshi') : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap button */}
          <Button variant="ghost" size="icon" onClick={swap} aria-label={t('swapCurrencies')} className="hidden sm:flex">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          {/* To */}
          <div className="space-y-2">
            <Label>{t('to')}</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'SAT' ? t('satoshi') : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label>{t('amount')}</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('amountPlaceholder')}
          />
        </div>

        {/* Result */}
        <div className="rounded-md border border-border bg-muted p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('result')}</p>
          <p className="text-2xl font-bold text-primary">
            {result !== null ? `${result} ${toCurrency}` : t('loading')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
