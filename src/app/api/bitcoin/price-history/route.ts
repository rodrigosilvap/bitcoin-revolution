import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') ?? '7';
  const currency = (searchParams.get('currency') ?? 'USD').toLowerCase();

  try {
    const interval = days === '1' ? 'hourly' : 'daily';
    const url = `${COINGECKO_BASE}/coins/bitcoin/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

    const data = await res.json();

    return NextResponse.json({
      prices: data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        date: new Date(timestamp).toISOString(),
        price,
      })),
      currency: currency.toUpperCase(),
    });
  } catch (error) {
    console.error('[/api/bitcoin/price-history]', error);
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 502 });
  }
}
