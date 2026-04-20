'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchBitcoinPrice } from '@/lib/services/bitcoin-service';

interface HeroPriceTickerProps {
  initialPrice: number;
  initialChange: number;
}

export function HeroPriceTicker({ initialPrice, initialChange }: HeroPriceTickerProps) {
  const [price, setPrice] = useState(initialPrice);
  const [change, setChange] = useState(initialChange);

  useEffect(() => {
    const update = () => {
      fetchBitcoinPrice('USD')
        .then((d) => {
          setPrice(d.price);
          setChange(d.change24h);
        })
        .catch(() => {});
    };

    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const isPositive = change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="flex w-fit items-center gap-3 rounded-full border border-primary/30 bg-primary/5 px-4 py-2">
      <span className="text-lg font-bold text-foreground">
        ₿ ${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </span>
      <span className={`flex items-center gap-1 text-sm font-semibold ${colorClass}`}>
        <Icon className="h-3.5 w-3.5" />
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
      <span className="text-[10px] text-muted-foreground">24h</span>
    </div>
  );
}
