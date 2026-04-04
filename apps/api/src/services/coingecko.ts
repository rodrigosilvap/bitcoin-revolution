import type { PriceData, MarketData, PriceHistory } from '@seventy-capital/types';

const BASE = 'https://api.coingecko.com/api/v3';

export async function fetchPrice(
  vsCurrencies: string,
): Promise<Record<string, PriceData>> {
  const url = `${BASE}/simple/price?ids=bitcoin&vs_currencies=${vsCurrencies}&include_24hr_change=true&include_last_updated_at=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  const data = await res.json() as Record<string, Record<string, number>>;

  const result: Record<string, PriceData> = {};
  for (const curr of vsCurrencies.split(',')) {
    const lc = curr.toLowerCase();
    result[lc.toUpperCase()] = {
      price: data.bitcoin[lc] ?? 0,
      currency: lc.toUpperCase(),
      change24h: data.bitcoin[`${lc}_24h_change`] ?? 0,
      lastUpdated: data.bitcoin['last_updated_at'] ?? 0,
    };
  }
  return result;
}

export async function fetchMarketData(): Promise<MarketData> {
  const url = `${BASE}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  const data = await res.json() as { market_data: Record<string, Record<string, number>>; last_updated: string; price_change_24h_in_currency?: Record<string, number> };
  const md = data.market_data;

  return {
    currentPrice: { usd: md['current_price']['usd'], eur: md['current_price']['eur'] },
    marketCap: { usd: md['market_cap']['usd'] },
    totalVolume: { usd: md['total_volume']['usd'] },
    priceChange24h: {
      percentage: md['price_change_percentage_24h']['usd'] ?? 0,
      usd: md['price_change_24h_in_currency']?.['usd'] ?? 0,
    },
    high24h: { usd: md['high_24h']['usd'] },
    low24h: { usd: md['low_24h']['usd'] },
    lastUpdated: data.last_updated,
  };
}

export async function fetchPriceHistory(days: string, currency: string): Promise<PriceHistory> {
  const lc = currency.toLowerCase();
  const interval = days === '1' ? 'hourly' : 'daily';
  const url = `${BASE}/coins/bitcoin/market_chart?vs_currency=${lc}&days=${days}&interval=${interval}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  const data = await res.json() as { prices: [number, number][] };

  return {
    prices: data.prices.map(([timestamp, price]) => ({
      timestamp,
      date: new Date(timestamp).toISOString(),
      price,
    })),
    currency: lc.toUpperCase(),
  };
}
