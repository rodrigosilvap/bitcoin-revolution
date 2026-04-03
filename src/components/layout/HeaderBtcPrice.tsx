'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PriceData {
  price: number;
  change24h: number;
}

export function HeaderBtcPrice() {
  const [data, setData] = useState<PriceData | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/bitcoin/price?currency=USD');
      if (res.ok) {
        const json = await res.json();
        setData({ price: json.price, change24h: json.change24h });
      }
    } catch {
      // silently fail — header price is non-critical
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const up = data.change24h >= 0;

  return (
    <div className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm sm:flex">
      <span className="font-semibold text-primary">₿</span>
      <span className="font-medium">{formatCurrency(data.price, 'USD', false)}</span>
      <span className={`flex items-center gap-0.5 text-xs ${up ? 'text-green-400' : 'text-red-400'}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? '+' : ''}{data.change24h.toFixed(2)}%
      </span>
    </div>
  );
}
