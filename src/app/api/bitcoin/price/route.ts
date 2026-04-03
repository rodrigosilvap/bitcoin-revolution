import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currency = (searchParams.get('currency') ?? 'USD').toLowerCase();
  const currencies = searchParams.get('currencies');

  try {
    const vsCurrencies = currencies
      ? currencies.split(',').map((c) => c.toLowerCase()).join(',')
      : currency;

    const url = `${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=${vsCurrencies}&include_24hr_change=true&include_last_updated_at=true`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

    const data = await res.json();

    if (currencies) {
      // Multi-currency response
      const result: Record<string, unknown> = {};
      for (const curr of currencies.split(',')) {
        const lc = curr.toLowerCase();
        result[curr.toUpperCase()] = {
          price: data.bitcoin[lc] ?? 0,
          currency: curr.toUpperCase(),
          change24h: data.bitcoin[`${lc}_24h_change`] ?? 0,
          lastUpdated: data.bitcoin.last_updated_at ?? 0,
        };
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({
      price: data.bitcoin[currency] ?? 0,
      currency: currency.toUpperCase(),
      change24h: data.bitcoin[`${currency}_24h_change`] ?? 0,
      lastUpdated: data.bitcoin.last_updated_at ?? 0,
    });
  } catch (error) {
    console.error('[/api/bitcoin/price]', error);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 502 });
  }
}
