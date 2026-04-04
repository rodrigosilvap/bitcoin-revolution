import type { PriceData, MarketData, PriceHistory, TreasuryData } from '@bitcoin-revolution/types';
import { fetchMarketCaps } from './market-caps.js';

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

export async function fetchTreasuries(): Promise<TreasuryData> {
  const url = `${BASE}/companies/public_treasury/bitcoin`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

  const data = await res.json() as {
    total_holdings: number;
    total_value_usd: number;
    market_cap_dominance: number;
    companies: {
      name: string;
      symbol: string;
      country: string;
      total_holdings: number;
      total_entry_value_usd: number;
      total_current_value_usd: number;
      percentage_of_total_supply: number;
      market_cap_usd: number;
    }[];
  };

  const companies = data.companies.map((c) => ({
    name: c.name,
    symbol: c.symbol,
    country: c.country,
    totalHoldings: c.total_holdings,
    totalEntryValueUsd: c.total_entry_value_usd,
    totalCurrentValueUsd: c.total_current_value_usd,
    percentageOfTotalSupply: c.percentage_of_total_supply,
    marketCapUsd: c.market_cap_usd || undefined,
  }));

  // Enrich with live stock market caps (price × shares) from Yahoo Finance + SEC EDGAR
  const marketCaps = await fetchMarketCaps(companies.map(c => c.symbol)).catch(() => ({} as Record<string, number>));
  for (const company of companies) {
    if (marketCaps[company.symbol] != null) {
      company.marketCapUsd = marketCaps[company.symbol];
    }
  }

  return {
    totalHoldings: data.total_holdings,
    totalValueUsd: data.total_value_usd,
    marketCapDominance: data.market_cap_dominance,
    fetchedAt: Date.now(),
    companies,
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
