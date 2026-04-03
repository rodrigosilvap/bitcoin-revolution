import { NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function GET() {
  try {
    const url = `${COINGECKO_BASE}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

    const data = await res.json();
    const md = data.market_data;

    return NextResponse.json({
      currentPrice: {
        usd: md.current_price.usd,
        eur: md.current_price.eur,
      },
      marketCap: { usd: md.market_cap.usd },
      totalVolume: { usd: md.total_volume.usd },
      priceChange24h: {
        percentage: md.price_change_percentage_24h,
        usd: md.price_change_24h_in_currency?.usd ?? 0,
      },
      high24h: { usd: md.high_24h.usd },
      low24h: { usd: md.low_24h.usd },
      lastUpdated: data.last_updated,
    });
  } catch (error) {
    console.error('[/api/bitcoin/market-data]', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 502 });
  }
}
