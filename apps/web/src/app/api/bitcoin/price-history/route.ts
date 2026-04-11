import { NextResponse } from 'next/server';

export const revalidate = 300; // 5 min cache

interface PricePoint {
  timestamp: number;
  date: string;
  price: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') ?? '365';
  const currency = (searchParams.get('currency') ?? 'USD').toLowerCase();
  const interval = days === '1' ? 'hourly' : 'daily';

  try {
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json() as { prices: [number, number][] };

    const prices: PricePoint[] = data.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp).toISOString(),
      price,
    }));

    return NextResponse.json({ prices, currency: currency.toUpperCase() });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 502 });
  }
}
